const Loan = require('../models/Loan');
const LoanStaff = require('../models/LoanStaff');
const LoanCollection = require('../models/LoanCollection');
const FinancialYear = require('../models/FinancialYear');
const User = require('../models/User');

class LoanService {
    /**
     * Create a new loan
     */
    async createLoan(loanData) {
        try {
            // Validate financial year exists
            const financialYear = await FinancialYear.findById(loanData.financeYearId);
            if (!financialYear) {
                throw new Error('Financial year not found');
            }

            const loan = new Loan(loanData);
            return await loan.save();
        } catch (error) {
            throw new Error(`Error creating loan: ${error.message}`);
        }
    }

    /**
     * Get all loans
     */
    async getAllLoans(filters = {}) {
        try {
            const query = {};

            if (filters.financeYearId) {
                query.financeYearId = filters.financeYearId;
            }

            if (filters.allowTopup !== undefined) {
                query.allowTopup = filters.allowTopup;
            }

            return await Loan.find(query)
                .populate('financeYearId')
                .sort({ createdAt: -1 });
        } catch (error) {
            throw new Error(`Error fetching loans: ${error.message}`);
        }
    }

    /**
     * Get loan by ID
     */
    async getLoanById(loanId) {
        try {
            const loan = await Loan.findById(loanId)
                .populate('financeYearId');

            if (!loan) {
                throw new Error('Loan not found');
            }

            return loan;
        } catch (error) {
            throw new Error(`Error fetching loan: ${error.message}`);
        }
    }

    /**
     * Update loan
     */
    async updateLoan(loanId, updateData) {
        try {
            const loan = await Loan.findById(loanId);

            if (!loan) {
                throw new Error('Loan not found');
            }

            // Check if there are any active loan staff records
            const activeStaff = await LoanStaff.find({
                loanId: loanId,
                loanStatus: { $in: ['active', 'approved'] }
            });

            if (activeStaff.length > 0 && updateData.loanAmount) {
                throw new Error('Cannot update loan amount when there are active loan staff records');
            }

            Object.assign(loan, updateData);
            return await loan.save();
        } catch (error) {
            throw new Error(`Error updating loan: ${error.message}`);
        }
    }

    /**
     * Delete loan
     */
    async deleteLoan(loanId) {
        try {
            const loan = await Loan.findById(loanId);

            if (!loan) {
                throw new Error('Loan not found');
            }

            // Check if there are any loan staff records
            const loanStaff = await LoanStaff.find({ loanId: loanId });
            if (loanStaff.length > 0) {
                throw new Error('Cannot delete loan with existing loan staff records');
            }

            return await Loan.findByIdAndDelete(loanId);
        } catch (error) {
            throw new Error(`Error deleting loan: ${error.message}`);
        }
    }

    /**
     * Get loans by financial year
     */
    async getLoansByFinancialYear(financeYearId) {
        try {
            return await Loan.find({ financeYearId })
                .populate('financeYearId')
                .sort({ createdAt: -1 });
        } catch (error) {
            throw new Error(`Error fetching loans by financial year: ${error.message}`);
        }
    }

    /**
     * Get loans with top-up allowed
     */
    async getLoansWithTopup() {
        try {
            return await Loan.find({ allowTopup: true })
                .populate('financeYearId')
                .sort({ createdAt: -1 });
        } catch (error) {
            throw new Error(`Error fetching loans with top-up: ${error.message}`);
        }
    }

    /**
     * Get loans without top-up
     */
    async getLoansWithoutTopup() {
        try {
            return await Loan.find({ allowTopup: false })
                .populate('financeYearId')
                .sort({ createdAt: -1 });
        } catch (error) {
            throw new Error(`Error fetching loans without top-up: ${error.message}`);
        }
    }

    /**
     * Enable top-up for loan
     */
    async enableTopup(loanId, topupAmount) {
        try {
            const loan = await Loan.findById(loanId);

            if (!loan) {
                throw new Error('Loan not found');
            }

            if (loan.allowTopup) {
                throw new Error('Top-up is already enabled for this loan');
            }

            return await loan.enableTopup(topupAmount);
        } catch (error) {
            throw new Error(`Error enabling top-up: ${error.message}`);
        }
    }

    /**
     * Disable top-up for loan
     */
    async disableTopup(loanId) {
        try {
            const loan = await Loan.findById(loanId);

            if (!loan) {
                throw new Error('Loan not found');
            }

            if (!loan.allowTopup) {
                throw new Error('Top-up is already disabled for this loan');
            }

            // Check if any staff has taken top-up
            const staffWithTopup = await LoanStaff.find({
                loanId: loanId,
                hasTopup: true
            });

            if (staffWithTopup.length > 0) {
                throw new Error('Cannot disable top-up when staff have taken top-up');
            }

            return await loan.disableTopup();
        } catch (error) {
            throw new Error(`Error disabling top-up: ${error.message}`);
        }
    }

