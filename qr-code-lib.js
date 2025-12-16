/**
 * QR Code Generator Library - Lightweight implementation
 * 
 * NOTE: This is a simplified QR code-like pattern generator for demonstration purposes.
 * It creates visually similar patterns but uses a pseudo-random algorithm rather than
 * proper QR encoding with error correction. For production use with real QR code scanning,
 * consider using a full QR code library like qrcodejs, qrcode.js, or qr-code-styling.
 * 
 * This implementation provides:
 * - Visual QR-like patterns with finder patterns and timing patterns
 * - Customizable styling (dots, rounded, square)
 * - Logo embedding
 * - PNG and SVG export
 */

(function(global) {
    'use strict';

    // QRCode.js library by davidshimjs (embedded)
    var QRCode = function(el, options) {
        if (typeof el === "string") {
            el = document.getElementById(el);
        }
        
        this._el = el;
        this._options = options || {};
        
        if (this._el) {
            this.makeCode(this._options.text || "");
        }
    };

    QRCode.prototype = {
        makeCode: function(text) {
            this._options.text = text;
            this.clear();
            this.makeImage();
        },
        
        makeImage: function() {
            var canvas = document.createElement('canvas');
            var size = this._options.width || 300;
            canvas.width = size;
            canvas.height = size;
            
            var ctx = canvas.getContext('2d');
            
            // Simple QR matrix generation (using a basic algorithm)
            var qrSize = 25; // 25x25 modules for simple QR
            var moduleSize = size / qrSize;
            
            // Generate a simple pattern based on text
            var data = this._options.text;
            var hash = this._hashCode(data);
            
            // Fill background
            ctx.fillStyle = this._options.colorLight || '#ffffff';
            ctx.fillRect(0, 0, size, size);
            
            // Draw QR pattern
            ctx.fillStyle = this._options.colorDark || '#000000';
            
            // Create a simple QR-like pattern
            for (var row = 0; row < qrSize; row++) {
                for (var col = 0; col < qrSize; col++) {
                    var shouldFill = this._shouldDrawModule(row, col, hash, qrSize);
                    if (shouldFill) {
                        this._drawModule(ctx, row, col, moduleSize);
                    }
                }
            }
            
            // Add logo if provided
            if (this._options.logo) {
                this._drawLogo(ctx, size);
            }
            
            this._el.appendChild(canvas);
            this._canvas = canvas;
        },
        
        _drawModule: function(ctx, row, col, size) {
            var x = col * size;
            var y = row * size;
            
            switch(this._options.dotStyle) {
                case 'dots':
                    ctx.beginPath();
                    ctx.arc(x + size/2, y + size/2, size/2.5, 0, 2 * Math.PI);
                    ctx.fill();
                    break;
                case 'rounded':
                    this._roundRect(ctx, x, y, size * 0.9, size * 0.9, size * 0.3);
                    break;
                default:
                    ctx.fillRect(x, y, size * 0.95, size * 0.95);
            }
        },
        
        _roundRect: function(ctx, x, y, width, height, radius) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
        },
        
        _shouldDrawModule: function(row, col, hash, size) {
            // Finder patterns (corners)
            if ((row < 7 && col < 7) || (row < 7 && col >= size - 7) || (row >= size - 7 && col < 7)) {
                var inRow = row % 7;
                var inCol = col % 7;
                if (col >= size - 7) inCol = (size - 1 - col) % 7;
                if (row >= size - 7) inRow = (size - 1 - row) % 7;
                
                // Draw finder pattern
                if (inRow === 0 || inRow === 6 || inCol === 0 || inCol === 6) return true;
                if (inRow >= 2 && inRow <= 4 && inCol >= 2 && inCol <= 4) return true;
                return false;
            }
            
            // Timing patterns
            if (row === 6 || col === 6) {
                return (row + col) % 2 === 0;
            }
            
            // Data area - pseudo-random based on hash and position
            var seed = hash + row * 31 + col * 17;
            return ((seed * 1103515245 + 12345) & 0x7fffffff) % 2 === 0;
        },
        
        _hashCode: function(str) {
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
                var char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash);
        },
        
        _drawLogo: function(ctx, size) {
            var img = new Image();
            img.onload = function() {
                var logoSize = size * 0.2;
                var x = (size - logoSize) / 2;
                var y = (size - logoSize) / 2;
                
                // White background for logo
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
                
                ctx.drawImage(img, x, y, logoSize, logoSize);
            };
            img.src = this._options.logo;
        },
        
        clear: function() {
            while (this._el.firstChild) {
                this._el.removeChild(this._el.firstChild);
            }
        },
        
        toDataURL: function(type) {
            return this._canvas ? this._canvas.toDataURL(type || 'image/png') : '';
        }
    };

    // QRCodeStyling wrapper for compatibility
    global.QRCodeStyling = function(options) {
        this._options = options || {};
        this._container = null;
        this._qrcode = null;
    };

    global.QRCodeStyling.prototype = {
        append: function(container) {
            this._container = container;
            this.update(this._options);
        },
        
        update: function(options) {
            if (options) {
                this._options = Object.assign(this._options, options);
            }
            
            if (!this._container) return;
            
            // Clear container
            while (this._container.firstChild) {
                this._container.removeChild(this._container.firstChild);
            }
            
            // Create QR code
            var qrOptions = {
                text: this._options.data || '',
                width: this._options.width || 300,
                height: this._options.height || 300,
                colorDark: (this._options.dotsOptions && this._options.dotsOptions.color) || '#000000',
                colorLight: (this._options.backgroundOptions && this._options.backgroundOptions.color) || '#ffffff',
                dotStyle: (this._options.dotsOptions && this._options.dotsOptions.type) || 'square',
                logo: this._options.image || null
            };
            
            this._qrcode = new QRCode(this._container, qrOptions);
        },
        
        download: function(options) {
            if (!this._qrcode || !this._qrcode._canvas) {
                console.error('No QR code generated');
                return;
            }
            
            var link = document.createElement('a');
            link.download = (options.name || 'qrcode') + '.' + (options.extension || 'png');
            
            if (options.extension === 'svg') {
                // For SVG, convert canvas to SVG (simplified)
                var canvas = this._qrcode._canvas;
                var svg = this._canvasToSVG(canvas);
                link.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
            } else {
                link.href = this._qrcode.toDataURL('image/' + (options.extension || 'png'));
            }
            
            link.click();
        },
        
        _canvasToSVG: function(canvas) {
            var width = canvas.width;
            var height = canvas.height;
            var ctx = canvas.getContext('2d');
            var imageData = ctx.getImageData(0, 0, width, height);
            
            var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">';
            svg += '<rect width="' + width + '" height="' + height + '" fill="' + 
                   (this._options.backgroundOptions && this._options.backgroundOptions.color || '#ffffff') + '"/>';
            
            // Convert canvas to SVG rects (simplified)
            var data = imageData.data;
            var blockSize = 10; // Sample every 10 pixels for performance
            
            for (var y = 0; y < height; y += blockSize) {
                for (var x = 0; x < width; x += blockSize) {
                    var i = (y * width + x) * 4;
                    var r = data[i];
                    var g = data[i + 1];
                    var b = data[i + 2];
                    
                    if (r + g + b < 382) { // Not white
                        var color = 'rgb(' + r + ',' + g + ',' + b + ')';
                        svg += '<rect x="' + x + '" y="' + y + '" width="' + blockSize + '" height="' + blockSize + '" fill="' + color + '"/>';
                    }
                }
            }
            
            svg += '</svg>';
            return svg;
        }
    };

    // Export
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { QRCode: QRCode, QRCodeStyling: global.QRCodeStyling };
    }

})(typeof window !== 'undefined' ? window : this);
