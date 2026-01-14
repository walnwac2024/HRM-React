// hrm/src/utils/performance.js
// Performance monitoring and Web Vitals tracking

/**
 * Report Web Vitals to analytics
 * @param {object} metric - Web Vital metric
 */
export function reportWebVitals(metric) {
    const { name, value, id } = metric;

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log(`[Web Vital] ${name}:`, value, 'ms');
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production' && window.gtag) {
        window.gtag('event', name, {
            event_category: 'Web Vitals',
            value: Math.round(name === 'CLS' ? value * 1000 : value),
            event_label: id,
            non_interaction: true,
        });
    }
}

/**
 * Measure component render time
 * @param {string} componentName - Name of component
 * @param {Function} callback - Function to measure
 */
export function measureRender(componentName, callback) {
    const start = performance.now();
    const result = callback();
    const end = performance.now();

    console.log(`[Render Time] ${componentName}:`, (end - start).toFixed(2), 'ms');

    return result;
}

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export function throttle(func, limit = 300) {
    let inThrottle;

    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Lazy load images with intersection observer
 * @param {string} selector - CSS selector for images
 */
export function lazyLoadImages(selector = 'img[data-src]') {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        const images = document.querySelectorAll(selector);
        images.forEach((img) => imageObserver.observe(img));
    }
}

/**
 * Prefetch critical resources
 * @param {Array<string>} urls - URLs to prefetch
 */
export function prefetchResources(urls) {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            urls.forEach((url) => {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = url;
                document.head.appendChild(link);
            });
        });
    }
}
