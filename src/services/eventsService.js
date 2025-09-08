const Events = require('../models/Events');
const EventCollection = require('../models/EventCollection');
const FinancialYear = require('../models/FinancialYear');

class EventsService {
    /**
     * Create a new event
     */
    async createEvent(eventData) {
        try {
            //  Validate financial year exists
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
        console.log(filters, 'events filters');
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
                const users = await require('../models/User').find({ isActive: true });
                return null; // Let controller handle 404
            }

            let contributors = event.contributors;

            // If host is updated, update contributors accordingly
            if (updateData.hostEmployeeId && updateData.hostEmployeeId !== event.hostEmployeeId) {
                contributors = users.map(u => {
                    if (u.employeeId === updateData.hostEmployeeId) {
                        return {
                            user: u._id,
                            contributedAmount: 0,
                            paymentStatus: 'host'
                        };
                    }
                    return {
                        user: u._id,
                        contributedAmount: updateData?.eventAmount || event?.eventAmount,
                        paymentStatus: 'paid'
                    };
                });
                updateData.contributors = contributors;
            } else if (updateData.eventAmount && updateData.eventAmount !== event.eventAmount) {
                // If only eventAmount is updated, update contributedAmount for all 'paid' contributors
                contributors = contributors.map(contributor => {
                    if (contributor.paymentStatus === 'paid') {
                        return {
                            ...contributor.toObject(),
                            contributedAmount: updateData.eventAmount
                        };
                    }
                    return contributor.toObject ? contributor.toObject() : contributor;
                });
                updateData.contributors = contributors;
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
   
    async getEventContributors(eventId, search = "") {
        try {
            const event = await Events.findById(eventId).populate({
                path: "contributors.user",
                select: "firstName lastName email employeeId",
            });
    
            if (!event) {
                throw new Error("Event not found");
            }
    
            let contributors = event.contributors;
    
            // 🔍 Apply search filter if provided
            if (search && search.trim() !== "") {
                const regex = new RegExp(search, "i"); // case-insensitive
                contributors = contributors.filter(c =>
                    regex.test(c.user?.firstName) ||
                    regex.test(c.user?.lastName) ||
                    regex.test(c.user?.email) ||
                    regex.test(c.user?.employeeId)
                );
            }
    
            return contributors.map(contributor => ({
                user: contributor.user,
                contributedAmount: contributor.contributedAmount,
                paymentStatus: contributor.paymentStatus
            }));
        } catch (error) {
            throw new Error(`Error fetching contributors: ${error.message}`);
        }
    }
    
    async updateContributorStatus(eventId, userId, paymentStatus) {
        try {
            const event = await Events.findById(eventId);
            if (!event) {
                throw new Error('Event not found');
            }
            // Find contributor
            const contributor = event.contributors.find(
                (c) => c.user.toString() === userId.toString()
            );
            if (!contributor) {
                throw new Error('Contributor not found');
            }
            // ✅ Update directly (multiple hosts allowed)
            contributor.paymentStatus = paymentStatus;
            if (paymentStatus === 'host') {
                contributor.contributedAmount = 0;
            }
            await event.save();
            return contributor; // return updated contributor only
        } catch (error) {
            throw new Error(`Error updating contributor status: ${error.message}`);
        }
    }
}

module.exports = new EventsService(); 