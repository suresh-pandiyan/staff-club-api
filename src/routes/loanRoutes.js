const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateLoan } = require('../middleware/validation');

/**
 * @swagger
 * /api/loans:
 *   post:
 *     summary: Create a new loan
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoanInput'
 *     responses:
 *       201:
 *         description: Loan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/',
    authenticateToken,
    authorizeRoles(['admin', 'manager']),
    validateLoan,
    loanController.createLoan
);

/**
 * @swagger
 * /api/loans:
 *   get:
 *     summary: Get all loans
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: financeYearId
 *         schema:
 *           type: string
 *         description: Filter by financial year
 *       - in: query
 *         name: allowTopup
 *         schema:
 *           type: boolean
 *         description: Filter by topup availability
 *     responses:
 *       200:
 *         description: List of loans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LoanResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 */
router.get('/',
    authenticateToken,
    loanController.getAllLoans
);

/**
 * @swagger
 * /api/loans/{id}:
 *   get:
 *     summary: Get loan by ID
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Loan ID
 *     responses:
 *       200:
 *         description: Loan details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanResponse'
 *       404:
 *         description: Loan not found
 */
router.get('/:id',
    authenticateToken,
    loanController.getLoanById
);

/**
 * @swagger
 * /api/loans/{id}:
 *   put:
 *     summary: Update loan
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Loan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoanInput'
 *     responses:
 *       200:
 *         description: Loan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanResponse'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Loan not found
 */
router.put('/:id',
    authenticateToken,
    authorizeRoles(['admin', 'manager']),
    validateLoan,
    loanController.updateLoan
);

/**
 * @swagger
 * /api/loans/{id}:
 *   delete:
 *     summary: Delete loan
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Loan ID
 *     responses:
 *       200:
 *         description: Loan deleted successfully
 *       404:
 *         description: Loan not found
 */
router.delete('/:id',
    authenticateToken,
    authorizeRoles(['admin']),
    loanController.deleteLoan
);

/**
 * @swagger
 * /api/loans/financial-year/{financeYearId}:
 *   get:
 *     summary: Get loans by financial year
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: financeYearId
 *         required: true
 *         schema:
 *           type: string
 *         description: Financial year ID
 *     responses:
 *       200:
 *         description: List of loans for the financial year
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LoanResponse'
 */
router.get('/financial-year/:financeYearId',
    authenticateToken,
    loanController.getLoansByFinancialYear
);

/**
 * @swagger
 * /api/loans/with-topup:
 *   get:
 *     summary: Get loans with topup allowed
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of loans with topup allowed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LoanResponse'
 */
router.get('/with-topup',
    authenticateToken,
    loanController.getLoansWithTopup
);

/**
 * @swagger
 * /api/loans/without-topup:
 *   get:
 *     summary: Get loans without topup
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of loans without topup
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LoanResponse'
 */
router.get('/without-topup',
    authenticateToken,
    loanController.getLoansWithoutTopup
);

/**
 * @swagger
 * /api/loans/{id}/enable-topup:
 *   patch:
 *     summary: Enable topup for loan
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Loan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topupAmount
 *             properties:
 *               topupAmount:
 *                 type: number
 *                 description: Topup amount
 *     responses:
 *       200:
 *         description: Topup enabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanResponse'
 *       404:
 *         description: Loan not found
 */
router.patch('/:id/enable-topup',
    authenticateToken,
    authorizeRoles(['admin', 'manager']),
    loanController.enableTopup
);

/**
 * @swagger
 * /api/loans/{id}/disable-topup:
 *   patch:
 *     summary: Disable topup for loan
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Loan ID
 *     responses:
 *       200:
 *         description: Topup disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanResponse'
 *       404:
 *         description: Loan not found
 */
router.patch('/:id/disable-topup',
    authenticateToken,
    authorizeRoles(['admin', 'manager']),
    loanController.disableTopup
);

/**
 * @swagger
 * /api/loans/{id}/update-amount:
 *   patch:
 *     summary: Update loan amount
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Loan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loanAmount
 *             properties:
 *               loanAmount:
 *                 type: number
 *                 description: New loan amount
 *     responses:
 *       200:
 *         description: Loan amount updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanResponse'
 *       404:
 *         description: Loan not found
 */
router.patch('/:id/update-amount',
    authenticateToken,
    authorizeRoles(['admin', 'manager']),
    loanController.updateLoanAmount
);

/**
 * @swagger
 * /api/loans/{id}/update-topup-amount:
 *   patch:
 *     summary: Update topup amount
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Loan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topupAmount
 *             properties:
 *               topupAmount:
 *                 type: number
 *                 description: New topup amount
 *     responses:
 *       200:
 *         description: Topup amount updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanResponse'
 *       404:
 *         description: Loan not found
 */
router.patch('/:id/update-topup-amount',
    authenticateToken,
    authorizeRoles(['admin', 'manager']),
    loanController.updateTopupAmount
);

/**
 * @swagger
 * /api/loans/{id}/stats:
 *   get:
 *     summary: Get loan statistics
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Loan ID
 *     responses:
 *       200:
 *         description: Loan statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalStaff:
 *                       type: number
 *                     totalCollections:
 *                       type: number
 *                     averageCollection:
 *                       type: number
 *                     completionPercentage:
 *                       type: number
 */
router.get('/:id/stats',
    authenticateToken,
    loanController.getLoanStats
);

/**
 * @swagger
 * /api/loans/summary:
 *   get:
 *     summary: Get loans with staff summary
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: financeYearId
 *         schema:
 *           type: string
 *         description: Financial year ID
 *     responses:
 *       200:
 *         description: Loans with summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/LoanResponse'
 *                       - type: object
 *                         properties:
 *                           totalStaff:
 *                             type: number
 *                           totalCollections:
 *                             type: number
 *                           completionPercentage:
 *                             type: number
 */
router.get('/summary',
    authenticateToken,
    loanController.getLoansWithSummary
);

module.exports = router; 