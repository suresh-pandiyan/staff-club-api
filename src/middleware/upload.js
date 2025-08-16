const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../public/uploads/avatars');
const ensureUploadsDir = async () => {
    try {
        await fs.access(uploadsDir);
    } catch (error) {
        await fs.mkdir(uploadsDir, { recursive: true });
    }
};

// Configure multer storage
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        await ensureUploadsDir();
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// File filter for images
const fileFilter = (req, file, cb) => {
    // Check file type
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'), false);
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
        return cb(new Error('Invalid file extension. Allowed: jpg, jpeg, png, gif, webp'), false);
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        return cb(new Error('File size too large. Maximum size is 5MB'), false);
    }

    cb(null, true);
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1 // Only one file at a time
    }
});

// Image processing middleware
const processImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }

        const filePath = req.file.path;
        const fileName = req.file.filename;
        const processedFileName = `processed-${fileName}`;
        const processedFilePath = path.join(uploadsDir, processedFileName);

        // Process image with sharp
        await sharp(filePath)
            .resize(300, 300, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 80 })
            .toFile(processedFilePath);

        // Delete original file
        await fs.unlink(filePath);

        // Update file info
        req.file.filename = processedFileName;
        req.file.path = processedFilePath;
        req.file.mimetype = 'image/jpeg';

        next();
    } catch (error) {
        // Clean up file if processing fails
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }
        next(error);
    }
};

// Avatar upload middleware
const uploadAvatar = upload.single('avatar');

// Error handling middleware for upload errors
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB',
                errors: [{ field: 'avatar', message: 'File size too large' }]
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Only one file allowed',
                errors: [{ field: 'avatar', message: 'Only one file allowed' }]
            });
        }
        return res.status(400).json({
            success: false,
            message: 'File upload error',
            errors: [{ field: 'avatar', message: error.message }]
        });
    }

    if (error.message.includes('Only image files are allowed') ||
        error.message.includes('Invalid file extension') ||
        error.message.includes('File size too large')) {
        return res.status(400).json({
            success: false,
            message: error.message,
            errors: [{ field: 'avatar', message: error.message }]
        });
    }

    next(error);
};

// Delete avatar file
const deleteAvatarFile = async (filename) => {
    try {
        const filePath = path.join(uploadsDir, filename);
        await fs.access(filePath);
        await fs.unlink(filePath);
        return true;
    } catch (error) {
        console.error('Error deleting avatar file:', error);
        return false;
    }
};

// Get avatar URL
const getAvatarUrl = (filename) => {
    if (!filename) return null;
    return `/uploads/avatars/${filename}`;
};

module.exports = {
    uploadAvatar,
    processImage,
    handleUploadError,
    deleteAvatarFile,
    getAvatarUrl
}; 