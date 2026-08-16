const express = require('express');
const router = express.Router();
const { controller: chiNhanhController} = require('../controllers/chi_nhanh');

// Lấy tất cả chi nhánh
router.get("/", chiNhanhController.getAll);


// Tìm chi nhánh gần nhất (Truyền tham số qua query string: ?lng=...&lat=...)
router.get("/gan-nhat", chiNhanhController.getNearestBranch);

// Tìm kiếm chi nhánh theo tên (Truyền tham số qua query string: ?ten=...)
router.get("/tim", chiNhanhController.searchBranchByName);

// Thêm chi nhánh mới
router.post("/", chiNhanhController.addBranch);

router.get("/:ma", chiNhanhController.getById);
// Cập nhật chi nhánh theo mã
router.put("/:ma", chiNhanhController.updateBranch);

module.exports = {
    router
}
