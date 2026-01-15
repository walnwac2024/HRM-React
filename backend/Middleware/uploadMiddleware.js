const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist
const newsUploadsDir = path.join(__dirname, '../uploads/news');
const profileUploadsDir = path.join(__dirname, '../uploads/profile-img');
const rootUploadsDir = path.join(__dirname, '../uploads');

[newsUploadsDir, profileUploadsDir, rootUploadsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Check if request is for news or avatar
        const isNews = req.originalUrl.includes('/news');
        const isAvatar = req.originalUrl.includes('/avatar');

        console.log(`[Upload Debug] URL: ${req.originalUrl}, isNews: ${isNews}, isAvatar: ${isAvatar}`);

        let dest = rootUploadsDir;
        if (isNews) dest = newsUploadsDir;
        else if (isAvatar) dest = profileUploadsDir;

        console.log(`[Upload Debug] Destination: ${dest}`);
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const isNews = req.originalUrl.includes('/news');
        const isAvatar = req.originalUrl.includes('/avatar');

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let prefix = '';
        if (isNews) prefix = 'news-';
        // if (isAvatar) prefix = 'profile-'; // Optional, keeping simple for now

        cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // If it's a document, allow any type (or we could restrict to pdf/doc/etc)
    if (file.fieldname === 'documents' || file.fieldname === 'file') {
        return cb(null, true);
    }

    // Default image filter for 'avatar' or 'image'
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed for this field (jpeg, jpg, png, gif, webp)'));
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // Increased to 10MB limit
    },
    fileFilter: fileFilter
});

module.exports = upload;
