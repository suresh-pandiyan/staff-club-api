const mongoose = require('mongoose');

const chitMembersSchema = new mongoose.Schema({
    // Reference to Financial Year
    financeYearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FinancialYear',
        required: [true, 'Financial year is required']
    },

    // Reference to Chitfund
    chitfundId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chitfund',
        required: [true, 'Chitfund is required']
    },

    // Reference to Staff/User
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Staff is required']
    },

    // Whether the staff has taken the chit
    chitTaken: {
        type: Boolean,
        default: false
    },

    // Amount taken by the staff
    chitTakenAmount: {
        type: Number,
        min: [0, 'Amount cannot be negative'],
        default: 0
    },

    // Month when chit was taken (1-12)
    chitTakenMonth: {
        type: Number,
        min: [1, 'Month must be between 1 and 12'],
        max: [12, 'Month must be between 1 and 12'],
        default: null
    },

    // Interest percentage for this member
    chitInterestPercentage: {
        type: Number,
        min: [0, 'Interest percentage cannot be negative'],
        max: [100, 'Interest percentage cannot exceed 100%'],
        default: 0
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Compound index to ensure unique staff per chitfund
chitMembersSchema.index({ chitfundId: 1, staffId: 1 }, { unique: true });

// Indexes for efficient queries
chitMembersSchema.index({ financeYearId: 1 });
chitMembersSchema.index({ staffId: 1 });
chitMembersSchema.index({ chitTaken: 1 });
chitMembersSchema.index({ chitTakenMonth: 1 });

// Virtual for formatted month name
chitMembersSchema.virtual('monthName').get(function () {
    if (!this.chitTakenMonth) return null;
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[this.chitTakenMonth - 1];
});

// Virtual for interest amount
chitMembersSchema.virtual('interestAmount').get(function () {
    return (this.chitTakenAmount * this.chitInterestPercentage) / 100;
});

// Virtual for total amount (principal + interest)
chitMembersSchema.virtual('totalAmount').get(function () {
    return this.chitTakenAmount + this.interestAmount;
});

// Pre-save middleware to validate chit member
chitMembersSchema.pre('save', function (next) {
    if (this.chitTaken && this.chitTakenAmount <= 0) {
        return next(new Error('Chit taken amount must be greater than 0 when chit is taken'));
    }

    if (this.chitTaken && !this.chitTakenMonth) {
        return next(new Error('Month must be specified when chit is taken'));
    }

    if (!this.chitTaken && this.chitTakenAmount > 0) {
        return next(new Error('Chit taken amount should be 0 when chit is not taken'));
    }

    next();
});

// Static method to get members by chitfund
chitMembersSchema.statics.getByChitfund = function (chitfundId) {
    return this.find({ chitfundId }).populate('financeYearId chitfundId staffId');
};

// Static method to get members by staff
chitMembersSchema.statics.getByStaff = function (staffId) {
    return this.find({ staffId }).populate('financeYearId chitfundId staffId');
};

// Static method to get members who have taken chit
chitMembersSchema.statics.getTakenMembers = function (chitfundId) {
    return this.find({ chitfundId, chitTaken: true }).populate('financeYearId chitfundId staffId');
};

// Static method to get members who haven't taken chit
chitMembersSchema.statics.getPendingMembers = function (chitfundId) {
    return this.find({ chitfundId, chitTaken: false }).populate('financeYearId chitfundId staffId');
};

// Instance method to take chit
chitMembersSchema.methods.takeChit = function (amount, month, interestPercentage = 0) {
    this.chitTaken = true;
    this.chitTakenAmount = amount;
    this.chitTakenMonth = month;
    this.chitInterestPercentage = interestPercentage;
    return this.save();
};

// Instance method to release chit
chitMembersSchema.methods.releaseChit = function () {
    this.chitTaken = false;
    this.chitTakenAmount = 0;
    this.chitTakenMonth = null;
    this.chitInterestPercentage = 0;
    return this.save();
};

// Instance method to update interest percentage
chitMembersSchema.methods.updateInterestPercentage = function (percentage) {
    this.chitInterestPercentage = percentage;
    return this.save();
};

// Configure toJSON to include virtuals
chitMembersSchema.set('toJSON', { virtuals: true });
chitMembersSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ChitMembers', chitMembersSchema); 