const mongoose = require('mongoose');

const chitCollectionSchema = new mongoose.Schema({
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

    // Reference to Staff/User who made the collection
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Staff is required']
    },

    // Month of collection (1-12)
    collectionMonth: {
        type: Number,
        required: [true, 'Collection month is required'],
        min: [1, 'Month must be between 1 and 12'],
        max: [12, 'Month must be between 1 and 12']
    },

    // Amount collected
    collectionAmount: {
        type: Number,
        required: [true, 'Collection amount is required'],
        min: [0, 'Collection amount cannot be negative']
    },

    // Who collected the amount (staff ID)
    collectionBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Collection by is required']
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Compound index to ensure unique collection per staff per month per chitfund
chitCollectionSchema.index({ chitfundId: 1, staffId: 1, collectionMonth: 1 }, { unique: true });

// Indexes for efficient queries
chitCollectionSchema.index({ financeYearId: 1 });
chitCollectionSchema.index({ chitfundId: 1 });
chitCollectionSchema.index({ staffId: 1 });
chitCollectionSchema.index({ collectionMonth: 1 });
chitCollectionSchema.index({ collectionBy: 1 });

// Virtual for formatted month name
chitCollectionSchema.virtual('monthName').get(function () {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[this.collectionMonth - 1];
});

// Virtual for formatted collection date
chitCollectionSchema.virtual('formattedCollectionDate').get(function () {
    return this.createdAt.toLocaleDateString();
});

// Virtual for year-month combination
chitCollectionSchema.virtual('yearMonth').get(function () {
    const year = this.createdAt.getFullYear();
    return `${year}-${this.collectionMonth.toString().padStart(2, '0')}`;
});

// Pre-save middleware to validate collection
chitCollectionSchema.pre('save', function (next) {
    if (this.collectionAmount <= 0) {
        return next(new Error('Collection amount must be greater than 0'));
    }

    next();
});

// Static method to get collections by chitfund
chitCollectionSchema.statics.getByChitfund = function (chitfundId) {
    return this.find({ chitfundId })
        .populate('financeYearId chitfundId staffId collectionBy')
        .sort({ collectionMonth: 1, createdAt: 1 });
};

// Static method to get collections by staff
chitCollectionSchema.statics.getByStaff = function (staffId) {
    return this.find({ staffId })
        .populate('financeYearId chitfundId staffId collectionBy')
        .sort({ collectionMonth: 1, createdAt: 1 });
};

// Static method to get collections by month
chitCollectionSchema.statics.getByMonth = function (chitfundId, month) {
    return this.find({ chitfundId, collectionMonth: month })
        .populate('financeYearId chitfundId staffId collectionBy');
};

// Static method to get collections by collector
chitCollectionSchema.statics.getByCollector = function (collectorId) {
    return this.find({ collectionBy: collectorId })
        .populate('financeYearId chitfundId staffId collectionBy')
        .sort({ createdAt: -1 });
};

// Static method to get total collections for a chitfund
chitCollectionSchema.statics.getTotalCollections = function (chitfundId) {
    return this.aggregate([
        { $match: { chitfundId: mongoose.Types.ObjectId(chitfundId) } },
        { $group: { _id: null, total: { $sum: '$collectionAmount' } } }
    ]);
};

// Static method to get monthly collections summary
chitCollectionSchema.statics.getMonthlySummary = function (chitfundId) {
    return this.aggregate([
        { $match: { chitfundId: mongoose.Types.ObjectId(chitfundId) } },
        {
            $group: {
                _id: '$collectionMonth',
                totalAmount: { $sum: '$collectionAmount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);
};

// Instance method to update collection amount
chitCollectionSchema.methods.updateAmount = function (newAmount) {
    this.collectionAmount = newAmount;
    return this.save();
};

// Instance method to update collector
chitCollectionSchema.methods.updateCollector = function (newCollectorId) {
    this.collectionBy = newCollectorId;
    return this.save();
};

// Configure toJSON to include virtuals
chitCollectionSchema.set('toJSON', { virtuals: true });
chitCollectionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ChitCollection', chitCollectionSchema); 