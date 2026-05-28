const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    tripNumber: {
        type: String,
        unique: true
    },
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
    tripType: {
        type: String,
        enum: ['delivery', 'rental', 'passenger_transport', 'goods_transport'],
        required: true
    },
    startLocation: {
        type: String,
        required: true,
        trim: true
    },
    destination: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    startMileage: {
        type: Number,
        required: true
    },
    endMileage: {
        type: Number
    },
    distance: {
        type: Number
    },
    expenses: [{
        type: {
            type: String,
            enum: ['fuel', 'toll', 'parking', 'food', 'accommodation', 'other']
        },
        amount: Number,
        description: String,
        date: Date
    }],
    totalExpenses: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Generate trip number before saving
tripSchema.pre('save', async function(next) {
    if (!this.tripNumber) {
        const count = await mongoose.model('Trip').countDocuments();
        this.tripNumber = `TRIP-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Trip', tripSchema);