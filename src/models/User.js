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
            required: false,
            trim: true,
            default: ''
        },
        city: {
            type: String,
            required: false,
            trim: true,
            default: ''
        },
        state: {
            type: String,
            required: false,
            trim: true,
            default: ''
        },
        zipCode: {
            type: String,
            required: false,
            trim: true,
            default: ''
        },
        country: {
            type: String,
            required: false,
            trim: true,
            default: 'India'
        }
    },
    department: {
        type: String,
        enum: [
            'Computer Science & Engineering(CSE)',
            'Information Technology(IT)',
            'Electronics & Communication Engineering(ECE)',
            'Electrical & Electronics Engineering(EEE)',
            'Mechanical Engineering(MECH)',
            'Civil Engineering',
            'Artificial Intelligence & Data Science(AI & DS)',
            'Master of Business Administration(MBA)',
            'Cyber Security',
            'Master of Computer Applications(MCA)',
        ],
        default: null
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
            required: false,
            trim: true,
            default: ''
        },
        relationship: {
            type: String,
            required: false,
            trim: true,
            default: ''
        },
        phone: {
            type: String,
            required: false,
            trim: true,
            default: ''
        },
        address: {
            type: String,
            trim: true
        }
    },
    // Authentication fields
    password: {
        type: String,
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

// Post-save middleware to create/update MemberSettings
userSchema.post('save', async function (doc) {
    try {
        // Only proceed if user is active
        if (doc.isActive && doc.status === 'active') {
            const FinancialYear = mongoose.model('FinancialYear');
            const MemberSettings = mongoose.model('MemberSettings');

            // Get the currently active financial year
            const activeYear = await FinancialYear.findOne({ currentlyActive: true });

            if (activeYear && activeYear.memberShareAmount > 0) {
                // Check if MemberSettings already exists for this user and financial year
                const existingSettings = await MemberSettings.findOne({
                    financeYearId: activeYear._id,
                    staffId: doc._id
                });

                if (existingSettings) {
                    // Update existing settings if needed
                    if (existingSettings.shareAmount !== activeYear.memberShareAmount) {
                        existingSettings.shareAmount = activeYear.memberShareAmount;
                        await existingSettings.save();
                        console.log(`Updated MemberSettings for user ${doc.employeeId} in ${activeYear.financeYear}`);
                    }
                } else {
                    // Create new MemberSettings
                    const newSettings = new MemberSettings({
                        financeYearId: activeYear._id,
                        staffId: doc._id,
                        shareAmount: activeYear.memberShareAmount,
                        notes: `Auto-created for new user ${doc.employeeId}`
                    });

                    await newSettings.save();
                    console.log(`Created MemberSettings for user ${doc.employeeId} in ${activeYear.financeYear}`);
                }
            }
        }
    } catch (error) {
        console.error('Error creating/updating MemberSettings:', error);
        // Don't throw error as it would rollback the user creation/update
    }
});

// Post-update middleware to handle MemberSettings when user status changes
userSchema.post('findOneAndUpdate', async function (doc) {
    try {
        if (doc) {
            const FinancialYear = mongoose.model('FinancialYear');
            const MemberSettings = mongoose.model('MemberSettings');

            // Get the currently active financial year
            const activeYear = await FinancialYear.findOne({ currentlyActive: true });

            if (activeYear) {
                if (doc.isActive && doc.status === 'active') {
                    // User is active, ensure MemberSettings exists
                    const existingSettings = await MemberSettings.findOne({
                        financeYearId: activeYear._id,
                        staffId: doc._id
                    });

                    if (!existingSettings) {
                        // Create new MemberSettings
                        const newSettings = new MemberSettings({
                            financeYearId: activeYear._id,
                            staffId: doc._id,
                            shareAmount: activeYear.memberShareAmount,
                            notes: `Auto-created for reactivated user ${doc.employeeId}`
                        });

                        await newSettings.save();
                        console.log(`Created MemberSettings for reactivated user ${doc.employeeId} in ${activeYear.financeYear}`);
                    }
                } else {
                    // User is inactive, deactivate MemberSettings
                    await MemberSettings.updateMany(
                        { staffId: doc._id, isActive: true },
                        { isActive: false, notes: `User deactivated: ${doc.status}` }
                    );
                    console.log(`Deactivated MemberSettings for user ${doc.employeeId}`);
                }
            }
        }
    } catch (error) {
        console.error('Error updating MemberSettings after user update:', error);
    }
});

// Post-remove middleware to handle MemberSettings when user is deleted
userSchema.post('findOneAndDelete', async function (doc) {
    try {
        if (doc) {
            const MemberSettings = mongoose.model('MemberSettings');

            // Deactivate all MemberSettings for this user
            await MemberSettings.updateMany(
                { staffId: doc._id, isActive: true },
                { isActive: false, notes: `User deleted` }
            );

            console.log(`Deactivated MemberSettings for deleted user ${doc.employeeId}`);
        }
    } catch (error) {
        console.error('Error deactivating MemberSettings after user deletion:', error);
    }
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

// Static method to sync MemberSettings for all active users
userSchema.statics.syncMemberSettings = async function (financeYearId = null) {
    try {
        const FinancialYear = mongoose.model('FinancialYear');
        const MemberSettings = mongoose.model('MemberSettings');

        // Get the target financial year (active if not specified)
        let targetYear;
        if (financeYearId) {
            targetYear = await FinancialYear.findById(financeYearId);
        } else {
            targetYear = await FinancialYear.findOne({ currentlyActive: true });
        }

        if (!targetYear || !targetYear.memberShareAmount) {
            throw new Error('No active financial year found or memberShareAmount not set');
        }

        // Get all active users
        const activeUsers = await this.find({
            isActive: true,
            status: 'active'
        }).select('_id employeeId');

        if (activeUsers.length === 0) {
            return { message: 'No active users found', synced: 0 };
        }

        // Get existing MemberSettings for this financial year
        const existingSettings = await MemberSettings.find({
            financeYearId: targetYear._id,
            isActive: true
        });

        const existingMap = new Map();
        existingSettings.forEach(setting => {
            existingMap.set(setting.staffId.toString(), setting);
        });

        let created = 0;
        let updated = 0;
        let skipped = 0;

        // Process each user
        for (const user of activeUsers) {
            const existing = existingMap.get(user._id.toString());

            if (existing) {
                // Update if amount changed
                if (existing.shareAmount !== targetYear.memberShareAmount) {
                    existing.shareAmount = targetYear.memberShareAmount;
                    existing.notes = `Auto-updated from default amount`;
                    await existing.save();
                    updated++;
                } else {
                    skipped++;
                }
            } else {
                // Create new MemberSettings
                const newSettings = new MemberSettings({
                    financeYearId: targetYear._id,
                    staffId: user._id,
                    shareAmount: targetYear.memberShareAmount,
                    notes: `Auto-created during sync for user ${user.employeeId}`
                });

                await newSettings.save();
                created++;
            }
        }

        return {
            message: `MemberSettings sync completed for ${targetYear.financeYear}`,
            financialYear: targetYear.financeYear,
            totalUsers: activeUsers.length,
            created,
            updated,
            skipped,
            totalProcessed: created + updated + skipped
        };

    } catch (error) {
        console.error('Error syncing MemberSettings:', error);
        throw error;
    }
};

// Static method to get users with their MemberSettings
userSchema.statics.getUsersWithMemberSettings = async function (financeYearId = null) {
    try {
        const FinancialYear = mongoose.model('FinancialYear');
        const MemberSettings = mongoose.model('MemberSettings');

        // Get the target financial year
        let targetYear;
        if (financeYearId) {
            targetYear = await FinancialYear.findById(financeYearId);
        } else {
            targetYear = await FinancialYear.findOne({ currentlyActive: true });
        }

        if (!targetYear) {
            throw new Error('No financial year found');
        }

        // Get all active users
        const users = await this.find({
            isActive: true,
            status: 'active'
        }).select('_id employeeId firstName lastName designation department');

        // Get MemberSettings for this financial year
        const memberSettings = await MemberSettings.find({
            financeYearId: targetYear._id,
            isActive: true
        });

        const settingsMap = new Map();
        memberSettings.forEach(setting => {
            settingsMap.set(setting.staffId.toString(), setting);
        });

        // Combine user data with MemberSettings
        const usersWithSettings = users.map(user => {
            const settings = settingsMap.get(user._id.toString());
            return {
                ...user.toObject(),
                memberSettings: settings ? {
                    shareAmount: settings.shareAmount,
                    isCustom: true,
                    notes: settings.notes
                } : {
                    shareAmount: targetYear.memberShareAmount,
                    isCustom: false,
                    notes: 'Using default amount'
                }
            };
        });

        return {
            financialYear: targetYear.financeYear,
            defaultAmount: targetYear.memberShareAmount,
            totalUsers: usersWithSettings.length,
            users: usersWithSettings.sort((a, b) => a.firstName.localeCompare(b.firstName))
        };

    } catch (error) {
        console.error('Error getting users with MemberSettings:', error);
        throw error;
    }
};

module.exports = mongoose.model('User', userSchema); 