const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { checkSymptoms } = require("../controllers/symptomCheckController");
router.post("/", auth, checkSymptoms);
module.exports = router;