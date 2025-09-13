const mongoose = require('mongoose');

const staffShareSchema = new mongoose.Schema({
    // Reference to Financial Year
    financeYearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FinancialYear',
        required: [true, 'Financial year is required']
    },

    // Reference to Staff/User
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Staff is required']
    },

    // Month of share contribution (1-12)
    shareMonth: {
        type: Number,
        required: [true, 'Share month is required'],
        min: [1, 'Month must be between 1 and 12'],
        max: [12, 'Month must be between 1 and 12']
    },

    // Amount contributed as share
    shareAmount: {
        type: Number,
        required: [true, 'Share amount is required'],
        min: [0, 'Share amount cannot be negative']
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Compound index to ensure unique share per staff per month per financial year
staffShareSchema.index({ financeYearId: 1, staffId: 1, shareMonth: 1 }, { unique: true });

// Indexes for efficient queries
staffShareSchema.index({ financeYearId: 1 });
staffShareSchema.index({ staffId: 1 });
staffShareSchema.index({ shareMonth: 1 });

// Virtual for formatted month name
staffShareSchema.virtual('monthName').get(function () {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[this.shareMonth - 1];
});

// Virtual for formatted share date
staffShareSchema.virtual('formattedShareDate').get(function () {
    return this.createdAt.toLocaleDateString();
});

// Virtual for year-month combination
staffShareSchema.virtual('yearMonth').get(function () {
    const year = this.createdAt.getFullYear();
    return `${year}-${this.shareMonth.toString().padStart(2, '0')}`;
});

// Pre-save middleware to validate share
staffShareSchema.pre('save', function (next) {
    if (this.shareAmount <= 0) {
        return next(new Error('Share amount must be greater than 0'));
    }

    next();
});

// Static method to get shares by staff
staffShareSchema.statics.getByStaff = function (staffId) {
    return this.find({ staffId })
        .populate('financeYearId staffId')
        .sort({ shareMonth: 1, createdAt: 1 });
};

// Static method to get shares by financial year
staffShareSchema.statics.getByFinancialYear = function (financeYearId) {
    return this.find({ financeYearId })
        .populate('financeYearId staffId')
        .sort({ shareMonth: 1, createdAt: 1 });
};

// Static method to get shares by month
staffShareSchema.statics.getByMonth = function (financeYearId, month) {
    return this.find({ financeYearId, shareMonth: month })
        .populate('financeYearId staffId');
};

// Static method to get effective share amount for a staff member
staffShareSchema.statics.getEffectiveShareAmount = async function (staffId, financeYearId) {
    const MemberSettings = mongoose.model('MemberSettings');
    return await MemberSettings.getEffectiveShareAmount(staffId, financeYearId);
};

// Static method to get total shares for a staff member
staffShareSchema.statics.getTotalShares = function (staffId, financeYearId = null) {
    const match = { staffId };
    if (financeYearId) {
        match.financeYearId = financeYearId;
    }

    return this.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: '$shareAmount' } } }
    ]);
};

// Static method to get monthly shares summary
staffShareSchema.statics.getMonthlySummary = function (financeYearId) {
    return this.aggregate([
        { $match: { financeYearId: mongoose.Types.ObjectId(financeYearId) } },
        {
            $group: {
                _id: '$shareMonth',
                totalAmount: { $sum: '$shareAmount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);
};

// Static method to get staff shares summary
staffShareSchema.statics.getStaffSummary = function (financeYearId) {
    return this.aggregate([
        { $match: { financeYearId: mongoose.Types.ObjectId(financeYearId) } },
        {
            $group: {
                _id: '$staffId',
                totalAmount: { $sum: '$shareAmount' },
                months: { $addToSet: '$shareMonth' },
                count: { $sum: 1 }
            }
        },
        { $sort: { totalAmount: -1 } }
    ]);
};

// Static method to get expected vs actual collections with effective share amounts
staffShareSchema.statics.getExpectedVsActualWithEffectiveAmounts = async function (financeYearId) {
    const MemberSettings = mongoose.model('MemberSettings');

    // Get all effective share amounts for this financial year
    const effectiveAmounts = await MemberSettings.getAllEffectiveShareAmounts(financeYearId);

    // Get actual collections
    const actualCollections = await this.aggregate([
        { $match: { financeYearId: mongoose.Types.ObjectId(financeYearId) } },
        {
            $group: {
                _id: {
                    month: '$shareMonth',
                    staffId: '$staffId'
                },
                totalAmount: { $sum: '$shareAmount' }
            }
        },
        { $sort: { '_id.month': 1 } }
    ]);

    // Organize by month
    const monthlyData = {};
    for (let month = 1; month <= 12; month++) {
        monthlyData[month] = {
            month,
            monthName: new Date(2024, month - 1, 1).toLocaleDateString('en-US', { month: 'long' }),
            expectedAmount: 0,
            actualAmount: 0,
            expectedCount: 0,
            actualCount: 0,
            staffDetails: []
        };
    }

    // Calculate expected amounts for each month
    effectiveAmounts.effectiveAmounts.forEach(staff => {
        for (let month = 1; month <= 12; month++) {
            monthlyData[month].expectedAmount += staff.effectiveAmount;
            monthlyData[month].expectedCount += 1;
            monthlyData[month].staffDetails.push({
                staffId: staff.staffId,
                staffName: staff.staffName,
                employeeId: staff.employeeId,
                expectedAmount: staff.effectiveAmount,
                isCustom: staff.isCustom
            });
        }
    });

    // Add actual collections
    actualCollections.forEach(item => {
        const month = item._id.month;
        monthlyData[month].actualAmount += item.totalAmount;
        monthlyData[month].actualCount += 1;
    });

    return {
        financialYear: effectiveAmounts.financialYear,
        defaultAmount: effectiveAmounts.defaultAmount,
        totalStaff: effectiveAmounts.totalStaff,
        monthlyData: Object.values(monthlyData),
        totalExpected: Object.values(monthlyData).reduce((sum, month) => sum + month.expectedAmount, 0),
        totalActual: Object.values(monthlyData).reduce((sum, month) => sum + month.actualAmount, 0)
    };
};

// Instance method to update share amount
staffShareSchema.methods.updateAmount = function (newAmount) {
    this.shareAmount = newAmount;
    return this.save();
};

// Instance method to update share month
staffShareSchema.methods.updateMonth = function (newMonth) {
    this.shareMonth = newMonth;
    return this.save();
};

// Configure toJSON to include virtuals
staffShareSchema.set('toJSON', { virtuals: true });
staffShareSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('StaffShare', staffShareSchema); 