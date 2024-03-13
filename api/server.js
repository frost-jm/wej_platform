const express = require('express');
const cors = require('cors');
const app = express();

const { verifyJwt } = require('./app/middleware/auth');
const { errorHandler } = require('./app/middleware/error');

var corsOptions = {
	origin: 'http://localhost:3000',
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get('/', (req, res) => {
	res.json({ message: 'Welcome to WEJ Platform API.' });
});

app.use(verifyJwt);
app.use(errorHandler);

// Routes
const entryRoutes = require('./app/routes/entry.routes');
const permissionRoutes = require('./app/routes/permission.routes');

// Access API

app.use('/api/permissions', permissionRoutes);
app.use('/api/entries', entryRoutes);

// set port, listen for requests
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});
