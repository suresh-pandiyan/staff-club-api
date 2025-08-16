const mongoose = require('mongoose');

const loanStaffSchema = new mongoose.Schema({
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

    // Reference to Staff/User
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Staff is required']
    },

    // Amount taken as loan
    loanTakenAmount: {
        type: Number,
        required: [true, 'Loan taken amount is required'],
        min: [0, 'Loan taken amount cannot be negative']
    },

    // Month when loan was taken (1-12)
    loanTakenMonth: {
        type: Number,
        required: [true, 'Loan taken month is required'],
        min: [1, 'Month must be between 1 and 12'],
        max: [12, 'Month must be between 1 and 12']
    },

    // Interest percentage for this loan
    loanInterestPercentage: {
        type: Number,
        required: [true, 'Interest percentage is required'],
        min: [0, 'Interest percentage cannot be negative'],
        max: [100, 'Interest percentage cannot exceed 100%']
    },

    // Total amount due (principal + interest)
    loanDueAmount: {
        type: Number,
        required: [true, 'Loan due amount is required'],
        min: [0, 'Loan due amount cannot be negative']
    },

    // Top-up amount taken
    loanTopupAmount: {
        type: Number,
        min: [0, 'Top-up amount cannot be negative'],
        default: 0
    },

    // First authority person who approved
    loanAuthorityPerson1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'First authority person is required']
    },

    // Second authority person who approved
    loanAuthorityPerson2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Second authority person is required']
    },

    // Eligibility amount for this staff
    loanElgibilityAmount: {
        type: Number,
        required: [true, 'Loan eligibility amount is required'],
        min: [0, 'Loan eligibility amount cannot be negative']
    },

    // Status of the loan
    loanStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'defaulted'],
        default: 'pending',
        required: true
    },

    // Whether top-up has been taken
    hasTopup: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Compound index to ensure unique loan per staff
loanStaffSchema.index({ loanId: 1, staffId: 1 }, { unique: true });

// Indexes for efficient queries
loanStaffSchema.index({ financeYearId: 1 });
loanStaffSchema.index({ staffId: 1 });
loanStaffSchema.index({ loanStatus: 1 });
loanStaffSchema.index({ loanTakenMonth: 1 });
loanStaffSchema.index({ hasTopup: 1 });

// Virtual for formatted month name
loanStaffSchema.virtual('monthName').get(function () {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[this.loanTakenMonth - 1];
});

// Virtual for interest amount
loanStaffSchema.virtual('interestAmount').get(function () {
    return (this.loanTakenAmount * this.loanInterestPercentage) / 100;
});

// Virtual for total loan amount (principal + top-up)
loanStaffSchema.virtual('totalLoanAmount').get(function () {
    return this.loanTakenAmount + this.loanTopupAmount;
});

// Virtual for remaining amount
loanStaffSchema.virtual('remainingAmount').get(function () {
    return this.loanDueAmount;
});

// Pre-save middleware to validate loan staff
loanStaffSchema.pre('save', function (next) {
    if (this.loanTakenAmount <= 0) {
        return next(new Error('Loan taken amount must be greater than 0'));
    }

    if (this.loanDueAmount < this.loanTakenAmount) {
        return next(new Error('Loan due amount cannot be less than loan taken amount'));
    }

    if (this.hasTopup && this.loanTopupAmount <= 0) {
        return next(new Error('Top-up amount must be greater than 0 when top-up is taken'));
    }

    if (!this.hasTopup && this.loanTopupAmount > 0) {
        return next(new Error('Top-up amount should be 0 when top-up is not taken'));
    }

    next();
});

// Static method to get loans by staff
loanStaffSchema.statics.getByStaff = function (staffId) {
    return this.find({ staffId }).populate('financeYearId loanId staffId loanAuthorityPerson1 loanAuthorityPerson2');
};

// Static method to get loans by loan scheme
loanStaffSchema.statics.getByLoan = function (loanId) {
    return this.find({ loanId }).populate('financeYearId loanId staffId loanAuthorityPerson1 loanAuthorityPerson2');
};

// Static method to get loans by status
loanStaffSchema.statics.getByStatus = function (status) {
    return this.find({ loanStatus: status }).populate('financeYearId loanId staffId loanAuthorityPerson1 loanAuthorityPerson2');
};

// Static method to get active loans
loanStaffSchema.statics.getActive = function () {
    return this.find({ loanStatus: 'active' }).populate('financeYearId loanId staffId loanAuthorityPerson1 loanAuthorityPerson2');
};

// Static method to get loans with top-up
loanStaffSchema.statics.getWithTopup = function () {
    return this.find({ hasTopup: true }).populate('financeYearId loanId staffId loanAuthorityPerson1 loanAuthorityPerson2');
};

// Instance method to approve loan
loanStaffSchema.methods.approveLoan = function () {
    this.loanStatus = 'approved';
    return this.save();
};

// Instance method to activate loan
loanStaffSchema.methods.activateLoan = function () {
    this.loanStatus = 'active';
    return this.save();
};

// Instance method to complete loan
loanStaffSchema.methods.completeLoan = function () {
    this.loanStatus = 'completed';
    return this.save();
};

// Instance method to reject loan
loanStaffSchema.methods.rejectLoan = function () {
    this.loanStatus = 'rejected';
    return this.save();
};

// Instance method to default loan
loanStaffSchema.methods.defaultLoan = function () {
    this.loanStatus = 'defaulted';
    return this.save();
};

// Instance method to take top-up
loanStaffSchema.methods.takeTopup = function (topupAmount) {
    this.hasTopup = true;
    this.loanTopupAmount = topupAmount;
    this.loanDueAmount += topupAmount;
    return this.save();
};

// Instance method to update due amount
loanStaffSchema.methods.updateDueAmount = function (newAmount) {
    this.loanDueAmount = newAmount;
    return this.save();
};

// Configure toJSON to include virtuals
loanStaffSchema.set('toJSON', { virtuals: true });
loanStaffSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('LoanStaff', loanStaffSchema); 