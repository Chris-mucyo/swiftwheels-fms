const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    tripNumber: {
        type: String,
        unique: true,
        sparse: true // Allow null values temporarily
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

// Generate unique trip number before saving
tripSchema.pre('save', async function(next) {
    if (this.isNew && !this.tripNumber) {
        try {
            // Find the last trip to get the latest number
            const lastTrip = await mongoose.model('Trip')
                .findOne({})
                .sort({ createdAt: -1 })
                .select('tripNumber');

            let nextNumber = 1;
            if (lastTrip && lastTrip.tripNumber) {
                const lastNum = parseInt(lastTrip.tripNumber.split('-')[1]);
                nextNumber = lastNum + 1;
            }

            this.tripNumber = `TRIP-${String(nextNumber).padStart(6, '0')}`;
        } catch (error) {
            // If error, use timestamp-based number
            const timestamp = Date.now().toString().slice(-6);
            this.tripNumber = `TRIP-${timestamp}`;
        }
    }
    next();
});

module.exports = mongoose.model('Trip', tripSchema);