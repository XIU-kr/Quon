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
            throw new Error('검색 요청 실패');
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
        console.error('Address search error:', error);
        resultsContainer.innerHTML = '<div class="search-results-empty">검색 중 오류가 발생했습니다</div>';
        showNotification('주소 검색에 실패했습니다', 'error');
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
            const name = document.getElementById('vcard-name').value.trim();
            const org = document.getElementById('vcard-org').value.trim();
            let tel = document.getElementById('vcard-tel').value.trim();
            const email = document.getElementById('vcard-email').value.trim();
            const url = document.getElementById('vcard-url').value.trim();
            const address = document.getElementById('vcard-address').value.trim();

            // iOS-compatible vCard format with CRLF line endings
            content = 'BEGIN:VCARD\r\nVERSION:3.0\r\n';
            if (name) {
                // For Korean names, treat entire name as display name
                content += `FN:${escapeVCard(name)}\r\n`;
                // Try to parse name - if it contains spaces, split; otherwise use as-is
                const nameParts = name.split(' ');
                if (nameParts.length > 1) {
                    // Assume last part is given name, first part is family name (Korean convention)
                    const familyName = nameParts[0];
                    const givenName = nameParts.slice(1).join(' ');
                    content += `N:${escapeVCard(familyName)};${escapeVCard(givenName)};;;\r\n`;
                } else {
                    content += `N:${escapeVCard(name)};;;;\r\n`;
                }
            }
            if (org) content += `ORG:${escapeVCard(org)}\r\n`;
            if (tel) {
                // Format Korean phone number: add +82 and remove leading 0
                tel = formatKoreanPhoneNumber(tel);
                content += `TEL;TYPE=CELL:${tel}\r\n`;
            }
            if (email) content += `EMAIL;TYPE=INTERNET:${email}\r\n`;
            if (url) content += `URL:${url}\r\n`;
            if (address) {
                // For Korean addresses, use the full address as street address
                content += `ADR;TYPE=HOME:;;${escapeVCard(address)};;;;\r\n`;
            }
            content += 'END:VCARD';
            break;

        case 'email':
            const emailTo = document.getElementById('email-to').value.trim();
            const subject = document.getElementById('email-subject').value.trim();
            const body = document.getElementById('email-body').value.trim();

            if (emailTo) {
                content = `mailto:${emailTo}`;
                const params = [];
                if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
                if (body) params.push(`body=${encodeURIComponent(body)}`);
                if (params.length > 0) {
                    content += '?' + params.join('&');
                }
            }
            break;

        case 'tel':
            let telNumber = document.getElementById('tel-number').value.trim();
            if (telNumber) {
                // Format Korean phone number: add +82 and remove leading 0
                telNumber = formatKoreanPhoneNumber(telNumber);
                content = `tel:${telNumber}`;
            }
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
    container.innerHTML = '<div class="empty-state"><div class="icon">📱</div><p>내용을 입력하고 "큐알코드 만들기"를 눌러주세요</p></div>';
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
        showNotification('큐알코드에 담을 내용을 입력해주세요');
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
        showNotification('먼저 큐알코드를 만들어주세요');
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

// Utility function to escape special characters in vCard
function escapeVCard(str) {
    // Escape backslashes first, then other special characters
    return str.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
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

// Utility function to format Korean phone number
// Converts 01012345678 to +821012345678 for international format
function formatKoreanPhoneNumber(phoneNumber) {
    // Remove all non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 010, 011, 016, 017, 018, 019 (Korean mobile prefixes)
    if (cleaned.startsWith('010') || cleaned.startsWith('011') || 
        cleaned.startsWith('016') || cleaned.startsWith('017') || 
        cleaned.startsWith('018') || cleaned.startsWith('019')) {
        // Remove leading 0 and add +82
        cleaned = '+82' + cleaned.substring(1);
    }
    // If it already starts with 82 (country code without +)
    else if (cleaned.startsWith('82')) {
        cleaned = '+' + cleaned;
    }
    // If it doesn't start with + or 82, assume it needs +82
    else if (!cleaned.startsWith('+')) {
        // If it starts with 0, remove it
        if (cleaned.startsWith('0')) {
            cleaned = '+82' + cleaned.substring(1);
        } else {
            cleaned = '+82' + cleaned;
        }
    }
    
    return cleaned;
}
