const express = require('express');
const router = express.Router();
const chitfundController = require('../controllers/chitfundController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateChitfund } = require('../middleware/validation');

/**
 * @swagger
 * /api/chitfunds:
 *   post:
 *     summary: Create a new chitfund
 *     tags: [Chitfund]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChitfundInput'
 *     responses:
 *       201:
 *         description: Chitfund created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChitfundResponse'
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
    validateChitfund,
    chitfundController.createChitfund
);

/**
 * @swagger
 * /api/chitfunds:
 *   get:
 *     summary: Get all chitfunds
 *     tags: [Chitfund]
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
 *           enum: [created, on-going, completed]
 *         description: Filter by status
 *       - in: query
 *         name: financeYearId
 *         schema:
 *           type: string
 *         description: Filter by financial year
 *     responses:
 *       200:
 *         description: List of chitfunds
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
 *                     $ref: '#/components/schemas/ChitfundResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 */
router.get('/',
    authenticateToken,
    chitfundController.getAllChitfunds
);

/**
 * @swagger
 * /api/chitfunds/{id}:
 *   get:
 *     summary: Get chitfund by ID
 *     tags: [Chitfund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chitfund ID
 *     responses:
 *       200:
 *         description: Chitfund details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChitfundResponse'
 *       404:
 *         description: Chitfund not found
 */
router.get('/:id',
    authenticateToken,
    chitfundController.getChitfundById
);

/**
 * @swagger
 * /api/chitfunds/{id}:
 *   put:
 *     summary: Update chitfund
 *     tags: [Chitfund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chitfund ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChitfundInput'
 *     responses:
 *       200:
 *         description: Chitfund updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChitfundResponse'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Chitfund not found
 */
router.put('/:id',
    authenticateToken,
    authorizeRoles(['admin', 'manager']),
    validateChitfund,
    chitfundController.updateChitfund
);

/**
 * @swagger
 * /api/chitfunds/{id}:
 *   delete:
 *     summary: Delete chitfund
 *     tags: [Chitfund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chitfund ID
 *     responses:
 *       200:
 *         description: Chitfund deleted successfully
 *       404:
 *         description: Chitfund not found
 */
router.delete('/:id',
    authenticateToken,
    authorizeRoles(['admin']),
    chitfundController.deleteChitfund
);

/**
 * @swagger
 * /api/chitfunds/financial-year/{financeYearId}:
 *   get:
 *     summary: Get chitfunds by financial year
 *     tags: [Chitfund]
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
 *         description: List of chitfunds for the financial year
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
 *                     $ref: '#/components/schemas/ChitfundResponse'
 */
router.get('/financial-year/:financeYearId',
    authenticateToken,
    chitfundController.getChitfundsByFinancialYear
);

/**
 * @swagger
 * /api/chitfunds/status/{status}:
 *   get:
 *     summary: Get chitfunds by status
 *     tags: [Chitfund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [created, on-going, completed]
 *         description: Chitfund status
 *     responses:
 *       200:
 *         description: List of chitfunds by status
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
 *                     $ref: '#/components/schemas/ChitfundResponse'
 */
router.get('/status/:status',
    authenticateToken,
    chitfundController.getChitfundsByStatus
);

/**
 * @swagger
 * /api/chitfunds/{id}/add-staff:
 *   post:
 *     summary: Add staff to chitfund
 *     tags: [Chitfund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chitfund ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               staffIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of staff IDs to add
 *     responses:
 *       200:
 *         description: Staff added to chitfund successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChitfundResponse'
 *       404:
 *         description: Chitfund not found
 */
router.post('/:id/add-staff',
    authenticateToken,
    authorizeRoles(['admin', 'manager']),
    chitfundController.addStaffToChitfund
);

/**
 * @swagger
 * /api/chitfunds/{id}/remove-staff:
 *   delete:
 *     summary: Remove staff from chitfund
 *     tags: [Chitfund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chitfund ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               staffIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of staff IDs to remove
 *     responses:
 *       200:
 *         description: Staff removed from chitfund successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChitfundResponse'
 *       404:
 *         description: Chitfund not found
 */
router.delete('/:id/remove-staff',
    authenticateToken,
    authorizeRoles(['admin', 'manager']),
    chitfundController.removeStaffFromChitfund
);

/**
 * @swagger
 * /api/chitfunds/{id}/complete:
 *   patch:
 *     summary: Complete a chitfund
 *     tags: [Chitfund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chitfund ID
 *     responses:
 *       200:
 *         description: Chitfund completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChitfundResponse'
 *       404:
 *         description: Chitfund not found
 */
router.patch('/:id/complete',
    authenticateToken,
    authorizeRoles(['admin', 'manager']),
    chitfundController.completeChitfund
);

/**
 * @swagger
 * /api/chitfunds/{id}/stats:
 *   get:
 *     summary: Get chitfund statistics
 *     tags: [Chitfund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chitfund ID
 *     responses:
 *       200:
 *         description: Chitfund statistics
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
 *                     totalMembers:
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
    chitfundController.getChitfundStats
);

/**
 * @swagger
 * /api/chitfunds/summary:
 *   get:
 *     summary: Get chitfunds with summary
 *     tags: [Chitfund]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chitfunds with summary data
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
 *                       - $ref: '#/components/schemas/ChitfundResponse'
 *                       - type: object
 *                         properties:
 *                           totalMembers:
 *                             type: number
 *                           totalCollections:
 *                             type: number
 *                           completionPercentage:
 *                             type: number
 */
router.get('/summary',
    authenticateToken,
    chitfundController.getChitfundsWithSummary
);

module.exports = router; 