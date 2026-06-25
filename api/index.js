const app = require("../server");

// Vercel sends requests to /api/... so we strip the /api prefix
// before passing to Express, where routes are mounted at /employees
module.exports = (req, res) => {
  req.url = req.url.replace(/^\/api/, "") || "/";
  return app(req, res);
};
