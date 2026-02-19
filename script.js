// QR Code Generator Application
let qrCode = null;
let currentType = 'url';
let logoImage = null;
let previewZoom = 1;
const PREVIEW_ZOOM_MIN = 0.75;
const PREVIEW_ZOOM_MAX = 1.8;
const PREVIEW_ZOOM_STEP = 0.1;
const DESIGN_PANEL_STATE_KEY = 'quon_design_panel_state';
const RECENT_SETTINGS_KEY = 'quon_recent_settings';
const QR_TYPES = ['url', 'text', 'vcard', 'email', 'tel', 'wifi'];
let isGenerating = false;

function initializeAdsenseUnits() {
    const adUnits = document.querySelectorAll('.adsbygoogle');
    if (!adUnits.length) {
        return;
    }

    adUnits.forEach((adUnit) => {
        if (adUnit.getAttribute('data-adsbygoogle-status') === 'done') {
            return;
        }

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
            console.error('[AdSense] Failed to initialize ad unit:', error);
        }
    });
}

function updatePreviewZoomLabel() {
    const zoomLabel = document.getElementById('preview-zoom-level');
    if (!zoomLabel) {
        return;
    }

    zoomLabel.textContent = `${Math.round(previewZoom * 100)}%`;
}

function applyPreviewZoom() {
    const qrElements = document.querySelectorAll('#qr-code-container canvas, #qr-code-container svg');
    qrElements.forEach((element) => {
        element.style.transform = `scale(${previewZoom})`;
        element.style.transformOrigin = 'center center';
    });
    updatePreviewZoomLabel();
}

function setPreviewZoom(nextZoom) {
    previewZoom = Math.max(PREVIEW_ZOOM_MIN, Math.min(PREVIEW_ZOOM_MAX, nextZoom));
    applyPreviewZoom();
    saveRecentSettings();
}

function initializeDesignPanelState() {
    const groups = Array.from(document.querySelectorAll('.design-group'));
    if (!groups.length) {
        return;
    }

    let savedState = {};
    try {
        const raw = localStorage.getItem(DESIGN_PANEL_STATE_KEY);
        if (raw) {
            savedState = JSON.parse(raw);
        }
    } catch (error) {
        savedState = {};
    }

    groups.forEach((group, index) => {
        const groupKey = group.dataset.group || `group-${index}`;
        if (Object.prototype.hasOwnProperty.call(savedState, groupKey)) {
            group.open = Boolean(savedState[groupKey]);
        }

        group.addEventListener('toggle', () => {
            const nextState = {};
            groups.forEach((entry, entryIndex) => {
                const key = entry.dataset.group || `group-${entryIndex}`;
                nextState[key] = entry.open;
            });

            try {
                localStorage.setItem(DESIGN_PANEL_STATE_KEY, JSON.stringify(nextState));
            } catch (error) {
                // Ignore storage write errors
            }
        });
    });
}

function getDialCodeLabel(option, language) {
    const savedKoreanLabel = option.dataset.labelKo || option.textContent;
    const code = option.value || '';

    if (option.dataset.i18n) {
        return option.textContent;
    }

    if (language === 'ko') {
        return savedKoreanLabel;
    }

    return code;
}

function normalizeCountryOptionLabels(language) {
    const selectors = ['vcard-tel-country', 'tel-country'];

    selectors.forEach((id) => {
        const select = document.getElementById(id);
        if (!select) return;

        Array.from(select.options).forEach((option) => {
            if (!option.dataset.labelKo) {
                option.dataset.labelKo = option.textContent;
            }

            if (!option.value) {
                return;
            }

            option.textContent = getDialCodeLabel(option, language);
        });
    });
}

function syncCountryCodeOptions() {
    const sourceSelect = document.getElementById('vcard-tel-country');
    const targetSelect = document.getElementById('tel-country');

    if (!sourceSelect || !targetSelect) {
        return;
    }

    targetSelect.innerHTML = sourceSelect.innerHTML;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize language first (wait for it to load)
    await initLanguage();
    initializeAdsenseUnits();
    initializeDesignPanelState();
    
    initializeEventListeners();
    syncCountryCodeOptions();
    normalizeCountryOptionLabels(getCurrentLanguage());
    restoreRecentSettings();
    createInitialQRCode();
    // Disable download buttons initially
    document.getElementById('download-png').disabled = true;
    document.getElementById('download-svg').disabled = true;
});

