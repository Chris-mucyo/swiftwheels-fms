const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private
exports.getTrips = async (req, res) => {
    try {
        let query = {};

        // Filters
        if (req.query.status) query.status = req.query.status;
        if (req.query.tripType) query.tripType = req.query.tripType;
        if (req.query.vehicle) query.vehicle = req.query.vehicle;
        if (req.query.driver) query.driver = req.query.driver;

        // Date range filter
        if (req.query.startDate && req.query.endDate) {
            query.startDate = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
            };
        }

        const trips = await Trip.find(query)
            .populate('vehicle', 'registrationNumber brand model')
            .populate('driver', 'licenseNumber')
            .populate({
                path: 'driver',
                populate: {
                    path: 'userId',
                    select: 'firstName lastName'
                }
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: trips.length,
            trips
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching trips'
        });
    }
};

// @desc    Create trip
// @route   POST /api/trips
// @access  Private
exports.createTrip = async (req, res) => {
    try {
        const trip = await Trip.create(req.body);

        // Update vehicle status
        await Vehicle.findByIdAndUpdate(req.body.vehicle, { status: 'assigned' });

        const populatedTrip = await Trip.findById(trip._id)
            .populate('vehicle', 'registrationNumber brand model')
            .populate('driver', 'licenseNumber');

        res.status(201).json({
            success: true,
            trip: populatedTrip
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating trip'
        });
    }
};

// @desc    Update trip status
// @route   PUT /api/trips/:id
// @access  Private
exports.updateTrip = async (req, res) => {
    try {
        const trip = await Trip.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('vehicle', 'registrationNumber brand model')
            .populate('driver', 'licenseNumber');

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        // If trip completed, update vehicle status and calculate distance
        if (req.body.status === 'completed' && trip.endMileage) {
            trip.distance = trip.endMileage - trip.startMileage;
            await trip.save();

            // Update vehicle mileage
            await Vehicle.findByIdAndUpdate(trip.vehicle, {
                currentMileage: trip.endMileage,
                status: 'available'
            });
        }

        res.json({
            success: true,
            trip
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating trip'
        });
    }
};