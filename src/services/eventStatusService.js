const Events = require('../models/Events');

class EventStatusService {
    /**
     * Update expired events status to false
     */
    async updateExpiredEvents() {
        try {
            const now = new Date();
            
            // Find all events where eventClosed has passed but eventStatus is still true
            const expiredEvents = await Events.updateMany(
                {
                    eventClosed: { $lt: now },
                    eventStatus: true
                },
                {
                    $set: { eventStatus: false }
                }
            );

            if (expiredEvents.modifiedCount > 0) {
                console.log(`Updated ${expiredEvents.modifiedCount} expired events to inactive status`);
            }
            return expiredEvents;
        } catch (error) {
            console.error('Error updating expired events:', error);
            throw error;
        }
    }

    /**
     * Get events that are about to expire (within next hour)
     */
    async getExpiringEvents() {
        try {
            const now = new Date();
            const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

            return await Events.find({
                eventClosed: { 
                    $gte: now,
                    $lte: oneHourFromNow 
                },
                eventStatus: true
            }).populate('financeYearId');
        } catch (error) {
            console.error('Error fetching expiring events:', error);
            throw error;
        }
    }

    /**
     * Start interval to check for expired events every minute
     */
    startEventStatusScheduler() {
        // Run every minute to check for expired events
        setInterval(async () => {
            try {
                await this.updateExpiredEvents();
            } catch (error) {
                console.error('Scheduled event status update failed:', error);
            }
        }, 60000); // 60 seconds

        console.log('Event status scheduler started - checking every minute');
    }

    /**
     * Manual trigger to update all event statuses
     */
    async refreshAllEventStatuses() {
        try {
            const now = new Date();
            
            // Update all events based on their eventClosed date
            const result = await Events.updateMany(
                {},
                [
                    {
                        $set: {
                            eventStatus: {
                                $cond: {
                                    if: { $lte: ["$eventClosed", now] },
                                    then: false,
                                    else: true
                                }
                            }
                        }
                    }
                ]
            );

            console.log(`Refreshed status for ${result.modifiedCount} events`);
            return result;
        } catch (error) {
            console.error('Error refreshing event statuses:', error);
            throw error;
        }
    }
}

module.exports = new EventStatusService();
