const mongoose = require('mongoose');

const fuelRecordSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    fuelDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    quantity: {
        type: Number, // liters
        required: true
    },
    costPerLiter: {
        type: Number,
        required: true
    },
    totalCost: {
        type: Number,
        required: true
    },
    mileageAtRefuel: {
        type: Number,
        required: true
    },
    fuelType: {
        type: String,
        enum: ['petrol', 'diesel', 'electric', 'cng'],
        required: true
    },
    station: {
        type: String,
        trim: true
    },
    receiptNumber: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Calculate total cost before saving
fuelRecordSchema.pre('save', function(next) {
    this.totalCost = this.quantity * this.costPerLiter;
    next();
});

module.exports = mongoose.model('FuelRecord', fuelRecordSchema);