const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getVehicleUsageReport,
    getDriverActivityReport,
    getMaintenanceReport,
    getFuelConsumptionReport,
    getExpenseReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/vehicle-usage', authorize('administrator', 'fleet_manager'), getVehicleUsageReport);
router.get('/driver-activity', authorize('administrator', 'fleet_manager'), getDriverActivityReport);
router.get('/maintenance', authorize('administrator', 'fleet_manager'), getMaintenanceReport);
router.get('/fuel-consumption', authorize('administrator', 'fleet_manager'), getFuelConsumptionReport);
router.get('/expenses', authorize('administrator', 'fleet_manager'), getExpenseReport);

module.exports = router;