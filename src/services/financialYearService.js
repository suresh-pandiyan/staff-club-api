const FinancialYear = require('../models/FinancialYear');

class FinancialYearService {
    /**
     * Create a new financial year
     */
    async createFinancialYear(financialYearData) {
        try {
            // Check if financial year already exists
            const existingYear = await FinancialYear.findOne({
                financeYear: financialYearData.financeYear
            });

            if (existingYear) {
                throw new Error('Financial year already exists');
            }

            // If this is set as currently active, deactivate others
            if (financialYearData.currentlyActive) {
                await FinancialYear.updateMany(
                    { currentlyActive: true },
                    { currentlyActive: false }
                );
            }

            const financialYear = new FinancialYear(financialYearData);
            return await financialYear.save();
        } catch (error) {
            throw new Error(`Error creating financial year: ${error.message}`);
        }
    }

    /**
     * Get all financial years
     */
    async getAllFinancialYears(filters = {}) {
        try {
            const query = {};

            if (filters.currentlyActive !== undefined) {
                query.currentlyActive = filters.currentlyActive;
            }

            return await FinancialYear.find(query)
                .sort({ startFrom: -1 });
        } catch (error) {
            throw new Error(`Error fetching financial years: ${error.message}`);
        }
    }

    /**
     * Get financial year by ID
     */
    async getFinancialYearById(financialYearId) {
        try {
            const financialYear = await FinancialYear.findById(financialYearId);

            if (!financialYear) {
                throw new Error('Financial year not found');
            }

            return financialYear;
        } catch (error) {
            throw new Error(`Error fetching financial year: ${error.message}`);
        }
    }

    /**
     * Update financial year
     */
    async updateFinancialYear(financialYearId, updateData) {
        try {
            const financialYear = await FinancialYear.findById(financialYearId);

            if (!financialYear) {
                throw new Error('Financial year not found');
            }

            // Check if finance year name is being changed and if it already exists
            if (updateData.financeYear && updateData.financeYear !== financialYear.financeYear) {
                const existingYear = await FinancialYear.findOne({
                    financeYear: updateData.financeYear,
                    _id: { $ne: financialYearId }
                });

                if (existingYear) {
                    throw new Error('Financial year name already exists');
                }
            }

            // If this is being set as currently active, deactivate others
            if (updateData.currentlyActive) {
                await FinancialYear.updateMany(
                    { _id: { $ne: financialYearId }, currentlyActive: true },
                    { currentlyActive: false }
                );
            }

            Object.assign(financialYear, updateData);
            return await financialYear.save();
        } catch (error) {
            throw new Error(`Error updating financial year: ${error.message}`);
        }
    }

    /**
     * Delete financial year
     */
    async deleteFinancialYear(financialYearId) {
        try {
            const financialYear = await FinancialYear.findById(financialYearId);

            if (!financialYear) {
                throw new Error('Financial year not found');
            }

            // Prevent deletion if it's currently active
            if (financialYear.currentlyActive) {
                throw new Error('Cannot delete currently active financial year');
            }

            return await FinancialYear.findByIdAndDelete(financialYearId);
        } catch (error) {
            throw new Error(`Error deleting financial year: ${error.message}`);
        }
    }

    /**
     * Get currently active financial year
     */
    async getCurrentlyActiveFinancialYear() {
        try {
            const financialYear = await FinancialYear.findOne({ currentlyActive: true });

            if (!financialYear) {
                throw new Error('No currently active financial year found');
            }

            return financialYear;
        } catch (error) {
            throw new Error(`Error fetching currently active financial year: ${error.message}`);
        }
    }

    /**
     * Set financial year as currently active
     */
    async setCurrentlyActiveFinancialYear(financialYearId) {
        try {
            const financialYear = await FinancialYear.findById(financialYearId);

            if (!financialYear) {
                throw new Error('Financial year not found');
            }

            // Deactivate all other financial years
            await FinancialYear.updateMany(
                { _id: { $ne: financialYearId } },
                { currentlyActive: false }
            );

            // Activate the selected financial year
            financialYear.currentlyActive = true;
            return await financialYear.save();
        } catch (error) {
            throw new Error(`Error setting currently active financial year: ${error.message}`);
        }
    }

    /**
     * Get financial years by date range
     */
    async getFinancialYearsByDateRange(startDate, endDate) {
        try {
            return await FinancialYear.find({
                $or: [
                    {
                        startFrom: { $lte: endDate },
                        endTo: { $gte: startDate }
                    },
                    {
                        startFrom: { $gte: startDate, $lte: endDate }
                    },
                    {
                        endTo: { $gte: startDate, $lte: endDate }
                    }
                ]
            }).sort({ startFrom: -1 });
        } catch (error) {
            throw new Error(`Error fetching financial years by date range: ${error.message}`);
        }
    }

    /**
     * Get financial year by date
     */
    async getFinancialYearByDate(date) {
        try {
            const financialYear = await FinancialYear.findOne({
                startFrom: { $lte: date },
                endTo: { $gte: date }
            });

            if (!financialYear) {
                throw new Error('No financial year found for the specified date');
            }

            return financialYear;
        } catch (error) {
            throw new Error(`Error fetching financial year by date: ${error.message}`);
        }
    }

    /**
     * Get financial year statistics
     */
    async getFinancialYearStats(financialYearId) {
        try {
            const financialYear = await FinancialYear.findById(financialYearId);
            if (!financialYear) {
                throw new Error('Financial year not found');
            }

            const totalDays = Math.ceil((financialYear.endTo - financialYear.startFrom) / (1000 * 60 * 60 * 24));
            const daysElapsed = Math.ceil((new Date() - financialYear.startFrom) / (1000 * 60 * 60 * 24));
            const daysRemaining = Math.max(0, totalDays - daysElapsed);
            const progressPercentage = Math.min(100, (daysElapsed / totalDays) * 100);

            return {
                financialYear,
                totalDays,
                daysElapsed,
                daysRemaining,
                progressPercentage,
                isActive: financialYear.currentlyActive,
                isCompleted: new Date() > financialYear.endTo
            };
        } catch (error) {
            throw new Error(`Error getting financial year stats: ${error.message}`);
        }
    }

    /**
     * Get financial years with statistics
     */
    async getFinancialYearsWithStats() {
        try {
            const financialYears = await FinancialYear.find().sort({ startFrom: -1 });

            const yearsWithStats = financialYears.map(year => {
                const totalDays = Math.ceil((year.endTo - year.startFrom) / (1000 * 60 * 60 * 24));
                const daysElapsed = Math.ceil((new Date() - year.startFrom) / (1000 * 60 * 60 * 24));
                const daysRemaining = Math.max(0, totalDays - daysElapsed);
                const progressPercentage = Math.min(100, (daysElapsed / totalDays) * 100);

                return {
                    ...year.toObject(),
                    totalDays,
                    daysElapsed,
                    daysRemaining,
                    progressPercentage,
                    isActive: year.currentlyActive,
                    isCompleted: new Date() > year.endTo
                };
            });

            return yearsWithStats;
        } catch (error) {
            throw new Error(`Error getting financial years with stats: ${error.message}`);
        }
    }
}

module.exports = new FinancialYearService(); 