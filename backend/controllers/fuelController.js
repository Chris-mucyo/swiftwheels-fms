const FuelRecord = require('../models/FuelRecord');
const Vehicle = require('../models/Vehicle');

// @desc    Get all fuel records
// @route   GET /api/fuel
// @access  Private
exports.getFuelRecords = async (req, res) => {
    try {
        let query = {};

        if (req.query.vehicle) query.vehicle = req.query.vehicle;
        if (req.query.startDate && req.query.endDate) {
            query.fuelDate = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
            };
        }

        const fuelRecords = await FuelRecord.find(query)
            .populate('vehicle', 'registrationNumber brand model')
            .populate({
                path: 'driver',
                populate: {
                    path: 'userId',
                    select: 'firstName lastName'
                }
            })
            .sort({ fuelDate: -1 });

        // Calculate total fuel cost
        const totalCost = fuelRecords.reduce((sum, record) => sum + record.totalCost, 0);
        const totalQuantity = fuelRecords.reduce((sum, record) => sum + record.quantity, 0);

        res.json({
            success: true,
            count: fuelRecords.length,
            summary: {
                totalCost,
                totalQuantity,
                averageCostPerLiter: totalQuantity > 0 ? (totalCost / totalQuantity).toFixed(2) : 0
            },
            fuelRecords
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching fuel records'
        });
    }
};

// @desc    Record fuel usage
// @route   POST /api/fuel
// @access  Private
exports.recordFuel = async (req, res) => {
    try {
        const fuelRecord = await FuelRecord.create(req.body);

        const populatedRecord = await FuelRecord.findById(fuelRecord._id)
            .populate('vehicle', 'registrationNumber')
            .populate({
                path: 'driver',
                populate: {
                    path: 'userId',
                    select: 'firstName lastName'
                }
            });

        res.status(201).json({
            success: true,
            fuelRecord: populatedRecord
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error recording fuel usage'
        });
    }
};

// @desc    Get fuel report
// @route   GET /api/fuel/report
// @access  Private
exports.getFuelReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const matchStage = {};
        if (startDate && endDate) {
            matchStage.fuelDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const report = await FuelRecord.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$vehicle',
                    totalFuel: { $sum: '$quantity' },
                    totalCost: { $sum: '$totalCost' },
                    recordCount: { $sum: 1 },
                    avgCostPerLiter: { $avg: '$costPerLiter' }
                }
            },
            {
                $lookup: {
                    from: 'vehicles',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'vehicle'
                }
            },
            { $unwind: '$vehicle' },
            {
                $project: {
                    _id: 1,
                    vehicleReg: '$vehicle.registrationNumber',
                    vehicleType: '$vehicle.type',
                    totalFuel: 1,
                    totalCost: 1,
                    recordCount: 1,
                    avgCostPerLiter: { $round: ['$avgCostPerLiter', 2] }
                }
            },
            { $sort: { totalCost: -1 } }
        ]);

        res.json({
            success: true,
            report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating fuel report'
        });
    }
};