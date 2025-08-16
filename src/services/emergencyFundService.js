const EmergencyFund = require('../models/EmergencyFund');
const EmergencyFundCollection = require('../models/EmergencyFundCollection');
const FinancialYear = require('../models/FinancialYear');

class EmergencyFundService {
    /**
     * Create a new emergency fund
     */
    async createEmergencyFund(emergencyFundData) {
        try {
            // Validate financial year exists
            const financialYear = await FinancialYear.findById(emergencyFundData.financeYearId);
            if (!financialYear) {
                throw new Error('Financial year not found');
            }

            const emergencyFund = new EmergencyFund(emergencyFundData);
            return await emergencyFund.save();
        } catch (error) {
            throw new Error(`Error creating emergency fund: ${error.message}`);
        }
    }

    /**
     * Get all emergency funds
     */
    async getAllEmergencyFunds(filters = {}) {
        try {
            const query = {};

            if (filters.financeYearId) {
                query.financeYearId = filters.financeYearId;
            }

            if (filters.status) {
                query.status = filters.status;
            }

            return await EmergencyFund.find(query)
                .populate('financeYearId')
                .sort({ emergencyFundCreated: -1 });
        } catch (error) {
            throw new Error(`Error fetching emergency funds: ${error.message}`);
        }
    }

    /**
     * Get emergency fund by ID
     */
    async getEmergencyFundById(emergencyFundId) {
        try {
            const emergencyFund = await EmergencyFund.findById(emergencyFundId)
                .populate('financeYearId');

            if (!emergencyFund) {
                throw new Error('Emergency fund not found');
            }

            return emergencyFund;
        } catch (error) {
            throw new Error(`Error fetching emergency fund: ${error.message}`);
        }
    }

    /**
     * Update emergency fund
     */
    async updateEmergencyFund(emergencyFundId, updateData) {
        try {
            const emergencyFund = await EmergencyFund.findById(emergencyFundId);

            if (!emergencyFund) {
                throw new Error('Emergency fund not found');
            }

            // Prevent updating if fund is closed
            if (emergencyFund.status === 'closed' && updateData.emergencyFundAmount) {
                throw new Error('Cannot update amount for closed emergency fund');
            }

            Object.assign(emergencyFund, updateData);
            return await emergencyFund.save();
        } catch (error) {
            throw new Error(`Error updating emergency fund: ${error.message}`);
        }
    }

    /**
     * Delete emergency fund
     */
    async deleteEmergencyFund(emergencyFundId) {
        try {
            const emergencyFund = await EmergencyFund.findById(emergencyFundId);

            if (!emergencyFund) {
                throw new Error('Emergency fund not found');
            }

            // Check if there are any collections
            const collections = await EmergencyFundCollection.find({ emergencyFundId: emergencyFundId });
            if (collections.length > 0) {
                throw new Error('Cannot delete emergency fund with existing collections');
            }

            return await EmergencyFund.findByIdAndDelete(emergencyFundId);
        } catch (error) {
            throw new Error(`Error deleting emergency fund: ${error.message}`);
        }
    }

    /**
     * Get emergency funds by financial year
     */
    async getEmergencyFundsByFinancialYear(financeYearId) {
        try {
            return await EmergencyFund.find({ financeYearId })
                .populate('financeYearId')
                .sort({ emergencyFundCreated: -1 });
        } catch (error) {
            throw new Error(`Error fetching emergency funds by financial year: ${error.message}`);
        }
    }

    /**
     * Get active emergency funds
     */
    async getActiveEmergencyFunds() {
        try {
            return await EmergencyFund.find({ status: 'active' })
                .populate('financeYearId')
                .sort({ emergencyFundCreated: -1 });
        } catch (error) {
            throw new Error(`Error fetching active emergency funds: ${error.message}`);
        }
    }

    /**
     * Close emergency fund
     */
    async closeEmergencyFund(emergencyFundId) {
        try {
            const emergencyFund = await EmergencyFund.findById(emergencyFundId);

            if (!emergencyFund) {
                throw new Error('Emergency fund not found');
            }

            if (emergencyFund.status === 'closed') {
                throw new Error('Emergency fund is already closed');
            }

            emergencyFund.emergencyFundClosed = new Date();
            return await emergencyFund.save();
        } catch (error) {
            throw new Error(`Error closing emergency fund: ${error.message}`);
        }
    }

    /**
     * Get emergency fund statistics
     */
    async getEmergencyFundStats(emergencyFundId) {
        try {
            const emergencyFund = await EmergencyFund.findById(emergencyFundId);
            if (!emergencyFund) {
                throw new Error('Emergency fund not found');
            }

            const collections = await EmergencyFundCollection.find({ emergencyFundId });
            const totalCollected = collections.reduce((sum, collection) => sum + collection.collectionAmount, 0);
            const remainingAmount = emergencyFund.emergencyFundAmount - totalCollected;

            return {
                emergencyFund,
                totalCollected,
                remainingAmount,
                collectionCount: collections.length,
                completionPercentage: (totalCollected / emergencyFund.emergencyFundAmount) * 100
            };
        } catch (error) {
            throw new Error(`Error getting emergency fund stats: ${error.message}`);
        }
    }

    /**
     * Get emergency funds with collection summary
     */
    async getEmergencyFundsWithSummary(financeYearId = null) {
        try {
            const query = financeYearId ? { financeYearId } : {};
            const emergencyFunds = await EmergencyFund.find(query).populate('financeYearId');

            const fundsWithSummary = await Promise.all(
                emergencyFunds.map(async (fund) => {
                    const collections = await EmergencyFundCollection.find({ emergencyFundId: fund._id });
                    const totalCollected = collections.reduce((sum, collection) => sum + collection.collectionAmount, 0);

                    return {
                        ...fund.toObject(),
                        totalCollected,
                        remainingAmount: fund.emergencyFundAmount - totalCollected,
                        collectionCount: collections.length,
                        completionPercentage: (totalCollected / fund.emergencyFundAmount) * 100
                    };
                })
            );

            return fundsWithSummary;
        } catch (error) {
            throw new Error(`Error getting emergency funds with summary: ${error.message}`);
        }
    }
}

module.exports = new EmergencyFundService(); 