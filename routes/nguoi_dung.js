const express = require('express');
const router = express.Router();
const { controller: nguoiDungController} = require('../controllers/nguoi_dung');

router.get("/", nguoiDungController.getAll);
router.get("/khach-hang", nguoiDungController.getCustomers);
router.get("/nhan-vien", nguoiDungController.getStaffs);
router.get("/nhan-vien/tim", nguoiDungController.searchStaffByName);
router.get("/khach-hang/tim", nguoiDungController.searchCustomerByName);
router.post("/nhan-vien", nguoiDungController.addStaff);
router.post("/dang-nhap", nguoiDungController.login);
module.exports = {
    router
}
