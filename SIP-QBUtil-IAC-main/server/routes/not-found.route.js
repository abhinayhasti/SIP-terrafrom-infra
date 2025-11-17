const express = require("express");

module.exports = express.Router().all("**", (_, res) => {
  return res.status(404).json({ success: false, message: "Route Not Found." });
});

