const asyncHandler = require('../helpers/asyncHandler');
const ResponseHandler = require('../helpers/responseHandler');
const AuthService = require('../services/authService');
const { deleteAvatarFile, getAvatarUrl } = require('../middleware/upload');

class AvatarController {
    // @desc    Upload avatar
    // @route   POST /api/auth/avatar
    // @access  Private
    static uploadAvatar = asyncHandler(async (req, res) => {
        if (!req.file) {
            return ResponseHandler.error(res, 'No file uploaded', 400, [
                { field: 'avatar', message: 'Please select an image file' }
            ]);
        }

        const userId = req.user.id;
        const avatarUrl = getAvatarUrl(req.file.filename);

        // Update user's avatar in database
        const user = await AuthService.updateProfile(userId, {
            avatar: avatarUrl
        });

        return ResponseHandler.success(res, {
            avatar: avatarUrl,
            user: user
        }, 'Avatar uploaded successfully');
    });

    // @desc    Delete avatar
    // @route   DELETE /api/auth/avatar
    // @access  Private
    static deleteAvatar = asyncHandler(async (req, res) => {
        const userId = req.user.id;

        // Get current user to find existing avatar
        const currentUser = await AuthService.getCurrentUser(userId);

        if (currentUser.avatar && !currentUser.avatar.includes('default-avatar.png')) {
            // Extract filename from avatar URL
            const avatarPath = currentUser.avatar;
            const filename = avatarPath.split('/').pop();

            // Delete file from storage
            await deleteAvatarFile(filename);
        }

        // Update user's avatar to default
        const user = await AuthService.updateProfile(userId, {
            avatar: '/uploads/avatars/default-avatar.png'
        });

        return ResponseHandler.success(res, {
            avatar: '/uploads/avatars/default-avatar.png',
            user: user
        }, 'Avatar deleted successfully');
    });

    // @desc    Get avatar info
    // @route   GET /api/auth/avatar
    // @access  Private
    static getAvatarInfo = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const user = await AuthService.getCurrentUser(userId);

        return ResponseHandler.success(res, {
            avatar: user.avatar,
            hasAvatar: user.avatar && !user.avatar.includes('default-avatar.png')
        }, 'Avatar information retrieved');
    });
}

module.exports = AvatarController; 