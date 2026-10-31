// A successful mutation response waits for its queued database writes to commit.
// This adapter is intended for one process / one replica only.
module.exports = function persistence(database) {
    return (req, res, next) => {
        if (!database.pgAdapter.isEnabled() || ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
        const end = res.end;
        let ending = false;
        res.end = function (...args) {
            if (ending) return this;
            ending = true;
            (async () => {
                while ((await database.pgAdapter.flush(database.db)).processed > 0) { /* drain */ }
                end.apply(res, args);
            })().catch(() => {
                if (res.headersSent) return res.destroy();
                res.statusCode = 503;
                res.removeHeader('Content-Length');
                res.removeHeader('Content-Encoding');
                res.setHeader('Content-Type', 'application/json');
                end.call(res, JSON.stringify({ success: false, error: 'Database save could not be confirmed. Reload before retrying.' }));
            });
            return this;
        };
        next();
    };
};