    /**
     * Update loan amount
     */
    async updateLoanAmount(loanId, newAmount) {
        try {
            const loan = await Loan.findById(loanId);

            if (!loan) {
                throw new Error('Loan not found');
            }

            // Check if there are any active loan staff records
            const activeStaff = await LoanStaff.find({
                loanId: loanId,
                loanStatus: { $in: ['active', 'approved'] }
            });

            if (activeStaff.length > 0) {
                throw new Error('Cannot update loan amount when there are active loan staff records');
            }

            return await loan.updateLoanAmount(newAmount);
        } catch (error) {
            throw new Error(`Error updating loan amount: ${error.message}`);
        }
    }

    /**
     * Update top-up amount
     */
    async updateTopupAmount(loanId, newAmount) {
        try {
            const loan = await Loan.findById(loanId);

            if (!loan) {
                throw new Error('Loan not found');
            }

            if (!loan.allowTopup) {
                throw new Error('Top-up is not enabled for this loan');
            }

            return await loan.updateTopupAmount(newAmount);
        } catch (error) {
            throw new Error(`Error updating top-up amount: ${error.message}`);
        }
    }

    /**
     * Get loan statistics
     */
    async getLoanStats(loanId) {
        try {
            const loan = await Loan.findById(loanId);
            if (!loan) {
                throw new Error('Loan not found');
            }

            const loanStaff = await LoanStaff.find({ loanId });
            const collections = await LoanCollection.find({ loanId });

            const totalCollected = collections.reduce((sum, collection) => sum + collection.collectionAmount, 0);
            const activeStaff = loanStaff.filter(staff => staff.loanStatus === 'active').length;
            const approvedStaff = loanStaff.filter(staff => staff.loanStatus === 'approved').length;
            const completedStaff = loanStaff.filter(staff => staff.loanStatus === 'completed').length;
            const staffWithTopup = loanStaff.filter(staff => staff.hasTopup).length;

            const totalLoanValue = loan.loanAmount * loan.loanTotalStaffs;
            const totalTopupValue = loan.allowTopup ? loan.loanTopupAmount * loan.loanTotalStaffs : 0;
            const totalSchemeValue = totalLoanValue + totalTopupValue;

            return {
                loan,
                totalCollected,
                totalLoanValue,
                totalTopupValue,
                totalSchemeValue,
                activeStaff,
                approvedStaff,
                completedStaff,
                staffWithTopup,
                totalStaff: loanStaff.length,
                collectionCount: collections.length,
                completionPercentage: (totalCollected / totalSchemeValue) * 100
            };
        } catch (error) {
            throw new Error(`Error getting loan stats: ${error.message}`);
        }
    }

    /**
     * Get loans with staff summary
     */
    async getLoansWithSummary(financeYearId = null) {
        try {
            const query = financeYearId ? { financeYearId } : {};
            const loans = await Loan.find(query).populate('financeYearId');

            const loansWithSummary = await Promise.all(
                loans.map(async (loan) => {
                    const loanStaff = await LoanStaff.find({ loanId: loan._id });
                    const collections = await LoanCollection.find({ loanId: loan._id });

                    const totalCollected = collections.reduce((sum, collection) => sum + collection.collectionAmount, 0);
                    const activeStaff = loanStaff.filter(staff => staff.loanStatus === 'active').length;
                    const approvedStaff = loanStaff.filter(staff => staff.loanStatus === 'approved').length;
                    const completedStaff = loanStaff.filter(staff => staff.loanStatus === 'completed').length;
                    const staffWithTopup = loanStaff.filter(staff => staff.hasTopup).length;

                    const totalLoanValue = loan.loanAmount * loan.loanTotalStaffs;
                    const totalTopupValue = loan.allowTopup ? loan.loanTopupAmount * loan.loanTotalStaffs : 0;
                    const totalSchemeValue = totalLoanValue + totalTopupValue;

                    return {
                        ...loan.toObject(),
                        totalCollected,
                        totalLoanValue,
                        totalTopupValue,
                        totalSchemeValue,
                        activeStaff,
                        approvedStaff,
                        completedStaff,
                        staffWithTopup,
                        totalStaff: loanStaff.length,
                        collectionCount: collections.length,
                        completionPercentage: (totalCollected / totalSchemeValue) * 100
                    };
                })
            );

            return loansWithSummary;
        } catch (error) {
            throw new Error(`Error getting loans with summary: ${error.message}`);
        }
    }
}

module.exports = new LoanService(); 