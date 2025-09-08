const EmergencyFund = require('../models/EmergencyFund');
const EmergencyFundCollection = require('../models/EmergencyFundCollection');
const FinancialYear = require('../models/FinancialYear');
const User = require('../models/User');
const mongoose = require('mongoose');

class EmergencyFundService {
    /**
     * Create a new emergency fund
     */
    async createEmergencyFund(emergencyFundData) {
        try {            
            // Early validation - check if employee is nominating themselves
            if (emergencyFundData.employeeId.toString() === emergencyFundData.nomineeId.toString()) {
                throw new Error("Employee cannot nominate themselves");
            }
            // Parallel database queries for better performance
            const [
                financialYear,
                existingFund,
                nomineeExists,
                nomineeEmergencyFunds
            ] = await Promise.all([
                FinancialYear.findById(emergencyFundData.financeYearId),
                EmergencyFund.findById( emergencyFundData.employeeId),
                User.findById(emergencyFundData.nomineeId), // Use findById instead of findOne with employeeId
                EmergencyFund.find({
                    $or: [
                        { nomineeId: emergencyFundData.nomineeId },
                        { employeeId: emergencyFundData.nomineeId }
                    ]
                })
            ]);
        
            // Validate financial year exists
            if (!financialYear) {
                throw new Error('Financial year not found');
            }
            
            // Check if employee already has an emergency fund
            if (existingFund) {
                throw new Error("Employee already has an emergency fund");
            }
            
            // Check if nominee exists
            if (!nomineeExists) {
                throw new Error("Nominee must be a valid user");
            }
            
            // Check nominee's emergency fund status
            const nomineeAlreadyUsed = nomineeEmergencyFunds.find(fund =>
                fund.nomineeId.toString() === emergencyFundData.nomineeId.toString()
            );
            if (nomineeAlreadyUsed) {
                throw new Error("Nominee is already assigned");
            }
            
            const nomineeHasFund = nomineeEmergencyFunds.find(fund =>
                fund.employeeId.toString() === emergencyFundData.nomineeId.toString() &&
                fund.nomineeId.toString() === emergencyFundData.employeeId.toString()
            );
            
            if (nomineeHasFund) {
                throw new Error("Nominee already has an emergency fund");
            }
            
            // Create the emergency fund
            const emergencyFund = new EmergencyFund(emergencyFundData);
            return await emergencyFund.save();
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }
    /**
     * Get all emergency funds
     */

    /**
     * Get emergency funds by financial year
     */
    async getAllEmergencyFunds(filters = {}) {
        try {
            const query = {};
            if (filters.financeYearId) {
                query.financeYearId = filters.financeYearId;  // Filters by financial year
            }
            if (filters.status) {
                query.status = filters.status;
            }
            return await EmergencyFund.find(query)
                .populate('financeYearId')
                .populate('employeeId', 'employeeId firstName lastName')
                .populate('nomineeId', 'employeeId firstName lastName ')
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
                .populate('financeYearId')
                .populate('employeeId', 'employeeId firstName lastName email')
                .populate('nomineeId', 'employeeId firstName lastName email');
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
            if (!mongoose.Types.ObjectId.isValid(emergencyFundId)) {
                throw new Error("Invalid Emergency Fund ID");
            }
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
            throw new Error(`${error.message}`);
        }
    }
    /**
     * Get active emergency funds
     */
    async getActiveEmergencyFunds() {
        try {
            return await EmergencyFund.find({ status: 'active' })
                .populate('financeYearId')
                .populate('employeeId', 'employeeId firstName lastName email')
                .populate('nomineeId', 'employeeId firstName lastName email')
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
            // Use aggregation for better performance
            const result = await EmergencyFund.aggregate([
                { $match: { _id: emergencyFundId } },
                {
                    $lookup: {
                        from: 'emergencyfundcollections',
                        localField: '_id',
                        foreignField: 'emergencyFundId',
                        as: 'collections'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'employeeId',
                        foreignField: '_id',
                        as: 'employee',
                        pipeline: [
                            { $project: { employeeId: 1, firstName: 1, lastName: 1 } }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'nomineeId',
                        foreignField: '_id',
                        as: 'nominee',
                        pipeline: [
                            { $project: { employeeId: 1, firstName: 1, lastName: 1 } }
                        ]
                    }
                },
                {
                    $addFields: {
                        totalCollected: { $sum: '$collections.collectionAmount' },
                        collectionCount: { $size: '$collections' }
                    }
                },
                {
                    $addFields: {
                        remainingAmount: { $subtract: ['$emergencyFundAmount', '$totalCollected'] },
                        completionPercentage: {
                            $multiply: [
                                { $divide: ['$totalCollected', '$emergencyFundAmount'] },
                                100
                            ]
                        }
                    }
                },
                {
                    $project: {
                        collections: 0 // Remove collections array from final result
                    }
                }
            ]);

            if (result.length === 0) {
                throw new Error('Emergency fund not found');
            }

            const emergencyFund = result[0];
            return {
                emergencyFund,
                totalCollected: emergencyFund.totalCollected,
                remainingAmount: emergencyFund.remainingAmount,
                collectionCount: emergencyFund.collectionCount,
                completionPercentage: emergencyFund.completionPercentage
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

            // Use aggregation pipeline for better performance
            const fundsWithSummary = await EmergencyFund.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: 'emergencyfundcollections',
                        localField: '_id',
                        foreignField: 'emergencyFundId',
                        as: 'collections'
                    }
                },
                {
                    $lookup: {
                        from: 'financialyears',
                        localField: 'financeYearId',
                        foreignField: '_id',
                        as: 'financeYear'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'employeeId',
                        foreignField: '_id',
                        as: 'employee',
                        pipeline: [
                            { $project: { employeeId: 1, firstName: 1, lastName: 1 } }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'nomineeId',
                        foreignField: '_id',
                        as: 'nominee',
                        pipeline: [
                            { $project: { employeeId: 1, firstName: 1, lastName: 1 } }
                        ]
                    }
                },
                {
                    $addFields: {
                        totalCollected: { $sum: '$collections.collectionAmount' },
                        collectionCount: { $size: '$collections' }
                    }
                },
                {
                    $addFields: {
                        remainingAmount: { $subtract: ['$emergencyFundAmount', '$totalCollected'] },
                        completionPercentage: {
                            $multiply: [
                                { $divide: ['$totalCollected', '$emergencyFundAmount'] },
                                100
                            ]
                        }
                    }
                },
                {
                    $project: {
                        collections: 0 // Remove collections array from final result
                    }
                },
                { $sort: { emergencyFundCreated: -1 } }
            ]);

            return fundsWithSummary;
        } catch (error) {
            throw new Error(`Error getting emergency funds with summary: ${error.message}`);
        }
    }
}

module.exports = new EmergencyFundService();