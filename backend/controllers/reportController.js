const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const FuelRecord = require('../models/FuelRecord');
const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
    try {
        const [
            totalVehicles,
            availableVehicles,
            vehiclesInMaintenance,
            activeDrivers,
            activeTrips,
            completedTrips,
            scheduledMaintenance,
            totalFuelCost
        ] = await Promise.all([
            Vehicle.countDocuments(),
            Vehicle.countDocuments({ status: 'available' }),
            Vehicle.countDocuments({ status: 'maintenance' }),
            Driver.countDocuments({ status: 'active' }),
            Trip.countDocuments({ status: 'in_progress' }),
            Trip.countDocuments({ status: 'completed' }),
            Maintenance.countDocuments({ status: 'scheduled' }),
            FuelRecord.aggregate([
                { $group: { _id: null, total: { $sum: '$totalCost' } } }
            ])
        ]);

        res.json({
            success: true,
            stats: {
                totalVehicles,
                availableVehicles,
                vehiclesInMaintenance,
                activeDrivers,
                activeTrips,
                completedTrips,
                scheduledMaintenance,
                totalFuelCost: totalFuelCost[0]?.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    }
};

// @desc    Get vehicle usage report
// @route   GET /api/reports/vehicle-usage
// @access  Private
exports.getVehicleUsageReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const matchStage = {};
        if (startDate && endDate) {
            matchStage.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const report = await Trip.aggregate([
            { $match: { ...matchStage, status: 'completed' } },
            {
                $group: {
                    _id: '$vehicle',
                    totalTrips: { $sum: 1 },
                    totalDistance: { $sum: '$distance' },
                    totalExpenses: { $sum: '$totalExpenses' },
                    averageDistance: { $avg: '$distance' }
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
                    registrationNumber: '$vehicle.registrationNumber',
                    vehicleType: '$vehicle.type',
                    brand: '$vehicle.brand',
                    model: '$vehicle.model',
                    totalTrips: 1,
                    totalDistance: 1,
                    totalExpenses: 1,
                    averageDistance: { $round: ['$averageDistance', 2] }
                }
            },
            { $sort: { totalTrips: -1 } }
        ]);

        res.json({
            success: true,
            report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating vehicle usage report'
        });
    }
};

// @desc    Get driver activity report
// @route   GET /api/reports/driver-activity
// @access  Private
exports.getDriverActivityReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const matchStage = {};
        if (startDate && endDate) {
            matchStage.startDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const report = await Trip.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$driver',
                    totalTrips: { $sum: 1 },
                    completedTrips: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    totalDistance: { $sum: '$distance' },
                    totalExpenses: { $sum: '$totalExpenses' }
                }
            },
            {
                $lookup: {
                    from: 'drivers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'driver'
                }
            },
            { $unwind: '$driver' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'driver.userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 1,
                    driverName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
                    licenseNumber: '$driver.licenseNumber',
                    totalTrips: 1,
                    completedTrips: 1,
                    completionRate: {
                        $round: [
                            { $multiply: [{ $divide: ['$completedTrips', '$totalTrips'] }, 100] },
                            1
                        ]
                    },
                    totalDistance: 1,
                    totalExpenses: 1
                }
            },
            { $sort: { totalTrips: -1 } }
        ]);

        res.json({
            success: true,
            report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating driver activity report'
        });
    }
};

// @desc    Get maintenance report
// @route   GET /api/reports/maintenance
// @access  Private
exports.getMaintenanceReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const matchStage = {};
        if (startDate && endDate) {
            matchStage.scheduledDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const report = await Maintenance.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$vehicle',
                    totalServices: { $sum: 1 },
                    completedServices: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    totalCost: { $sum: '$cost' },
                    averageCost: { $avg: '$cost' }
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
                    registrationNumber: '$vehicle.registrationNumber',
                    vehicleType: '$vehicle.type',
                    totalServices: 1,
                    completedServices: 1,
                    pendingServices: { $subtract: ['$totalServices', '$completedServices'] },
                    totalCost: 1,
                    averageCost: { $round: ['$averageCost', 2] }
                }
            },
            { $sort: { totalCost: -1 } }
        ]);

        // Get upcoming maintenance
        const upcomingMaintenance = await Maintenance.find({
            status: 'scheduled',
            scheduledDate: { $gte: new Date() }
        })
            .populate('vehicle', 'registrationNumber brand model')
            .sort({ scheduledDate: 1 })
            .limit(10);

        res.json({
            success: true,
            report,
            upcomingMaintenance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating maintenance report'
        });
    }
};

// @desc    Get fuel consumption report
// @route   GET /api/reports/fuel-consumption
// @access  Private
exports.getFuelConsumptionReport = async (req, res) => {
    try {
        const { startDate, endDate, vehicleId } = req.query;

        const matchStage = {};
        if (startDate && endDate) {
            matchStage.fuelDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (vehicleId) {
            matchStage.vehicle = mongoose.Types.ObjectId(vehicleId);
        }

        const report = await FuelRecord.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        vehicle: '$vehicle',
                        month: { $month: '$fuelDate' },
                        year: { $year: '$fuelDate' }
                    },
                    totalFuel: { $sum: '$quantity' },
                    totalCost: { $sum: '$totalCost' },
                    avgPricePerLiter: { $avg: '$costPerLiter' },
                    refuelCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'vehicles',
                    localField: '_id.vehicle',
                    foreignField: '_id',
                    as: 'vehicle'
                }
            },
            { $unwind: '$vehicle' },
            {
                $project: {
                    _id: 0,
                    vehicle: '$vehicle.registrationNumber',
                    vehicleType: '$vehicle.type',
                    month: '$_id.month',
                    year: '$_id.year',
                    totalFuel: 1,
                    totalCost: 1,
                    avgPricePerLiter: { $round: ['$avgPricePerLiter', 2] },
                    refuelCount: 1
                }
            },
            { $sort: { year: -1, month: -1 } }
        ]);

        // Calculate summary
        const summary = report.reduce((acc, item) => {
            acc.totalFuel += item.totalFuel;
            acc.totalCost += item.totalCost;
            acc.totalRefuels += item.refuelCount;
            return acc;
        }, { totalFuel: 0, totalCost: 0, totalRefuels: 0 });

        res.json({
            success: true,
            summary: {
                ...summary,
                averagePricePerLiter: summary.totalFuel > 0
                    ? (summary.totalCost / summary.totalFuel).toFixed(2)
                    : 0
            },
            report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating fuel consumption report'
        });
    }
};

// @desc    Get expense report
// @route   GET /api/reports/expenses
// @access  Private
exports.getExpenseReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const matchStage = { status: 'completed' };
        if (startDate && endDate) {
            matchStage.startDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const report = await Trip.aggregate([
            { $match: matchStage },
            { $unwind: '$expenses' },
            {
                $group: {
                    _id: '$expenses.type',
                    totalAmount: { $sum: '$expenses.amount' },
                    count: { $sum: 1 },
                    averageAmount: { $avg: '$expenses.amount' }
                }
            },
            {
                $project: {
                    _id: 0,
                    expenseType: '$_id',
                    totalAmount: 1,
                    count: 1,
                    averageAmount: { $round: ['$averageAmount', 2] },
                    percentage: 0
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);

        // Calculate percentages
        const grandTotal = report.reduce((sum, item) => sum + item.totalAmount, 0);
        report.forEach(item => {
            item.percentage = grandTotal > 0
                ? ((item.totalAmount / grandTotal) * 100).toFixed(1)
                : 0;
        });

        res.json({
            success: true,
            grandTotal,
            report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating expense report'
        });
    }
};