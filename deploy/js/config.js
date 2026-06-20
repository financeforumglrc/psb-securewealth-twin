/**
 * DS Financial frontend runtime configuration.
 * GitHub Pages builds point to the Render backend.
 * Local dev falls back to localhost.
 */
(function () {
    const isGitHubPages = location.hostname.endsWith('github.io');
    window.DS_API_BASE_URL = isGitHubPages
        ? 'https://psb-securewealth-api.onrender.com/api/v1'
        : 'http://localhost:5000/api/v1';
})();