// Initialize all event listeners
function initializeEventListeners() {
    document.addEventListener('languageChanged', (event) => {
        normalizeCountryOptionLabels(event.detail.language);
    });

    // Type selector buttons
    const typeButtons = document.querySelectorAll('.type-btn');
    typeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            switchQRType(this.dataset.type);
        });
    });

    // Generate button
    document.getElementById('generate-btn').addEventListener('click', generateQRCode);

    const fillExampleButton = document.getElementById('preview-fill-example');
    if (fillExampleButton) {
        fillExampleButton.addEventListener('click', fillExampleContent);
    }

    const zoomInButton = document.getElementById('preview-zoom-in');
    const zoomOutButton = document.getElementById('preview-zoom-out');
    const zoomResetButton = document.getElementById('preview-zoom-reset');

    if (zoomInButton && zoomOutButton && zoomResetButton) {
        zoomInButton.addEventListener('click', () => setPreviewZoom(previewZoom + PREVIEW_ZOOM_STEP));
        zoomOutButton.addEventListener('click', () => setPreviewZoom(previewZoom - PREVIEW_ZOOM_STEP));
        zoomResetButton.addEventListener('click', () => setPreviewZoom(1));
        updatePreviewZoomLabel();
    }

    // Download buttons
    document.getElementById('download-png').addEventListener('click', () => downloadQR('png'));
    document.getElementById('download-svg').addEventListener('click', () => downloadQR('svg'));

    // Logo upload
    document.getElementById('logo-upload').addEventListener('change', handleLogoUpload);

    // Customization options - live update
    const customizationInputs = [
        'dots-type', 'corner-square-type', 'corner-dot-type',
        'dots-color', 'background-color'
    ];
    
    customizationInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => {
                saveRecentSettings();
                generateQRCode();
            });
        }
    });

    // Input fields - generate on Enter key and clear inline errors
    const inputFields = document.querySelectorAll('.input-field');
    inputFields.forEach(field => {
        if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
            field.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && field.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    generateQRCode();
                }
            });
        }

        field.addEventListener('input', () => {
            field.classList.remove('is-invalid');
            const sibling = field.nextElementSibling;
            if (sibling && sibling.classList && sibling.classList.contains('field-error')) {
                sibling.remove();
            }
        });
    });

    document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            generateQRCode();
        }
    });

    // Country code checkbox toggles for vCard
    document.getElementById('vcard-use-country-code').addEventListener('change', function() {
        const countryGroup = document.getElementById('vcard-country-group');
        countryGroup.style.display = this.checked ? 'block' : 'none';
    });

    // Country code checkbox toggles for Tel
    document.getElementById('tel-use-country-code').addEventListener('change', function() {
        const countryGroup = document.getElementById('tel-country-group');
        countryGroup.style.display = this.checked ? 'block' : 'none';
    });
}

function togglePreviewExampleButton(visible) {
    const fillButton = document.getElementById('preview-fill-example');
    if (!fillButton) {
        return;
    }

    fillButton.classList.toggle('is-hidden', !visible);
}

function setPreviewEmptyState(isEmpty) {
    const previewStage = document.querySelector('.preview-stage');
    const previewContainer = document.getElementById('qr-code-container');

    if (previewStage) {
        previewStage.classList.toggle('is-empty', isEmpty);
    }

    if (previewContainer) {
        previewContainer.classList.toggle('is-empty', isEmpty);
    }
}

