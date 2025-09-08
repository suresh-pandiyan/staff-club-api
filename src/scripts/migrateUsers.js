const mongoose = require('mongoose');
const config = require('../config');

// Connect to MongoDB
mongoose.connect(config.database.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const User = require('../models/User');

async function migrateUsers() {
    try {
        console.log('Starting user migration...');
        
        // Find all users that might have missing address or emergency contact fields
        const users = await User.find({
            $or: [
                { 'address.street': { $exists: false } },
                { 'address.street': null },
                { 'address.street': '' },
                { 'emergencyContact.name': { $exists: false } },
                { 'emergencyContact.name': null },
                { 'emergencyContact.name': '' }
            ]
        });

        console.log(`Found ${users.length} users that need migration`);

        for (const user of users) {
            let needsUpdate = false;
            const updateData = {};

            // Check and set default address values
            if (!user.address) {
                updateData.address = {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: 'India'
                };
                needsUpdate = true;
            } else {
                if (!user.address.street) {
                    updateData['address.street'] = '';
                    needsUpdate = true;
                }
                if (!user.address.city) {
                    updateData['address.city'] = '';
                    needsUpdate = true;
                }
                if (!user.address.state) {
                    updateData['address.state'] = '';
                    needsUpdate = true;
                }
                if (!user.address.zipCode) {
                    updateData['address.zipCode'] = '';
                    needsUpdate = true;
                }
                if (!user.address.country) {
                    updateData['address.country'] = 'India';
                    needsUpdate = true;
                }
            }

            // Check and set default emergency contact values
            if (!user.emergencyContact) {
                updateData.emergencyContact = {
                    name: '',
                    relationship: '',
                    phone: '',
                    address: ''
                };
                needsUpdate = true;
            } else {
                if (!user.emergencyContact.name) {
                    updateData['emergencyContact.name'] = '';
                    needsUpdate = true;
                }
                if (!user.emergencyContact.relationship) {
                    updateData['emergencyContact.relationship'] = '';
                    needsUpdate = true;
                }
                if (!user.emergencyContact.phone) {
                    updateData['emergencyContact.phone'] = '';
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                await User.findByIdAndUpdate(user._id, updateData, { runValidators: false });
                console.log(`Updated user: ${user.email}`);
            }
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateUsers();
