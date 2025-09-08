const User = require('../models/User');
const ResponseHandler = require('../helpers/responseHandler');
const RedisHelper = require('../helpers/redisHelper');
const config = require('../config');

class AuthService {
    // Register new user
    static async register(userData) {
        const {
            employeeId, firstName, lastName, email, phone, password,
            role = 'user', type = 'full-time', joinDate = new Date(),
            address, designation, currentSalary, emergencyContact
        } = userData;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { employeeId }]
        });
        if (existingUser) {
            throw new Error('User already exists this email or employee ID');
        }

        // Create user
        const user = await User.create({
            employeeId,
            firstName,
            lastName,
            email,
            phone,
            password,
            role,
            type,
            joinDate,
            address,
            designation,
            currentSalary,
            emergencyContact
        });

        // Generate token
        const token = user.getSignedJwtToken();

        // Update last login without triggering validation
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        // Cache user data
        await RedisHelper.set(`user:${user._id}`, user.fullProfile, 3600);

        return {
            user: user.fullProfile,
            token
        };
    }

    // Login user
    static async login(credentials) {
        const { email, password } = credentials;

        // Validate email and password
        if (!email || !password) {
            throw new Error('Please provide email and password');
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new Error('Account is deactivated');
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        // Generate token
        const token = user.getSignedJwtToken();

        // Update last login without triggering validation
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        // Cache user data
        await RedisHelper.set(`user:${user._id}`, user.fullProfile, 3600);

        return {
            user: user.fullProfile,
            token
        };
    }

    // Get current user
    static async getCurrentUser(userId) {
        // Try to get from cache first
        const cachedUser = await RedisHelper.get(`user:${userId}`);
        if (cachedUser) {
            return cachedUser;
        }

        // Get from database
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Cache user data
        await RedisHelper.set(`user:${user._id}`, user.fullProfile, 3600);

        return user.fullProfile;
    }

    // Update user profile
    static async updateProfile(userId, updateData) {
        const allowedFields = [
            'firstName', 'lastName', 'phone', 'avatar', 'address',
            'designation', 'currentSalary', 'emergencyContact'
        ];
        const filteredData = {};

        // Only allow specific fields to be updated
        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredData[key] = updateData[key];
            }
        });

        const user = await User.findByIdAndUpdate(
            userId,
            filteredData,
            { new: true, runValidators: true }
        );

        if (!user) {
            throw new Error('User not found');
        }

        // Update cache
        await RedisHelper.set(`user:${user._id}`, user.fullProfile, 3600);

        return user.fullProfile;
    }

    // Change password
    static async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findById(userId).select('+password');
        if (!user) {
            throw new Error('User not found');
        }

        // Check current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            throw new Error('Current password is incorrect');
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Clear user cache
        await RedisHelper.del(`user:${userId}`);

        return { message: 'Password updated successfully' };
    }

    // Logout (invalidate token)
    static async logout(userId) {
        // Add token to blacklist (you can implement this with Redis)
        await RedisHelper.set(`blacklist:${userId}`, Date.now(), 86400); // 24 hours

        // Clear user cache
        await RedisHelper.del(`user:${userId}`);

        return { message: 'Logged out successfully' };
    }

    // Refresh token
    static async refreshToken(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const token = user.getSignedJwtToken();

        return { token };
    }

    // Get all users (admin only)
    static async getAllUsers(page = 1, limit = 10, search = '') {
        const skip = (page - 1) * limit;

        let query = {};
        if (search) {
            query = {
                $or: [
                    { employeeId: { $regex: search, $options: 'i' } },
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } },
                    { designation: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(query)
        ]);

        return {
            users: users.map(user => user.fullProfile),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // Deactivate user (admin only)
    static async deactivateUser(userId) {
        const user = await User.findByIdAndUpdate(
            userId,
            { isActive: false },
            { new: true }
        );

        if (!user) {
            throw new Error('User not found');
        }

        // Clear user cache
        await RedisHelper.del(`user:${userId}`);

        return user.fullProfile;
    }

    // Activate user (admin only)
    static async activateUser(userId) {
        const user = await User.findByIdAndUpdate(
            userId,
            { isActive: true },
            { new: true }
        );

        if (!user) {
            throw new Error('User not found');
        }

        // Update cache
        await RedisHelper.set(`user:${user._id}`, user.fullProfile, 3600);

        return user.fullProfile;
    }

    static async createMember(userData) {
        const {
            employeeId,
            firstName,
            lastName,
            email,
            phone,
            password,
            role = 'user',
            type = 'full-time',
            joinDate = new Date(),
            address,
            department,
            designation,
            currentSalary,
            emergencyContact
        } = userData;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { employeeId }]
        });
        if (existingUser) {
            throw new Error('User already exists with this email or employee ID');
        }

        // Create user
        const user = await User.create({
            employeeId,
            firstName,
            lastName,
            email,
            phone,
            password,
            role,
            type,
            joinDate,
            address,
            department,
            designation,
            currentSalary,
            emergencyContact
        });

        // Generate token
        const token = user.getSignedJwtToken();

        // Update last login without triggering validation
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        // Cache user data
        await RedisHelper.set(`user:${user._id}`, user.fullProfile, 3600);

        return {
            user: user.fullProfile,
            token
        };
    }

    // Update member (admin only)
    static async updateMember(userId, updateData) {
        const {
            employeeId,
            firstName,
            lastName,
            email,
            phone,
            type,
            address,
            department,
            designation,
            currentSalary,
            emergencyContact
        } = updateData;

        // Check if user exists
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            throw new Error('User not found');
        }

        // Check if email or employeeId is being changed and if it conflicts with another user
        if (email && email !== existingUser.email) {
            const emailExists = await User.findOne({ email, _id: { $ne: userId } });
            if (emailExists) {
                throw new Error('Email already exists with another user');
            }
        }

        if (employeeId && employeeId !== existingUser.employeeId) {
            const employeeIdExists = await User.findOne({ employeeId, _id: { $ne: userId } });
            if (employeeIdExists) {
                throw new Error('Employee ID already exists with another user');
            }
        }

        // Prepare update object with only provided fields
        const updateObject = {};
        if (employeeId) updateObject.employeeId = employeeId;
        if (firstName) updateObject.firstName = firstName;
        if (lastName) updateObject.lastName = lastName;
        if (email) updateObject.email = email;
        if (phone) updateObject.phone = phone;
        if (type) updateObject.type = type;
        if (address) updateObject.address = address;
        if (department) updateObject.department = department;
        if (designation) updateObject.designation = designation;
        if (currentSalary !== undefined) updateObject.currentSalary = currentSalary;
        if (emergencyContact) updateObject.emergencyContact = emergencyContact;

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateObject,
            { new: true, runValidators: true }
        );

        // Clear user cache
        await RedisHelper.del(`user:${userId}`);

        return updatedUser.fullProfile;
    }
}

module.exports = AuthService; 