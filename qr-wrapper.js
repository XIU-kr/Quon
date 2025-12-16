/**
 * QR Code Styling Wrapper
 * Wraps the qrcode library to provide a QRCodeStyling-compatible interface
 */

(function(global) {
    'use strict';

    // Get the QRCode library from the bundle
    const QRCodeLib = global.require ? global.require('qrcode') : null;

    if (!QRCodeLib) {
        console.error('QRCode library not found. Make sure qrcode-bundle.js is loaded first.');
        return;
    }

    // QRCodeStyling wrapper for compatibility
    global.QRCodeStyling = function(options) {
        this._options = options || {};
        this._container = null;
        this._canvas = null;
    };

    global.QRCodeStyling.prototype = {
        append: function(container) {
            this._container = container;
            this.update(this._options);
        },
        
        update: function(options) {
            if (options) {
                this._options = Object.assign({}, this._options, options);
            }
            
            if (!this._container) return;
            
            // Clear container
            while (this._container.firstChild) {
                this._container.removeChild(this._container.firstChild);
            }
            
            // Create canvas
            const canvas = document.createElement('canvas');
            this._canvas = canvas;
            
            // Prepare QRCode options
            const qrOptions = {
                errorCorrectionLevel: this._options.qrOptions?.errorCorrectionLevel || 'M',
                type: 'image/png',
                width: this._options.width || 300,
                margin: this._options.margin || 2,
                color: {
                    dark: (this._options.dotsOptions && this._options.dotsOptions.color) || '#000000',
                    light: (this._options.backgroundOptions && this._options.backgroundOptions.color) || '#ffffff'
                }
            };
            
            // Generate QR code
            QRCodeLib.toCanvas(canvas, this._options.data || '', qrOptions, (error) => {
                if (error) {
                    console.error('QR Code generation error:', error);
                    const errorDiv = document.createElement('div');
                    errorDiv.textContent = 'Error generating QR code';
                    errorDiv.style.color = 'red';
                    this._container.appendChild(errorDiv);
                    return;
                }
                
                // Apply custom styling if needed
                this._applyCustomStyling(canvas, this._options);
                
                // Add to container
                this._container.appendChild(canvas);
                
                // Add logo if provided
                if (this._options.image) {
                    this._addLogo(canvas, this._options.image);
                }
            });
        },
        
        _applyCustomStyling: function(canvas, options) {
            // Note: Advanced styling (rounded dots, etc.) would require 
            // post-processing the canvas, which is complex.
            // For now, we use the standard QR code appearance.
            // This is a limitation compared to qr-code-styling library.
        },
        
        _addLogo: function(canvas, logoSrc) {
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = function() {
                const size = canvas.width;
                const logoSize = size * 0.2;
                const x = (size - logoSize) / 2;
                const y = (size - logoSize) / 2;
                
                // White background for logo
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
                
                // Draw logo
                ctx.drawImage(img, x, y, logoSize, logoSize);
            };
            
            img.onerror = function() {
                console.error('Failed to load logo image');
            };
            
            img.src = logoSrc;
        },
        
        download: function(options) {
            if (!this._canvas) {
                console.error('No QR code generated');
                return;
            }
            
            const filename = (options.name || 'qrcode') + '.' + (options.extension || 'png');
            
            if (options.extension === 'svg') {
                // Convert canvas to SVG
                this._downloadAsSVG(filename);
            } else {
                // Download as PNG
                this._downloadAsPNG(filename);
            }
        },
        
        _downloadAsPNG: function(filename) {
            this._canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = filename;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
            });
        },
        
        _downloadAsSVG: function(filename) {
            const canvas = this._canvas;
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Create SVG
            let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">`;
            
            // Add background
            const bgColor = this._options.backgroundOptions?.color || '#ffffff';
            svg += `<rect width="${canvas.width}" height="${canvas.height}" fill="${bgColor}"/>`;
            
            // Sample pixels and create rects
            const moduleSize = Math.ceil(canvas.width / 100); // Sample every N pixels
            for (let y = 0; y < canvas.height; y += moduleSize) {
                for (let x = 0; x < canvas.width; x += moduleSize) {
                    const i = (y * canvas.width + x) * 4;
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    // If dark pixel
                    if (r + g + b < 382) {
                        const color = `rgb(${r},${g},${b})`;
                        svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="${color}"/>`;
                    }
                }
            }
            
            svg += '</svg>';
            
            // Download SVG
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        }
    };

})(typeof window !== 'undefined' ? window : this);
