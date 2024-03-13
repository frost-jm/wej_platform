const express = require('express');
const router = express.Router();

// Entry Controller
const permissions = require('../controllers/permission.controller');

// Insert Permissions
router.post('/add', permissions.create);

// View Permission
router.get('/', permissions.view);

// DELETE entry
router.delete('/all', permissions.deleteAll);

module.exports = router;
