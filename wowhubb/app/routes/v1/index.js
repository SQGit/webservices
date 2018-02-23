const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const eventRoutes = require('./event.route');
const mediaRoutes = require('./media.route');
const trialRoutes = require('./trial.route');
const networkRoutes = require('./network.route');
const providerRoutes = require('./provider.route');

const adminRoutes = require('./admin.route');

// TEST

const eventTestRoutes = require('./eventtest.route');

const router = express.Router();

router.get('/status', (req, res) => res.send('OK'));


// router.use('/docs', express.static('docs'));

router.use('/user', userRoutes);
router.use('/', authRoutes);
router.use('/event', eventRoutes);
router.use('/media', mediaRoutes);
router.use('/trial', trialRoutes);
router.use('/network', networkRoutes);
router.use('/provider', providerRoutes);

router.use('/admin', adminRoutes);

// TEST

router.use('/eventtest', eventTestRoutes);

module.exports = router;
