const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    // Reference to Financial Year
    financeYearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FinancialYear',
        required: [true, 'Financial year is required']
    },

    // Reference to Account
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'Account is required']
    },

    // Transaction type (income or expense)
    transactionType: {
        type: String,
        enum: ['income', 'expense'],
        required: [true, 'Transaction type is required']
    },

    // Transaction category
    transactionCategory: {
        type: String,
        enum: [
            // Income categories
            'share_collection', 'chitfund_collection', 'charity_donation', 'event_contribution',
            'emergency_fund_contribution', 'loan_repayment', 'interest_income', 'other_income',
            // Expense categories
            'loan_disbursement', 'chitfund_payout', 'charity_expense', 'event_expense',
            'emergency_fund_disbursement', 'operational_expense', 'maintenance_expense',
            'salary_expense', 'utility_expense', 'other_expense'
        ],
        required: [true, 'Transaction category is required']
    },

    // Transaction amount
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be greater than 0']
    },

    // Transaction description
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },

    // Reference to related entity (optional)
    relatedEntity: {
        entityType: {
            type: String,
            enum: ['user', 'loan', 'chitfund', 'charity', 'event', 'emergency_fund', 'share'],
            default: null
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        }
    },

    // Payment method
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank_transfer', 'check', 'online', 'other'],
        required: [true, 'Payment method is required']
    },

    // Transaction date
    transactionDate: {
        type: Date,
        required: [true, 'Transaction date is required'],
        default: Date.now
    },

    // Reference to staff who recorded the transaction
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Recorded by is required']
    },

    // Transaction status
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled', 'reversed'],
        default: 'completed',
        required: true
    },

    // Receipt/invoice number
    receiptNumber: {
        type: String,
        trim: true
    },

    // Additional notes
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for efficient queries
transactionSchema.index({ financeYearId: 1 });
transactionSchema.index({ accountId: 1 });
transactionSchema.index({ transactionType: 1 });
transactionSchema.index({ transactionCategory: 1 });
transactionSchema.index({ transactionDate: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ recordedBy: 1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function () {
    return this.amount.toLocaleString();
});

// Virtual for formatted transaction date
transactionSchema.virtual('formattedTransactionDate').get(function () {
    return this.transactionDate.toLocaleDateString();
});

// Virtual for transaction direction
transactionSchema.virtual('direction').get(function () {
    return this.transactionType === 'income' ? 'in' : 'out';
});

// Virtual for category display name
transactionSchema.virtual('categoryDisplayName').get(function () {
    return this.transactionCategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
});

// Pre-save middleware to validate transaction
transactionSchema.pre('save', function (next) {
    if (this.amount <= 0) {
        return next(new Error('Amount must be greater than 0'));
    }

    if (this.transactionDate > new Date()) {
        return next(new Error('Transaction date cannot be in the future'));
    }

    next();
});

// Static method to get transactions by account
transactionSchema.statics.getByAccount = function (accountId) {
    return this.find({ accountId })
        .populate('financeYearId accountId recordedBy')
        .sort({ transactionDate: -1 });
};

// Static method to get transactions by type
transactionSchema.statics.getByType = function (transactionType) {
    return this.find({ transactionType })
        .populate('financeYearId accountId recordedBy')
        .sort({ transactionDate: -1 });
};

// Static method to get transactions by category
transactionSchema.statics.getByCategory = function (category) {
    return this.find({ transactionCategory: category })
        .populate('financeYearId accountId recordedBy')
        .sort({ transactionDate: -1 });
};

// Static method to get transactions by date range
transactionSchema.statics.getByDateRange = function (startDate, endDate) {
    return this.find({
        transactionDate: {
            $gte: startDate,
            $lte: endDate
        }
    })
        .populate('financeYearId accountId recordedBy')
        .sort({ transactionDate: -1 });
};

// Static method to get total income
transactionSchema.statics.getTotalIncome = function (accountId = null) {
    const match = { transactionType: 'income' };
    if (accountId) match.accountId = accountId;

    return this.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
};

// Static method to get total expenses
transactionSchema.statics.getTotalExpenses = function (accountId = null) {
    const match = { transactionType: 'expense' };
    if (accountId) match.accountId = accountId;

    return this.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
};

// Static method to get category summary
transactionSchema.statics.getCategorySummary = function (accountId = null) {
    const match = {};
    if (accountId) match.accountId = accountId;

    return this.aggregate([
        { $match: match },
        {
            $group: {
                _id: {
                    type: '$transactionType',
                    category: '$transactionCategory'
                },
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.type': 1, total: -1 } }
    ]);
};

// Instance method to reverse transaction
transactionSchema.methods.reverseTransaction = function () {
    this.status = 'reversed';
    return this.save();
};

// Instance method to cancel transaction
transactionSchema.methods.cancelTransaction = function () {
    this.status = 'cancelled';
    return this.save();
};

// Instance method to update amount
transactionSchema.methods.updateAmount = function (newAmount) {
    this.amount = newAmount;
    return this.save();
};

// Configure toJSON to include virtuals
transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Transaction', transactionSchema); 