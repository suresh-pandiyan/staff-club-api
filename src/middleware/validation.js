const { body, param, query } = require('express-validator');
const { validateRequest } = require('./validateRequest');

// CharityFund validation
const validateCharityFund = [
    body('financeYearId')
        .isMongoId()
        .withMessage('Valid financial year ID is required'),
    body('charityTitle')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Charity title must be between 3 and 100 characters'),
    body('charityDescription')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Charity description must be between 10 and 500 characters'),
    body('charityAmount')
        .isFloat({ min: 0 })
        .withMessage('Charity amount must be a positive number'),
    body('charityCreated')
        .optional()
        .isISO8601()
        .withMessage('Valid date format required for charity created date'),
    body('charityClosed')
        .optional()
        .isISO8601()
        .withMessage('Valid date format required for charity closed date'),
    validateRequest
];

// Chitfund validation
const validateChitfund = [
    body('financeYearId')
        .isMongoId()
        .withMessage('Valid financial year ID is required'),
    body('chitName')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Chit name must be between 3 and 100 characters'),
    body('chitStaffs')
        .isArray({ min: 1 })
        .withMessage('At least one staff member is required'),
    body('chitStaffs.*')
        .isMongoId()
        .withMessage('Valid staff ID is required'),
    body('chitStarted')
        .isISO8601()
        .withMessage('Valid date format required for chit start date'),
    body('chitAmount')
        .isFloat({ min: 0 })
        .withMessage('Chit amount must be a positive number'),
    body('chitStatus')
        .isIn(['created', 'on-going', 'completed'])
        .withMessage('Valid chit status is required'),
    validateRequest
];

// EmergencyFund validation
const validateEmergencyFund = [
    body('financeYearId')
        .isMongoId()
        .withMessage('Valid financial year ID is required'),
    body('emergencyFundName')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Emergency fund name must be between 3 and 100 characters'),
    body('emergencyFundDescription')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Emergency fund description must be between 10 and 500 characters'),
    body('emergencyFundAmount')
        .isFloat({ min: 0 })
        .withMessage('Emergency fund amount must be a positive number'),
    body('emergencyFundCreated')
        .optional()
        .isISO8601()
        .withMessage('Valid date format required for emergency fund created date'),
    body('emergencyFundClosed')
        .optional()
        .isISO8601()
        .withMessage('Valid date format required for emergency fund closed date'),
    validateRequest
];

// Event validation
const validateEvent = [
    body('financeYearId')
        .isMongoId()
        .withMessage('Valid financial year ID is required'),
    body('eventName')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Event name must be between 3 and 100 characters'),
    body('hostEmployeeId')
        .trim()
        .notEmpty()
        .withMessage('Host employee ID is required'),
    body('eventDescription')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Event description must be between 10 and 500 characters'),
    body('eventLocation')
        .trim()
        .notEmpty()
        .withMessage('Event location is required'),
    body('eventAmount')
        .isNumeric()
        .withMessage('Event amount must be a number')
        .isFloat({ min: 1 })
        .withMessage('Event amount must be greater than 0'),
    body('eventTime')
        .trim()
        .notEmpty()
        .withMessage('Event time is required'),
    body('eventClosed')
        .trim()
        .notEmpty()
        .withMessage('Event end date is required')
        .isISO8601()
        .withMessage('Event end date must be a valid date format'),
    validateRequest
];

