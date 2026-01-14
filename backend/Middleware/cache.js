// backend/middleware/cache.js
// Simple in-memory cache middleware for API responses

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Cache middleware for GET requests
 * Usage: router.get('/endpoint', cacheMiddleware(300), handler)
 * @param {number} duration - Cache duration in seconds
 */
function cacheMiddleware(duration = 300) {
    const cacheDuration = duration * 1000;

    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = req.originalUrl || req.url;
        const cached = cache.get(key);

        // Check if cached and not expired
        if (cached && Date.now() - cached.timestamp < cacheDuration) {
            console.log(`[CACHE HIT] ${key}`);
            return res.json(cached.data);
        }

        // Store original res.json
        const originalJson = res.json.bind(res);

        // Override res.json to cache the response
        res.json = function (data) {
            cache.set(key, {
                data,
                timestamp: Date.now(),
            });

            // Clean up old cache entries periodically
            if (cache.size > 100) {
                const now = Date.now();
                for (const [k, v] of cache.entries()) {
                    if (now - v.timestamp > cacheDuration) {
                        cache.delete(k);
                    }
                }
            }

            return originalJson(data);
        };

        next();
    };
}

/**
 * Clear cache for specific pattern
 * @param {string|RegExp} pattern - URL pattern to clear
 */
function clearCache(pattern) {
    if (typeof pattern === 'string') {
        cache.delete(pattern);
    } else if (pattern instanceof RegExp) {
        for (const key of cache.keys()) {
            if (pattern.test(key)) {
                cache.delete(key);
            }
        }
    }
}

/**
 * Clear all cache
 */
function clearAllCache() {
    cache.clear();
}

module.exports = {
    cacheMiddleware,
    clearCache,
    clearAllCache,
};
