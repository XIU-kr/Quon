// Ad-block detection script
// This script detects if users are using ad-blocking extensions
// and politely asks them to disable it to support the free service

(function() {
    'use strict';
    
    let adBlockDetected = false;
    
    // Method 1: Check if a bait element is hidden by ad blockers
    function checkBaitElement() {
        return new Promise((resolve) => {
            // Create a bait element that ad blockers typically hide
            const bait = document.createElement('div');
            bait.className = 'ad ads ad-banner advertisement adsbox pub_300x250 pub_300x250m pub_728x90';
            bait.style.cssText = 'width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;';
            
            document.body.appendChild(bait);
            
            // Wait a moment for ad blockers to hide it
            setTimeout(() => {
                const isHidden = bait.offsetParent === null || 
                                bait.offsetHeight === 0 || 
                                bait.offsetLeft === 0 || 
                                bait.offsetTop === 0 || 
                                bait.clientHeight === 0 || 
                                bait.clientWidth === 0 ||
                                window.getComputedStyle(bait).display === 'none' ||
                                window.getComputedStyle(bait).visibility === 'hidden';
                
                document.body.removeChild(bait);
                resolve(isHidden);
            }, 100);
        });
    }
    
    // Method 2: Try to fetch a common ad script
    function checkAdScriptBlocking() {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
            script.onerror = () => resolve(true);  // Blocked
            script.onload = () => resolve(false);  // Not blocked
            
            // Set a timeout in case neither fires
            setTimeout(() => resolve(false), 2000);
            
            document.head.appendChild(script);
        });
    }
    
    // Method 3: Check for common ad-blocker objects
    function checkAdBlockerObjects() {
        // Check for ad-blocker specific properties
        if (typeof window.canRunAds === 'undefined') {
            return true;
        }
        
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
            <div class="adblock-modal-content">
                <div class="adblock-icon">🚫</div>
                <h2 class="adblock-title">${messages.title}</h2>
                <p class="adblock-message">${messages.message}</p>
                <p class="adblock-sub-message">${messages.subMessage}</p>
                <button class="adblock-btn" onclick="location.reload()">${messages.buttonText}</button>
                <p class="adblock-note">${messages.note}</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Prevent scrolling on body when modal is open
        document.body.style.overflow = 'hidden';
    }
    
    // Get messages based on current language
    function getMessages() {
        const currentLang = getCurrentLanguage();
        
        if (currentLang === 'ko') {
            return {
                title: '광고 차단 프로그램이 감지되었습니다',
                message: '이 웹사이트는 광고 수익으로 운영되어 모든 사용자에게 무료로 서비스를 제공하고 있습니다.',
                subMessage: '원활한 사이트 이용을 위해 광고 차단 프로그램을 비활성화해 주시기 바랍니다. 여러분의 이해와 협조에 깊이 감사드립니다.',
                buttonText: '새로고침',
                note: '광고 차단을 해제하신 후 새로고침 버튼을 눌러주세요.'
            };
        }
        
        // Default to English
        return {
            title: 'Ad Blocker Detected',
            message: 'This website is supported by advertising revenue and provides free service to all users.',
            subMessage: 'To use this site smoothly, please disable your ad blocker. We deeply appreciate your understanding and cooperation.',
            buttonText: 'Refresh Page',
            note: 'Please click the refresh button after disabling your ad blocker.'
        };
    }
    
    // Detect current language from localStorage or browser
    function getCurrentLanguage() {
        // Try to get from localStorage first
        const savedLang = localStorage.getItem('language');
        if (savedLang) {
            return savedLang;
        }
        
        // Check browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('ko')) {
            return 'ko';
        }
        
        return 'en';
    }
    
    // Main detection function
    async function detectAdBlock() {
        try {
            // Run multiple detection methods
            const [baitResult, scriptResult, objectResult] = await Promise.all([
                checkBaitElement(),
                checkAdScriptBlocking(),
                Promise.resolve(checkAdBlockerObjects())
            ]);
            
            // If any method detects an ad blocker
            adBlockDetected = baitResult || scriptResult || objectResult;
            
            if (adBlockDetected) {
                console.log('[Ad-block Detector] Ad blocker detected');
                showAdBlockModal();
            } else {
                console.log('[Ad-block Detector] No ad blocker detected');
            }
        } catch (error) {
            console.error('[Ad-block Detector] Error during detection:', error);
            // Don't show modal on error to avoid false positives
        }
    }
    
    // Run detection after page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(detectAdBlock, 1000); // Small delay to ensure page is ready
        });
    } else {
        setTimeout(detectAdBlock, 1000);
    }
    
    // Expose detection status for debugging
    window.adBlockDetectionStatus = function() {
        return {
            detected: adBlockDetected,
            timestamp: new Date().toISOString()
        };
    };
})();
