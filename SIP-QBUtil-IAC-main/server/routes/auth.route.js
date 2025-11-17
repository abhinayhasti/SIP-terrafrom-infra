const express = require("express");

const {
  requestAuthorizeUrl,
  generateToken,
  retrieveToken,
} = require("../controllers/auth.controller");

module.exports = express
  .Router()
  .get("/authorize", requestAuthorizeUrl)
  .get("/callback", generateToken)
  .get("/retrieve-token", retrieveToken);

