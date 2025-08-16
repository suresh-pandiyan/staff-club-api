const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    // Employee Information
    employeeId: {
        type: String,
        required: [true, 'Please add an employee ID'],
        unique: true,
        trim: true,
        maxlength: [20, 'Employee ID cannot be more than 20 characters']
    },
    firstName: {
        type: String,
        required: [true, 'Please add a first name'],
        trim: true,
        maxlength: [50, 'First name cannot be more than 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Please add a last name'],
        trim: true,
        maxlength: [50, 'Last name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        match: [
            /^[\+]?[1-9][\d]{0,15}$/,
            'Please add a valid phone number'
        ]
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator', 'manager', 'supervisor'],
        default: 'user'
    },
    type: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'intern'],
        default: 'full-time'
    },
    joinDate: {
        type: Date,
        required: [true, 'Please add a join date'],
        default: Date.now
    },
    address: {
        street: {
            type: String,
            required: [true, 'Please add a street address'],
            trim: true
        },
        city: {
            type: String,
            required: [true, 'Please add a city'],
            trim: true
        },
        state: {
            type: String,
            required: [true, 'Please add a state'],
            trim: true
        },
        zipCode: {
            type: String,
            required: [true, 'Please add a zip code'],
            trim: true
        },
        country: {
            type: String,
            required: [true, 'Please add a country'],
            trim: true,
            default: 'India'
        }
    },
    designation: {
        type: String,
        required: [true, 'Please add a designation'],
        trim: true,
        maxlength: [100, 'Designation cannot be more than 100 characters']
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'terminated', 'resigned', 'on-leave'],
        default: 'active'
    },
    hasLoan: {
        type: Boolean,
        default: false
    },
    hasChitfund: {
        type: Boolean,
        default: false
    },
    currentSalary: {
        type: Number,
        required: [true, 'Please add current salary'],
        min: [0, 'Salary cannot be negative']
    },
    emergencyContact: {
        name: {
            type: String,
            required: [true, 'Please add emergency contact name'],
            trim: true
        },
        relationship: {
            type: String,
            required: [true, 'Please add relationship'],
            trim: true
        },
        phone: {
            type: String,
            required: [true, 'Please add emergency contact phone'],
            match: [
                /^[\+]?[1-9][\d]{0,15}$/,
                'Please add a valid phone number'
            ]
        },
        address: {
            type: String,
            trim: true
        }
    },

    // Authentication fields
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    avatar: {
        type: String,
        default: '/uploads/avatars/default-avatar.png'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for user's full profile
userSchema.virtual('fullProfile').get(function () {
    return {
        id: this._id,
        employeeId: this.employeeId,
        firstName: this.firstName,
        lastName: this.lastName,
        fullName: `${this.firstName} ${this.lastName}`,
        email: this.email,
        phone: this.phone,
        role: this.role,
        type: this.type,
        designation: this.designation,
        status: this.status,
        joinDate: this.joinDate,
        address: this.address,
        currentSalary: this.currentSalary,
        hasLoan: this.hasLoan,
        hasChitfund: this.hasChitfund,
        emergencyContact: this.emergencyContact,
        avatar: this.avatar,
        isActive: this.isActive,
        lastLogin: this.lastLogin,
        emailVerified: this.emailVerified,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
});

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for formatted address
userSchema.virtual('formattedAddress').get(function () {
    if (!this.address) return '';
    return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        { id: this._id },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

// Generate email verification token
userSchema.methods.getEmailVerificationToken = function () {
    // Generate token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to emailVerificationToken field
    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    // Set expire
    this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    return verificationToken;
};

module.exports = mongoose.model('User', userSchema); 