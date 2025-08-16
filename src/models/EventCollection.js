const mongoose = require('mongoose');

const eventCollectionSchema = new mongoose.Schema({
    // Reference to Financial Year
    financeYearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FinancialYear',
        required: [true, 'Financial year is required']
    },

    // Reference to Event
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Events',
        required: [true, 'Event is required']
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

// Compound index to ensure unique contribution per staff per event
eventCollectionSchema.index({ eventId: 1, staffId: 1 }, { unique: true });

// Indexes for efficient queries
eventCollectionSchema.index({ financeYearId: 1 });
eventCollectionSchema.index({ eventId: 1 });
eventCollectionSchema.index({ staffId: 1 });

// Virtual for formatted contribution date
eventCollectionSchema.virtual('formattedContributionDate').get(function () {
    return this.createdAt.toLocaleDateString();
});

// Pre-save middleware to validate collection
eventCollectionSchema.pre('save', function (next) {
    if (this.collectionAmount <= 0) {
        return next(new Error('Collection amount must be greater than 0'));
    }

    next();
});

// Static method to get collections by event
eventCollectionSchema.statics.getByEvent = function (eventId) {
    return this.find({ eventId })
        .populate('financeYearId eventId staffId')
        .sort({ createdAt: 1 });
};

// Static method to get collections by staff
eventCollectionSchema.statics.getByStaff = function (staffId) {
    return this.find({ staffId })
        .populate('financeYearId eventId staffId')
        .sort({ createdAt: -1 });
};

// Static method to get collections by financial year
eventCollectionSchema.statics.getByFinancialYear = function (financeYearId) {
    return this.find({ financeYearId })
        .populate('financeYearId eventId staffId')
        .sort({ createdAt: -1 });
};

// Static method to get total collections for an event
eventCollectionSchema.statics.getTotalCollections = function (eventId) {
    return this.aggregate([
        { $match: { eventId: mongoose.Types.ObjectId(eventId) } },
        { $group: { _id: null, total: { $sum: '$collectionAmount' } } }
    ]);
};

// Static method to get total collections by staff
eventCollectionSchema.statics.getTotalByStaff = function (staffId) {
    return this.aggregate([
        { $match: { staffId: mongoose.Types.ObjectId(staffId) } },
        { $group: { _id: null, total: { $sum: '$collectionAmount' } } }
    ]);
};

// Instance method to update collection amount
eventCollectionSchema.methods.updateAmount = function (newAmount) {
    this.collectionAmount = newAmount;
    return this.save();
};

// Configure toJSON to include virtuals
eventCollectionSchema.set('toJSON', { virtuals: true });
eventCollectionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('EventCollection', eventCollectionSchema); 