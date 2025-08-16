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
    body('eventDescription')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Event description must be between 10 and 500 characters'),
    body('eventAmount')
        .isFloat({ min: 0 })
        .withMessage('Event amount must be a positive number'),
    body('eventCreated')
        .optional()
        .isISO8601()
        .withMessage('Valid date format required for event created date'),
    body('eventClosed')
        .optional()
        .isISO8601()
        .withMessage('Valid date format required for event closed date'),
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
    validateAmount
}; 