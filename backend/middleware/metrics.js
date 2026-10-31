/**
 * API Metrics & Observability Middleware
 * Tracks request rates, latencies, and error rates per endpoint
 */

const { db } = require('../services/database');
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/metrics.log', level: 'info' }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
  ]
});

// In-memory metrics store (reset periodically)
const metrics = {
  totalRequests: 0,
  activeRequests: 0,
  requestsByMethod: {},
  requestsByEndpoint: {},
  requestsByStatus: {},
  errorsByEndpoint: {},
  latencyBuckets: {
    '0-100ms': 0,
    '100-300ms': 0,
    '300-500ms': 0,
    '500-1000ms': 0,
    '1000ms+': 0
  },
  startTime: Date.now()
};

// Reset metrics every hour (use unref so it doesn't keep the process alive in tests)
const metricsInterval = setInterval(() => {
  metrics.startTime = Date.now();
  metrics.totalRequests = 0;
  metrics.requestsByMethod = {};
  metrics.requestsByEndpoint = {};
  metrics.requestsByStatus = {};
  metrics.errorsByEndpoint = {};
  metrics.latencyBuckets = {
    '0-100ms': 0,
    '100-300ms': 0,
    '300-500ms': 0,
    '500-1000ms': 0,
    '1000ms+': 0
  };
}, 60 * 60 * 1000);
metricsInterval.unref();

/**
 * Middleware: track every request
 */
function metricsMiddleware(req, res, next) {
  metrics.totalRequests++;
  metrics.activeRequests++;

  const method = req.method;
  const endpoint = req.path;

  metrics.requestsByMethod[method] = (metrics.requestsByMethod[method] || 0) + 1;
  metrics.requestsByEndpoint[endpoint] = (metrics.requestsByEndpoint[endpoint] || 0) + 1;

  const start = Date.now();

  // Track response
  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.activeRequests--;

    const statusCode = res.statusCode;
    metrics.requestsByStatus[statusCode] = (metrics.requestsByStatus[statusCode] || 0) + 1;

    // Latency bucketing
    if (duration <= 100) metrics.latencyBuckets['0-100ms']++;
    else if (duration <= 300) metrics.latencyBuckets['100-300ms']++;
    else if (duration <= 500) metrics.latencyBuckets['300-500ms']++;
    else if (duration <= 1000) metrics.latencyBuckets['500-1000ms']++;
    else metrics.latencyBuckets['1000ms+']++;

    // Track errors
    if (statusCode >= 400) {
      metrics.errorsByEndpoint[endpoint] = (metrics.errorsByEndpoint[endpoint] || 0) + 1;
      logger.warn('API error', {
        method,
        endpoint,
        statusCode,
        duration,
        timestamp: new Date().toISOString()
      });
    }

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method,
        endpoint,
        duration,
        statusCode,
        timestamp: new Date().toISOString()
      });
    }
  });

  next();
}

/**
 * GET /api/v1/metrics — expose current metrics
 */
function getMetrics(req, res) {
  const uptime = Math.floor((Date.now() - metrics.startTime) / 1000);

  res.json({
    success: true,
    data: {
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`,
      uptimeSeconds: uptime,
      totalRequests: metrics.totalRequests,
      activeRequests: metrics.activeRequests,
      requestsPerSecond: uptime > 0 ? (metrics.totalRequests / uptime).toFixed(2) : 0,
      byMethod: metrics.requestsByMethod,
      byStatus: metrics.requestsByStatus,
      byEndpoint: metrics.requestsByEndpoint,
      errorsByEndpoint: metrics.errorsByEndpoint,
      latencyDistribution: metrics.latencyBuckets,
      startTime: new Date(metrics.startTime).toISOString()
    }
  });
}

/**
 * GET /api/v1/metrics/db — database health
 */
function getDbMetrics(req, res) {
  try {
    const dbStatus = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const activeDevices = db.prepare(`SELECT COUNT(DISTINCT device_id) as count FROM device_ids WHERE last_seen > datetime('now', '-1 day')`).get();
    const totalTransactions = db.prepare('SELECT COUNT(*) as count FROM transactions').get();
    const dbSize = db.prepare("SELECT page_count * page_size as size FROM pragma_page_count, pragma_page_size").get();

    res.json({
      success: true,
      data: {
        totalUsers: dbStatus.count,
        activeDevices24h: activeDevices.count,
        totalTransactions: totalTransactions.count,
        dbSizeBytes: dbSize?.size || 0,
        dbSizeMB: ((dbSize?.size || 0) / (1024 * 1024)).toFixed(2),
        status: 'healthy'
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Database metrics unavailable',
      code: 'METRICS_ERROR'
    });
  }
}

module.exports = {
  metricsMiddleware,
  getMetrics,
  getDbMetrics
};
