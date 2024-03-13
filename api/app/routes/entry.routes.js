const express = require('express');
const router = express.Router();

// Entry Controller
const entries = require('../controllers/entry.controller');

// Create a new Entry
router.post('/create', entries.create);

// Retrieve all Entries
router.get('/view-entry', entries.findAll);

// Get total entries count and entries count grouped by pointsFor
router.get('/total', entries.getTotalCounts);

// Retrieve a single entry
router.get('/:id', entries.findEntry);

// Update entry
router.put('/edit/:id', entries.update);

// DELETE entry
router.put('/delete/:id', entries.delete);

module.exports = router;
