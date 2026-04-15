// Ad-block detection script
// This script detects if users are using ad-blocking extensions
// and politely asks them to disable it to support the free service

(function() {
    'use strict';
    
    // Configuration
    const DETECTION_DELAY = 1000; // Delay before running detection (ms)
    const BAIT_CHECK_DELAY = 100; // Time to wait for ad blockers to hide bait (ms)
    const SCRIPT_TIMEOUT = 3000; // Timeout for script loading test (ms)
    const MIN_DETECTION_SCORE = 2; // Minimum positive checks required to detect ad blocker
    const MAX_CONFIRM_RETRIES = 1; // Additional confirmation checks to reduce accidental false positives
    const RETRY_DELAY = 1500; // Delay between confirmation retries (ms)
    
    let adBlockDetected = false;
    
    // Method 1: Check if bait elements are hidden by ad blockers
    function checkBaitElement() {
        return new Promise((resolve) => {
            const baitConfigs = [
                {
                    className: 'ad ads ad-banner advertisement adsbox pub_300x250 pub_300x250m pub_728x90',
                    id: 'adsbox'
                },
                {
                    className: 'google-ad ad-slot ad-unit ad-container',
                    id: 'google_ads_iframe_test'
                }
            ];

            const baits = baitConfigs.map((cfg) => {
                const bait = document.createElement('div');
                bait.className = cfg.className;
                bait.id = cfg.id;
                bait.setAttribute('aria-hidden', 'true');
                bait.style.cssText = 'width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -10000px !important; opacity: 0 !important; pointer-events: none !important;';
                document.body.appendChild(bait);
                return bait;
            });
            
            // Wait a moment for ad blockers to hide it
            setTimeout(() => {
                const hiddenCount = baits.filter((bait) => {
                    if (!bait || !document.body.contains(bait)) {
                        return true;
                    }

                    const computedStyle = window.getComputedStyle(bait);
                    return bait.offsetParent === null ||
                        bait.offsetHeight === 0 ||
                        bait.clientHeight === 0 ||
                        computedStyle.display === 'none' ||
                        computedStyle.visibility === 'hidden';
                }).length;

                baits.forEach((bait) => {
                    if (bait && bait.parentNode) {
                        bait.parentNode.removeChild(bait);
                    }
                });

                resolve(hiddenCount >= 1);
            }, BAIT_CHECK_DELAY);
        });
    }
    
    function probeAdScript(url) {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            
            let resolved = false;
            
            script.onerror = () => {
                if (!resolved) {
                    resolved = true;
                    // Remove the script element
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                    resolve(true);  // Blocked
                }
            };
            
            script.onload = () => {
                if (!resolved) {
                    resolved = true;
                    // Remove the script element
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                    resolve(false);  // Not blocked
                }
            };
            
            // Set a timeout in case neither fires
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    // Remove the script element
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                    resolve(false);
                }
            }, SCRIPT_TIMEOUT);
            
            // Handle CSP errors gracefully
            try {
                document.head.appendChild(script);
            } catch (error) {
                if (!resolved) {
                    resolved = true;
                    resolve(false); // Don't treat CSP errors as ad-block
                }
            }
        });
    }

    // Method 2: Probe common ad scripts
    async function checkAdScriptBlocking() {
        const probes = await Promise.all([
            probeAdScript('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'),
            probeAdScript('https://securepubads.g.doubleclick.net/tag/js/gpt.js')
        ]);

        return probes.filter(Boolean).length >= 1;
    }
    
    // Method 3: Check for common ad-blocker objects
    function checkAdBlockerObjects() {
        // Check for common ad-blocker extensions
        if (window.adblock || window.adBlock || window.AdBlock) {
            return true;
        }
        
        return false;
    }
    
    // Show the ad-block detection modal
    function showAdBlockModal() {
        // Check if modal already exists
        if (document.getElementById('adblock-modal')) {
            return;
        }
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'adblock-modal';
        overlay.className = 'adblock-overlay';
        
        // Get translated messages
        const messages = getMessages();
        
        overlay.innerHTML = `
            <div class="adblock-modal-content" role="dialog" aria-modal="true" aria-labelledby="adblock-title" aria-describedby="adblock-message adblock-sub-message">
                <div class="adblock-icon">🚫</div>
                <h2 id="adblock-title" class="adblock-title">${messages.title}</h2>
                <p id="adblock-message" class="adblock-message">${messages.message}</p>
                <p id="adblock-sub-message" class="adblock-sub-message">${messages.subMessage}</p>
                <button id="adblock-recheck-btn" class="adblock-btn">${messages.buttonText}</button>
                <p class="adblock-note">${messages.note}</p>
            </div>
        `;
        
        document.body.appendChild(overlay);

        const recheckBtn = document.getElementById('adblock-recheck-btn');
        if (recheckBtn) {
            recheckBtn.addEventListener('click', () => {
                recheckBtn.disabled = true;
                recheckBtn.textContent = messages.recheckingText;
                setTimeout(() => {
                    location.reload();
                }, 300);
            });
            recheckBtn.focus();
        }
        
        // Prevent scrolling on body when modal is open
        document.body.style.overflow = 'hidden';
    }

    function hideAdBlockModal() {
        const overlay = document.getElementById('adblock-modal');
        if (!overlay) {
            return;
        }

        overlay.remove();
        document.body.style.overflow = '';
    }
    
    // Get messages based on current language
    function getMessages() {
        const currentLang = getCurrentLanguage();
        
        if (currentLang === 'ko') {
            return {
                title: '광고 차단 프로그램이 감지되었습니다',
                message: '이 웹사이트는 광고 수익으로 운영되어 모든 사용자에게 무료로 서비스를 제공하고 있습니다.',
                subMessage: '원활한 이용을 위해 이 사이트에서 광고 차단을 해제해 주세요. 해제 후 아래 버튼으로 다시 확인할 수 있습니다.',
                buttonText: '다시 확인',
                recheckingText: '확인 중...',
                note: '광고 차단을 해제한 뒤 다시 확인 버튼을 눌러 주세요.'
            };
        }
        
        // Default to English
        return {
            title: 'Ad Blocker Detected',
            message: 'This website is supported by advertising revenue and provides free service to all users.',
            subMessage: 'Please disable your ad blocker for this site. After disabling it, use the button below to recheck.',
            buttonText: 'Recheck Now',
            recheckingText: 'Rechecking...',
            note: 'Click recheck after disabling your ad blocker.'
        };
    }
    
    // Detect current language from localStorage or browser
    function getCurrentLanguage() {
        // Try to get from localStorage first (matches i18n.js)
        try {
            const savedLang = localStorage.getItem('quon_language');
            if (savedLang) {
                return savedLang;
            }
        } catch (error) {
            // Ignore storage access issues and continue with browser language
        }
        
        // Check browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('ko')) {
            return 'ko';
        }
        
        return 'en';
    }
    
    async function runDetectionPass() {
        const [baitResult, scriptResult, objectResult] = await Promise.all([
            checkBaitElement(),
            checkAdScriptBlocking(),
            Promise.resolve(checkAdBlockerObjects())
        ]);

        const detectionCount = [baitResult, scriptResult, objectResult].filter(Boolean).length;
        return {
            baitResult,
            scriptResult,
            objectResult,
            detectionCount,
            detected: detectionCount >= MIN_DETECTION_SCORE
        };
    }

    // Main detection function
    async function detectAdBlock() {
        try {
            let lastPass = await runDetectionPass();

            for (let attempt = 0; attempt < MAX_CONFIRM_RETRIES && lastPass.detected; attempt++) {
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
                lastPass = await runDetectionPass();
            }

            adBlockDetected = lastPass.detected;
            
            if (adBlockDetected) {
                console.log(`[Ad-block Detector] Ad blocker detected (score: ${lastPass.detectionCount})`);
                showAdBlockModal();
            } else {
                console.log(`[Ad-block Detector] No ad blocker detected (score: ${lastPass.detectionCount})`);
                hideAdBlockModal();
            }
        } catch (error) {
            console.error('[Ad-block Detector] Error during detection:', error);
            // Don't show modal on error to avoid false positives
        }
    }
    
    // Run detection after page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(detectAdBlock, DETECTION_DELAY); // Small delay to ensure page is ready
        });
    } else {
        setTimeout(detectAdBlock, DETECTION_DELAY);
    }
    
    // Expose detection status for debugging
    window.adBlockDetectionStatus = function() {
        return {
            detected: adBlockDetected,
            timestamp: new Date().toISOString()
        };
    };
})();
