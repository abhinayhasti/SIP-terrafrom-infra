const express = require("express");

const { getProfitAndLoss } = require("../controllers/financial.controller");

module.exports = express.Router().get("/profitAndLoss", getProfitAndLoss);


