const CharityFund = require('../models/CharityFund');
const CharityCollection = require('../models/CharityCollection');
const FinancialYear = require('../models/FinancialYear');

class CharityFundService {
    /**
     * Create a new charity fund
     */
    async createCharityFund(charityFundData) {
        try {
            // Validate financial year exists
            const financialYear = await FinancialYear.findById(charityFundData.financeYearId);
            if (!financialYear) {
                throw new Error('Financial year not found');
            }

            const charityFund = new CharityFund(charityFundData);
            return await charityFund.save();
        } catch (error) {
            throw new Error(`Error creating charity fund: ${error.message}`);
        }
    }

    /**
     * Get all charity funds
     */
    async getAllCharityFunds(filters = {}) {
        try {
            const query = {};

            if (filters.financeYearId) {
                query.financeYearId = filters.financeYearId;
            }

            if (filters.status) {
                query.status = filters.status;
            }

            return await CharityFund.find(query)
                .populate('financeYearId')
                .sort({ charityCreated: -1 });
        } catch (error) {
            throw new Error(`Error fetching charity funds: ${error.message}`);
        }
    }

    /**
     * Get charity fund by ID
     */
    async getCharityFundById(charityFundId) {
        try {
            const charityFund = await CharityFund.findById(charityFundId)
                .populate('financeYearId');

            if (!charityFund) {
                throw new Error('Charity fund not found');
            }

            return charityFund;
        } catch (error) {
            throw new Error(`Error fetching charity fund: ${error.message}`);
        }
    }

    /**
     * Update charity fund
     */
    async updateCharityFund(charityFundId, updateData) {
        try {
            const charityFund = await CharityFund.findById(charityFundId);

            if (!charityFund) {
                throw new Error('Charity fund not found');
            }

            // Prevent updating if fund is closed
            if (charityFund.status === 'closed' && updateData.charityAmount) {
                throw new Error('Cannot update amount for closed charity fund');
            }

            Object.assign(charityFund, updateData);
            return await charityFund.save();
        } catch (error) {
            throw new Error(`Error updating charity fund: ${error.message}`);
        }
    }

    /**
     * Delete charity fund
     */
    async deleteCharityFund(charityFundId) {
        try {
            const charityFund = await CharityFund.findById(charityFundId);

            if (!charityFund) {
                throw new Error('Charity fund not found');
            }

            // Check if there are any collections
            const collections = await CharityCollection.find({ charityFundId: charityFundId });
            if (collections.length > 0) {
                throw new Error('Cannot delete charity fund with existing collections');
            }

            return await CharityFund.findByIdAndDelete(charityFundId);
        } catch (error) {
            throw new Error(`Error deleting charity fund: ${error.message}`);
        }
    }

    /**
     * Get charity funds by financial year
     */
    async getCharityFundsByFinancialYear(financeYearId) {
        try {
            return await CharityFund.find({ financeYearId })
                .populate('financeYearId')
                .sort({ charityCreated: -1 });
        } catch (error) {
            throw new Error(`Error fetching charity funds by financial year: ${error.message}`);
        }
    }

    /**
     * Get active charity funds
     */
    async getActiveCharityFunds() {
        try {
            return await CharityFund.find({ status: 'active' })
                .populate('financeYearId')
                .sort({ charityCreated: -1 });
        } catch (error) {
            throw new Error(`Error fetching active charity funds: ${error.message}`);
        }
    }

    /**
     * Close charity fund
     */
    async closeCharityFund(charityFundId) {
        try {
            const charityFund = await CharityFund.findById(charityFundId);

            if (!charityFund) {
                throw new Error('Charity fund not found');
            }

            if (charityFund.status === 'closed') {
                throw new Error('Charity fund is already closed');
            }

            charityFund.charityClosed = new Date();
            return await charityFund.save();
        } catch (error) {
            throw new Error(`Error closing charity fund: ${error.message}`);
        }
    }

    /**
     * Get charity fund statistics
     */
    async getCharityFundStats(charityFundId) {
        try {
            const charityFund = await CharityFund.findById(charityFundId);
            if (!charityFund) {
                throw new Error('Charity fund not found');
            }

            const collections = await CharityCollection.find({ charityFundId });
            const totalCollected = collections.reduce((sum, collection) => sum + collection.collectionAmount, 0);
            const remainingAmount = charityFund.charityAmount - totalCollected;

            return {
                charityFund,
                totalCollected,
                remainingAmount,
                collectionCount: collections.length,
                completionPercentage: (totalCollected / charityFund.charityAmount) * 100
            };
        } catch (error) {
            throw new Error(`Error getting charity fund stats: ${error.message}`);
        }
    }

    /**
     * Get charity funds with collection summary
     */
    async getCharityFundsWithSummary(financeYearId = null) {
        try {
            const query = financeYearId ? { financeYearId } : {};
            const charityFunds = await CharityFund.find(query).populate('financeYearId');

            const fundsWithSummary = await Promise.all(
                charityFunds.map(async (fund) => {
                    const collections = await CharityCollection.find({ charityFundId: fund._id });
                    const totalCollected = collections.reduce((sum, collection) => sum + collection.collectionAmount, 0);

                    return {
                        ...fund.toObject(),
                        totalCollected,
                        remainingAmount: fund.charityAmount - totalCollected,
                        collectionCount: collections.length,
                        completionPercentage: (totalCollected / fund.charityAmount) * 100
                    };
                })
            );

            return fundsWithSummary;
        } catch (error) {
            throw new Error(`Error getting charity funds with summary: ${error.message}`);
        }
    }
}

module.exports = new CharityFundService(); 