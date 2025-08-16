const mongoose = require('mongoose');

const accountBalanceSchema = new mongoose.Schema({
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

    // Balance date (daily/monthly snapshot)
    balanceDate: {
        type: Date,
        required: [true, 'Balance date is required']
    },

    // Opening balance for the period
    openingBalance: {
        type: Number,
        required: [true, 'Opening balance is required'],
        default: 0
    },

    // Total income for the period
    totalIncome: {
        type: Number,
        required: [true, 'Total income is required'],
        default: 0
    },

    // Total expenses for the period
    totalExpenses: {
        type: Number,
        required: [true, 'Total expenses is required'],
        default: 0
    },

    // Closing balance for the period
    closingBalance: {
        type: Number,
        required: [true, 'Closing balance is required'],
        default: 0
    },

    // Number of transactions in the period
    transactionCount: {
        type: Number,
        required: [true, 'Transaction count is required'],
        default: 0
    },

    // Balance type (daily, monthly, yearly)
    balanceType: {
        type: String,
        enum: ['daily', 'monthly', 'yearly'],
        required: [true, 'Balance type is required']
    },

    // Period identifier (e.g., "2024-01" for monthly, "2024-01-15" for daily)
    periodIdentifier: {
        type: String,
        required: [true, 'Period identifier is required']
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Compound index to ensure unique balance per account per period
accountBalanceSchema.index({ accountId: 1, balanceType: 1, periodIdentifier: 1 }, { unique: true });

// Indexes for efficient queries
accountBalanceSchema.index({ financeYearId: 1 });
accountBalanceSchema.index({ accountId: 1 });
accountBalanceSchema.index({ balanceDate: 1 });
accountBalanceSchema.index({ balanceType: 1 });
accountBalanceSchema.index({ periodIdentifier: 1 });

// Virtual for net change
accountBalanceSchema.virtual('netChange').get(function () {
    return this.totalIncome - this.totalExpenses;
});

// Virtual for formatted opening balance
accountBalanceSchema.virtual('formattedOpeningBalance').get(function () {
    return this.openingBalance.toLocaleString();
});

// Virtual for formatted closing balance
accountBalanceSchema.virtual('formattedClosingBalance').get(function () {
    return this.closingBalance.toLocaleString();
});

// Virtual for formatted total income
accountBalanceSchema.virtual('formattedTotalIncome').get(function () {
    return this.totalIncome.toLocaleString();
});

// Virtual for formatted total expenses
accountBalanceSchema.virtual('formattedTotalExpenses').get(function () {
    return this.totalExpenses.toLocaleString();
});

// Virtual for formatted net change
accountBalanceSchema.virtual('formattedNetChange').get(function () {
    return this.netChange.toLocaleString();
});

// Virtual for balance status
accountBalanceSchema.virtual('balanceStatus').get(function () {
    if (this.closingBalance > 0) return 'positive';
    if (this.closingBalance < 0) return 'negative';
    return 'zero';
});

// Pre-save middleware to validate account balance
accountBalanceSchema.pre('save', function (next) {
    // Validate that closing balance equals opening balance + net change
    const expectedClosingBalance = this.openingBalance + this.netChange;
    if (Math.abs(this.closingBalance - expectedClosingBalance) > 0.01) {
        return next(new Error('Closing balance does not match opening balance + net change'));
    }

    if (this.balanceDate > new Date()) {
        return next(new Error('Balance date cannot be in the future'));
    }

    next();
});

// Static method to get balances by account
accountBalanceSchema.statics.getByAccount = function (accountId) {
    return this.find({ accountId })
        .populate('financeYearId accountId')
        .sort({ balanceDate: -1 });
};

// Static method to get balances by type
accountBalanceSchema.statics.getByType = function (balanceType) {
    return this.find({ balanceType })
        .populate('financeYearId accountId')
        .sort({ balanceDate: -1 });
};

// Static method to get balances by date range
accountBalanceSchema.statics.getByDateRange = function (startDate, endDate) {
    return this.find({
        balanceDate: {
            $gte: startDate,
            $lte: endDate
        }
    })
        .populate('financeYearId accountId')
        .sort({ balanceDate: -1 });
};

// Static method to get latest balance for an account
accountBalanceSchema.statics.getLatestBalance = function (accountId) {
    return this.findOne({ accountId })
        .populate('financeYearId accountId')
        .sort({ balanceDate: -1 });
};

// Static method to get monthly summary
accountBalanceSchema.statics.getMonthlySummary = function (accountId, year) {
    return this.aggregate([
        {
            $match: {
                accountId: mongoose.Types.ObjectId(accountId),
                balanceType: 'monthly',
                periodIdentifier: { $regex: `^${year}-` }
            }
        },
        {
            $group: {
                _id: null,
                totalIncome: { $sum: '$totalIncome' },
                totalExpenses: { $sum: '$totalExpenses' },
                avgClosingBalance: { $avg: '$closingBalance' },
                maxClosingBalance: { $max: '$closingBalance' },
                minClosingBalance: { $min: '$closingBalance' }
            }
        }
    ]);
};

// Static method to get yearly summary
accountBalanceSchema.statics.getYearlySummary = function (accountId) {
    return this.aggregate([
        {
            $match: {
                accountId: mongoose.Types.ObjectId(accountId),
                balanceType: 'yearly'
            }
        },
        {
            $group: {
                _id: null,
                totalIncome: { $sum: '$totalIncome' },
                totalExpenses: { $sum: '$totalExpenses' },
                avgClosingBalance: { $avg: '$closingBalance' }
            }
        }
    ]);
};

// Instance method to update balances
accountBalanceSchema.methods.updateBalances = function (income, expenses) {
    this.totalIncome = income;
    this.totalExpenses = expenses;
    this.closingBalance = this.openingBalance + (income - expenses);
    return this.save();
};

// Configure toJSON to include virtuals
accountBalanceSchema.set('toJSON', { virtuals: true });
accountBalanceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('AccountBalance', accountBalanceSchema); 