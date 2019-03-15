const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const seatRoutes = require('./seat.route');

const sqlAuthRoutes = require('./sqlauth.route');
const sqlUserRoutes = require('./sqluser.route');

const router = express.Router();

router.get('/status', (req, res) => res.send('OK'));


// router.use('/docs', express.static('docs'));

// router.use('/api', userRoutes);
router.use('/', authRoutes);
router.use('/seat', seatRoutes);
router.use('/user', userRoutes);

router.use('/sqlauth', sqlAuthRoutes);
router.use('/sqluser', sqlUserRoutes);

module.exports = router;
