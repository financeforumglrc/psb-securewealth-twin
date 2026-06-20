/**
 * DS Financial frontend runtime configuration.
 * GitHub Pages builds point to the Render backend.
 * Local dev falls back to localhost.
 */
(function () {
    const isProduction = location.hostname.endsWith('github.io') ||
                         location.hostname.endsWith('onrender.com') ||
                         location.hostname === 'psb-securewealth-frontend.onrender.com';
    window.DS_API_BASE_URL = isProduction
        ? 'https://psb-securewealth-backend.onrender.com/api/v1'
        : 'http://localhost:5000/api/v1';
})();
