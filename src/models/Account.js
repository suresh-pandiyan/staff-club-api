const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    // Reference to Financial Year
    financeYearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FinancialYear',
        required: [true, 'Financial year is required']
    },

    // Account name/identifier
    accountName: {
        type: String,
        required: [true, 'Account name is required'],
        trim: true,
        unique: true
    },

    // Account description
    accountDescription: {
        type: String,
        required: [true, 'Account description is required'],
        trim: true
    },

    // Account type (main, reserve, emergency, etc.)
    accountType: {
        type: String,
        enum: ['main', 'reserve', 'emergency', 'charity', 'event', 'loan', 'chitfund', 'share'],
        required: [true, 'Account type is required']
    },

    // Opening balance
    openingBalance: {
        type: Number,
        required: [true, 'Opening balance is required'],
        default: 0
    },

    // Current balance
    currentBalance: {
        type: Number,
        required: [true, 'Current balance is required'],
        default: 0
    },

    // Account status
    accountStatus: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active',
        required: true
    },

    // Whether this is the primary account
    isPrimary: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for efficient queries
accountSchema.index({ financeYearId: 1 });
accountSchema.index({ accountType: 1 });
accountSchema.index({ accountStatus: 1 });
accountSchema.index({ isPrimary: 1 });

// Virtual for formatted balance
accountSchema.virtual('formattedBalance').get(function () {
    return this.currentBalance.toLocaleString();
});

// Virtual for balance status
accountSchema.virtual('balanceStatus').get(function () {
    if (this.currentBalance > 0) return 'positive';
    if (this.currentBalance < 0) return 'negative';
    return 'zero';
});

// Pre-save middleware to validate account
accountSchema.pre('save', function (next) {
    if (this.accountName.trim().length === 0) {
        return next(new Error('Account name cannot be empty'));
    }

    next();
});

// Static method to get accounts by financial year
accountSchema.statics.getByFinancialYear = function (financeYearId) {
    return this.find({ financeYearId }).populate('financeYearId');
};

// Static method to get accounts by type
accountSchema.statics.getByType = function (accountType) {
    return this.find({ accountType }).populate('financeYearId');
};

// Static method to get active accounts
accountSchema.statics.getActive = function () {
    return this.find({ accountStatus: 'active' }).populate('financeYearId');
};

// Static method to get primary account
accountSchema.statics.getPrimary = function () {
    return this.findOne({ isPrimary: true }).populate('financeYearId');
};

// Instance method to update balance
accountSchema.methods.updateBalance = function (amount) {
    this.currentBalance += amount;
    return this.save();
};

// Instance method to set balance
accountSchema.methods.setBalance = function (amount) {
    this.currentBalance = amount;
    return this.save();
};

// Instance method to activate account
accountSchema.methods.activateAccount = function () {
    this.accountStatus = 'active';
    return this.save();
};

// Instance method to deactivate account
accountSchema.methods.deactivateAccount = function () {
    this.accountStatus = 'inactive';
    return this.save();
};

// Configure toJSON to include virtuals
accountSchema.set('toJSON', { virtuals: true });
accountSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Account', accountSchema); 