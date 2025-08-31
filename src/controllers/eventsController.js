const { validationResult } = require('express-validator');
const eventsService = require('../services/eventsService');
const User = require('../models/User');
const Events = require('../models/Events');

class EventsController {
    async createEvent(req, res) {
        const { eventAmount, hostEmployeeId } = req.body;
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            const users = await User.find({ isActive: true });
            const hostUser = users.find(u => u.employeeId === hostEmployeeId);
            const contributors = users?.map(u => {
                if (hostUser && u.employeeId === hostEmployeeId) {
                    return {
                        user: u._id,
                        contributedAmount: 0,          // host pays nothing
                        paymentStatus: "host"          // mark as host
                    };
                }
                return {
                    user: u._id,
                    contributedAmount: eventAmount,
                    paymentStatus: "paid"
                };
            });
            const eventData = {
                ...req.body,
                contributors,
            };
            const event = await eventsService.createEvent(eventData);
            res.status(201).json({
                success: true,
                message: 'Event created successfully',
                data: event
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    
    async getAllEvents(req, res) {
        try {
            const filters = {
                financeYearId: req.query.financeYearId,
                status: req.query.status
            };
            const events = await eventsService.getAllEvents(filters);
            res.status(200).json({
                success: true,
                message: 'Events retrieved successfully',
                data: events
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    async getEventById(req, res) {
        try {
            const event = await eventsService.getEventById(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Event retrieved successfully',
                data: event
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
            const event = await eventsService.updateEvent(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: 'Event updated successfully',
                data: event
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
        try {
            const events = await eventsService.getEventsByFinancialYear(req.params.financeYearId);
            res.status(200).json({
                success: true,
                message: 'Events retrieved successfully',
                data: events
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
            const { search } = req.query;
            const contributors = await eventsService.getEventContributors(eventId, search);
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
    // async getEventContributors(req, res) {
    //     try {
    //         const contributors = await eventsService.getEventContributors(req.params.eventId);
    //         res.status(200).json({
    //             success: true,
    //             message: 'Contributors retrieved successfully',
    //             data: contributors
    //         });
    //     } catch (error) {
    //         res.status(404).json({
    //             success: false,
    //             message: error.message
    //         });
    //     }
    // }
    async updateContributorStatus(req, res) {
        const { eventId, userId } = req.params;
        const { paymentStatus } = req.body;
        try {
            const updatedContributor = await eventsService.updateContributorStatus(
                eventId,
                userId,
                paymentStatus
            );
            res.status(200).json({
                success: true,
                message: `Contributor status updated to ${paymentStatus}`,
                data: updatedContributor
            });
        } catch (error) {
            console.error("Error updating contributor status:", error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

}

module.exports = new EventsController(); 