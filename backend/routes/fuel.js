const express = require('express');
const router = express.Router();
const {
    getFuelRecords,
    recordFuel,
    getFuelReport
} = require('../controllers/fuelController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getFuelRecords)
    .post(recordFuel);

router.get('/report', getFuelReport);

module.exports = router;