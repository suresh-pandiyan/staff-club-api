const asyncHandler = require('../helpers/asyncHandler');
const ResponseHandler = require('../helpers/responseHandler');
const AuthService = require('../services/authService');
const { body, validationResult } = require('express-validator');

class AuthController {
    // @desc    Register user
    // @route   POST /api/auth/register
    // @access  Public
    static register = asyncHandler(async (req, res) => {
        console.log("req", req.body);
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ResponseHandler.error(res, 'Validation failed', 400, errors.array());
        }

        const {
            employeeId, firstName, lastName, email, phone, password,
            role, type, joinDate, address, designation, currentSalary,
            emergencyContact
        } = req.body;

        const result = await AuthService.register({
            employeeId,
            firstName,
            lastName,
            email,
            phone,
            password,
            role,
            type,
            joinDate,
            address,
            designation,
            currentSalary,
            emergencyContact
        });

        return ResponseHandler.created(res, result, 'Employee registered successfully');
    });

    // @desc    Login user
    // @route   POST /api/auth/login
    // @access  Public
    static login = asyncHandler(async (req, res) => {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ResponseHandler.error(res, 'Validation failed', 400, errors.array());
        }

        const { email, password } = req.body;

        const result = await AuthService.login({ email, password });

        return ResponseHandler.success(res, result, 'Login successful');
    });

    // @desc    Get current user
    // @route   GET /api/auth/me
    // @access  Private
    static getMe = asyncHandler(async (req, res) => {
        const user = await AuthService.getCurrentUser(req.user.id);

        return ResponseHandler.success(res, user, 'User profile retrieved');
    });

    // @desc    Update user profile
    // @route   PUT /api/auth/profile
    // @access  Private
    static updateProfile = asyncHandler(async (req, res) => {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ResponseHandler.error(res, 'Validation failed', 400, errors.array());
        }

        const {
            firstName, lastName, phone, avatar, address,
            designation, currentSalary, emergencyContact
        } = req.body;

        const user = await AuthService.updateProfile(req.user.id, {
            firstName,
            lastName,
            phone,
            avatar,
            address,
            designation,
            currentSalary,
            emergencyContact
        });

        return ResponseHandler.success(res, user, 'Profile updated successfully');
    });

    // @desc    Change password
    // @route   PUT /api/auth/change-password
    // @access  Private
    static changePassword = asyncHandler(async (req, res) => {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ResponseHandler.error(res, 'Validation failed', 400, errors.array());
        }

        const { currentPassword, newPassword } = req.body;

        const result = await AuthService.changePassword(
            req.user.id,
            currentPassword,
            newPassword
        );

        return ResponseHandler.success(res, result, 'Password changed successfully');
    });

    // @desc    Logout user
    // @route   POST /api/auth/logout
    // @access  Private
    static logout = asyncHandler(async (req, res) => {
        const result = await AuthService.logout(req.user.id);

        return ResponseHandler.success(res, result, 'Logged out successfully');
    });

    // @desc    Refresh token
    // @route   POST /api/auth/refresh
    // @access  Private
    static refreshToken = asyncHandler(async (req, res) => {
        const result = await AuthService.refreshToken(req.user.id);

        return ResponseHandler.success(res, result, 'Token refreshed successfully');
    });

    // @desc    Get all users (admin only)
    // @route   GET /api/auth/users
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

    // @desc    Deactivate user (admin only)
    // @route   PUT /api/auth/users/:id/deactivate
    // @access  Private/Admin
    static deactivateUser = asyncHandler(async (req, res) => {
        const user = await AuthService.deactivateUser(req.params.id);

        return ResponseHandler.success(res, user, 'User deactivated successfully');
    });

    // @desc    Activate user (admin only)
    // @route   PUT /api/auth/users/:id/activate
    // @access  Private/Admin
    static activateUser = asyncHandler(async (req, res) => {
        const user = await AuthService.activateUser(req.params.id);

        return ResponseHandler.success(res, user, 'User activated successfully');
    });
}

// Validation middleware
const validateRegister = [
    body('employeeId')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Employee ID must be between 3 and 20 characters'),
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('phone')
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Please provide a valid phone number'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('role')
        .optional()
        .isIn(['user', 'admin', 'moderator', 'manager', 'supervisor'])
        .withMessage('Invalid role'),
    body('type')
        .optional()
        .isIn(['full-time', 'part-time', 'contract', 'intern'])
        .withMessage('Invalid employee type'),
    body('joinDate')
        .optional()
        .isISO8601()
        .withMessage('Join date must be a valid date'),
    body('address.street')
        .trim()
        .notEmpty()
        .withMessage('Street address is required'),
    body('address.city')
        .trim()
        .notEmpty()
        .withMessage('City is required'),
    body('address.state')
        .trim()
        .notEmpty()
        .withMessage('State is required'),
    body('address.zipCode')
        .trim()
        .notEmpty()
        .withMessage('Zip code is required'),
    body('designation')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Designation must be between 2 and 100 characters'),
    body('currentSalary')
        .isFloat({ min: 0 })
        .withMessage('Current salary must be a positive number'),
    body('emergencyContact.name')
        .trim()
        .notEmpty()
        .withMessage('Emergency contact name is required'),
    body('emergencyContact.relationship')
        .trim()
        .notEmpty()
        .withMessage('Emergency contact relationship is required'),
    body('emergencyContact.phone')
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Please provide a valid emergency contact phone number')
];

const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const validateUpdateProfile = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('phone')
        .optional()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Please provide a valid phone number'),
    body('avatar')
        .optional()
        .isURL()
        .withMessage('Avatar must be a valid URL'),
    body('address.street')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Street address cannot be empty'),
    body('address.city')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('City cannot be empty'),
    body('address.state')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('State cannot be empty'),
    body('address.zipCode')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Zip code cannot be empty'),
    body('designation')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Designation must be between 2 and 100 characters'),
    body('currentSalary')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Current salary must be a positive number'),
    body('emergencyContact.name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Emergency contact name cannot be empty'),
    body('emergencyContact.relationship')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Emergency contact relationship cannot be empty'),
    body('emergencyContact.phone')
        .optional()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Please provide a valid emergency contact phone number')
];

const validateChangePassword = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters')
];

module.exports = {
    AuthController,
    validateRegister,
    validateLogin,
    validateUpdateProfile,
    validateChangePassword
}; 