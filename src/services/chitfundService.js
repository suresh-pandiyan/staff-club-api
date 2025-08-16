const Chitfund = require('../models/Chitfund');
const ChitMembers = require('../models/ChitMembers');
const ChitCollection = require('../models/ChitCollection');
const FinancialYear = require('../models/FinancialYear');
const User = require('../models/User');

class ChitfundService {
    /**
     * Create a new chitfund
     */
    async createChitfund(chitfundData) {
        try {
            // Validate financial year exists
            const financialYear = await FinancialYear.findById(chitfundData.financeYearId);
            if (!financialYear) {
                throw new Error('Financial year not found');
            }

            // Validate staff members exist
            if (chitfundData.chitStaffs && chitfundData.chitStaffs.length > 0) {
                const staffMembers = await User.find({ _id: { $in: chitfundData.chitStaffs } });
                if (staffMembers.length !== chitfundData.chitStaffs.length) {
                    throw new Error('Some staff members not found');
                }
            }

            const chitfund = new Chitfund(chitfundData);
            return await chitfund.save();
        } catch (error) {
            throw new Error(`Error creating chitfund: ${error.message}`);
        }
    }

    /**
     * Get all chitfunds
     */
    async getAllChitfunds(filters = {}) {
        try {
            const query = {};

            if (filters.financeYearId) {
                query.financeYearId = filters.financeYearId;
            }

            if (filters.chitStatus) {
                query.chitStatus = filters.chitStatus;
            }

            return await Chitfund.find(query)
                .populate('financeYearId')
                .populate('chitStaffs', 'firstName lastName employeeId')
                .sort({ chitStarted: -1 });
        } catch (error) {
            throw new Error(`Error fetching chitfunds: ${error.message}`);
        }
    }

    /**
     * Get chitfund by ID
     */
    async getChitfundById(chitfundId) {
        try {
            const chitfund = await Chitfund.findById(chitfundId)
                .populate('financeYearId')
                .populate('chitStaffs', 'firstName lastName employeeId');

            if (!chitfund) {
                throw new Error('Chitfund not found');
            }

            return chitfund;
        } catch (error) {
            throw new Error(`Error fetching chitfund: ${error.message}`);
        }
    }

    /**
     * Update chitfund
     */
    async updateChitfund(chitfundId, updateData) {
        try {
            const chitfund = await Chitfund.findById(chitfundId);

            if (!chitfund) {
                throw new Error('Chitfund not found');
            }

            // Prevent updating if chitfund is completed
            if (chitfund.chitStatus === 'completed' && updateData.chitAmount) {
                throw new Error('Cannot update amount for completed chitfund');
            }

            // Validate staff members if updating
            if (updateData.chitStaffs && updateData.chitStaffs.length > 0) {
                const staffMembers = await User.find({ _id: { $in: updateData.chitStaffs } });
                if (staffMembers.length !== updateData.chitStaffs.length) {
                    throw new Error('Some staff members not found');
                }
            }

            Object.assign(chitfund, updateData);
            return await chitfund.save();
        } catch (error) {
            throw new Error(`Error updating chitfund: ${error.message}`);
        }
    }

    /**
     * Delete chitfund
     */
    async deleteChitfund(chitfundId) {
        try {
            const chitfund = await Chitfund.findById(chitfundId);

            if (!chitfund) {
                throw new Error('Chitfund not found');
            }

            // Check if there are any members or collections
            const members = await ChitMembers.find({ chitfundId: chitfundId });
            const collections = await ChitCollection.find({ chitfundId: chitfundId });

            if (members.length > 0 || collections.length > 0) {
                throw new Error('Cannot delete chitfund with existing members or collections');
            }

            return await Chitfund.findByIdAndDelete(chitfundId);
        } catch (error) {
            throw new Error(`Error deleting chitfund: ${error.message}`);
        }
    }

    /**
     * Get chitfunds by financial year
     */
    async getChitfundsByFinancialYear(financeYearId) {
        try {
            return await Chitfund.find({ financeYearId })
                .populate('financeYearId')
                .populate('chitStaffs', 'firstName lastName employeeId')
                .sort({ chitStarted: -1 });
        } catch (error) {
            throw new Error(`Error fetching chitfunds by financial year: ${error.message}`);
        }
    }

    /**
     * Get chitfunds by status
     */
    async getChitfundsByStatus(status) {
        try {
            return await Chitfund.find({ chitStatus: status })
                .populate('financeYearId')
                .populate('chitStaffs', 'firstName lastName employeeId')
                .sort({ chitStarted: -1 });
        } catch (error) {
            throw new Error(`Error fetching chitfunds by status: ${error.message}`);
        }
    }

