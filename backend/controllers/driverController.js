const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private
exports.getDrivers = async (req, res) => {
    try {
        let query = {};

        if (req.query.status) query.status = req.query.status;
        if (req.query.search) {
            query.$or = [
                { licenseNumber: { $regex: req.query.search, $options: 'i' } },
                { 'userId.firstName': { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const drivers = await Driver.find(query)
            .populate('userId', 'firstName lastName email phone')
            .populate('assignedVehicle', 'registrationNumber brand model')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: drivers.length,
            drivers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching drivers'
        });
    }
};

// @desc    Get single driver
// @route   GET /api/drivers/:id
// @access  Private
exports.getDriver = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id)
            .populate('userId', 'firstName lastName email phone')
            .populate('assignedVehicle', 'registrationNumber brand model');

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.json({
            success: true,
            driver
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching driver'
        });
    }
};

// @desc    Create driver
// @route   POST /api/drivers
// @access  Private (Admin only)
exports.createDriver = async (req, res) => {
    try {
        const driver = await Driver.create(req.body);

        const populatedDriver = await Driver.findById(driver._id)
            .populate('userId', 'firstName lastName email')
            .populate('assignedVehicle', 'registrationNumber');

        res.status(201).json({
            success: true,
            driver: populatedDriver
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating driver record'
        });
    }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Private (Admin only)
exports.updateDriver = async (req, res) => {
    try {
        const driver = await Driver.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('userId', 'firstName lastName email');

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.json({
            success: true,
            driver
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating driver'
        });
    }
};

// @desc    Assign vehicle to driver
// @route   PUT /api/drivers/:id/assign-vehicle
// @access  Private (Admin, Fleet Manager)
exports.assignVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.body;

        // Check if vehicle exists and is available
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        if (vehicle.status === 'assigned' && vehicle.assignedDriver?.toString() !== req.params.id) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle is already assigned to another driver'
            });
        }

        // Update driver with assigned vehicle
        const driver = await Driver.findByIdAndUpdate(
            req.params.id,
            { assignedVehicle: vehicleId },
            { new: true }
        ).populate('assignedVehicle', 'registrationNumber brand model');

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // Update vehicle status and assign driver
        vehicle.status = 'assigned';
        vehicle.assignedDriver = driver._id;
        await vehicle.save();

        res.json({
            success: true,
            driver
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error assigning vehicle'
        });
    }
};