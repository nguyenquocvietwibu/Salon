const express = require('express');
const router = express.Router();
const { controller: chiNhanhController} = require('../controllers/chi_nhanh');

// 1. Lấy tất cả chi nhánh
router.get("/", chiNhanhController.getAll);

// 2. Tìm chi nhánh gần nhất (Truyền tham số qua query string: ?lng=...&lat=...)
// 🚨 Mẹo: Đặt route này LÊN TRÊN route "/search" và "/:ma" để tránh bị Express hiểu nhầm chữ "search" là ":ma"
router.get("/gan-nhat", chiNhanhController.getNearestBranch);

// 3. Tìm kiếm chi nhánh theo tên (Truyền tham số qua query string: ?ten=...)
router.get("/tim", chiNhanhController.searchBranchByName);

// 4. Thêm chi nhánh mới
router.post("/", chiNhanhController.addBranch);

// 5. Cập nhật chi nhánh theo mã
router.put("/:ma", chiNhanhController.updateBranch);

module.exports = {
    router
}
