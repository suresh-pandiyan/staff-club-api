const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    // Reference to Financial Year
    financeYearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FinancialYear',
        required: [true, 'Financial year is required']
    },

    // Loan scheme name
    loanName: {
        type: String,
        required: [true, 'Loan name is required'],
        trim: true
    },

    // Loan scheme description
    loanDescription: {
        type: String,
        required: [true, 'Loan description is required'],
        trim: true
    },

    // Maximum loan amount per staff
    loanAmount: {
        type: Number,
        required: [true, 'Loan amount is required'],
        min: [1, 'Loan amount must be greater than 0']
    },

    // Whether top-up is allowed for this loan
    allowTopup: {
        type: Boolean,
        default: false
    },

    // Maximum top-up amount
    loanTopupAmount: {
        type: Number,
        min: [0, 'Top-up amount cannot be negative'],
        default: 0
    },

    // Total number of staff who can take this loan
    loanTotalStaffs: {
        type: Number,
        required: [true, 'Total staff count is required'],
        min: [1, 'Total staff count must be at least 1']
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for efficient queries
loanSchema.index({ financeYearId: 1 });
loanSchema.index({ allowTopup: 1 });

// Virtual for total loan value
loanSchema.virtual('totalLoanValue').get(function () {
    return this.loanAmount * this.loanTotalStaffs;
});

// Virtual for total top-up value
loanSchema.virtual('totalTopupValue').get(function () {
    return this.allowTopup ? this.loanTopupAmount * this.loanTotalStaffs : 0;
});

// Virtual for total scheme value
loanSchema.virtual('totalSchemeValue').get(function () {
    return this.totalLoanValue + this.totalTopupValue;
});

// Pre-save middleware to validate loan
loanSchema.pre('save', function (next) {
    if (this.loanAmount <= 0) {
        return next(new Error('Loan amount must be greater than 0'));
    }

    if (this.loanTotalStaffs <= 0) {
        return next(new Error('Total staff count must be greater than 0'));
    }

    if (this.allowTopup && this.loanTopupAmount <= 0) {
        return next(new Error('Top-up amount must be greater than 0 when top-up is allowed'));
    }

    if (!this.allowTopup && this.loanTopupAmount > 0) {
        return next(new Error('Top-up amount should be 0 when top-up is not allowed'));
    }

    next();
});

// Static method to get loans by financial year
loanSchema.statics.getByFinancialYear = function (financeYearId) {
    return this.find({ financeYearId }).populate('financeYearId');
};

// Static method to get loans with top-up allowed
loanSchema.statics.getWithTopup = function () {
    return this.find({ allowTopup: true }).populate('financeYearId');
};

// Static method to get loans without top-up
loanSchema.statics.getWithoutTopup = function () {
    return this.find({ allowTopup: false }).populate('financeYearId');
};

// Instance method to enable top-up
loanSchema.methods.enableTopup = function (topupAmount) {
    this.allowTopup = true;
    this.loanTopupAmount = topupAmount;
    return this.save();
};

// Instance method to disable top-up
loanSchema.methods.disableTopup = function () {
    this.allowTopup = false;
    this.loanTopupAmount = 0;
    return this.save();
};

// Instance method to update loan amount
loanSchema.methods.updateLoanAmount = function (newAmount) {
    this.loanAmount = newAmount;
    return this.save();
};

// Instance method to update top-up amount
loanSchema.methods.updateTopupAmount = function (newAmount) {
    this.loanTopupAmount = newAmount;
    return this.save();
};

// Configure toJSON to include virtuals
loanSchema.set('toJSON', { virtuals: true });
loanSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Loan', loanSchema); 