    /**
     * Add staff member to chitfund
     */
    async addStaffToChitfund(chitfundId, staffId) {
        try {
            const chitfund = await Chitfund.findById(chitfundId);
            if (!chitfund) {
                throw new Error('Chitfund not found');
            }

            const staff = await User.findById(staffId);
            if (!staff) {
                throw new Error('Staff member not found');
            }

            if (chitfund.chitStaffs.includes(staffId)) {
                throw new Error('Staff member already in chitfund');
            }

            chitfund.chitStaffs.push(staffId);
            return await chitfund.save();
        } catch (error) {
            throw new Error(`Error adding staff to chitfund: ${error.message}`);
        }
    }

    /**
     * Remove staff member from chitfund
     */
    async removeStaffFromChitfund(chitfundId, staffId) {
        try {
            const chitfund = await Chitfund.findById(chitfundId);
            if (!chitfund) {
                throw new Error('Chitfund not found');
            }

            // Check if staff has taken chit
            const member = await ChitMembers.findOne({ chitfundId, staffId });
            if (member && member.chitTaken) {
                throw new Error('Cannot remove staff who has taken chit');
            }

            chitfund.chitStaffs = chitfund.chitStaffs.filter(id => id.toString() !== staffId);
            return await chitfund.save();
        } catch (error) {
            throw new Error(`Error removing staff from chitfund: ${error.message}`);
        }
    }

    /**
     * Complete chitfund
     */
    async completeChitfund(chitfundId) {
        try {
            const chitfund = await Chitfund.findById(chitfundId);

            if (!chitfund) {
                throw new Error('Chitfund not found');
            }

            if (chitfund.chitStatus === 'completed') {
                throw new Error('Chitfund is already completed');
            }

            chitfund.chitStatus = 'completed';
            return await chitfund.save();
        } catch (error) {
            throw new Error(`Error completing chitfund: ${error.message}`);
        }
    }

    /**
     * Get chitfund statistics
     */
    async getChitfundStats(chitfundId) {
        try {
            const chitfund = await Chitfund.findById(chitfundId);
            if (!chitfund) {
                throw new Error('Chitfund not found');
            }

            const members = await ChitMembers.find({ chitfundId });
            const collections = await ChitCollection.find({ chitfundId });

            const totalCollected = collections.reduce((sum, collection) => sum + collection.collectionAmount, 0);
            const membersWhoTookChit = members.filter(member => member.chitTaken).length;
            const totalValue = chitfund.chitAmount * chitfund.chitStaffs.length;

            return {
                chitfund,
                totalCollected,
                totalValue,
                membersCount: members.length,
                membersWhoTookChit,
                remainingMembers: members.length - membersWhoTookChit,
                collectionCount: collections.length,
                completionPercentage: (totalCollected / totalValue) * 100
            };
        } catch (error) {
            throw new Error(`Error getting chitfund stats: ${error.message}`);
        }
    }

    /**
     * Get chitfunds with member summary
     */
    async getChitfundsWithSummary(financeYearId = null) {
        try {
            const query = financeYearId ? { financeYearId } : {};
            const chitfunds = await Chitfund.find(query)
                .populate('financeYearId')
                .populate('chitStaffs', 'firstName lastName employeeId');

            const chitfundsWithSummary = await Promise.all(
                chitfunds.map(async (chitfund) => {
                    const members = await ChitMembers.find({ chitfundId: chitfund._id });
                    const collections = await ChitCollection.find({ chitfundId: chitfund._id });

                    const totalCollected = collections.reduce((sum, collection) => sum + collection.collectionAmount, 0);
                    const membersWhoTookChit = members.filter(member => member.chitTaken).length;
                    const totalValue = chitfund.chitAmount * chitfund.chitStaffs.length;

                    return {
                        ...chitfund.toObject(),
                        totalCollected,
                        totalValue,
                        membersCount: members.length,
                        membersWhoTookChit,
                        remainingMembers: members.length - membersWhoTookChit,
                        collectionCount: collections.length,
                        completionPercentage: (totalCollected / totalValue) * 100
                    };
                })
            );

            return chitfundsWithSummary;
        } catch (error) {
            throw new Error(`Error getting chitfunds with summary: ${error.message}`);
        }
    }
}

module.exports = new ChitfundService(); 