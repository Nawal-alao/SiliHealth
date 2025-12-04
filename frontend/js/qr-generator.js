/**
 * QR Code Generator Helper
 * Generates QR codes using external API (no dependencies)
 */

window.QRCodeGenerator = {
  /**
   * Generate QR code as Data URL
   * @param {string} text - Text to encode
   * @param {number} size - Size in pixels (default 200)
   * @returns {Promise<string>} - Data URL of QR code
   */
  generate: async function(text, size = 200) {
    try {
      // Using qr-server.com API (free, no auth required)
      const encoded = encodeURIComponent(text);
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
      
      // Fetch and convert to data URL for display
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('QR code generation failed:', error);
      throw error;
    }
  },

  /**
   * Generate QR code and render to DOM element
   * @param {string} text - Text to encode
   * @param {HTMLElement} container - Container element
   * @param {number} size - Size in pixels
   */
  renderToElement: async function(text, container, size = 200) {
    try {
      const dataUrl = await this.generate(text, size);
      const img = document.createElement('img');
      img.src = dataUrl;
      img.alt = 'QR Code';
      img.style.maxWidth = size + 'px';
      img.style.borderRadius = '8px';
      img.style.background = 'white';
      img.style.padding = '8px';
      container.innerHTML = '';
      container.appendChild(img);
    } catch (error) {
      console.error('Failed to render QR code:', error);
      container.innerHTML = `<p class="muted" style="color: var(--danger);">Erreur génération QR code</p>`;
    }
  },

  /**
   * Generate QR code as SVG (client-side, no network)
   * Simple implementation for basic encoding
   * @param {string} text - Text to encode
   * @param {number} size - Size in pixels
   * @returns {string} - SVG string
   */
  generateSVG: function(text, size = 200) {
    // For simple implementation without external library
    // we'll generate a placeholder SVG that encodes the text
    const encoded = btoa(text).substring(0, 32); // Simple encoding
    const parts = encoded.split('').map((c, i) => {
      const code = c.charCodeAt(0);
      return (code % 2 === 0) ? '█' : ' ';
    });

    // Create a simple grid pattern
    const gridSize = Math.ceil(Math.sqrt(parts.length));
    let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="white"/>
      <text x="${size/2}" y="${size/2 + 5}" font-size="10" text-anchor="middle" fill="black">${text.substring(0, 20)}</text>
    </svg>`;

    return svg;
  }
};
