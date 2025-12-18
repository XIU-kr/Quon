// English translations
window.en = {
    // Header - Updated branding to Quon
    'header.title': '🎨 Quon - Free QR Code Generator',
    'header.subtitle': 'Create customized QR codes with the information you want easily',
    
    // Type selector
    'type.url': 'URL',
    'type.text': 'Text',
    'type.vcard': 'Contact',
    'type.email': 'Email',
    'type.tel': 'Phone',
    'type.geo': 'Location',
    'type.wifi': 'Wi-Fi',
    
    // Section titles
    'section.type': 'Select Code Type',
    'section.content': 'Enter Content',
    'section.design': 'Customize Design',
    'section.preview': 'Preview',
    
    // Common form labels
    'form.required': '*',
    'form.optional': '(optional)',
    
    // URL form
    'url.label': 'URL Address',
    'url.placeholder': 'https://example.com',
    
    // Text form
    'text.label': 'Text Content',
    'text.placeholder': 'Enter your text here...',
    
    // VCard form
    'vcard.required': 'Required Fields',
    'vcard.optional': 'Optional Fields',
    'vcard.fullname': 'Full Name',
    'vcard.fullname.placeholder': 'John Doe',
    'vcard.fullname.help': 'Or enter last and first name separately below',
    'vcard.lastname': 'Last Name',
    'vcard.lastname.placeholder': 'Doe',
    'vcard.firstname': 'First Name',
    'vcard.firstname.placeholder': 'John',
    'vcard.tel': 'Phone Number',
    'vcard.tel.placeholder': '1234567890',
    'vcard.country.use': 'Use country code',
    'vcard.country.select': 'Select Country',
    'vcard.org': 'Company/Organization',
    'vcard.org.placeholder': 'Company Name',
    'vcard.email': 'Email',
    'vcard.email.placeholder': 'email@example.com',
    'vcard.url': 'Website',
    'vcard.url.placeholder': 'https://example.com',
    'vcard.address': 'Address',
    'vcard.address.search': 'Search Address',
    'vcard.address.search.placeholder': 'Search for address (e.g., City Hall)',
    'vcard.address.placeholder': 'Enter address directly or search above',
    
    // Email form
    'email.to': 'Recipient Email',
    'email.to.placeholder': 'recipient@example.com',
    'email.subject': 'Subject',
    'email.subject.placeholder': 'Email subject',
    'email.body': 'Body',
    'email.body.placeholder': 'Email content...',
    
    // Tel form
    'tel.number': 'Phone Number',
    'tel.number.placeholder': '1234567890',
    
    // Geo form
    'geo.search': 'Address Search',
    'geo.search.placeholder': 'Enter place name or address (e.g., City Hall)',
    'geo.lat': 'Latitude',
    'geo.lat.placeholder': '37.5665',
    'geo.lat.help': 'Latitude value (-90 ~ 90)',
    'geo.lon': 'Longitude',
    'geo.lon.placeholder': '126.9780',
    'geo.lon.help': 'Longitude value (-180 ~ 180)',
    'geo.current': '📍 Use My Current Location',
    'geo.current.help': 'Or search address above or enter coordinates manually',
    
    // Wi-Fi form
    'wifi.ssid': 'Network Name (SSID)',
    'wifi.ssid.placeholder': 'MyWiFi',
    'wifi.password': 'Password',
    'wifi.password.placeholder': 'password123',
    'wifi.encryption': 'Security Type',
    'wifi.encryption.wpa': 'WPA/WPA2',
    'wifi.encryption.wep': 'WEP',
    'wifi.encryption.none': 'None',
    'wifi.hidden': 'Hidden Network',
    
    // Design options
    'design.dots.type': 'Dot Style',
    'design.dots.rounded': 'Rounded Square',
    'design.dots.dots': 'Dots',
    'design.dots.classy': 'Classy',
    'design.dots.classy-rounded': 'Classy Rounded',
    'design.dots.square': 'Square',
    'design.dots.extra-rounded': 'Extra Rounded',
    
    'design.corner.square': 'Corner Square Style',
    'design.corner.square.dot': 'Dot',
    'design.corner.square.square': 'Square',
    'design.corner.square.extra-rounded': 'Extra Rounded',
    
    'design.corner.dot': 'Corner Dot Style',
    'design.corner.dot.dot': 'Dot',
    'design.corner.dot.square': 'Square',
    
    'design.color.dots': 'Code Color',
    'design.color.background': 'Background Color',
    
    'design.logo': 'Logo Image (optional)',
    'design.logo.help': 'Upload a logo to place in the center of the code',
    
    // Buttons
    'button.generate': 'Generate QR Code',
    'button.download.png': 'Download PNG',
    'button.download.svg': 'Download SVG',
    'button.search': '🔍 Search',
    
    // Messages
    'message.empty': 'Enter content and click "Generate QR Code"',
    'message.error.empty': 'Please enter the content for the QR code',
    'message.error.required': 'Please fill in the required field',
    'message.error.email': 'Please enter the recipient email',
    'message.error.tel': 'Please enter the phone number',
    'message.error.name': 'Please enter your name or full name',
    'message.error.geo': 'Please enter latitude and longitude',
    'message.error.api': 'API server connection failed',
    'message.error.network': 'Please check your network connection',
    'message.error.search.empty': 'No search results',
    'message.error.search.query': 'Please enter an address to search',
    'message.success.location': 'Location successfully retrieved!',
    'message.success.location.select': 'Location selected',
    'message.success.address.select': 'Address entered',
    'message.loading.location': '⏳ Checking location...',
    'message.loading.search': 'Searching...',
    'message.error.location.denied': 'Location access denied. Please allow location permissions.',
    'message.error.location.unavailable': 'Location information unavailable',
    'message.error.location.timeout': 'Location request timed out',
    'message.error.location.unsupported': 'Browser does not support geolocation',
    
    // Footer
    'footer.made': 'Made with ❤️ by',
    'footer.github': 'GitHub Repository',
    
    // Country codes
    'country.kr': 'South Korea (+82)',
    'country.us': 'USA/Canada (+1)',
    'country.jp': 'Japan (+81)',
    'country.cn': 'China (+86)',
    
    // Ad sections
    'ad.header': 'Advertisement',
    'ad.note': 'Ads help keep this service free. Future mobile app will offer ad-free experience with in-app purchase.',
    
    // Language switcher
    'lang.name.en': 'English',
    'lang.name.ko': '한국어',
    'lang.select': 'Language'
};

// Also export for module systems (if available)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.en;
}
