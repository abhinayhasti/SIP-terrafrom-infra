const express = require("express");

const { getDepartments } = require("../controllers/department.controller");

module.exports = express.Router().get("/departments", getDepartments);


