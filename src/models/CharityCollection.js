const mongoose = require('mongoose');

const charityCollectionSchema = new mongoose.Schema({
    // Reference to Financial Year
    financeYearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FinancialYear',
        required: [true, 'Financial year is required']
    },

    // Reference to Charity Fund
    charityFundId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CharityFund',
        required: [true, 'Charity fund is required']
    },

    // Reference to Staff/User who made the donation
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Staff is required']
    },

    // Amount donated
    collectionAmount: {
        type: Number,
        required: [true, 'Collection amount is required'],
        min: [0, 'Collection amount cannot be negative']
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Compound index to ensure unique donation per staff per charity fund
charityCollectionSchema.index({ charityFundId: 1, staffId: 1 }, { unique: true });

// Indexes for efficient queries
charityCollectionSchema.index({ financeYearId: 1 });
charityCollectionSchema.index({ charityFundId: 1 });
charityCollectionSchema.index({ staffId: 1 });

// Virtual for formatted donation date
charityCollectionSchema.virtual('formattedDonationDate').get(function () {
    return this.createdAt.toLocaleDateString();
});

// Pre-save middleware to validate collection
charityCollectionSchema.pre('save', function (next) {
    if (this.collectionAmount <= 0) {
        return next(new Error('Collection amount must be greater than 0'));
    }

    next();
});

// Static method to get collections by charity fund
charityCollectionSchema.statics.getByCharityFund = function (charityFundId) {
    return this.find({ charityFundId })
        .populate('financeYearId charityFundId staffId')
        .sort({ createdAt: 1 });
};

// Static method to get collections by staff
charityCollectionSchema.statics.getByStaff = function (staffId) {
    return this.find({ staffId })
        .populate('financeYearId charityFundId staffId')
        .sort({ createdAt: -1 });
};

// Static method to get collections by financial year
charityCollectionSchema.statics.getByFinancialYear = function (financeYearId) {
    return this.find({ financeYearId })
        .populate('financeYearId charityFundId staffId')
        .sort({ createdAt: -1 });
};

// Static method to get total collections for a charity fund
charityCollectionSchema.statics.getTotalCollections = function (charityFundId) {
    return this.aggregate([
        { $match: { charityFundId: mongoose.Types.ObjectId(charityFundId) } },
        { $group: { _id: null, total: { $sum: '$collectionAmount' } } }
    ]);
};

// Static method to get total collections by staff
charityCollectionSchema.statics.getTotalByStaff = function (staffId) {
    return this.aggregate([
        { $match: { staffId: mongoose.Types.ObjectId(staffId) } },
        { $group: { _id: null, total: { $sum: '$collectionAmount' } } }
    ]);
};

// Instance method to update collection amount
charityCollectionSchema.methods.updateAmount = function (newAmount) {
    this.collectionAmount = newAmount;
    return this.save();
};

// Configure toJSON to include virtuals
charityCollectionSchema.set('toJSON', { virtuals: true });
charityCollectionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CharityCollection', charityCollectionSchema); 