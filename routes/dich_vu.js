const express = require('express');
const router = express.Router();
const { controller: dichVuController} = require('../controllers/dich_vu');

router.get("/tim", dichVuController.searchServiceByName);
router.get("/le", dichVuController.getAllSingle);
router.get("/goi", dichVuController.getAllCombo);
router.get("/", dichVuController.getAll);
router.get("/goi/:ma", dichVuController.getComboDetails);
router.get("/le/:ma", dichVuController.getSingleDetails);
router.get("/:ma", dichVuController.getById);

router.post("/le", dichVuController.addSingle);
router.post("/goi", dichVuController.addCombo);

router.put("/le/:ma", dichVuController.updateSingle);
router.put("/goi/:ma", dichVuController.updateCombo);

router.delete("/:ma", dichVuController.delete);

module.exports = {
    router
}

