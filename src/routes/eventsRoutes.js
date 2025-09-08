const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateEvent } = require('../middleware/validation');

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventInput'
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
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
    validateEvent,
    eventsController.createEvent
);

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
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
 *         description: List of events
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
 *                     $ref: '#/components/schemas/EventResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 */
router.get('/',
    authenticateToken,
    authorizeRoles(['admin', 'manager']),
    eventsController.getAllEvents
);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 *       404:
 *         description: Event not found
 */
router.get('/:id',
    authenticateToken,
    eventsController.getEventById
);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Update event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventInput'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Event not found
 */
router.put('/:id',
    authenticateToken,
    authorizeRoles(['admin', 'manager']),
    validateEvent,
    eventsController.updateEvent
);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 */
router.delete('/:id',
    authenticateToken,
    authorizeRoles(['admin']),
    eventsController.deleteEvent
);

/**
 * @swagger
 * /api/events/financial-year/{financeYearId}:
 *   get:
 *     summary: Get events by financial year
 *     tags: [Events]
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
 *         description: List of events for the financial year
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
 *                     $ref: '#/components/schemas/EventResponse'
 */
router.get('/financial-year/:financeYearId',
    authenticateToken,
    eventsController.getEventsByFinancialYear
);

/**
 * @swagger
 * /api/events/active:
 *   get:
 *     summary: Get active events
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active events
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
 *                     $ref: '#/components/schemas/EventResponse'
 */
router.get('/active',
    authenticateToken,
    eventsController.getActiveEvents
);

/**
 * @swagger
 * /api/events/{id}/close:
 *   patch:
 *     summary: Close an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event closed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 *       404:
 *         description: Event not found
 */
router.patch('/:id/close',
    authenticateToken,
    authorizeRoles(['admin', 'manager']),
    eventsController.closeEvent
);

/**
 * @swagger
 * /api/events/{id}/stats:
 *   get:
 *     summary: Get event statistics
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event statistics
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
 *                     totalContributions:
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
    eventsController.getEventStats
);

/**
 * @swagger
 * /api/events/summary:
 *   get:
 *     summary: Get events with summary
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Events with summary data
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
 *                       - $ref: '#/components/schemas/EventResponse'
 *                       - type: object
 *                         properties:
 *                           totalContributions:
 *                             type: number
 *                           totalContributors:
 *                             type: number
 *                           progressPercentage:
 *                             type: number
 */
router.get('/summary',
    authenticateToken,
    eventsController.getEventsWithSummary
);

/**
 * @swagger
 * /api/events/contributors/{eventId}:
 *   get:
 *     summary: Get contributors for an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [host, paid, unpaid]
 *         description: Filter contributors by payment status (host, paid, unpaid)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search contributors by name, email, or employeeId
 *     responses:
 *       200:
 *         description: List of contributors for the event
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
 *                     type: object
 *                     properties:
 *                       user:
 *                         $ref: '#/components/schemas/Employee'
 *                       contributedAmount:
 *                         type: number
 *                       paymentStatus:
 *                         type: string
 *                         enum: [paid, unpaid, host]
 *       404:
 *         description: Event not found
 */
router.get('/contributors/:eventId',
    authenticateToken,
    authorizeRoles(['admin', 'manager']),
    eventsController.getEventContributors
);

router.patch(
    '/:eventId/contributors/:userId/status',
    authenticateToken,
    authorizeRoles(['admin', 'manager']),
    eventsController.updateContributorStatus
);
module.exports = router; 