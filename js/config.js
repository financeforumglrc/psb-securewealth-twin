/**
 * DS Financial frontend runtime configuration.
 * GitHub Pages builds point to the Render backend.
 * Local dev falls back to localhost.
 */
(function () {
    // Allow a deployment to provide its own API URL before this script loads.
    if (window.DS_API_BASE_URL) return;
    const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
    window.DS_API_BASE_URL = isLocal
        ? '/api/v1'
        : 'https://psb-securewealth-backend.onrender.com/api/v1';
})();
