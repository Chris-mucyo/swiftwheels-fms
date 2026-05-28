const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    registrationNumber: {
        type: String,
        required: [true, 'Registration number is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Vehicle type is required'],
        enum: ['truck', 'bus', 'van', 'car']
    },
    brand: {
        type: String,
        required: [true, 'Brand is required'],
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Model is required'],
        trim: true
    },
    year: {
        type: Number,
        required: [true, 'Year is required']
    },
    color: {
        type: String,
        trim: true
    },
    capacity: {
        type: String,
        trim: true
    },
    fuelType: {
        type: String,
        enum: ['petrol', 'diesel', 'electric', 'hybrid'],
        default: 'diesel'
    },
    status: {
        type: String,
        enum: ['available', 'assigned', 'maintenance', 'retired'],
        default: 'available'
    },
    currentMileage: {
        type: Number,
        default: 0
    },
    insuranceExpiry: {
        type: Date
    },
    roadTaxExpiry: {
        type: Date
    },
    assignedDriver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Vehicle', vehicleSchema);