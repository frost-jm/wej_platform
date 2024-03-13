const Permissions = require('../models/permissions.model');

exports.create = async (req, res) => {
	const newEntries = req.body;
  
	// Find the reviewee(s) from the newEntries array to remove duplicates
	const reviewees = newEntries.map((entry) => entry.reviewee);
  
	// Delete existing entries with the same reviewee
	Permissions.deleteByReviewees(reviewees, (err, result) => {
	  if (err) {
		console.error('Error deleting existing permissions:', err);
		res.status(500).json({ error: 'Internal server error' });
	  } else {
		
		Permissions.create(newEntries, (err, result) => {
		  if (err) {
			console.error('Error creating permissions:', err);
			res.status(500).json({ error: 'Internal server error' });
		  } else {
			res.status(200).json({ message: 'Permissions added successfully' });
		  }
		});
	  }
	});
  };

exports.view = function (req, res) {
	Permissions.view(function (err, permissions) {
		if (err) {
			console.error(err);
			return res.status(500).json({ message: 'Internal server error' });
		}
		res.json({ permissions });
	});
};

exports.deleteAll = async (req, res) => {
	Permissions.deleteAll((err, result) => {
		if (err) {
			console.error('Error deleting permissions:', err);
			res.status(500).json({ error: 'Internal server error' });
		} else {
			res.status(200).json({ message: 'All permissions deleted successfully' });
		}
	});
};
