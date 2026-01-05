const serverless = require('serverless-http');
const app = require('../src/app');

let dbInitDone = false;
let dbInitError = null;

function initModels() {
	if (dbInitDone || dbInitError) return;
	try {
		// require models lazily; this may throw if env vars are missing — catch and record
		require('../src/models');
		dbInitDone = true;
		console.log('DB models initialized');
	} catch (err) {
		dbInitError = err;
		console.error('DB models initialization failed:', err && err.message ? err.message : err);
	}
}

// Middleware to ensure models are initialized before handling requests
app.use((req, res, next) => {
	if (!dbInitDone && !dbInitError) initModels();
	if (dbInitError) {
		// Return a safe 500 with a helpful message instead of crashing the function
		return res.status(500).json({ success: false, message: 'Database not configured. Check DATABASE_URL in environment variables.' });
	}
	return next();
});

module.exports = serverless(app);
