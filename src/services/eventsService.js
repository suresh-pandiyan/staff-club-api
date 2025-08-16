const Events = require('../models/Events');
const EventCollection = require('../models/EventCollection');
const FinancialYear = require('../models/FinancialYear');

class EventsService {
    /**
     * Create a new event
     */
    async createEvent(eventData) {
        try {
            // Validate financial year exists
            const financialYear = await FinancialYear.findById(eventData.financeYearId);
            if (!financialYear) {
                throw new Error('Financial year not found');
            }

            const event = new Events(eventData);
            return await event.save();
        } catch (error) {
            throw new Error(`Error creating event: ${error.message}`);
        }
    }

    /**
     * Get all events
     */
    async getAllEvents(filters = {}) {
        try {
            const query = {};

            if (filters.financeYearId) {
                query.financeYearId = filters.financeYearId;
            }

            if (filters.status) {
                query.status = filters.status;
            }

            return await Events.find(query)
                .populate('financeYearId')
                .sort({ eventCreated: -1 });
        } catch (error) {
            throw new Error(`Error fetching events: ${error.message}`);
        }
    }

    /**
     * Get event by ID
     */
    async getEventById(eventId) {
        try {
            const event = await Events.findById(eventId)
                .populate('financeYearId');

            if (!event) {
                throw new Error('Event not found');
            }

            return event;
        } catch (error) {
            throw new Error(`Error fetching event: ${error.message}`);
        }
    }

    /**
     * Update event
     */
    async updateEvent(eventId, updateData) {
        try {
            const event = await Events.findById(eventId);

            if (!event) {
                throw new Error('Event not found');
            }

            // Prevent updating if event is closed
            if (event.status === 'closed' && updateData.eventAmount) {
                throw new Error('Cannot update amount for closed event');
            }

            Object.assign(event, updateData);
            return await event.save();
        } catch (error) {
            throw new Error(`Error updating event: ${error.message}`);
        }
    }

    /**
     * Delete event
     */
    async deleteEvent(eventId) {
        try {
            const event = await Events.findById(eventId);

            if (!event) {
                throw new Error('Event not found');
            }

            // Check if there are any collections
            const collections = await EventCollection.find({ eventId: eventId });
            if (collections.length > 0) {
                throw new Error('Cannot delete event with existing collections');
            }

            return await Events.findByIdAndDelete(eventId);
        } catch (error) {
            throw new Error(`Error deleting event: ${error.message}`);
        }
    }

    /**
     * Get events by financial year
     */
    async getEventsByFinancialYear(financeYearId) {
        try {
            return await Events.find({ financeYearId })
                .populate('financeYearId')
                .sort({ eventCreated: -1 });
        } catch (error) {
            throw new Error(`Error fetching events by financial year: ${error.message}`);
        }
    }

    /**
     * Get active events
     */
    async getActiveEvents() {
        try {
            return await Events.find({ status: 'active' })
                .populate('financeYearId')
                .sort({ eventCreated: -1 });
        } catch (error) {
            throw new Error(`Error fetching active events: ${error.message}`);
        }
    }

    /**
     * Close event
     */
    async closeEvent(eventId) {
        try {
            const event = await Events.findById(eventId);

            if (!event) {
                throw new Error('Event not found');
            }

            if (event.status === 'closed') {
                throw new Error('Event is already closed');
            }

            event.eventClosed = new Date();
            return await event.save();
        } catch (error) {
            throw new Error(`Error closing event: ${error.message}`);
        }
    }

    /**
     * Get event statistics
     */
    async getEventStats(eventId) {
        try {
            const event = await Events.findById(eventId);
            if (!event) {
                throw new Error('Event not found');
            }

            const collections = await EventCollection.find({ eventId });
            const totalCollected = collections.reduce((sum, collection) => sum + collection.collectionAmount, 0);
            const remainingAmount = event.eventAmount - totalCollected;

            return {
                event,
                totalCollected,
                remainingAmount,
                collectionCount: collections.length,
                completionPercentage: (totalCollected / event.eventAmount) * 100
            };
        } catch (error) {
            throw new Error(`Error getting event stats: ${error.message}`);
        }
    }

    /**
     * Get events with collection summary
     */
    async getEventsWithSummary(financeYearId = null) {
        try {
            const query = financeYearId ? { financeYearId } : {};
            const events = await Events.find(query).populate('financeYearId');

            const eventsWithSummary = await Promise.all(
                events.map(async (event) => {
                    const collections = await EventCollection.find({ eventId: event._id });
                    const totalCollected = collections.reduce((sum, collection) => sum + collection.collectionAmount, 0);

                    return {
                        ...event.toObject(),
                        totalCollected,
                        remainingAmount: event.eventAmount - totalCollected,
                        collectionCount: collections.length,
                        completionPercentage: (totalCollected / event.eventAmount) * 100
                    };
                })
            );

            return eventsWithSummary;
        } catch (error) {
            throw new Error(`Error getting events with summary: ${error.message}`);
        }
    }
}

module.exports = new EventsService(); 