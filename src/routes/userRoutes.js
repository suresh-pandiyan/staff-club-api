const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const UserController = require('../controllers/userController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and statistics endpoints
 */

// All routes are protected
router.use(authenticateToken);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     description: Retrieve all users with pagination and search capabilities. Admin access required.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering users by employee ID, name, email, phone, or designation
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Users retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     totalPages:
 *                       type: integer
 *                       example: 15
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authorizeRoles('admin'), UserController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Users]
 *     description: Retrieve a specific employee by their ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', UserController.getUserById);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics (Admin only)
 *     tags: [Users]
 *     description: Retrieve user statistics and analytics. Admin access required.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       description: Total number of users
 *                       example: 150
 *                     activeUsers:
 *                       type: integer
 *                       description: Number of active users
 *                       example: 120
 *                     inactiveUsers:
 *                       type: integer
 *                       description: Number of inactive users
 *                       example: 30
 *                     usersByRole:
 *                       type: object
 *                       description: User count by role
 *                       example:
 *                         user: 100
 *                         admin: 5
 *                         moderator: 10
 *                         manager: 20
 *                         supervisor: 15
 *                     usersByType:
 *                       type: object
 *                       description: User count by employment type
 *                       example:
 *                         "full-time": 120
 *                         "part-time": 20
 *                         "contract": 8
 *                         "intern": 2
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/stats', authorizeRoles('admin'), UserController.getUserStats);

router.get('/create-member', authorizeRoles('admin'), UserController.createMember);

module.exports = router; 