const express = require('express');

const router = express.Router();

/* Admin */

const adminAuthRoutes = require('./admin/auth.route');
const adminContractRoutes = require('./admin/contract.route');
const adminEmployerRoutes = require('./admin/employer.route');
const adminJobSeekerRoutes = require('./admin/jobseeker.route');
const adminJobRoutes = require('./admin/job.route');

/* Employer */

const employerAuthRoutes = require('./employer/auth.route');
const employerContractRoutes = require('./employer/contract.route');
const employerJobRoutes = require('./employer/job.route');


/* Jobseeker */

const jobseekerAuthRoutes = require('./jobseeker/auth.route');
const jobseekerJobRoutes = require('./jobseeker/job.route');
const jobseekerContractRoutes = require('./jobseeker/contract.route');

/* Media */

const mediaRoutes = require('./media.route');


/* =================================================================== */

/* Admin */

router.use('/admin', adminAuthRoutes);
router.use('/admin/contract', adminContractRoutes);
router.use('/admin/employer', adminEmployerRoutes);
router.use('/admin/jobseeker', adminJobSeekerRoutes);
router.use('/admin/job', adminJobRoutes);


/* Employer */

router.use('/employer', employerAuthRoutes);
router.use('/employer/contract', employerContractRoutes);
router.use('/employer/job', employerJobRoutes);

/* Jobseeker */

router.use('/jobseeker', jobseekerAuthRoutes);
router.use('/jobseeker/job', jobseekerJobRoutes);
router.use('/jobseeker/contract', jobseekerContractRoutes);

/* Media */

router.use('/media', mediaRoutes);


module.exports = router;
