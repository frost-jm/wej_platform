const sql = require('./db.js');

const Permission = {
	create: function (newEntries, callback) {
		// Iterate over the newEntries array and insert each object into the database
		const query = 'INSERT INTO permissions (reviewee, reviewer) VALUES ?';
		const values = newEntries.map((entry) => [entry.reviewee, entry.reviewer]);
		sql.query(query, [values], callback);
	},
	deleteByReviewees: function (reviewees, callback) {
		const query = 'DELETE FROM permissions WHERE reviewee IN (?)';
		sql.query(query, [reviewees], callback);
	  },
	view: function (callback) {
		const query = 'SELECT * FROM permissions';
		sql.query(query, callback);
	},
	deleteAll: function (callback) {
		const query = 'DELETE FROM permissions';
		sql.query(query, callback);
	},
};

module.exports = Permission;
