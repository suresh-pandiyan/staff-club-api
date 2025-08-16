const mongoose = require('mongoose');

const charityFundSchema = new mongoose.Schema({
    // Reference to Financial Year
    financeYearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FinancialYear',
        required: [true, 'Financial year is required']
    },

    // Charity fund title
    charityTitle: {
        type: String,
        required: [true, 'Charity title is required'],
        trim: true
    },

    // Charity fund description
    charityDescription: {
        type: String,
        required: [true, 'Charity description is required'],
        trim: true
    },

    // Target amount for the charity fund
    charityAmount: {
        type: Number,
        required: [true, 'Charity amount is required'],
        min: [1, 'Charity amount must be greater than 0']
    },

    // When the charity fund was created
    charityCreated: {
        type: Date,
        required: [true, 'Charity created date is required'],
        default: Date.now
    },

    // When the charity fund was closed
    charityClosed: {
        type: Date,
        default: null
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for efficient queries
charityFundSchema.index({ financeYearId: 1 });
charityFundSchema.index({ charityCreated: 1 });
charityFundSchema.index({ charityClosed: 1 });

// Virtual for formatted created date
charityFundSchema.virtual('formattedCreatedDate').get(function () {
    return this.charityCreated.toLocaleDateString();
});

// Virtual for formatted closed date
charityFundSchema.virtual('formattedClosedDate').get(function () {
    return this.charityClosed ? this.charityClosed.toLocaleDateString() : null;
});

// Virtual for status
charityFundSchema.virtual('status').get(function () {
    return this.charityClosed ? 'closed' : 'active';
});

// Virtual for duration in days
charityFundSchema.virtual('duration').get(function () {
    const endDate = this.charityClosed || new Date();
    const diffTime = Math.abs(endDate - this.charityCreated);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Pre-save middleware to validate charity fund
charityFundSchema.pre('save', function (next) {
    if (this.charityAmount <= 0) {
        return next(new Error('Charity amount must be greater than 0'));
    }

    if (this.charityClosed && this.charityClosed < this.charityCreated) {
        return next(new Error('Charity closed date cannot be before created date'));
    }

    next();
});

// Static method to get active charity funds
charityFundSchema.statics.getActive = function () {
    return this.find({ charityClosed: null }).populate('financeYearId');
};

// Static method to get closed charity funds
charityFundSchema.statics.getClosed = function () {
    return this.find({ charityClosed: { $ne: null } }).populate('financeYearId');
};

// Static method to get charity funds by financial year
charityFundSchema.statics.getByFinancialYear = function (financeYearId) {
    return this.find({ financeYearId }).populate('financeYearId');
};

// Instance method to close charity fund
charityFundSchema.methods.closeCharity = function () {
    this.charityClosed = new Date();
    return this.save();
};

// Instance method to reopen charity fund
charityFundSchema.methods.reopenCharity = function () {
    this.charityClosed = null;
    return this.save();
};

// Configure toJSON to include virtuals
charityFundSchema.set('toJSON', { virtuals: true });
charityFundSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CharityFund', charityFundSchema); 