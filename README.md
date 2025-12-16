# 🎨 QR Code Generator

A beautiful, responsive web application for generating customizable QR codes. Create QR codes for URLs, plain text, contact information (V-Card), emails, phone numbers, locations, and Wi-Fi credentials - all with extensive styling options.

![QR Code Generator](https://img.shields.io/badge/QR%20Code-Generator-51A273?style=for-the-badge)
[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-51A273?style=for-the-badge&logo=github)](https://sn0wmankr.github.io/QRCodeGenerator/)
[![License](https://img.shields.io/badge/License-MIT-51A273?style=for-the-badge)](LICENSE)

## ✨ Features

### 📱 Multiple QR Code Types
- **URL** - Website links and web pages
- **Plain Text** - Any text content
- **V-Card** - Contact information (name, phone, email, address, etc.)
- **Email** - Pre-filled email with recipient, subject, and body
- **Phone** - Direct phone call links
- **Location (Geo)** - GPS coordinates for maps
- **Wi-Fi** - Wireless network credentials with security settings

### 🎨 Extensive Customization
- **Dot Styles**: Rounded, Dots, Classy, Classy Rounded, Square, Extra Rounded
- **Corner Styles**: Customize corner squares and dots independently
- **Color Options**: Full color picker for dots and background
- **Logo Support**: Upload and embed your logo in the center of the QR code
- **High Quality**: Generate QR codes optimized for scanning

### 📲 Responsive Design
- Beautiful, modern interface with gradient backgrounds
- Fully responsive layout that works on desktop, tablet, and mobile
- Touch-friendly controls and intuitive navigation
- Optimized for all screen sizes

### 💾 Export Options
- **PNG Format**: High-resolution raster image
- **SVG Format**: Scalable vector graphics for print

## 🚀 Quick Start

### Online Version
Visit the live application: [QR Code Generator](https://sn0wmankr.github.io/QRCodeGenerator/)

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/sn0wmankr/QRCodeGenerator.git
   cd QRCodeGenerator
   ```

2. Open `index.html` in your web browser:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Or simply open the file
   open index.html
   ```

3. Start creating QR codes!

## 🎯 Usage Guide

### Creating a QR Code

1. **Select QR Code Type**
   - Click on one of the seven type buttons at the top (URL, Text, V-Card, etc.)

2. **Enter Content**
   - Fill in the required fields for your selected type
   - All form fields are validated and formatted automatically

3. **Customize Appearance** (Optional)
   - Choose dot style, corner styles, and colors
   - Upload a logo image to place in the center
   - Preview updates in real-time

4. **Generate**
   - Click the "Generate QR Code" button
   - Your QR code appears in the preview panel

5. **Download**
   - Click "Download PNG" or "Download SVG" to save your QR code

### Examples

#### URL QR Code
```
Type: URL
Input: https://github.com/sn0wmankr
```

#### Wi-Fi QR Code
```
Type: Wi-Fi
SSID: MyHomeNetwork
Password: SecurePassword123
Security: WPA/WPA2
Hidden: No
```

#### V-Card QR Code
```
Type: V-Card
Name: John Doe
Organization: Tech Company
Phone: +1-234-567-8900
Email: john@example.com
```

## 🛠️ Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - No framework dependencies
- **[qr-code-styling](https://github.com/kozakdenys/qr-code-styling)** - Advanced QR code generation with styling support (via CDN)
- **GitHub Pages** - Free hosting

## 🌈 Color Theme

The application uses a calming green color palette:
- Primary Color: `#51A273` (Emerald Green)
- Primary Hover: `#429960`
- Light Background: `#e8f5ed`

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**sn0wmankr**
- GitHub: [@sn0wmankr](https://github.com/sn0wmankr)
- Project: [QRCodeGenerator](https://github.com/sn0wmankr/QRCodeGenerator)

## 🙏 Acknowledgments

- [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) - Excellent QR code styling library
- QR Code technology originally developed by Denso Wave

## 📊 Project Status

🟢 Active - This project is actively maintained and accepting contributions.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/sn0wmankr">sn0wmankr</a>
</div>
