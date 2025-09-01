const mongoose = require('mongoose');

const contributorSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    contributedAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["paid", "unpaid","host"], default: "paid" }
});

const eventsSchema = new mongoose.Schema({
    // Reference to Financial Year
    contributors: [contributorSchema],
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
    hostEmployeeId: {
        type: String,
        required: [true, 'Host EmployeeId is required'],
        trim: true
    },

    // Event description
    eventDescription: {
        type: String,
        required: [true, 'Event description is required'],
        trim: true
    },
    eventLocation: {
        type: String,
        required: [true, 'Event location is required'],
    },

    // Target amount for the event
    eventAmount: {
        type: Number,
        required: [true, 'Event amount is required'],
        min: [1, 'Event amount must be greater than 0']
    },

    eventTime: { type: String, required: true },
    // When the event was created
    eventCreated: {
        type: Date,
        // required: [true, 'Event created date is required'],
        default: Date.now
    },


    // When the event ends
    eventClosed: {
        type: Date,
        required: [true, 'Event end date is required']
    },
    eventStatus: {
        type: Boolean,
        default: true
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
    return this.eventClosed.toLocaleDateString();
});

// Virtual for status - based on current date vs event end date
eventsSchema.virtual('status').get(function () {
    const now = new Date();
    return now > this.eventClosed ? 'completed' : 'active';
});

// Virtual for duration in days
eventsSchema.virtual('duration').get(function () {
    const endDate = this.eventClosed;
    const diffTime = Math.abs(endDate - this.eventCreated);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Pre-save middleware to validate event and auto-update status
eventsSchema.pre('save', function (next) {
    if (this.eventAmount <= 0) {
        return next(new Error('Event amount must be greater than 0'));
    }

    // Only validate if eventClosed is explicitly set and not null
    if (this.eventClosed && this.eventCreated) {
        // Use date comparison that accounts for same day
        const closedDate = new Date(this.eventClosed);
        const createdDate = new Date(this.eventCreated);
        
        // Reset time to start of day for comparison
        closedDate.setHours(0, 0, 0, 0);
        createdDate.setHours(0, 0, 0, 0);
        
        if (closedDate < createdDate) {
            return next(new Error('Event closed date cannot be before created date'));
        }
    }

    // Set eventStatus to true for new events, update existing ones based on time
    if (this.isNew) {
        this.eventStatus = true;
    } else if (this.eventClosed) {
        const now = new Date();
        this.eventStatus = now <= this.eventClosed;
    }

    next();
});

// Static method to get active events (events that haven't ended yet)
eventsSchema.statics.getActive = function () {
    const now = new Date();
    return this.find({ eventClosed: { $gt: now } }).populate('financeYearId');
};

// Static method to get completed events (events that have ended)
eventsSchema.statics.getCompleted = function () {
    const now = new Date();
    return this.find({ eventClosed: { $lte: now } }).populate('financeYearId');
};

// Static method to get events by financial year
eventsSchema.statics.getByFinancialYear = function (financeYearId) {
    return this.find({ financeYearId }).populate('financeYearId');
};

// Instance method to extend event end date
eventsSchema.methods.extendEvent = function (newEndDate) {
    this.eventClosed = newEndDate;
    return this.save();
};

// Instance method to check if event is currently active
eventsSchema.methods.isActive = function () {
    const now = new Date();
    return now <= this.eventClosed;
};

// Configure toJSON to include virtuals
eventsSchema.set('toJSON', { virtuals: true });
eventsSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Events', eventsSchema); 