(function () {
    function openHash() {
        let id;
        try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
        if (!id) return;
        if (document.getElementById('panel-' + id) && typeof switchTool === 'function') switchTool(id);
        else if (document.getElementById(id)?.classList.contains('inv-content') && typeof switchInv === 'function') switchInv(id);
    }
    document.addEventListener('DOMContentLoaded', openHash);
    window.addEventListener('hashchange', openHash);
    document.addEventListener('click', function (event) {
        const control = event.target.closest('[data-tool]');
        if (control?.dataset.tool && document.getElementById('panel-' + control.dataset.tool)) history.replaceState(null, '', '#' + control.dataset.tool);
    });
})();
