const app = require("../../server");

module.exports = (req, res) => {
  // Strip /api prefix so Express matches "/employees"
  req.url = req.url.replace(/^\/api/, "") || "/";
  return app(req, res);
};
