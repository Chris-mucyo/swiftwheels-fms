const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');

// @desc    Get all maintenance records
// @route   GET /api/maintenance
// @access  Private
exports.getMaintenanceRecords = async (req, res) => {
    try {
        let query = {};

        if (req.query.status) query.status = req.query.status;
        if (req.query.vehicle) query.vehicle = req.query.vehicle;
        if (req.query.priority) query.priority = req.query.priority;

        const records = await Maintenance.find(query)
            .populate('vehicle', 'registrationNumber brand model')
            .sort({ scheduledDate: 1 });

        res.json({
            success: true,
            count: records.length,
            records
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching maintenance records'
        });
    }
};

// @desc    Schedule maintenance
// @route   POST /api/maintenance
// @access  Private (Admin, Fleet Manager)
exports.scheduleMaintenance = async (req, res) => {
    try {
        const maintenance = await Maintenance.create(req.body);

        // Update vehicle status to maintenance
        if (req.body.status === 'in_progress') {
            await Vehicle.findByIdAndUpdate(req.body.vehicle, {
                status: 'maintenance'
            });
        }

        const populatedRecord = await Maintenance.findById(maintenance._id)
            .populate('vehicle', 'registrationNumber brand model');

        res.status(201).json({
            success: true,
            maintenance: populatedRecord
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error scheduling maintenance'
        });
    }
};

// @desc    Update maintenance record
// @route   PUT /api/maintenance/:id
// @access  Private (Admin, Fleet Manager)
exports.updateMaintenance = async (req, res) => {
    try {
        const maintenance = await Maintenance.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('vehicle', 'registrationNumber brand model');

        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance record not found'
            });
        }

        // Update vehicle status based on maintenance completion
        if (req.body.status === 'completed') {
            await Vehicle.findByIdAndUpdate(maintenance.vehicle._id, {
                status: 'available'
            });
        } else if (req.body.status === 'in_progress') {
            await Vehicle.findByIdAndUpdate(maintenance.vehicle._id, {
                status: 'maintenance'
            });
        }

        res.json({
            success: true,
            maintenance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating maintenance record'
        });
    }
};