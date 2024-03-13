const errorHandler = (error, request, response, next) => {
	if (error.name === 'UnauthorizedError') {
		const message = 'Unauthorized Access';
		return response.status(401).json({ message });
	}

	if (error.name === 'InvalidTokenError') {
		const message = 'Invalid token';
		return response.status(403).json({ message });
	}

	const status = error.status || 500;
	const message = error.message || 'Access Denied';
	response.status(status).json({ message });
};
module.exports = {
	errorHandler,
};
