const express = require("express");

const {
  credentialsController,
  generateTokenController,
  retrieveTokenController,
  getDataFromQuickBook,
  postDataToQuickBook,
  getData,
  getDataByDepartment,
} = require("../controllers/credentialsController.js");

const router = express.Router();

router.get("/", (_, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to Sage Intact API",
  });
});

router.post("/post-credentials", credentialsController);

router.get("/callback", generateTokenController);

router.get("/retrieve-token", retrieveTokenController);

router.get("/get-data", getData);

router.get("/retrieve-data/department", getDataByDepartment);

router.post("/post-data", postDataToQuickBook);

router.get("/retrieve-data", getDataFromQuickBook);

router.get("**", (_, res) => {
  return res.status(404).json({ success: false, message: "Route Not Found." });
});

module.exports = router;
