const mongoose = require('mongoose');

const eventsSchema = new mongoose.Schema({
    // Reference to Financial Year
    financeYearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FinancialYear',
        required: [true, 'Financial year is required']
    },

    // Event name
    eventName: {
        type: String,
        required: [true, 'Event name is required'],
        trim: true
    },

    // Event description
    eventDescription: {
        type: String,
        required: [true, 'Event description is required'],
        trim: true
    },

    // Target amount for the event
    eventAmount: {
        type: Number,
        required: [true, 'Event amount is required'],
        min: [1, 'Event amount must be greater than 0']
    },

    // When the event was created
    eventCreated: {
        type: Date,
        required: [true, 'Event created date is required'],
        default: Date.now
    },

    // When the event was closed
    eventClosed: {
        type: Date,
        default: null
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for efficient queries
eventsSchema.index({ financeYearId: 1 });
eventsSchema.index({ eventCreated: 1 });
eventsSchema.index({ eventClosed: 1 });

// Virtual for formatted created date
eventsSchema.virtual('formattedCreatedDate').get(function () {
    return this.eventCreated.toLocaleDateString();
});

// Virtual for formatted closed date
eventsSchema.virtual('formattedClosedDate').get(function () {
    return this.eventClosed ? this.eventClosed.toLocaleDateString() : null;
});

// Virtual for status
eventsSchema.virtual('status').get(function () {
    return this.eventClosed ? 'closed' : 'active';
});

// Virtual for duration in days
eventsSchema.virtual('duration').get(function () {
    const endDate = this.eventClosed || new Date();
    const diffTime = Math.abs(endDate - this.eventCreated);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Pre-save middleware to validate event
eventsSchema.pre('save', function (next) {
    if (this.eventAmount <= 0) {
        return next(new Error('Event amount must be greater than 0'));
    }

    if (this.eventClosed && this.eventClosed < this.eventCreated) {
        return next(new Error('Event closed date cannot be before created date'));
    }

    next();
});

// Static method to get active events
eventsSchema.statics.getActive = function () {
    return this.find({ eventClosed: null }).populate('financeYearId');
};

// Static method to get closed events
eventsSchema.statics.getClosed = function () {
    return this.find({ eventClosed: { $ne: null } }).populate('financeYearId');
};

// Static method to get events by financial year
eventsSchema.statics.getByFinancialYear = function (financeYearId) {
    return this.find({ financeYearId }).populate('financeYearId');
};

// Instance method to close event
eventsSchema.methods.closeEvent = function () {
    this.eventClosed = new Date();
    return this.save();
};

// Instance method to reopen event
eventsSchema.methods.reopenEvent = function () {
    this.eventClosed = null;
    return this.save();
};

// Configure toJSON to include virtuals
eventsSchema.set('toJSON', { virtuals: true });
eventsSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Events', eventsSchema); 