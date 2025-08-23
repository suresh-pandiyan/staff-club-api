const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const UserController = require('../controllers/userController');
const { validateCreateMember, validateUpdateMember } = require('../middleware/validation');

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

/**
 * @swagger
 * /api/users/create-member:
 *   post:
 *     summary: Create a new member (Admin only)
 *     tags: [Users]
 *     description: Create a new staff member with all required information. Admin access required.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - firstName
 *               - lastName
 *               - email
 *               - phone
 *               - type
 *               - address
 *               - department
 *               - designation
 *               - emergencyContact
 *               - password
 *               - currentSalary
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: Unique employee identifier
 *                 example: "EMP001"
 *               firstName:
 *                 type: string
 *                 description: Employee's first name
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: Employee's last name
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Employee's email address
 *                 example: "john.doe@company.com"
 *               phone:
 *                 type: string
 *                 description: Employee's phone number
 *                 example: "+1234567890"
 *               type:
 *                 type: string
 *                 enum: [full-time, part-time, contract, intern]
 *                 description: Employment type
 *                 example: "full-time"
 *               address:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - state
 *                   - zipCode
 *                 properties:
 *                   street:
 *                     type: string
 *                     description: Street address
 *                     example: "123 Main St"
 *                   city:
 *                     type: string
 *                     description: City
 *                     example: "New York"
 *                   state:
 *                     type: string
 *                     description: State
 *                     example: "NY"
 *                   zipCode:
 *                     type: string
 *                     description: ZIP code
 *                     example: "10001"
 *                   country:
 *                     type: string
 *                     description: Country (optional, defaults to India)
 *                     example: "India"
 *               department:
 *                 type: string
 *                 enum: [
 *                   "Computer Science & Engineering(CSE)",
 *                   "Information Technology(IT)",
 *                   "Electronics & Communication Engineering(ECE)",
 *                   "Electrical & Electronics Engineering(EEE)",
 *                   "Mechanical Engineering(MECH)",
 *                   "Civil Engineering",
 *                   "Artificial Intelligence & Data Science(AI & DS)",
 *                   "Master of Business Administration(MBA)",
 *                   "Cyber Security",
 *                   "Master of Computer Applications(MCA)"
 *                 ]
 *                 description: Employee's department
 *                 example: "Computer Science & Engineering(CSE)"
 *               designation:
 *                 type: string
 *                 description: Employee's job designation
 *                 example: "Software Engineer"
 *               emergencyContact:
 *                 type: object
 *                 required:
 *                   - name
 *                   - relationship
 *                   - phone
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Emergency contact person's name
 *                     example: "Jane Doe"
 *                   relationship:
 *                     type: string
 *                     description: Relationship to employee
 *                     example: "Spouse"
 *                   phone:
 *                     type: string
 *                     description: Emergency contact phone number
 *                     example: "+1234567890"
 *                   address:
 *                     type: string
 *                     description: Emergency contact address (optional)
 *                     example: "456 Oak Ave, New York, NY 10002"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Employee's password
 *                 example: "password123"
 *               currentSalary:
 *                 type: number
 *                 minimum: 0
 *                 description: Employee's current salary
 *                 example: 75000
 *               role:
 *                 type: string
 *                 enum: [user, admin, moderator, manager, supervisor]
 *                 default: user
 *                 description: User role (optional)
 *                 example: "user"
 *               joinDate:
 *                 type: string
 *                 format: date
 *                 description: Employee join date (optional, defaults to current date)
 *                 example: "2024-01-15"
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   example: "User created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/Employee'
 *                     token:
 *                       type: string
 *                       description: JWT token for the new user
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *       409:
 *         description: Conflict - User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/create-member', authorizeRoles('admin'), validateCreateMember, UserController.createMember);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update an existing member (Admin only)
 *     tags: [Users]
 *     description: Update an existing member's information. Admin access required.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to update
 *         example: "68a0a15a5833d387f2373463"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: Employee ID (optional)
 *                 example: "EMP001"
 *               firstName:
 *                 type: string
 *                 description: First name (optional)
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: Last name (optional)
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address (optional)
 *                 example: "john.doe@example.com"
 *               phone:
 *                 type: string
 *                 description: Phone number (optional)
 *                 example: "+1234567890"
 *               type:
 *                 type: string
 *                 enum: [full-time, part-time, contract, intern]
 *                 description: Employment type (optional)
 *                 example: "full-time"
 *               address:
 *                 type: object
 *                 description: Address information (optional)
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: "123 Main St"
 *                   city:
 *                     type: string
 *                     example: "New York"
 *                   state:
 *                     type: string
 *                     example: "NY"
 *                   zipCode:
 *                     type: string
 *                     example: "10001"
 *                   country:
 *                     type: string
 *                     example: "USA"
 *               department:
 *                 type: string
 *                 enum: [
 *                   'Computer Science & Engineering(CSE)',
 *                   'Information Technology(IT)',
 *                   'Electronics & Communication Engineering(ECE)',
 *                   'Electrical & Electronics Engineering(EEE)',
 *                   'Mechanical Engineering(MECH)',
 *                   'Civil Engineering',
 *                   'Artificial Intelligence & Data Science(AI & DS)',
 *                   'Master of Business Administration(MBA)',
 *                   'Cyber Security',
 *                   'Master of Computer Applications(MCA)'
 *                 ]
 *                 description: Department (optional)
 *                 example: "Computer Science & Engineering(CSE)"
 *               designation:
 *                 type: string
 *                 description: Job designation (optional)
 *                 example: "Senior Software Engineer"
 *               currentSalary:
 *                 type: number
 *                 minimum: 0
 *                 description: Current salary (optional)
 *                 example: 80000
 *               emergencyContact:
 *                 type: object
 *                 description: Emergency contact information (optional)
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Jane Doe"
 *                   relationship:
 *                     type: string
 *                     example: "Spouse"
 *                   phone:
 *                     type: string
 *                     example: "+1234567890"
 *                   address:
 *                     type: string
 *                     example: "456 Oak Ave, New York, NY 10002"
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   example: "User updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict - Email or Employee ID already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/update-member/:id', authorizeRoles('admin'), validateUpdateMember, UserController.updateMember);

module.exports = router; 