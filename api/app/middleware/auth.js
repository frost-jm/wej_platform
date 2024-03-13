const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

require('dotenv').config();

const verifyJwt = jwt({
	secret: jwksRsa.expressJwtSecret({
		cache: true,
		rateLimit: true,
		jwksRequestsPerMinute: 2,
		jwksUri: `${process.env.AUTH0_ISSUER_BASE_URL}/.well-known/jwks.json`,
	}),
	aud: process.env.API_URI,
	algorithms: ['RS256'],
});

module.exports = {
	verifyJwt,
};
