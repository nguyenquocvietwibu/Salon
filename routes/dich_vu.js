const express = require('express');
const router = express.Router();
const { controller: dichVuController} = require('../controllers/dich_vu');


// 1. CÁC ROUTE CỐ ĐỊNH (PHẢI NẰM TRÊN)
router.get("/le", dichVuController.getAllSingle);
router.get("/goi", dichVuController.getAllCombo);
router.get("/", dichVuController.getAll);

// 2. CÁC ROUTE CÓ THAM SỐ (NẰM DƯỚI)
router.get("/goi/:ma", dichVuController.getComboDetails);
router.get("/le/:ma", dichVuController.getSingleDetails);
router.get("/:ma", dichVuController.get);

// 3. CÁC ROUTE THAO TÁC DỮ LIỆU
router.delete("/:ma", dichVuController.delete);
router.post("/le", dichVuController.addSingle);
router.post("/goi", dichVuController.addCombo);
router.put("/le/:ma", dichVuController.updateSingle);
router.put("/goi/:ma", dichVuController.updateCombo);



module.exports = {
    router
}

