const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    // Loan Configuration
    loanMaxAmount: {
        type: Number,
        required: [true, 'Maximum loan amount is required'],
        min: [0, 'Maximum loan amount cannot be negative'],
        default: 50000
    },

    loanMinAmount: {
        type: Number,
        required: [true, 'Minimum loan amount is required'],
        min: [0, 'Minimum loan amount cannot be negative'],
        default: 500
    },

    intrestPercentage: {
        type: Number,
        required: [true, 'Interest percentage is required'],
        min: [0, 'Interest percentage cannot be negative'],
        max: [100, 'Interest percentage cannot exceed 100%'],
        default: 23
    },

    topupLimit: {
        type: Number,
        required: [true, 'Top-up limit is required'],
        min: [0, 'Top-up limit cannot be negative'],
        default: 5000
    },

    loanElgibility: {
        type: Number,
        required: [true, 'Loan eligibility amount is required'],
        min: [0, 'Loan eligibility amount cannot be negative'],
        default: 10000
    },

    // System Settings
    staffEmailVerification: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Index for efficient queries
settingsSchema.index({ createdAt: -1 });

// Virtual for formatted loan range
settingsSchema.virtual('loanRange').get(function () {
    return `${this.loanMinAmount.toLocaleString()} - ${this.loanMaxAmount.toLocaleString()}`;
});

// Virtual for formatted interest rate
settingsSchema.virtual('formattedInterestRate').get(function () {
    return `${this.intrestPercentage}%`;
});

// Pre-save middleware to validate loan amounts
settingsSchema.pre('save', function (next) {
    if (this.loanMinAmount >= this.loanMaxAmount) {
        return next(new Error('Minimum loan amount must be less than maximum loan amount'));
    }

    if (this.topupLimit > this.loanMaxAmount) {
        return next(new Error('Top-up limit cannot exceed maximum loan amount'));
    }

    if (this.loanElgibility > this.loanMaxAmount) {
        return next(new Error('Loan eligibility amount cannot exceed maximum loan amount'));
    }

    next();
});

// Static method to get current settings (latest)
settingsSchema.statics.getCurrentSettings = function () {
    return this.findOne().sort({ createdAt: -1 });
};

// Static method to update settings
settingsSchema.statics.updateSettings = function (settingsData) {
    return this.create(settingsData);
};

// Instance method to validate loan amount
settingsSchema.methods.isValidLoanAmount = function (amount) {
    return amount >= this.loanMinAmount && amount <= this.loanMaxAmount;
};

// Instance method to calculate interest amount
settingsSchema.methods.calculateInterest = function (principalAmount) {
    return (principalAmount * this.intrestPercentage) / 100;
};

// Instance method to check if user is eligible for loan
settingsSchema.methods.isEligibleForLoan = function (userSalary) {
    return userSalary >= this.loanElgibility;
};

// Instance method to get maximum top-up amount
settingsSchema.methods.getMaxTopupAmount = function () {
    return Math.min(this.topupLimit, this.loanMaxAmount);
};

// Configure toJSON to include virtuals
settingsSchema.set('toJSON', { virtuals: true });
settingsSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Settings', settingsSchema); 