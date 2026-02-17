// English translations
window.en = {
    // Header - Updated branding to Quon
    'header.title': 'Quon - Free QR Code Generator',
    'header.subtitle': 'Create customized QR codes with the information you want easily',
    
    // Type selector
    'type.url': 'URL',
    'type.text': 'Text',
    'type.vcard': 'Contact',
    'type.email': 'Email',
    'type.tel': 'Phone',
    'type.wifi': 'Wi-Fi',
    
    // Section titles
    'section.type': 'Select Code Type',
    'section.content': 'Enter Content',
    'section.design': 'Customize Design',
    'section.preview': 'QR Preview',
    
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
    'vcard.address.placeholder': 'Enter address',
    
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
    'design.group.shape': 'Shape',
    'design.group.color': 'Color',
    'design.group.logo': 'Logo',

    // Preview tools
    'preview.zoom.in': '+',
    'preview.zoom.out': '-',
    'preview.zoom.reset': 'Reset',
    
    // Buttons
    'button.generate': 'Generate QR Code',
    'button.download.png': 'Download PNG',
    'button.download.svg': 'Download SVG',
    
    // Messages
    'message.empty': 'Enter content and click "Generate QR Code"',
    'message.error.empty': 'Please enter the content for the QR code',
    'message.error.email': 'Please enter the recipient email',
    'message.error.tel': 'Please enter the phone number',
    'message.error.name': 'Please enter your name or full name',
    'message.error.api': 'API server connection failed',
    'message.error.network': 'Please check your network connection',
    
    // Footer
    'footer.made': 'Made with ❤️ by',
    'footer.privacy': 'Privacy Policy',
    
    // Country codes
    'country.kr': 'South Korea (+82)',
    'country.us': 'USA/Canada (+1)',
    
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
