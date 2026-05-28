const express = require('express');
const router = express.Router();
const {
    getMaintenanceRecords,
    scheduleMaintenance,
    updateMaintenance
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getMaintenanceRecords)
    .post(authorize('administrator', 'fleet_manager'), scheduleMaintenance);

router.route('/:id')
    .put(authorize('administrator', 'fleet_manager'), updateMaintenance);

module.exports = router;