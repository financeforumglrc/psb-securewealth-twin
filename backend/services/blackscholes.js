/**
 * Black-Scholes option pricing — shared between the backend (Node, via
 * module.exports) and the frontend (browser global `BlackScholes`, loaded
 * via <script src="backend/services/blackscholes.js"></script>).
 *
 * Prices European calls/puts and computes Greeks:
 *   delta, gamma, theta (per year), vega (per 1% vol), rho (per 1% rate).
 * Normal CDF via Abramowitz–Stegun 7.1.26 erf approximation (|ε| ≤ 1.5e-7).
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.BlackScholes = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    var SQRT_2PI = Math.sqrt(2 * Math.PI);

    function normPdf(x) {
        return Math.exp(-0.5 * x * x) / SQRT_2PI;
    }

    // Standard normal CDF via erf approximation (Abramowitz–Stegun 7.1.26)
    function normCdf(x) {
        var sign = x < 0 ? -1 : 1;
        var ax = Math.abs(x) / Math.SQRT2;
        var t = 1 / (1 + 0.3275911 * ax);
        var erf = sign * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax));
        return 0.5 * (1 + erf);
    }

    function d1d2(S, K, r, sigma, T) {
        var sqrtT = Math.sqrt(T);
        var d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
        return { d1: d1, d2: d1 - sigma * sqrtT };
    }

    function validInputs(S, K, r, sigma, T) {
        return Number.isFinite(S) && S > 0 && Number.isFinite(K) && K > 0 &&
            Number.isFinite(r) && Number.isFinite(sigma) && sigma > 0 &&
            Number.isFinite(T) && T > 0;
    }

    /**
     * European option price.
     * @param type 'call' | 'put'
     */
    function price(S, K, r, sigma, T, type) {
        if (!validInputs(S, K, r, sigma, T)) return NaN;
        var d = d1d2(S, K, r, sigma, T);
        var disc = Math.exp(-r * T);
        if (type === 'put') {
            return K * disc * normCdf(-d.d2) - S * normCdf(-d.d1);
        }
        return S * normCdf(d.d1) - K * disc * normCdf(d.d2);
    }

    /**
     * Greeks for a European option.
     * theta: per year. vega: per 1.00 (100%) of vol → returned per 1% (divide by 100).
     * rho: per 1% change in interest rate.
     */
    function greeks(S, K, r, sigma, T, type) {
        if (!validInputs(S, K, r, sigma, T)) {
            return { delta: NaN, gamma: NaN, theta: NaN, vega: NaN, rho: NaN };
        }
        var sqrtT = Math.sqrt(T);
        var d = d1d2(S, K, r, sigma, T);
        var pdf = normPdf(d.d1);
        var disc = Math.exp(-r * T);
        var isPut = type === 'put';

        var delta = isPut ? normCdf(d.d1) - 1 : normCdf(d.d1);
        var gamma = pdf / (S * sigma * sqrtT);
        var theta = isPut
            ? (-S * pdf * sigma) / (2 * sqrtT) + r * K * disc * normCdf(-d.d2)
            : (-S * pdf * sigma) / (2 * sqrtT) - r * K * disc * normCdf(d.d2);
        var vega = (S * pdf * sqrtT) / 100; // per 1% vol
        var rho = isPut
            ? (-K * T * disc * normCdf(-d.d2)) / 100
            : (K * T * disc * normCdf(d.d2)) / 100;

        return { delta: delta, gamma: gamma, theta: theta, vega: vega, rho: rho };
    }

    return { normPdf: normPdf, normCdf: normCdf, price: price, greeks: greeks };
});
