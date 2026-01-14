// backend/utils/imageOptimizer.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * Optimize and convert image to WebP format
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to save optimized image
 * @param {object} options - Optimization options
 * @returns {Promise<object>} - Optimization results
 */
async function optimizeImage(inputPath, outputPath, options = {}) {
    const {
        width = null,
        height = null,
        quality = 80,
        format = 'webp',
        fit = 'cover',
    } = options;

    try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        // Resize if dimensions provided
        if (width || height) {
            image.resize(width, height, { fit });
        }

        // Convert to specified format
        if (format === 'webp') {
            image.webp({ quality });
        } else if (format === 'jpeg' || format === 'jpg') {
            image.jpeg({ quality, progressive: true });
        } else if (format === 'png') {
            image.png({ quality, compressionLevel: 9 });
        }

        // Save optimized image
        await image.toFile(outputPath);

        // Get file sizes
        const originalSize = (await fs.stat(inputPath)).size;
        const optimizedSize = (await fs.stat(outputPath)).size;
        const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(2);

        return {
            success: true,
            originalSize,
            optimizedSize,
            savings: `${savings}%`,
            format,
            dimensions: {
                width: metadata.width,
                height: metadata.height,
            },
        };
    } catch (error) {
        console.error('Image optimization error:', error);
        throw new Error(`Failed to optimize image: ${error.message}`);
    }
}

/**
 * Create multiple sizes of an image (thumbnail, medium, large)
 * @param {string} inputPath - Path to input image
 * @param {string} outputDir - Directory to save resized images
 * @param {string} baseName - Base name for output files
 * @returns {Promise<object>} - Paths to generated images
 */
async function createImageSizes(inputPath, outputDir, baseName) {
    const sizes = {
        thumbnail: { width: 150, height: 150 },
        small: { width: 300, height: 300 },
        medium: { width: 600, height: 600 },
        large: { width: 1200, height: 1200 },
    };

    const results = {};

    for (const [sizeName, dimensions] of Object.entries(sizes)) {
        const outputPath = path.join(outputDir, `${baseName}_${sizeName}.webp`);

        try {
            await optimizeImage(inputPath, outputPath, {
                ...dimensions,
                quality: 80,
                format: 'webp',
            });

            results[sizeName] = outputPath;
        } catch (error) {
            console.error(`Failed to create ${sizeName}:`, error);
        }
    }

    return results;
}

/**
 * Compress image without changing dimensions
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to save compressed image
 * @param {number} quality - Compression quality (1-100)
 * @returns {Promise<object>} - Compression results
 */
async function compressImage(inputPath, outputPath, quality = 80) {
    return optimizeImage(inputPath, outputPath, { quality, format: 'webp' });
}

module.exports = {
    optimizeImage,
    createImageSizes,
    compressImage,
};
