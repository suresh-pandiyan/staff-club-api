const express = require('express');
const router = express.Router();
const charityFundController = require('../controllers/charityFundController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateCharityFund } = require('../middleware/validation');

/**
 * @swagger
 * /api/charity-funds:
 *   post:
 *     summary: Create a new charity fund
 *     tags: [CharityFund]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CharityFundInput'
 *     responses:
 *       201:
 *         description: Charity fund created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CharityFundResponse'
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
    validateCharityFund,
    charityFundController.createCharityFund
);

/**
 * @swagger
 * /api/charity-funds:
 *   get:
 *     summary: Get all charity funds
 *     tags: [CharityFund]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, closed]
 *         description: Filter by status
 *       - in: query
 *         name: financeYearId
 *         schema:
 *           type: string
 *         description: Filter by financial year
 *     responses:
 *       200:
 *         description: List of charity funds
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
 *                     $ref: '#/components/schemas/CharityFundResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 */
router.get('/',
    authenticateToken,
    charityFundController.getAllCharityFunds
);

/**
 * @swagger
 * /api/charity-funds/{id}:
 *   get:
 *     summary: Get charity fund by ID
 *     tags: [CharityFund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Charity fund ID
 *     responses:
 *       200:
 *         description: Charity fund details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CharityFundResponse'
 *       404:
 *         description: Charity fund not found
 */
router.get('/:id',
    authenticateToken,
    charityFundController.getCharityFundById
);

/**
 * @swagger
 * /api/charity-funds/{id}:
 *   put:
 *     summary: Update charity fund
 *     tags: [CharityFund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Charity fund ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CharityFundInput'
 *     responses:
 *       200:
 *         description: Charity fund updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CharityFundResponse'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Charity fund not found
 */
router.put('/:id',
    authenticateToken,
    authorizeRoles(['admin', 'manager']),
    validateCharityFund,
    charityFundController.updateCharityFund
);

/**
 * @swagger
 * /api/charity-funds/{id}:
 *   delete:
 *     summary: Delete charity fund
 *     tags: [CharityFund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Charity fund ID
 *     responses:
 *       200:
 *         description: Charity fund deleted successfully
 *       404:
 *         description: Charity fund not found
 */
router.delete('/:id',
    authenticateToken,
    authorizeRoles(['admin']),
    charityFundController.deleteCharityFund
);

/**
 * @swagger
 * /api/charity-funds/financial-year/{financeYearId}:
 *   get:
 *     summary: Get charity funds by financial year
 *     tags: [CharityFund]
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
 *         description: List of charity funds for the financial year
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
 *                     $ref: '#/components/schemas/CharityFundResponse'
 */
router.get('/financial-year/:financeYearId',
    authenticateToken,
    charityFundController.getCharityFundsByFinancialYear
);

/**
 * @swagger
 * /api/charity-funds/active:
 *   get:
 *     summary: Get active charity funds
 *     tags: [CharityFund]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active charity funds
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
 *                     $ref: '#/components/schemas/CharityFundResponse'
 */
router.get('/active',
    authenticateToken,
    charityFundController.getActiveCharityFunds
);

/**
 * @swagger
 * /api/charity-funds/{id}/close:
 *   patch:
 *     summary: Close a charity fund
 *     tags: [CharityFund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Charity fund ID
 *     responses:
 *       200:
 *         description: Charity fund closed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CharityFundResponse'
 *       404:
 *         description: Charity fund not found
 */
router.patch('/:id/close',
    authenticateToken,
    authorizeRoles(['admin', 'manager']),
    charityFundController.closeCharityFund
);

/**
 * @swagger
 * /api/charity-funds/{id}/stats:
 *   get:
 *     summary: Get charity fund statistics
 *     tags: [CharityFund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Charity fund ID
 *     responses:
 *       200:
 *         description: Charity fund statistics
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
 *                     totalCollections:
 *                       type: number
 *                     totalDonors:
 *                       type: number
 *                     averageDonation:
 *                       type: number
 *                     progressPercentage:
 *                       type: number
 */
router.get('/:id/stats',
    authenticateToken,
    charityFundController.getCharityFundStats
);

/**
 * @swagger
 * /api/charity-funds/summary:
 *   get:
 *     summary: Get charity funds with summary
 *     tags: [CharityFund]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Charity funds with summary data
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
 *                       - $ref: '#/components/schemas/CharityFundResponse'
 *                       - type: object
 *                         properties:
 *                           totalCollections:
 *                             type: number
 *                           totalDonors:
 *                             type: number
 *                           progressPercentage:
 *                             type: number
 */
router.get('/summary',
    authenticateToken,
    charityFundController.getCharityFundsWithSummary
);

module.exports = router; 