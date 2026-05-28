const express = require('express');
const router = express.Router();
const {
    getVehicles,
    getVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getVehicles)
    .post(authorize('administrator', 'fleet_manager'), createVehicle);

router.route('/:id')
    .get(getVehicle)
    .put(authorize('administrator', 'fleet_manager'), updateVehicle)
    .delete(authorize('administrator'), deleteVehicle);

module.exports = router;