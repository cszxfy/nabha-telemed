const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { joinQueue, getQueueStatus, getDoctorQueue, callNext } = require("../controllers/queueController");

router.post("/join", auth, joinQueue);
router.get("/status/:queueId", auth, getQueueStatus);
router.get("/doctor/:doctorId", auth, getDoctorQueue);
router.post("/call-next", auth, callNext);

module.exports = router;