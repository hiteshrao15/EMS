const app = require("../server");

// Vercel sends requests to /api/... so we strip the /api prefix
// before passing to Express, where routes are mounted at /employees.
// Using [[...all]].js as an optional catch-all catches all /api/* routes.
module.exports = (req, res) => {
  req.url = req.url.replace(/^\/api/, "") || "/";
  return app(req, res);
};
