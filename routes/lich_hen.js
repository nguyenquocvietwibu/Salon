const express = require('express');
const router = express.Router();
const { controller: lichHenController} = require('../controllers/lich_hen');

router.get("/khung-gio-cua-nhan-vien-trong-ngay", lichHenController.getEmployeeScheduleByDate);
router.get("/", lichHenController.getAll);

router.post("/", lichHenController.addBooking);
router.put("/:ma", lichHenController.approveBooking);


module.exports = {
    router
}