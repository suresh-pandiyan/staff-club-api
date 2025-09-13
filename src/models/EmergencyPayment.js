const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    fundId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmergencyFund',
        required: [true, 'Fund ID is required']
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Employee ID is required']
    },
    amountPaid: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: [1, 'Payment amount must be greater than 0']
    },
    month: {
        type: Number, // 1 - 12
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    paidAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for fast lookups
paymentSchema.index({ fundId: 1, month: 1, year: 1 });

// Static method to get total paid for a fund
paymentSchema.statics.getTotalPaid = async function (fundId) {
    const result = await this.aggregate([
        { $match: { fundId: new mongoose.Types.ObjectId(fundId) } },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } }
    ]);
    return result.length ? result[0].total : 0;
};

// Static method to get payments by month/year
paymentSchema.statics.getByMonth = function (fundId, month, year) {
    return this.find({ fundId, month, year });
};

// Instance method: check if this payment satisfies min requirement (₹500)
paymentSchema.methods.isMinimumMet = function () {
    return this.amountPaid >= 500;
};

module.exports = mongoose.model('Payment', paymentSchema);
