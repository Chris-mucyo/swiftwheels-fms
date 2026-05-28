const express = require('express');
const router = express.Router();
const {
    getTrips,
    createTrip,
    updateTrip
} = require('../controllers/tripController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getTrips)
    .post(createTrip);

router.route('/:id')
    .put(updateTrip);

module.exports = router;