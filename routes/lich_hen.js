const express = require('express');
const router = express.Router();
const { controller: lichHenController} = require('../controllers/lich_hen');

router.get("/khung-gio-cua-nhan-vien-trong-ngay", lichHenController.getEmployeeScheduleByDate);
router.get("/", lichHenController.getAll);
router.get("/cho-duyet-theo-chi-nhanh/", lichHenController.getPendingAppointmentsByBranch);
router.post("/", lichHenController.addBooking);
router.patch("/duyet/:ma", lichHenController.approveBooking);
router.put("/:ma", lichHenController.approveBooking);
router.get("/:ma", lichHenController.getById);

module.exports = {
    router
}