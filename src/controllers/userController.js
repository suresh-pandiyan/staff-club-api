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
    // @route   POST /api/users/create-member
    // @access  Private/Admin
    static createMember = asyncHandler(async (req, res) => {
        const userData = req.body;

        // Additional validation for required fields
        const requiredFields = [
            'employeeId', 'firstName', 'lastName', 'email', 'phone', 'type', 'department', 'designation'
        ];

        for (const field of requiredFields) {
            if (!userData[field]) {
                return ResponseHandler.error(res, `${field} is required`, 400);
            }
        }

        // Address and emergency contact are now optional, but if provided, they should be complete
        if (userData.address && (userData.address.street || userData.address.city || userData.address.state || userData.address.zipCode)) {
            if (!userData.address.street || !userData.address.city || !userData.address.state || !userData.address.zipCode) {
                return ResponseHandler.error(res, 'If address is provided, all address fields are required', 400);
            }
        }

        if (userData.emergencyContact && (userData.emergencyContact.name || userData.emergencyContact.relationship || userData.emergencyContact.phone)) {
            if (!userData.emergencyContact.name || !userData.emergencyContact.relationship || !userData.emergencyContact.phone) {
                return ResponseHandler.error(res, 'If emergency contact is provided, all emergency contact fields are required', 400);
            }
        }

        const newUser = await AuthService.createMember(userData);
        return ResponseHandler.success(res, newUser, 'User created successfully', 201);
    });

    // @desc    Update an existing member (admin only)
    // @route   PUT /api/users/:id
    // @access  Private/Admin
    static updateMember = asyncHandler(async (req, res) => {
        const userId = req.params.id;
        const updateData = req.body;

        // Validate that at least one field is provided for update
        if (Object.keys(updateData).length === 0) {
            return ResponseHandler.error(res, 'At least one field must be provided for update', 400);
        }

        const updatedUser = await AuthService.updateMember(userId, updateData);
        return ResponseHandler.success(res, updatedUser, 'User updated successfully');
    });
}

module.exports = UserController;