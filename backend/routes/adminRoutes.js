// routes/adminRoutes.js
const express = require('express');
const router  = express.Router();
const {
  getAdmins,
  updateAdminStatus,
  updateAdminRole,
  deleteAdmin
} = require('../controllers/adminController');
const { protect, superAdminOnly } = require('../middleware/authMiddleware');

// All routes are private and restricted to superadmins only
router.use(protect, superAdminOnly);

router.get('/',               getAdmins);
router.put('/:id/status',     updateAdminStatus);
router.put('/:id/role',       updateAdminRole);
router.delete('/:id',         deleteAdmin);

module.exports = router;