function saveRecentSettings() {
    const settings = {
        type: currentType,
        previewZoom,
        dotsType: document.getElementById('dots-type')?.value,
        cornerSquareType: document.getElementById('corner-square-type')?.value,
        cornerDotType: document.getElementById('corner-dot-type')?.value,
        dotsColor: document.getElementById('dots-color')?.value,
        backgroundColor: document.getElementById('background-color')?.value
    };

    try {
        localStorage.setItem(RECENT_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        // Ignore storage write errors
    }
}

function restoreRecentSettings() {
    try {
        const raw = localStorage.getItem(RECENT_SETTINGS_KEY);
        if (!raw) {
            return;
        }

        const saved = JSON.parse(raw);
        if (saved && QR_TYPES.includes(saved.type)) {
            switchQRType(saved.type);
        }

        const selectMappings = [
            ['dots-type', saved.dotsType],
            ['corner-square-type', saved.cornerSquareType],
            ['corner-dot-type', saved.cornerDotType],
            ['dots-color', saved.dotsColor],
            ['background-color', saved.backgroundColor]
        ];

        selectMappings.forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element && value) {
                element.value = value;
            }
        });

        if (typeof saved.previewZoom === 'number' && Number.isFinite(saved.previewZoom)) {
            setPreviewZoom(saved.previewZoom);
        } else {
            updatePreviewZoomLabel();
        }
    } catch (error) {
        updatePreviewZoomLabel();
    }
}

function fillExampleContent() {
    if (currentType === 'url') {
        document.getElementById('url-input').value = 'https://www.sn0wman.kr';
    }

    if (currentType === 'text') {
        document.getElementById('text-input').value = 'Scan this code to view a quick demo message.';
    }

    if (currentType === 'vcard') {
        document.getElementById('vcard-fullname').value = 'Hong Gil Dong';
        document.getElementById('vcard-tel').value = '01012345678';
        document.getElementById('vcard-email').value = 'hello@example.com';
        document.getElementById('vcard-org').value = 'Quon Team';
    }

    if (currentType === 'email') {
        document.getElementById('email-to').value = 'hello@example.com';
        document.getElementById('email-subject').value = 'Quick hello from Quon';
        document.getElementById('email-body').value = 'Hi! This is a sample email QR code.';
    }

    if (currentType === 'tel') {
        document.getElementById('tel-number').value = '01012345678';
    }

    if (currentType === 'wifi') {
        document.getElementById('wifi-ssid').value = 'Quon_WiFi';
        document.getElementById('wifi-password').value = 'sample-password';
    }

    generateQRCode();
    showNotification(t('message.success.prefilled'), 'success');
}

function updatePreviewStatus(messageKey, showFillAction = false) {
    const statusElement = document.getElementById('preview-status');
    if (!statusElement) {
        return;
    }

    statusElement.textContent = t(messageKey);
    togglePreviewExampleButton(showFillAction);
}

function clearValidationErrors() {
    document.querySelectorAll('.input-field.is-invalid').forEach((field) => {
        field.classList.remove('is-invalid');
    });

    document.querySelectorAll('.field-error').forEach((entry) => {
        entry.remove();
    });
}

function setFieldError(fieldId, messageKey) {
    const field = document.getElementById(fieldId);
    if (!field) {
        return;
    }

    field.classList.add('is-invalid');
    const error = document.createElement('div');
    error.className = 'field-error';
    error.textContent = t(messageKey);
    error.setAttribute('role', 'alert');
    field.insertAdjacentElement('afterend', error);
}

function validateCurrentInput() {
    clearValidationErrors();

    if (currentType === 'url' && !document.getElementById('url-input').value.trim()) {
        setFieldError('url-input', 'message.error.empty');
        return false;
    }

    if (currentType === 'vcard') {
        const fullName = document.getElementById('vcard-fullname').value.trim();
        const lastName = document.getElementById('vcard-lastname').value.trim();
        const firstName = document.getElementById('vcard-firstname').value.trim();
        const tel = document.getElementById('vcard-tel').value.trim();

        if (!fullName && !lastName && !firstName) {
            setFieldError('vcard-fullname', 'message.error.name');
            return false;
        }

        if (!tel) {
            setFieldError('vcard-tel', 'message.error.tel');
            return false;
        }
    }

    if (currentType === 'email' && !document.getElementById('email-to').value.trim()) {
        setFieldError('email-to', 'message.error.email');
        return false;
    }

    if (currentType === 'tel' && !document.getElementById('tel-number').value.trim()) {
        setFieldError('tel-number', 'message.error.tel');
        return false;
    }

    if (currentType === 'wifi' && !document.getElementById('wifi-ssid').value.trim()) {
        setFieldError('wifi-ssid', 'message.error.wifi');
        return false;
    }

    return true;
}

