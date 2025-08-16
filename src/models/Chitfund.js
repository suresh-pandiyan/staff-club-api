const mongoose = require('mongoose');

const chitfundSchema = new mongoose.Schema({
    // Reference to Financial Year
    financeYearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FinancialYear',
        required: [true, 'Financial year is required']
    },

    // Chitfund name/identifier
    chitName: {
        type: String,
        required: [true, 'Chitfund name is required'],
        trim: true
    },

    // Array of staff IDs participating in this chitfund
    chitStaffs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],

    // When the chitfund started
    chitStarted: {
        type: Date,
        required: [true, 'Chitfund start date is required'],
        default: Date.now
    },

    // Amount for each chit
    chitAmount: {
        type: Number,
        required: [true, 'Chit amount is required'],
        min: [1, 'Chit amount must be greater than 0']
    },

    // Status of the chitfund
    chitStatus: {
        type: String,
        enum: ['created', 'on-going', 'completed'],
        default: 'created',
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for efficient queries
chitfundSchema.index({ financeYearId: 1 });
chitfundSchema.index({ chitStatus: 1 });
chitfundSchema.index({ chitStaffs: 1 });
chitfundSchema.index({ chitStarted: 1 });

// Virtual for total chitfund value
chitfundSchema.virtual('totalValue').get(function () {
    return this.chitStaffs.length * this.chitAmount;
});

// Virtual for duration in months
chitfundSchema.virtual('duration').get(function () {
    const now = new Date();
    const diffTime = Math.abs(now - this.chitStarted);
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
});

// Virtual for formatted start date
chitfundSchema.virtual('formattedStartDate').get(function () {
    return this.chitStarted.toLocaleDateString();
});

// Pre-save middleware to validate chitfund
chitfundSchema.pre('save', function (next) {
    if (this.chitStaffs.length === 0) {
        return next(new Error('Chitfund must have at least one staff member'));
    }

    if (this.chitAmount <= 0) {
        return next(new Error('Chit amount must be greater than 0'));
    }

    next();
});

// Static method to get chitfunds by status
chitfundSchema.statics.getByStatus = function (status) {
    return this.find({ chitStatus: status }).populate('financeYearId chitStaffs');
};

// Static method to get chitfunds by financial year
chitfundSchema.statics.getByFinancialYear = function (financeYearId) {
    return this.find({ financeYearId }).populate('financeYearId chitStaffs');
};

// Static method to get chitfunds by staff member
chitfundSchema.statics.getByStaff = function (staffId) {
    return this.find({ chitStaffs: staffId }).populate('financeYearId chitStaffs');
};

// Instance method to add staff member
chitfundSchema.methods.addStaff = function (staffId) {
    if (!this.chitStaffs.includes(staffId)) {
        this.chitStaffs.push(staffId);
    }
    return this.save();
};

// Instance method to remove staff member
chitfundSchema.methods.removeStaff = function (staffId) {
    this.chitStaffs = this.chitStaffs.filter(id => id.toString() !== staffId.toString());
    return this.save();
};

// Instance method to update status
chitfundSchema.methods.updateStatus = function (newStatus) {
    this.chitStatus = newStatus;
    return this.save();
};

// Instance method to check if staff is member
chitfundSchema.methods.isStaffMember = function (staffId) {
    return this.chitStaffs.some(id => id.toString() === staffId.toString());
};

// Configure toJSON to include virtuals
chitfundSchema.set('toJSON', { virtuals: true });
chitfundSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Chitfund', chitfundSchema); 