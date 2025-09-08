const express = require('express');
const router = express.Router();
const emergencyFundController = require('../controllers/emergencyFundController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateEmergencyFund, validateId } = require('../middleware/validation');

/**
 * @swagger
 * /api/emergency-funds:
 *   post:
 *     summary: Create a new emergency fund
 *     tags: [EmergencyFund]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmergencyFundInput'
 *     responses:
 *       201:
 *         description: Emergency fund created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmergencyFundResponse'
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
    validateEmergencyFund,
    emergencyFundController.createEmergencyFund
);

/**
 * @swagger
 * /api/emergency-funds:
 *   get:
 *     summary: Get all emergency funds
 *     tags: [EmergencyFund]
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
 *         description: List of emergency funds
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
 *                     $ref: '#/components/schemas/EmergencyFundResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 */
router.get('/',
    authenticateToken,
    emergencyFundController.getEmergencyFundsByFinancialYear
);

/**
 * @swagger
 * /api/emergency-funds/{id}:
 *   get:
 *     summary: Get emergency fund by ID
 *     tags: [EmergencyFund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Emergency fund ID
 *     responses:
 *       200:
 *         description: Emergency fund details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmergencyFundResponse'
 *       404:
 *         description: Emergency fund not found
 */
router.get('/:id',
    authenticateToken,
    emergencyFundController.getEmergencyFundById
);

/**
 * @swagger
 * /api/emergency-funds/{id}:
 *   put:
 *     summary: Update emergency fund
 *     tags: [EmergencyFund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Emergency fund ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmergencyFundInput'
 *     responses:
 *       200:
 *         description: Emergency fund updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmergencyFundResponse'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Emergency fund not found
 */
router.put('/:id',
    authenticateToken,
    authorizeRoles(['admin', 'manager']),
    validateEmergencyFund,
    emergencyFundController.updateEmergencyFund
);

/**
 * @swagger
 * /api/emergency-funds/{id}:
 *   delete:
 *     summary: Delete emergency fund
 *     tags: [EmergencyFund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Emergency fund ID
 *     responses:
 *       200:
 *         description: Emergency fund deleted successfully
 *       404:
 *         description: Emergency fund not found
 */
router.delete('/:id',
    authenticateToken,
    authorizeRoles(['admin']),
    validateId,
    emergencyFundController.deleteEmergencyFund
);

/**
 * @swagger
 * /api/emergency-funds/financial-year/{financeYearId}:
 *   get:
 *     summary: Get emergency funds by financial year
 *     tags: [EmergencyFund]
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
 *         description: List of emergency funds for the financial year
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
 *                     $ref: '#/components/schemas/EmergencyFundResponse'
 */
// router.get('/:financeYearId',
//     authenticateToken,
//     emergencyFundController.getEmergencyFundsByFinancialYear
// );

/**
 * @swagger
 * /api/emergency-funds/active:
 *   get:
 *     summary: Get active emergency funds
 *     tags: [EmergencyFund]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active emergency funds
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
 *                     $ref: '#/components/schemas/EmergencyFundResponse'
 */
router.get('/active',
    authenticateToken,
    emergencyFundController.getActiveEmergencyFunds
);

/**
 * @swagger
 * /api/emergency-funds/{id}/close:
 *   patch:
 *     summary: Close an emergency fund
 *     tags: [EmergencyFund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Emergency fund ID
 *     responses:
 *       200:
 *         description: Emergency fund closed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmergencyFundResponse'
 *       404:
 *         description: Emergency fund not found
 */
router.patch('/:id/close',
    authenticateToken,
    authorizeRoles(['admin', 'manager']),
    emergencyFundController.closeEmergencyFund
);

/**
 * @swagger
 * /api/emergency-funds/{id}/stats:
 *   get:
 *     summary: Get emergency fund statistics
 *     tags: [EmergencyFund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Emergency fund ID
 *     responses:
 *       200:
 *         description: Emergency fund statistics
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
 *                     totalContributors:
 *                       type: number
 *                     averageContribution:
 *                       type: number
 *                     progressPercentage:
 *                       type: number
 */
router.get('/:id/stats',
    authenticateToken,
    emergencyFundController.getEmergencyFundStats
);

/**
 * @swagger
 * /api/emergency-funds/summary:
 *   get:
 *     summary: Get emergency funds with summary
 *     tags: [EmergencyFund]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Emergency funds with summary data
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
 *                       - $ref: '#/components/schemas/EmergencyFundResponse'
 *                       - type: object
 *                         properties:
 *                           totalCollections:
 *                             type: number
 *                           totalContributors:
 *                             type: number
 *                           progressPercentage:
 *                             type: number
 */
router.get('/summary',
    authenticateToken,
    emergencyFundController.getEmergencyFundsWithSummary
);

module.exports = router; 