function setGeneratingState(nextState) {
    isGenerating = nextState;
    const generateButton = document.getElementById('generate-btn');
    if (!generateButton) {
        return;
    }

    generateButton.disabled = nextState;
    generateButton.classList.toggle('is-loading', nextState);
    generateButton.textContent = nextState ? t('button.generating') : t('button.generate');
}

// Switch between QR code types
function switchQRType(type) {
    currentType = type;
    clearValidationErrors();
    saveRecentSettings();

    // Update active button
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');

    // Update active form
    document.querySelectorAll('.form-container').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(`form-${type}`).classList.add('active');
}

// Handle logo upload
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            logoImage = event.target.result;
            generateQRCode();
        };
        reader.readAsDataURL(file);
    } else {
        logoImage = null;
        generateQRCode();
    }
}

// Generate QR code content based on type
function getQRContent() {
    let content = '';

    switch (currentType) {
        case 'url':
            content = document.getElementById('url-input').value.trim();
            if (content && !content.startsWith('http://') && !content.startsWith('https://')) {
                content = 'https://' + content;
            }
            break;

        case 'text':
            content = document.getElementById('text-input').value.trim();
            break;

        case 'vcard':
            // Get name fields
            const fullName = document.getElementById('vcard-fullname').value.trim();
            const lastName = document.getElementById('vcard-lastname').value.trim();
            const firstName = document.getElementById('vcard-firstname').value.trim();
            
            // Determine which name to use
            // Note: If both full name and separate names are provided, full name takes precedence
            let name = '';
            let familyName = '';
            let givenName = '';
            
            if (fullName) {
                // Use full name - try to split it if it has spaces
                name = fullName;
                const nameParts = fullName.split(' ');
                if (nameParts.length > 1) {
                    // Korean naming convention: first part is family name, rest is given name
                    familyName = nameParts[0];
                    givenName = nameParts.slice(1).join(' ');
                } else {
                    familyName = fullName;
                    givenName = '';
                }
            } else if (lastName || firstName) {
                // Use last name and first name separately
                familyName = lastName;
                givenName = firstName;
                // Combine names with proper spacing
                if (lastName && firstName) {
                    name = lastName + ' ' + firstName;
                } else {
                    name = (lastName || firstName);
                }
            }
            
            // Get other fields
            const org = document.getElementById('vcard-org').value.trim();
            let tel = document.getElementById('vcard-tel').value.trim();
            const useCountryCode = document.getElementById('vcard-use-country-code').checked;
            const telCountry = document.getElementById('vcard-tel-country').value;
            const email = document.getElementById('vcard-email').value.trim();
            const url = document.getElementById('vcard-url').value.trim();
            const address = document.getElementById('vcard-address').value.trim();

            // Validate required fields
            if (!name) {
                showNotification(t('message.error.name'));
                return null;
            }
            if (!tel) {
                showNotification(t('message.error.tel'));
                return null;
            }

            // iOS-compatible vCard format with CRLF line endings
            content = 'BEGIN:VCARD\r\nVERSION:3.0\r\n';
            
            // Add formatted name
            content += formatVCardField('FN', name);
            
            // Add structured name (N field)
            const hasNonASCII = containsNonASCII(name);
            const nValue = `${escapeVCard(familyName)};${escapeVCard(givenName)};;;`;
            content += formatVCardNameField(nValue, hasNonASCII);
            
            if (org) content += formatVCardField('ORG', org);
            if (tel) {
                // Add country code if checkbox is enabled and country is selected
                const formattedTel = (useCountryCode && telCountry) ? `${telCountry}${tel}` : tel;
                content += `TEL;TYPE=CELL:${formattedTel}\r\n`;
            }
            if (email) content += `EMAIL;TYPE=INTERNET:${email}\r\n`;
            if (url) content += `URL:${url}\r\n`;
            if (address) {
                // For Korean addresses, use the full address as street address
                // ADR field has structured format, so we handle it specially
                const adrValue = `;;${escapeVCard(address)};;;;`;
                if (containsNonASCII(address)) {
                    const encoded = encodeQuotedPrintable(adrValue);
                    content += `ADR;TYPE=HOME;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:${encoded}\r\n`;
                } else {
                    content += `ADR;TYPE=HOME:${adrValue}\r\n`;
                }
            }
            content += 'END:VCARD';
            break;

        case 'email':
            const emailTo = document.getElementById('email-to').value.trim();
            const subject = document.getElementById('email-subject').value.trim();
            const body = document.getElementById('email-body').value.trim();

            if (!emailTo) {
                showNotification(t('message.error.email'));
                return null;
            }

            content = `mailto:${emailTo}`;
            const params = [];
            if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
            if (body) params.push(`body=${encodeURIComponent(body)}`);
            if (params.length > 0) {
                content += '?' + params.join('&');
            }
            break;

        case 'tel':
            const telNumber = document.getElementById('tel-number').value.trim();
            const useTelCountryCode = document.getElementById('tel-use-country-code').checked;
            const telCountryCode = document.getElementById('tel-country').value;
            
            if (!telNumber) {
                showNotification(t('message.error.tel'));
                return null;
            }

            // Add country code if checkbox is enabled and country is selected
            const formattedTelNumber = (useTelCountryCode && telCountryCode) ? `${telCountryCode}${telNumber}` : telNumber;
            content = `tel:${formattedTelNumber}`;
            break;

        case 'wifi':
            const ssid = document.getElementById('wifi-ssid').value.trim();
            const password = document.getElementById('wifi-password').value.trim();
            const encryption = document.getElementById('wifi-encryption').value;
            const hidden = document.getElementById('wifi-hidden').checked;

            if (ssid) {
                // Escape special characters for Wi-Fi QR code
                const escapedSsid = escapeWiFi(ssid);
                const escapedPassword = escapeWiFi(password);
                
                // iOS-compatible Wi-Fi format
                content = `WIFI:T:${encryption};S:${escapedSsid};P:${escapedPassword};${hidden ? 'H:true;' : ''};`;
            }
            break;
    }

    return content;
}

