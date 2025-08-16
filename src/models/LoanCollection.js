const mongoose = require('mongoose');

const loanCollectionSchema = new mongoose.Schema({
    // Reference to Financial Year
    financeYearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FinancialYear',
        required: [true, 'Financial year is required']
    },

    // Reference to Loan
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
        required: [true, 'Loan is required']
    },

    // Reference to Staff/User who made the repayment
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Staff is required']
    },

    // Amount repaid
    collectionAmount: {
        type: Number,
        required: [true, 'Collection amount is required'],
        min: [0, 'Collection amount cannot be negative']
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for efficient queries
loanCollectionSchema.index({ financeYearId: 1 });
loanCollectionSchema.index({ loanId: 1 });
loanCollectionSchema.index({ staffId: 1 });

// Virtual for formatted repayment date
loanCollectionSchema.virtual('formattedRepaymentDate').get(function () {
    return this.createdAt.toLocaleDateString();
});

// Pre-save middleware to validate collection
loanCollectionSchema.pre('save', function (next) {
    if (this.collectionAmount <= 0) {
        return next(new Error('Collection amount must be greater than 0'));
    }

    next();
});

// Static method to get collections by loan
loanCollectionSchema.statics.getByLoan = function (loanId) {
    return this.find({ loanId })
        .populate('financeYearId loanId staffId')
        .sort({ createdAt: 1 });
};

// Static method to get collections by staff
loanCollectionSchema.statics.getByStaff = function (staffId) {
    return this.find({ staffId })
        .populate('financeYearId loanId staffId')
        .sort({ createdAt: -1 });
};

// Static method to get collections by financial year
loanCollectionSchema.statics.getByFinancialYear = function (financeYearId) {
    return this.find({ financeYearId })
        .populate('financeYearId loanId staffId')
        .sort({ createdAt: -1 });
};

// Static method to get total collections for a loan
loanCollectionSchema.statics.getTotalCollections = function (loanId) {
    return this.aggregate([
        { $match: { loanId: mongoose.Types.ObjectId(loanId) } },
        { $group: { _id: null, total: { $sum: '$collectionAmount' } } }
    ]);
};

// Static method to get total collections by staff
loanCollectionSchema.statics.getTotalByStaff = function (staffId) {
    return this.aggregate([
        { $match: { staffId: mongoose.Types.ObjectId(staffId) } },
        { $group: { _id: null, total: { $sum: '$collectionAmount' } } }
    ]);
};

// Static method to get total collections for a specific staff and loan
loanCollectionSchema.statics.getTotalByStaffAndLoan = function (staffId, loanId) {
    return this.aggregate([
        {
            $match: {
                staffId: mongoose.Types.ObjectId(staffId),
                loanId: mongoose.Types.ObjectId(loanId)
            }
        },
        { $group: { _id: null, total: { $sum: '$collectionAmount' } } }
    ]);
};

// Static method to get monthly collections summary
loanCollectionSchema.statics.getMonthlySummary = function (loanId) {
    return this.aggregate([
        { $match: { loanId: mongoose.Types.ObjectId(loanId) } },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                totalAmount: { $sum: '$collectionAmount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
};

// Instance method to update collection amount
loanCollectionSchema.methods.updateAmount = function (newAmount) {
    this.collectionAmount = newAmount;
    return this.save();
};

// Configure toJSON to include virtuals
loanCollectionSchema.set('toJSON', { virtuals: true });
loanCollectionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('LoanCollection', loanCollectionSchema); 