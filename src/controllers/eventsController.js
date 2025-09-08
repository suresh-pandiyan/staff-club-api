const FinancialYear = require('../models/FinancialYear');
const { validationResult } = require('express-validator');
const eventsService = require('../services/eventsService');
const User = require('../models/User');
const Events = require('../models/Events');

class EventsController {
    async createEvent(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            let {
                eventAmount,
                hostEmployeeId,
                financeYearId,
                eventName,
                eventDescription,
                eventLocation,
                eventTime,
                eventClosed
            } = req.body;

            // Normalize eventClosed to end of day
            if (eventClosed) {
                const closedDate = new Date(eventClosed);
                closedDate.setHours(23, 59, 59, 999);
                eventClosed = closedDate;
            }

            // Validate financial year exists and eventClosed is within it
            const financialYear = await FinancialYear.findById(financeYearId);
            if (!financialYear) {
                return res.status(400).json({
                    success: false,
                    message: 'Financial year not found'
                });
            }
            // Log the dates for debugging
            if (!financialYear.isDateInRange(eventClosed)) {
                return res.status(400).json({
                    success: false,
                    message: `Event closed date must be within the selected financial year. Valid range: ${financialYear.startFrom.toISOString().slice(0, 10)} to ${financialYear.endTo.toISOString().slice(0, 10)}.\nCompared: eventClosed=${eventClosed}, startFrom=${financialYear.startFrom.toISOString()}, endTo=${financialYear.endTo.toISOString()}`
                });
            }
            // Get all active users
            const users = await User.find({ isActive: true });
            const hostUser = users.find(u => u.employeeId === hostEmployeeId);
            if (!hostUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Host employee not found'
                });
            }

            // Set contributors: host pays nothing, others pay eventAmount
            const contributors = users.map(u => {
                if (u.employeeId === hostEmployeeId) {
                    return {
                        user: u._id,
                        contributedAmount: 0,
                        paymentStatus: 'host'
                    };
                }
                return {
                    user: u._id,
                    contributedAmount: eventAmount,
                    paymentStatus: 'paid'
                };
            });

            const eventData = {
                eventAmount,
                hostEmployeeId,
                financeYearId,
                eventName,
                eventDescription,
                eventLocation,
                eventTime,
                eventClosed,
                contributors
            };

            const event = await eventsService.createEvent(eventData);
            // Add eventStatus for frontend compatibility
            const eventObj = event.toObject ? event.toObject({ virtuals: true }) : event;
            eventObj.eventStatus = eventObj.status === 'active' ? 'active' : 'resolved';
            res.status(201).json({
                success: true,
                message: 'Event created successfully',
                data: eventObj
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    // no need
    async getAllEvents(req, res) {
        console.log(req.query, 'req events controller');
        try {
            const filters = {
                financeYearId: req.query.financeYearId,
                status: req.query.status
            };
            const events = await eventsService.getAllEvents(filters);
            // Add eventStatus to each event for frontend compatibility and debug
            const eventsWithStatus = events.map(event => {
                const obj = event.toObject ? event.toObject({ virtuals: true }) : event;
                obj.eventStatus = obj.status === 'active' ? 'active' : 'resolved';
                return obj;
            });
          
            res.status(200).json({
                success: true,
                message: 'Events retrieved successfully',
                data: totalAmount
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    // no need
    async getEventById(req, res) {
        try {
            const event = await eventsService.getEventById(req.params.id);
            const eventObj = event.toObject ? event.toObject({ virtuals: true }) : event;
            eventObj.eventStatus = eventObj.status === 'active' ? 'active' : 'resolved';
            res.status(200).json({
                success: true,
                message: 'Event retrieved successfully',
                data: eventObj
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }
    async updateEvent(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            const eventId = req.params.id;
            const updateData = req.body;

            // Delegate all logic to the service
            const updatedEvent = await eventsService.updateEvent(eventId, updateData);

            if (!updatedEvent) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }

            // Add eventStatus for frontend compatibility
            const updatedEventObj = updatedEvent.toObject ? updatedEvent.toObject({ virtuals: true }) : updatedEvent;
            updatedEventObj.eventStatus = updatedEventObj.status === 'active' ? 'active' : 'resolved';

            res.status(201).json({
                success: true,
                message: 'Event updated successfully',
                data: updatedEventObj
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }
    async deleteEvent(req, res) {
        try {
            await eventsService.deleteEvent(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Event deleted successfully'
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }
    async getEventsByFinancialYear(req, res) {
        console.log(req.params, 'req events controller');
        try {
            const events = await eventsService.getEventsByFinancialYear(req.params.financeYearId);
            // Add amountCollected to each event
            const eventsWithAmount = events.map(event => {
                const obj = event.toObject ? event.toObject({ virtuals: true }) : event;
                obj.amountCollected = Array.isArray(obj.contributors)
                    ? obj.contributors.reduce((sum, c) => sum + (c.contributedAmount || 0), 0)
                    : 0;
                return obj;
            });
            res.status(200).json({
                success: true,
                message: 'Events retrieved successfully',
                data: eventsWithAmount
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async getActiveEvents(req, res) {
        try {
            const events = await eventsService.getActiveEvents();

            res.status(200).json({
                success: true,
                message: 'Active events retrieved successfully',
                data: events
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async closeEvent(req, res) {
        try {
            const event = await eventsService.closeEvent(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Event closed successfully',
                data: event
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }
    async getEventStats(req, res) {
        try {
            const stats = await eventsService.getEventStats(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Event statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }
    async getEventsWithSummary(req, res) {
        try {
            const events = await eventsService.getEventsWithSummary(req.query.financeYearId);
            res.status(200).json({
                success: true,
                message: 'Events with summary retrieved successfully',
                data: events
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async getEventContributors(req, res) {
        try {
            const { eventId } = req.params;
            const { search, status } = req.query;
            let contributors = await eventsService.getEventContributors(eventId, search);
            if (status && ['host', 'paid'].includes(status)) {
                contributors = contributors.filter(c => c.paymentStatus === status);
            }
            res.status(200).json({
                success: true,
                message: 'Contributors retrieved successfully',
                data: contributors
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateContributorStatus(req, res) {
        const { eventId, userId } = req.params;
        const { paymentStatus } = req.body;
        try {
            const updatedContributor = await eventsService.updateContributorStatus(
                eventId,
                userId,
                paymentStatus,
            );
            res.status(200).json({
                success: true,
                message: `Contributor status updated to ${paymentStatus}`,
                data: updatedContributor
            });
        }
        catch (error) {
            console.error("Error updating contributor status:", error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

}

module.exports = new EventsController(); 