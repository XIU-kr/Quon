// QR Code Generator Application
let qrCode = null;
let currentType = 'url';
let logoImage = null;
let map = null;
let marker = null;
let mapInitialized = false;

// Initialize Google Maps
function initMap() {
    // Default to San Francisco
    const defaultLocation = { lat: 37.7749, lng: -122.4194 };
    
    map = new google.maps.Map(document.getElementById('geo-map'), {
        center: defaultLocation,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false
    });
    
    // Add marker
    marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        draggable: true
    });
    
    // Update coordinates when marker is dragged
    marker.addListener('dragend', function(event) {
        updateLocationFromLatLng(event.latLng.lat(), event.latLng.lng());
    });
    
    // Add click listener to map
    map.addListener('click', function(event) {
        updateLocationFromLatLng(event.latLng.lat(), event.latLng.lng());
        marker.setPosition(event.latLng);
    });
    
    // Initialize Places Autocomplete
    const searchInput = document.getElementById('geo-search');
    const autocomplete = new google.maps.places.Autocomplete(searchInput);
    autocomplete.bindTo('bounds', map);
    
    autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();
        
        if (!place.geometry) {
            showNotification('No location found for this search', 'error');
            return;
        }
        
        // Update map and marker
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }
        
        marker.setPosition(place.geometry.location);
        updateLocationFromLatLng(place.geometry.location.lat(), place.geometry.location.lng());
    });
    
    mapInitialized = true;
}

// Update location fields from lat/lng
function updateLocationFromLatLng(lat, lng) {
    document.getElementById('geo-lat').value = lat.toFixed(6);
    document.getElementById('geo-lon').value = lng.toFixed(6);
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
    
    // Initialize map when geo type is selected
    if (type === 'geo' && mapInitialized && map) {
        // Trigger resize to ensure map displays correctly
        setTimeout(() => {
            google.maps.event.trigger(map, 'resize');
            map.setCenter(marker.getPosition());
        }, 100);
    }
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
            const tel = document.getElementById('vcard-tel').value.trim();
            const email = document.getElementById('vcard-email').value.trim();
            const url = document.getElementById('vcard-url').value.trim();
            const address = document.getElementById('vcard-address').value.trim();

            // iOS-compatible vCard format with CRLF line endings
            content = 'BEGIN:VCARD\r\nVERSION:3.0\r\n';
            if (name) {
                // Note: Name parsing assumes Western naming convention (First Last)
                // May not work correctly for names with prefixes, suffixes, or non-Western formats
                const nameParts = name.split(' ');
                const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
                const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : name;
                content += `N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;\r\n`;
                content += `FN:${escapeVCard(name)}\r\n`;
            }
            if (org) content += `ORG:${escapeVCard(org)}\r\n`;
            if (tel) content += `TEL;TYPE=CELL:${tel}\r\n`;
            if (email) content += `EMAIL;TYPE=INTERNET:${email}\r\n`;
            if (url) content += `URL:${url}\r\n`;
            if (address) {
                // ADR format: ;;street;city;state;postal;country
                // Expected input format: "Street, City, Country"
                // Note: This is a simplified parser. For more complex addresses, consider more robust parsing
                const addrParts = address.split(',').map(p => p.trim());
                const street = addrParts[0] || '';
                const city = addrParts[1] || '';
                const country = addrParts[2] || '';
                content += `ADR;TYPE=HOME:;;${escapeVCard(street)};${escapeVCard(city)};;${escapeVCard(country)}\r\n`;
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
            const telNumber = document.getElementById('tel-number').value.trim();
            if (telNumber) {
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
    container.innerHTML = '<div class="empty-state"><div class="icon">📱</div><p>Enter content and click "Generate QR Code"</p></div>';
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
        showNotification('Please enter content for the QR code');
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
        showNotification('Please generate a QR code first');
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
