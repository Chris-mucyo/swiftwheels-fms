const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    maintenanceType: {
        type: String,
        enum: ['routine_service', 'repair', 'inspection', 'tire_change', 'oil_change', 'other'],
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    completedDate: {
        type: Date
    },
    cost: {
        type: Number,
        default: 0
    },
    serviceProvider: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    notes: {
        type: String,
        trim: true
    },
    nextServiceMileage: {
        type: Number
    },
    nextServiceDate: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);