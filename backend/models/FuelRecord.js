const mongoose = require('mongoose');

const fuelRecordSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, 'Vehicle is required']
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: [true, 'Driver is required']
    },
    fuelDate: {
        type: Date,
        required: [true, 'Fuel date is required'],
        default: Date.now
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative']
    },
    costPerLiter: {
        type: Number,
        required: [true, 'Cost per liter is required'],
        min: [0, 'Cost cannot be negative']
    },
    totalCost: {
        type: Number,
        default: 0
    },
    mileageAtRefuel: {
        type: Number,
        required: [true, 'Mileage at refuel is required']
    },
    fuelType: {
        type: String,
        enum: ['petrol', 'diesel', 'electric', 'cng'],
        required: [true, 'Fuel type is required']
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
    if (this.quantity && this.costPerLiter) {
        this.totalCost = this.quantity * this.costPerLiter;
    }
    next();
});

// Calculate total cost before update
fuelRecordSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();
    if (update.quantity && update.costPerLiter) {
        update.totalCost = update.quantity * update.costPerLiter;
    } else if (update.quantity) {
        // If only quantity is updated, we need to get the current costPerLiter
        update.totalCost = update.quantity * (update.costPerLiter || 0);
    }
    next();
});

module.exports = mongoose.model('FuelRecord', fuelRecordSchema);