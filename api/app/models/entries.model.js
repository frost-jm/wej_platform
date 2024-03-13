const sql = require('./db.js');

// constructor
const Entry = {
  getAll: function (revieweeID, date, entryType, options, callback) {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    // Entries Query
    let query = `SELECT e.*, et.tagID, et.entryType, t.tag, t.labelColor, t.tagColor, t.pointsFor
		  FROM entries e
		  JOIN entryTypes et ON e.entryTypeID = et.id
		  JOIN tags t ON et.tagID = t.id
		  WHERE e.revieweeID = ? AND e.deleted <> 1`;

    const queryParams = [revieweeID];

    if (date) {
      query += ' AND DATE(e.createdDate) = ?';
      queryParams.push(date);
    }

    if (entryType) {
      const entryTypeCondition = Array.isArray(entryType)
        ? 'et.entryType IN (?)'
        : 'et.entryType = ?';
      query += ` AND ${entryTypeCondition}`;
      queryParams.push(entryType);
    }

    // Default Entry Types Query
    let entryTypesQuery = `SELECT
			et.id AS entryTypeID,
			et.entryType AS entryType,
			t.tagColor AS tagColor,
			t.labelColor AS labelColor,
			COUNT(*) AS count
		  FROM
			entryTypes et
			JOIN tags t ON et.tagID = t.id
			LEFT JOIN entries e ON et.id = e.entryTypeID
		  WHERE
			e.deleted <> 1
			AND e.revieweeID = ?`;

    if (date) {
      entryTypesQuery += ' AND DATE(e.createdDate) = ?';
    }

    entryTypesQuery += `
		  GROUP BY
			et.id, et.entryType, t.tagColor, t.labelColor;`;

    // Total Count Query
    let countQuery = `SELECT COUNT(*) AS totalCount FROM entries e
		  JOIN entryTypes et ON e.entryTypeID = et.id
		  WHERE e.revieweeID = ? AND e.deleted <> 1`;

    if (date) {
      countQuery += ' AND DATE(e.createdDate) = ?';
    }

    if (entryType) {
      const entryTypeCondition = Array.isArray(entryType)
        ? 'et.entryType IN (?)'
        : 'et.entryType = ?';
      countQuery += ` AND ${entryTypeCondition}`;
    }

    sql.query(countQuery, queryParams, (err, countResult) => {
      if (err) {
        return callback(err);
      }

      const totalCount = countResult[0].totalCount;

      sql.query(entryTypesQuery, queryParams, (err, entryTypesResult) => {
        if (err) {
          return callback(err);
        }

        query += ' ORDER BY e.createdDate DESC LIMIT ? OFFSET ?';
        queryParams.push(limit, offset);

        sql.query(query, queryParams, (err, entries) => {
          if (err) {
            return callback(err);
          }

          const result = {
            page,
            limit,
            totalCount,
            date: date || null,
            entries,
            entryType: entryTypesResult,
          };

          callback(null, result);
        });
      });
    });
  },
  getCount: function (revieweeID, callback) {
    sql.query(
      'SELECT COUNT(*) AS count FROM entries WHERE revieweeID = ? AND deleted <> 1',
      [revieweeID],
      callback
    );
  },
  getCountByPointsFor: function (revieweeID, callback) {
    sql.query(
      `SELECT t.pointsFor AS label, t.labelColor AS labelColor, t.tagColor AS tagColor, COUNT(*) AS count
		FROM entries e
		JOIN entryTypes et ON e.entryTypeID = et.id 
		JOIN tags t ON et.tagID = t.id 
		WHERE e.revieweeID = ? AND e.deleted <> 1
		GROUP BY t.pointsFor, t.labelColor, t.tagColor;
		`,
      [revieweeID],
      callback
    );
  },
  getById: function (entryId) {
    return new Promise((resolve, reject) => {
      sql.query(
        'SELECT * FROM entries WHERE id = ?',
        entryId,
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result[0]);
          }
        }
      );
    });
  },
  create: function (newEntry, callback) {
    sql.query('INSERT INTO entries SET ?', newEntry, callback);
  },
  update: function (entryId, updatedEntry, callback) {
    sql.query(
      'UPDATE entries SET ? WHERE id = ?',
      [updatedEntry, entryId],
      callback
    );
  },
  delete: function (entryId, callback) {
    const updatedEntry = { deleted: 1 };
    sql.query(
      'UPDATE entries SET ? WHERE id = ?',
      [updatedEntry, entryId],
      callback
    );
  },
};

module.exports = Entry;