// FinancialYear validation
const validateFinancialYear = [
    body('financeYear')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Financial year must be between 4 and 20 characters'),
    body('startFrom')
        .isISO8601()
        .withMessage('Valid date format required for start date'),
    body('endTo')
        .isISO8601()
        .withMessage('Valid date format required for end date'),
    body('currentlyActive')
        .optional()
        .isBoolean()
        .withMessage('Currently active must be a boolean'),
    body('eventTime')
        .notEmpty().withMessage('Event time is required')
        .matches(/^([9]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('Event time must be in HH:mm format (e.g., 12:00, 23:45)'),
    validateRequest
];

// Loan validation
const validateLoan = [
    body('financeYearId')
        .isMongoId()
        .withMessage('Valid financial year ID is required'),
    body('loanName')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Loan name must be between 3 and 100 characters'),
    body('loanDescription')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Loan description must be between 10 and 500 characters'),
    body('loanAmount')
        .isFloat({ min: 0 })
        .withMessage('Loan amount must be a positive number'),
    body('allowTopup')
        .optional()
        .isBoolean()
        .withMessage('Allow topup must be a boolean'),
    body('loanTopupAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Loan topup amount must be a positive number'),
    body('loanTotalStaffs')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Loan total staffs must be a non-negative integer'),
    validateRequest
];

// ID parameter validation
const validateId = [
    param('id')
        .isMongoId()
        .withMessage('Valid ID is required'),
    validateRequest
];

// Pagination validation
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    validateRequest
];

// Date range validation
const validateDateRange = [
    query('startDate')
        .isISO8601()
        .withMessage('Valid start date is required'),
    query('endDate')
        .isISO8601()
        .withMessage('Valid end date is required'),
    validateRequest
];

// Staff IDs validation
const validateStaffIds = [
    body('staffIds')
        .isArray({ min: 1 })
        .withMessage('At least one staff ID is required'),
    body('staffIds.*')
        .isMongoId()
        .withMessage('Valid staff ID is required'),
    validateRequest
];

// Amount validation
const validateAmount = [
    body('amount')
        .isFloat({ min: 0 })
        .withMessage('Amount must be a positive number'),
    validateRequest
];

// User validation for createMember
const validateCreateMember = [
    body('employeeId')
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Employee ID is required and must be between 1 and 20 characters'),
    body('firstName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name is required and must be between 1 and 50 characters'),
    body('lastName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name is required and must be between 1 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('phone')
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Valid phone number is required'),
    body('type')
        .isIn(['full-time', 'part-time', 'contract', 'intern'])
        .withMessage('Valid employment type is required'),
    body('address.street')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Street address is required'),
    body('address.city')
        .trim()
        .isLength({ min: 1 })
        .withMessage('City is required'),
    body('address.state')
        .trim()
        .isLength({ min: 1 })
        .withMessage('State is required'),
    body('address.zipCode')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Zip code is required'),
    body('address.country')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Country is required'),
    body('department')
        .isIn([
            'Computer Science & Engineering(CSE)',
            'Information Technology(IT)',
            'Electronics & Communication Engineering(ECE)',
            'Electrical & Electronics Engineering(EEE)',
            'Mechanical Engineering(MECH)',
            'Civil Engineering',
            'Artificial Intelligence & Data Science(AI & DS)',
            'Master of Business Administration(MBA)',
            'Cyber Security',
            'Master of Computer Applications(MCA)'
        ])
        .withMessage('Valid department is required'),
    body('designation')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Designation is required and must be between 1 and 100 characters'),
    body('emergencyContact.name')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Emergency contact name is required'),
    body('emergencyContact.relationship')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Emergency contact relationship is required'),
    body('emergencyContact.phone')
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Valid emergency contact phone number is required'),
    body('emergencyContact.address')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Emergency contact address must not be empty if provided'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('currentSalary')
        .isFloat({ min: 0 })
        .withMessage('Current salary must be a positive number'),
    validateRequest
];

// User validation for updateMember (all fields optional)
const validateUpdateMember = [
    param('id')
        .trim()
        .isMongoId()
        .withMessage('Valid user ID is required'),
    body('employeeId')
        .optional()
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Employee ID must be between 1 and 20 characters'),
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters'),
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters'),
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('phone')
        .optional()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Valid phone number is required'),
    body('type')
        .optional()
        .isIn(['full-time', 'part-time', 'contract', 'intern'])
        .withMessage('Valid employment type is required'),
    body('address.street')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Street address must not be empty if provided'),
    body('address.city')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('City must not be empty if provided'),
    body('address.state')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('State must not be empty if provided'),
    body('address.zipCode')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Zip code must not be empty if provided'),
    body('address.country')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Country must not be empty if provided'),
    body('department')
        .optional()
        .isIn([
            'Computer Science & Engineering(CSE)',
            'Information Technology(IT)',
            'Electronics & Communication Engineering(ECE)',
            'Electrical & Electronics Engineering(EEE)',
            'Mechanical Engineering(MECH)',
            'Civil Engineering',
            'Artificial Intelligence & Data Science(AI & DS)',
            'Master of Business Administration(MBA)',
            'Cyber Security',
            'Master of Computer Applications(MCA)'
        ])
        .withMessage('Valid department is required'),
    body('designation')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Designation must be between 1 and 100 characters'),
    body('emergencyContact.name')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Emergency contact name must not be empty if provided'),
    body('emergencyContact.relationship')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Emergency contact relationship must not be empty if provided'),
    body('emergencyContact.phone')
        .optional()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Valid emergency contact phone number is required'),
    body('emergencyContact.address')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Emergency contact address must not be empty if provided'),
    body('currentSalary')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Current salary must be a positive number'),
    validateRequest
];

module.exports = {
    validateCharityFund,
    validateChitfund,
    validateEmergencyFund,
    validateEvent,
    validateFinancialYear,
    validateLoan,
    validateId,
    validatePagination,
    validateDateRange,
    validateStaffIds,
    validateAmount,
    validateCreateMember,
    validateUpdateMember
}; 