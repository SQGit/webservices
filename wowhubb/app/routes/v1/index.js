const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const eventRoutes = require('./event.route');
const mediaRoutes = require('./media.route');

const router = express.Router();

router.get('/status', (req, res) => res.send('OK'));


// router.use('/docs', express.static('docs'));

router.use('/user', userRoutes);
router.use('/', authRoutes);
router.use('/event', eventRoutes);
router.use('/media', mediaRoutes);

module.exports = router;
