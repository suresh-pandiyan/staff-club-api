const mongoose = require('mongoose');

const financialYearSchema = new mongoose.Schema({
    // Financial year identifier (e.g., "2024-2025", "FY2024")
    financeYear: {
        type: String,
        required: [true, 'Financial year is required'],
        unique: true,
        trim: true,
        uppercase: true
    },

    // Start date of the financial year
    startFrom: {
        type: Date,
        required: [true, 'Start date is required']
    },

    // End date of the financial year
    endTo: {
        type: Date,
        required: [true, 'End date is required']
    },

    // Whether this is the currently active financial year
    currentlyActive: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Index for efficient queries
financialYearSchema.index({ financeYear: 1 });
financialYearSchema.index({ currentlyActive: 1 });
financialYearSchema.index({ startFrom: 1, endTo: 1 });

// Virtual for formatted date range
financialYearSchema.virtual('dateRange').get(function () {
    return `${this.startFrom.toLocaleDateString()} - ${this.endTo.toLocaleDateString()}`;
});

// Virtual for duration in days
financialYearSchema.virtual('duration').get(function () {
    const diffTime = Math.abs(this.endTo - this.startFrom);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Pre-save middleware to ensure only one financial year is currently active
financialYearSchema.pre('save', async function (next) {
    if (this.isModified('currentlyActive') && this.currentlyActive) {
        // Set all other financial years to inactive
        await this.constructor.updateMany(
            { _id: { $ne: this._id } },
            { currentlyActive: false }
        );
    }
    next();
});

// Static method to get currently active financial year
financialYearSchema.statics.getActiveFinancialYear = function () {
    return this.findOne({ currentlyActive: true });
};

// Static method to set a financial year as active
financialYearSchema.statics.setActiveFinancialYear = function (financeYearId) {
    return this.findByIdAndUpdate(
        financeYearId,
        { currentlyActive: true },
        { new: true }
    );
};

// Instance method to check if a date falls within this financial year
financialYearSchema.methods.isDateInRange = function (date) {
    const checkDate = new Date(date);
    return checkDate >= this.startFrom && checkDate <= this.endTo;
};

// Configure toJSON to include virtuals
financialYearSchema.set('toJSON', { virtuals: true });
financialYearSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('FinancialYear', financialYearSchema); 