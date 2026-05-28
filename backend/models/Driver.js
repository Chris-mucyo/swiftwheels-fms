const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    licenseNumber: {
        type: String,
        required: [true, 'License number is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    licenseExpiry: {
        type: Date,
        required: [true, 'License expiry date is required']
    },
    address: {
        type: String,
        trim: true
    },
    emergencyContact: {
        name: String,
        phone: String,
        relationship: String
    },
    assignedVehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    experience: {
        type: Number, // years
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Driver', driverSchema);