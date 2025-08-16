const asyncHandler = require('../helpers/asyncHandler');
const ResponseHandler = require('../helpers/responseHandler');
const AuthService = require('../services/authService');

class UserController {
    // @desc    Get all users (admin only)
    // @route   GET /api/users
    // @access  Private/Admin
    static getAllUsers = asyncHandler(async (req, res) => {
        const { page = 1, limit = 10, search = '' } = req.query;

        const result = await AuthService.getAllUsers(
            parseInt(page),
            parseInt(limit),
            search
        );

        return ResponseHandler.paginated(
            res,
            result.users,
            parseInt(page),
            parseInt(limit),
            result.pagination.total,
            'Users retrieved successfully'
        );
    });

    // @desc    Get user by ID
    // @route   GET /api/users/:id
    // @access  Private
    static getUserById = asyncHandler(async (req, res) => {
        const user = await AuthService.getCurrentUser(req.params.id);

        return ResponseHandler.success(res, user, 'User retrieved successfully');
    });

    // @desc    Get user statistics
    // @route   GET /api/users/stats
    // @access  Private/Admin
    static getUserStats = asyncHandler(async (req, res) => {
        // This would typically come from a separate service
        // For now, we'll return a mock response
        const stats = {
            totalUsers: 0,
            activeUsers: 0,
            newUsersThisMonth: 0,
            usersByRole: {
                user: 0,
                admin: 0,
                moderator: 0
            }
        };

        return ResponseHandler.success(res, stats, 'User statistics retrieved');
    });

    // @desc    Create a new user (admin only)
    // @route   POST /api/users
    // @access  Private/Admin
    static createMember = asyncHandler(async (req, res) => {
        const userData = req.body;
        const newUser = await AuthService.createMember(userData);
        return ResponseHandler.success(res, newUser, 'User created successfully', 201);
    });
}

module.exports = UserController;