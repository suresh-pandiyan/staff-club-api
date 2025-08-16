const mongoose = require('mongoose');

const emergencyFundSchema = new mongoose.Schema({
    // Reference to Financial Year
    financeYearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FinancialYear',
        required: [true, 'Financial year is required']
    },

    // Emergency fund name
    emergencyFundName: {
        type: String,
        required: [true, 'Emergency fund name is required'],
        trim: true
    },

    // Emergency fund description
    emergencyFundDescription: {
        type: String,
        required: [true, 'Emergency fund description is required'],
        trim: true
    },

    // Target amount for the emergency fund
    emergencyFundAmount: {
        type: Number,
        required: [true, 'Emergency fund amount is required'],
        min: [1, 'Emergency fund amount must be greater than 0']
    },

    // When the emergency fund was created
    emergencyFundCreated: {
        type: Date,
        required: [true, 'Emergency fund created date is required'],
        default: Date.now
    },

    // When the emergency fund was closed
    emergencyFundClosed: {
        type: Date,
        default: null
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for efficient queries
emergencyFundSchema.index({ financeYearId: 1 });
emergencyFundSchema.index({ emergencyFundCreated: 1 });
emergencyFundSchema.index({ emergencyFundClosed: 1 });

// Virtual for formatted created date
emergencyFundSchema.virtual('formattedCreatedDate').get(function () {
    return this.emergencyFundCreated.toLocaleDateString();
});

// Virtual for formatted closed date
emergencyFundSchema.virtual('formattedClosedDate').get(function () {
    return this.emergencyFundClosed ? this.emergencyFundClosed.toLocaleDateString() : null;
});

// Virtual for status
emergencyFundSchema.virtual('status').get(function () {
    return this.emergencyFundClosed ? 'closed' : 'active';
});

// Virtual for duration in days
emergencyFundSchema.virtual('duration').get(function () {
    const endDate = this.emergencyFundClosed || new Date();
    const diffTime = Math.abs(endDate - this.emergencyFundCreated);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Pre-save middleware to validate emergency fund
emergencyFundSchema.pre('save', function (next) {
    if (this.emergencyFundAmount <= 0) {
        return next(new Error('Emergency fund amount must be greater than 0'));
    }

    if (this.emergencyFundClosed && this.emergencyFundClosed < this.emergencyFundCreated) {
        return next(new Error('Emergency fund closed date cannot be before created date'));
    }

    next();
});

// Static method to get active emergency funds
emergencyFundSchema.statics.getActive = function () {
    return this.find({ emergencyFundClosed: null }).populate('financeYearId');
};

// Static method to get closed emergency funds
emergencyFundSchema.statics.getClosed = function () {
    return this.find({ emergencyFundClosed: { $ne: null } }).populate('financeYearId');
};

// Static method to get emergency funds by financial year
emergencyFundSchema.statics.getByFinancialYear = function (financeYearId) {
    return this.find({ financeYearId }).populate('financeYearId');
};

// Instance method to close emergency fund
emergencyFundSchema.methods.closeEmergencyFund = function () {
    this.emergencyFundClosed = new Date();
    return this.save();
};

// Instance method to reopen emergency fund
emergencyFundSchema.methods.reopenEmergencyFund = function () {
    this.emergencyFundClosed = null;
    return this.save();
};

// Configure toJSON to include virtuals
emergencyFundSchema.set('toJSON', { virtuals: true });
emergencyFundSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('EmergencyFund', emergencyFundSchema); 