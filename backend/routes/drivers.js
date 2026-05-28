const express = require('express');
const router = express.Router();
const {
    getDrivers,
    getDriver,
    createDriver,
    updateDriver,
    assignVehicle
} = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getDrivers)
    .post(authorize('administrator'), createDriver);

router.route('/:id')
    .get(getDriver)
    .put(authorize('administrator'), updateDriver);

router.put('/:id/assign-vehicle', authorize('administrator', 'fleet_manager'), assignVehicle);

module.exports = router;