// Get QR code options
function getQROptions() {
    const dotsColor = document.getElementById('dots-color').value;
    const backgroundColor = document.getElementById('background-color').value;
    const dotsType = document.getElementById('dots-type').value;
    const cornerSquareType = document.getElementById('corner-square-type').value;
    const cornerDotType = document.getElementById('corner-dot-type').value;

    const options = {
        width: 300,
        height: 300,
        type: "canvas",
        data: "",
        margin: 10,
        qrOptions: {
            typeNumber: 0,
            mode: "Byte",
            errorCorrectionLevel: "Q"
        },
        imageOptions: {
            hideBackgroundDots: true,
            imageSize: 0.4,
            margin: 5
        },
        dotsOptions: {
            color: dotsColor,
            type: dotsType
        },
        backgroundOptions: {
            color: backgroundColor
        },
        cornersSquareOptions: {
            color: dotsColor,
            type: cornerSquareType
        },
        cornersDotOptions: {
            color: dotsColor,
            type: cornerDotType
        }
    };

    // Add logo if available
    if (logoImage) {
        options.image = logoImage;
    }

    return options;
}

// Create initial QR code
function createInitialQRCode() {
    const container = document.getElementById('qr-code-container');
    container.innerHTML = '<div class="empty-state"><div class="icon">📱</div><p>' + t('message.empty') + '</p></div>';
    setPreviewEmptyState(true);
    updatePreviewStatus('message.empty', true);
    updatePreviewZoomLabel();
}

