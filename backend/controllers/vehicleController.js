const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private
exports.getVehicles = async (req, res) => {
    try {
        let query = {};

        // Filter options
        if (req.query.status) query.status = req.query.status;
        if (req.query.type) query.type = req.query.type;
        if (req.query.search) {
            query.$or = [
                { registrationNumber: { $regex: req.query.search, $options: 'i' } },
                { brand: { $regex: req.query.search, $options: 'i' } },
                { model: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const vehicles = await Vehicle.find(query)
            .populate('assignedDriver', 'licenseNumber userId')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: vehicles.length,
            vehicles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching vehicles'
        });
    }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
exports.getVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id)
            .populate('assignedDriver', 'licenseNumber userId');

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.json({
            success: true,
            vehicle
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching vehicle'
        });
    }
};

// @desc    Create vehicle
// @route   POST /api/vehicles
// @access  Private (Admin, Fleet Manager)
exports.createVehicle = async (req, res) => {
    try {
        // Check if registration number already exists
        const existingVehicle = await Vehicle.findOne({
            registrationNumber: req.body.registrationNumber
        });

        if (existingVehicle) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle with this registration number already exists'
            });
        }

        const vehicle = await Vehicle.create(req.body);

        res.status(201).json({
            success: true,
            vehicle
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating vehicle'
        });
    }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Admin, Fleet Manager)
exports.updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.json({
            success: true,
            vehicle
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating vehicle'
        });
    }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Admin only)
exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.json({
            success: true,
            message: 'Vehicle deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting vehicle'
        });
    }
};