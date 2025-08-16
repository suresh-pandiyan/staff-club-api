const express = require('express');
const router = express.Router();
const financialYearController = require('../controllers/financialYearController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateFinancialYear } = require('../middleware/validation');

/**
 * @swagger
 * /api/financial-years:
 *   post:
 *     summary: Create a new financial year
 *     tags: [FinancialYear]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FinancialYearInput'
 *     responses:
 *       201:
 *         description: Financial year created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinancialYearResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/',
    authenticateToken,
    authorizeRoles(['admin']),
    validateFinancialYear,
    financialYearController.createFinancialYear
);

/**
 * @swagger
 * /api/financial-years:
 *   get:
 *     summary: Get all financial years
 *     tags: [FinancialYear]
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
 *         name: currentlyActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of financial years
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
 *                     $ref: '#/components/schemas/FinancialYearResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 */
router.get('/',
    authenticateToken,
    financialYearController.getAllFinancialYears
);

/**
 * @swagger
 * /api/financial-years/{id}:
 *   get:
 *     summary: Get financial year by ID
 *     tags: [FinancialYear]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Financial year ID
 *     responses:
 *       200:
 *         description: Financial year details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinancialYearResponse'
 *       404:
 *         description: Financial year not found
 */
router.get('/:id',
    authenticateToken,
    financialYearController.getFinancialYearById
);

/**
 * @swagger
 * /api/financial-years/{id}:
 *   put:
 *     summary: Update financial year
 *     tags: [FinancialYear]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Financial year ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FinancialYearInput'
 *     responses:
 *       200:
 *         description: Financial year updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinancialYearResponse'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Financial year not found
 */
router.put('/:id',
    authenticateToken,
    authorizeRoles(['admin']),
    validateFinancialYear,
    financialYearController.updateFinancialYear
);

/**
 * @swagger
 * /api/financial-years/{id}:
 *   delete:
 *     summary: Delete financial year
 *     tags: [FinancialYear]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Financial year ID
 *     responses:
 *       200:
 *         description: Financial year deleted successfully
 *       404:
 *         description: Financial year not found
 */
router.delete('/:id',
    authenticateToken,
    authorizeRoles(['admin']),
    financialYearController.deleteFinancialYear
);

/**
 * @swagger
 * /api/financial-years/currently-active:
 *   get:
 *     summary: Get currently active financial year
 *     tags: [FinancialYear]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Currently active financial year
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinancialYearResponse'
 *       404:
 *         description: No active financial year found
 */
router.get('/currently-active',
    authenticateToken,
    financialYearController.getCurrentlyActiveFinancialYear
);

/**
 * @swagger
 * /api/financial-years/{id}/set-active:
 *   patch:
 *     summary: Set financial year as currently active
 *     tags: [FinancialYear]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Financial year ID
 *     responses:
 *       200:
 *         description: Financial year set as active successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinancialYearResponse'
 *       404:
 *         description: Financial year not found
 */
router.patch('/:id/set-active',
    authenticateToken,
    authorizeRoles(['admin']),
    financialYearController.setCurrentlyActiveFinancialYear
);

/**
 * @swagger
 * /api/financial-years/date-range:
 *   get:
 *     summary: Get financial years by date range
 *     tags: [FinancialYear]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of financial years in date range
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
 *                     $ref: '#/components/schemas/FinancialYearResponse'
 */
router.get('/date-range',
    authenticateToken,
    financialYearController.getFinancialYearsByDateRange
);

/**
 * @swagger
 * /api/financial-years/by-date/{date}:
 *   get:
 *     summary: Get financial year by specific date
 *     tags: [FinancialYear]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to find financial year for (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Financial year for the specified date
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinancialYearResponse'
 *       404:
 *         description: No financial year found for the date
 */
router.get('/by-date/:date',
    authenticateToken,
    financialYearController.getFinancialYearByDate
);

/**
 * @swagger
 * /api/financial-years/{id}/stats:
 *   get:
 *     summary: Get financial year statistics
 *     tags: [FinancialYear]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Financial year ID
 *     responses:
 *       200:
 *         description: Financial year statistics
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
 *                     totalCharityFunds:
 *                       type: number
 *                     totalChitfunds:
 *                       type: number
 *                     totalEvents:
 *                       type: number
 *                     totalEmergencyFunds:
 *                       type: number
 *                     totalLoans:
 *                       type: number
 *                     totalStaffShares:
 *                       type: number
 */
router.get('/:id/stats',
    authenticateToken,
    financialYearController.getFinancialYearStats
);

/**
 * @swagger
 * /api/financial-years/stats:
 *   get:
 *     summary: Get all financial years with statistics
 *     tags: [FinancialYear]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial years with statistics
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
 *                       - $ref: '#/components/schemas/FinancialYearResponse'
 *                       - type: object
 *                         properties:
 *                           totalCharityFunds:
 *                             type: number
 *                           totalChitfunds:
 *                             type: number
 *                           totalEvents:
 *                             type: number
 *                           totalEmergencyFunds:
 *                             type: number
 *                           totalLoans:
 *                             type: number
 *                           totalStaffShares:
 *                             type: number
 */
router.get('/stats',
    authenticateToken,
    financialYearController.getFinancialYearsWithStats
);

module.exports = router; 