// Show notification message
function showNotification(message, type = 'error') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Hide and remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Generate QR code
function generateQRCode() {
    if (isGenerating) {
        return;
    }

    if (!validateCurrentInput()) {
        showNotification(t('message.error.fixFields'));
        return;
    }

    const content = getQRContent();

    if (content === null) {
        return;
    }

    if (!content) {
        updatePreviewStatus('message.error.empty', true);
        showNotification(t('message.error.empty'));
        return;
    }

    setGeneratingState(true);
    window.requestAnimationFrame(() => {
        try {
            const options = getQROptions();
            options.data = content;

            const container = document.getElementById('qr-code-container');
            container.innerHTML = '';

            // Create new QR code
            qrCode = new QRCodeStyling(options);
            qrCode.append(container);
            applyPreviewZoom();
            setPreviewEmptyState(false);

            // Enable download buttons
            const downloadPngButton = document.getElementById('download-png');
            const downloadSvgButton = document.getElementById('download-svg');
            downloadPngButton.disabled = false;
            downloadSvgButton.disabled = false;
            downloadPngButton.focus({ preventScroll: true });

            updatePreviewStatus('message.success.generated', false);
            showNotification(t('message.success.generated'), 'success');
        } catch (error) {
            updatePreviewStatus('message.error.network', true);
            showNotification(t('message.error.network'));
        } finally {
            setGeneratingState(false);
        }
    });
}

// Download QR code
function downloadQR(format) {
    if (!qrCode) {
        showNotification(t('message.error.empty'));
        return;
    }

    const filename = `qrcode-${currentType}-${Date.now()}`;
    
    if (format === 'png') {
        qrCode.download({
            name: filename,
            extension: 'png'
        });
    } else if (format === 'svg') {
        qrCode.download({
            name: filename,
            extension: 'svg'
        });
    }
}

// Utility function to check if string contains non-ASCII characters
function containsNonASCII(str) {
    return /[^\x00-\x7F]/.test(str);
}

// Utility function to encode string in QUOTED-PRINTABLE format for vCard
function encodeQuotedPrintable(str) {
    // Encode string to UTF-8 bytes and then to QUOTED-PRINTABLE
    const encoded = [];
    const utf8Encoder = new TextEncoder();
    const bytes = utf8Encoder.encode(str);
    const EQUALS_CHAR_CODE = '='.charCodeAt(0);
    
    for (let i = 0; i < bytes.length; i++) {
        const byte = bytes[i];
        // Characters that must be encoded: control chars, =, and non-ASCII
        // Per RFC 2047, we encode all non-printable ASCII and non-ASCII bytes
        if (byte < 32 || byte > 126 || byte === EQUALS_CHAR_CODE) {
            encoded.push('=' + byte.toString(16).toUpperCase().padStart(2, '0'));
        } else {
            encoded.push(String.fromCharCode(byte));
        }
    }
    
    return encoded.join('');
}

// Utility function to escape and encode vCard field values
function escapeVCard(str) {
    // First escape special vCard characters
    let escaped = str.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    return escaped;
}

// Utility function to format vCard field with proper encoding
function formatVCardField(fieldName, value, escapeValue = true) {
    if (!value) return '';
    
    // Escape the value if needed
    const processedValue = escapeValue ? escapeVCard(value) : value;
    
    // Check if the value contains non-ASCII characters (Korean, etc.)
    if (containsNonASCII(processedValue)) {
        // Use QUOTED-PRINTABLE encoding with UTF-8 charset for non-ASCII content
        const encoded = encodeQuotedPrintable(processedValue);
        return `${fieldName};CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:${encoded}\r\n`;
    } else {
        // Use plain format for ASCII-only content
        return `${fieldName}:${processedValue}\r\n`;
    }
}

// Utility function to format vCard N field with proper encoding
function formatVCardNameField(nValue, hasNonASCII) {
    if (hasNonASCII) {
        const encoded = encodeQuotedPrintable(nValue);
        return `N;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:${encoded}\r\n`;
    } else {
        return `N:${nValue}\r\n`;
    }
}

// Utility function to escape special characters in Wi-Fi QR code
function escapeWiFi(str) {
    // Escape special characters: backslash, semicolon, comma, colon, double quote
    return str.replace(/\\/g, '\\\\')
              .replace(/;/g, '\\;')
              .replace(/,/g, '\\,')
              .replace(/:/g, '\\:')
              .replace(/"/g, '\\"');
}
