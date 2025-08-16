const mongoose = require('mongoose');

const emergencyFundCollectionSchema = new mongoose.Schema({
    // Reference to Financial Year
    financeYearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FinancialYear',
        required: [true, 'Financial year is required']
    },

    // Reference to Emergency Fund
    emergencyFundId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmergencyFund',
        required: [true, 'Emergency fund is required']
    },

    // Reference to Staff/User who made the contribution
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Staff is required']
    },

    // Amount contributed
    collectionAmount: {
        type: Number,
        required: [true, 'Collection amount is required'],
        min: [0, 'Collection amount cannot be negative']
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Compound index to ensure unique contribution per staff per emergency fund
emergencyFundCollectionSchema.index({ emergencyFundId: 1, staffId: 1 }, { unique: true });

// Indexes for efficient queries
emergencyFundCollectionSchema.index({ financeYearId: 1 });
emergencyFundCollectionSchema.index({ emergencyFundId: 1 });
emergencyFundCollectionSchema.index({ staffId: 1 });

// Virtual for formatted contribution date
emergencyFundCollectionSchema.virtual('formattedContributionDate').get(function () {
    return this.createdAt.toLocaleDateString();
});

// Pre-save middleware to validate collection
emergencyFundCollectionSchema.pre('save', function (next) {
    if (this.collectionAmount <= 0) {
        return next(new Error('Collection amount must be greater than 0'));
    }

    next();
});

// Static method to get collections by emergency fund
emergencyFundCollectionSchema.statics.getByEmergencyFund = function (emergencyFundId) {
    return this.find({ emergencyFundId })
        .populate('financeYearId emergencyFundId staffId')
        .sort({ createdAt: 1 });
};

// Static method to get collections by staff
emergencyFundCollectionSchema.statics.getByStaff = function (staffId) {
    return this.find({ staffId })
        .populate('financeYearId emergencyFundId staffId')
        .sort({ createdAt: -1 });
};

// Static method to get collections by financial year
emergencyFundCollectionSchema.statics.getByFinancialYear = function (financeYearId) {
    return this.find({ financeYearId })
        .populate('financeYearId emergencyFundId staffId')
        .sort({ createdAt: -1 });
};

// Static method to get total collections for an emergency fund
emergencyFundCollectionSchema.statics.getTotalCollections = function (emergencyFundId) {
    return this.aggregate([
        { $match: { emergencyFundId: mongoose.Types.ObjectId(emergencyFundId) } },
        { $group: { _id: null, total: { $sum: '$collectionAmount' } } }
    ]);
};

// Static method to get total collections by staff
emergencyFundCollectionSchema.statics.getTotalByStaff = function (staffId) {
    return this.aggregate([
        { $match: { staffId: mongoose.Types.ObjectId(staffId) } },
        { $group: { _id: null, total: { $sum: '$collectionAmount' } } }
    ]);
};

// Instance method to update collection amount
emergencyFundCollectionSchema.methods.updateAmount = function (newAmount) {
    this.collectionAmount = newAmount;
    return this.save();
};

// Configure toJSON to include virtuals
emergencyFundCollectionSchema.set('toJSON', { virtuals: true });
emergencyFundCollectionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('EmergencyFundCollection', emergencyFundCollectionSchema); 