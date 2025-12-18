// QR Code Generator Application
let qrCode = null;
let currentType = 'url';
let logoImage = null;

// Get current location using browser's geolocation API
function getCurrentLocation() {
    const button = document.getElementById('get-current-location');
    
    if (!navigator.geolocation) {
        showNotification('브라우저에서 위치 정보를 지원하지 않습니다', 'error');
        return;
    }
    
    // Update button text to show loading state
    const originalText = button.innerHTML;
    button.innerHTML = '⏳ 위치 확인 중...';
    button.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            // Success - update fields with current location
            document.getElementById('geo-lat').value = position.coords.latitude.toFixed(6);
            document.getElementById('geo-lon').value = position.coords.longitude.toFixed(6);
            showNotification('위치를 성공적으로 확인했습니다!', 'success');
            button.innerHTML = originalText;
            button.disabled = false;
        },
        function(error) {
            // Error handling
            let message = '위치를 확인할 수 없습니다';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    message = '위치 접근이 거부되었습니다. 위치 권한을 허용해주세요.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = '위치 정보를 사용할 수 없습니다';
                    break;
                case error.TIMEOUT:
                    message = '위치 요청 시간이 초과되었습니다';
                    break;
            }
            showNotification(message, 'error');
            button.innerHTML = originalText;
            button.disabled = false;
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// Search address using Kakao Map API via proxy
async function searchAddress(query, resultContainerId) {
    const resultsContainer = document.getElementById(resultContainerId);
    
    if (!query.trim()) {
        showNotification('검색할 주소를 입력해주세요', 'error');
        return;
    }
    
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = '<div class="search-results-loading">검색 중...</div>';
    
    try {
        const response = await fetch(`https://proxy.sn0wman.kr/api/kakao/geocode?query=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error('API_CONNECTION_FAILED');
        }
        
        const data = await response.json();
        
        if (!data.documents || data.documents.length === 0) {
            resultsContainer.innerHTML = '<div class="search-results-empty">검색 결과가 없습니다</div>';
            return;
        }
        
        // Display search results
        resultsContainer.innerHTML = '';
        data.documents.forEach((place, index) => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <div class="address-name">${place.address_name || place.place_name || '주소 정보 없음'}</div>
                <div class="address-detail">위도: ${place.y}, 경도: ${place.x}</div>
            `;
            item.addEventListener('click', () => {
                selectSearchResult(place, resultContainerId);
            });
            resultsContainer.appendChild(item);
        });
        
    } catch (error) {
        console.error('Address search error:', error.message || 'Unknown error');
        
        // Determine user-friendly error message
        let errorMessage = 'API 서버와 연결이 실패했습니다';
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
            errorMessage = '네트워크 연결을 확인해주세요';
        }
        
        resultsContainer.innerHTML = `<div class="search-results-empty">${errorMessage}</div>`;
        showNotification(errorMessage, 'error');
    }
}

// Handle search result selection
function selectSearchResult(place, resultContainerId) {
    const resultsContainer = document.getElementById(resultContainerId);
    
    if (resultContainerId === 'geo-search-results') {
        // For location form
        document.getElementById('geo-lat').value = place.y;
        document.getElementById('geo-lon').value = place.x;
        showNotification('위치가 선택되었습니다', 'success');
    } else if (resultContainerId === 'vcard-search-results') {
        // For vCard form
        document.getElementById('vcard-address').value = place.address_name || place.place_name || '';
        showNotification('주소가 입력되었습니다', 'success');
    }
    
    // Hide search results
    resultsContainer.style.display = 'none';
    resultsContainer.innerHTML = '';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    createInitialQRCode();
    // Disable download buttons initially
    document.getElementById('download-png').disabled = true;
    document.getElementById('download-svg').disabled = true;
});

// Initialize all event listeners
function initializeEventListeners() {
    // Type selector buttons
    const typeButtons = document.querySelectorAll('.type-btn');
    typeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            switchQRType(this.dataset.type);
        });
    });

    // Generate button
    document.getElementById('generate-btn').addEventListener('click', generateQRCode);

    // Download buttons
    document.getElementById('download-png').addEventListener('click', () => downloadQR('png'));
    document.getElementById('download-svg').addEventListener('click', () => downloadQR('svg'));

    // Logo upload
    document.getElementById('logo-upload').addEventListener('change', handleLogoUpload);

    // Get current location button
    document.getElementById('get-current-location').addEventListener('click', getCurrentLocation);

    // Address search buttons
    document.getElementById('geo-search-btn').addEventListener('click', () => {
        const query = document.getElementById('geo-address-search').value;
        searchAddress(query, 'geo-search-results');
    });
    
    document.getElementById('vcard-search-btn').addEventListener('click', () => {
        const query = document.getElementById('vcard-address-search').value;
        searchAddress(query, 'vcard-search-results');
    });
    
    // Search on Enter key
    document.getElementById('geo-address-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = document.getElementById('geo-address-search').value;
            searchAddress(query, 'geo-search-results');
        }
    });
    
    document.getElementById('vcard-address-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = document.getElementById('vcard-address-search').value;
            searchAddress(query, 'vcard-search-results');
        }
    });

    // Customization options - live update
    const customizationInputs = [
        'dots-type', 'corner-square-type', 'corner-dot-type',
        'dots-color', 'background-color'
    ];
    
    customizationInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', generateQRCode);
        }
    });

    // Input fields - generate on Enter key
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

// Switch between QR code types
function switchQRType(type) {
    currentType = type;

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
                showNotification('이름 또는 성함을 입력해주세요');
                return '';
            }
            if (!tel) {
                showNotification('전화번호를 입력해주세요');
                return '';
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
                showNotification('받는 사람 이메일을 입력해주세요');
                return '';
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
                showNotification('전화번호를 입력해주세요');
                return '';
            }

            // Add country code if checkbox is enabled and country is selected
            const formattedTelNumber = (useTelCountryCode && telCountryCode) ? `${telCountryCode}${telNumber}` : telNumber;
            content = `tel:${formattedTelNumber}`;
            break;

        case 'geo':
            const lat = document.getElementById('geo-lat').value.trim();
            const lon = document.getElementById('geo-lon').value.trim();
            if (lat && lon) {
                content = `geo:${lat},${lon}`;
            }
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
    container.innerHTML = '<div class="empty-state"><div class="icon">📱</div><p>내용을 입력하고 "QR 코드 만들기"를 눌러주세요</p></div>';
}

// Show notification message
function showNotification(message, type = 'error') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
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
    const content = getQRContent();

    if (!content) {
        showNotification('QR 코드에 담을 내용을 입력해주세요');
        return;
    }

    const options = getQROptions();
    options.data = content;

    const container = document.getElementById('qr-code-container');
    container.innerHTML = '';

    // Create new QR code
    qrCode = new QRCodeStyling(options);
    qrCode.append(container);

    // Enable download buttons
    document.getElementById('download-png').disabled = false;
    document.getElementById('download-svg').disabled = false;
}

// Download QR code
function downloadQR(format) {
    if (!qrCode) {
        showNotification('먼저 QR 코드를 만들어주세요');
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
