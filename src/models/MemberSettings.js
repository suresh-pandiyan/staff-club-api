const mongoose = require('mongoose');

const memberSettingsSchema = new mongoose.Schema({
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

    // Individual share amount for this staff member in this financial year
    // If not set, will use the default memberShareAmount from FinancialYear
    shareAmount: {
        type: Number,
        required: [true, 'Share amount is required'],
        min: [0, 'Share amount cannot be negative']
    },

    // Additional settings can be added here
    isActive: {
        type: Boolean,
        default: true
    },

    // Notes or comments for this member's settings
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Compound index to ensure unique settings per staff per financial year
memberSettingsSchema.index({ financeYearId: 1, staffId: 1 }, { unique: true });

// Indexes for efficient queries
memberSettingsSchema.index({ financeYearId: 1 });
memberSettingsSchema.index({ staffId: 1 });
memberSettingsSchema.index({ isActive: 1 });

// Virtual for formatted share amount
memberSettingsSchema.virtual('formattedShareAmount').get(function () {
    return `₹${this.shareAmount.toLocaleString()}`;
});

// Pre-save middleware to validate share amount
memberSettingsSchema.pre('save', function (next) {
    if (this.shareAmount <= 0) {
        return next(new Error('Share amount must be greater than 0'));
    }
    next();
});

// Static method to get member settings by financial year
memberSettingsSchema.statics.getByFinancialYear = function (financeYearId) {
    return this.find({ financeYearId, isActive: true })
        .populate('staffId', 'name employeeId email')
        .populate('financeYearId', 'financeYear memberShareAmount')
        .sort({ 'staffId.name': 1 });
};

// Static method to get member settings by staff member
memberSettingsSchema.statics.getByStaff = function (staffId, financeYearId = null) {
    const match = { staffId, isActive: true };
    if (financeYearId) {
        match.financeYearId = financeYearId;
    }

    return this.find(match)
        .populate('financeYearId', 'financeYear memberShareAmount startFrom endTo')
        .sort({ 'financeYearId.startFrom': -1 });
};

// Static method to get effective share amount for a staff member
memberSettingsSchema.statics.getEffectiveShareAmount = async function (staffId, financeYearId) {
    // First check if there's a custom setting for this member
    const customSetting = await this.findOne({
        staffId,
        financeYearId,
        isActive: true
    });

    if (customSetting) {
        return customSetting.shareAmount;
    }

    // If no custom setting, get the default from FinancialYear
    const FinancialYear = mongoose.model('FinancialYear');
    const year = await FinancialYear.findById(financeYearId);
    return year ? year.memberShareAmount : 0;
};

// Static method to get all effective share amounts for a financial year
memberSettingsSchema.statics.getAllEffectiveShareAmounts = async function (financeYearId) {
    const FinancialYear = mongoose.model('FinancialYear');
    const User = mongoose.model('User');

    // Get the default share amount for this financial year
    const year = await FinancialYear.findById(financeYearId);
    const defaultAmount = year ? year.memberShareAmount : 0;

    // Get all active staff members
    const staffMembers = await User.find({ isActive: true }).select('_id name employeeId');

    // Get custom settings for this financial year
    const customSettings = await this.find({ financeYearId, isActive: true });
    const customSettingsMap = new Map();
    customSettings.forEach(setting => {
        customSettingsMap.set(setting.staffId.toString(), setting.shareAmount);
    });

    // Create result with effective amounts
    const effectiveAmounts = staffMembers.map(staff => ({
        staffId: staff._id,
        staffName: staff.name,
        employeeId: staff.employeeId,
        customAmount: customSettingsMap.get(staff._id.toString()) || null,
        effectiveAmount: customSettingsMap.get(staff._id.toString()) || defaultAmount,
        isCustom: customSettingsMap.has(staff._id.toString())
    }));

    return {
        financialYear: year ? year.financeYear : null,
        defaultAmount,
        totalStaff: effectiveAmounts.length,
        effectiveAmounts: effectiveAmounts.sort((a, b) => a.staffName.localeCompare(b.staffName))
    };
};

// Static method to bulk update member settings
memberSettingsSchema.statics.bulkUpdateSettings = async function (financeYearId, settings) {
    const operations = [];

    for (const setting of settings) {
        operations.push({
            updateOne: {
                filter: { financeYearId, staffId: setting.staffId },
                update: {
                    shareAmount: setting.shareAmount,
                    isActive: true,
                    notes: setting.notes || ''
                },
                upsert: true
            }
        });
    }

    if (operations.length > 0) {
        const result = await this.bulkWrite(operations);
        return result;
    }

    return null;
};

// Instance method to update share amount
memberSettingsSchema.methods.updateShareAmount = function (newAmount) {
    this.shareAmount = newAmount;
    return this.save();
};

// Instance method to deactivate settings
memberSettingsSchema.methods.deactivate = function () {
    this.isActive = false;
    return this.save();
};

// Configure toJSON to include virtuals
memberSettingsSchema.set('toJSON', { virtuals: true });
memberSettingsSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MemberSettings', memberSettingsSchema);
