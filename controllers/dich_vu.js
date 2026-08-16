const { model: dichVuModel } = require('../models/dich_vu');
const { model: chiTietDichVuGoiModel } = require('../models/chi_tiet_dich_vu_goi');
const { model: vaiTroThucHienDichVuLe } = require('../models/vai_tro_thuc_hien_dich_vu_le');

const controller = {
    // 1. Lấy tất cả dịch vụ
    getAll: async (req, res) => {
        try {
            const data = await dichVuModel.layTat();
            res.status(200).json({
                success: true,
                data: data
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 2. Lấy 1 dịch vụ bất kỳ theo mã
    getById: async (req, res) => {
        try {
            const { ma } = req.params;
            const data = await dichVuModel.lay(ma);

            if (!data) {
                return res.status(404).json({ success: false, message: "Không tìm thấy dịch vụ" });
            }

            res.status(200).json({
                success: true,
                data: data
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 3. Thêm dịch vụ lẻ
    addSingle: async (req, res) => {
        try {
            const { ten, gia, thoiLuong, maVaiTro } = req.body;

            // 1. Kiểm tra bắt buộc phải truyền đủ 4 trường, bao gồm cả maVaiTro
            if (!ten || !gia || !thoiLuong || !maVaiTro) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng nhập đầy đủ: tên, giá, thời lượng và mã vai trò thực hiện dịch vụ!"
                });
            }

            // 2. Thêm dịch vụ vào bảng dich_vu
            const data = await dichVuModel.them(ten, gia, thoiLuong, "Lẻ");

            // 3. Thêm vai trò thực hiện dịch vụ lẻ (chắc chắn chạy vì maVaiTro đã được validate)
            await vaiTroThucHienDichVuLe.them(data.ma, maVaiTro);

            res.status(201).json({
                success: true,
                message: "Thêm dịch vụ lẻ và vai trò thực hiện thành công",
                data: data
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message
            });
        }
    },

    // 4. Thêm combo (gói)
    addCombo: async (req, res) => {
        try {
            const { ten, gia, thoiLuong, cacMaDVLe } = req.body;

            // 1. Kiểm tra bắt buộc phải truyền đủ tất cả các trường
            if (!ten || !gia || !thoiLuong || !cacMaDVLe) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng nhập đầy đủ: tên, giá, thời lượng và danh sách dịch vụ lẻ!"
                });
            }

            // 2. Kiểm tra cacMaDVLe phải là MẢNG và phải có ÍT NHẤT 2 dịch vụ lẻ
            if (!Array.isArray(cacMaDVLe) || cacMaDVLe.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "Combo bắt buộc phải là mảng chứa ít nhất 2 mã dịch vụ lẻ!"
                });
            }

            // 3. Thêm gói vào bảng dich_vu
            const newCombo = await dichVuModel.them(ten, gia, thoiLuong, "Gói");

            // 4. Thêm mảng các dịch vụ lẻ đi kèm vào bảng trung gian
            await chiTietDichVuGoiModel.them(newCombo.ma, cacMaDVLe);

            res.status(201).json({
                success: true,
                message: "Thêm combo thành công",
                data: newCombo
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message
            });
        }
    },

    // 5. Lấy danh sách tất cả dịch vụ lẻ
    getAllSingle: async (req, res) => {
        try {
            const data = await dichVuModel.layTatLe();
            res.status(200).json({
                success: true,
                data: data
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 6. Lấy danh sách tất cả dịch vụ gói
    getAllCombo: async (req, res) => {
        try {
            const data = await dichVuModel.layTatGoi();
            res.status(200).json({
                success: true,
                data: data
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 7. Lấy chi tiết combo (gồm các dịch vụ lẻ bên trong)
    getComboDetails: async (req, res) => {
        try {
            const { ma } = req.params;
            const data = await dichVuModel.layChiTietDvGoi(ma);

            if (!data) {
                return res.status(404).json({ success: false, message: "Không tìm thấy gói dịch vụ" });
            }

            res.status(200).json({
                success: true,
                data: data
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 8. Lấy chi tiết dịch vụ lẻ
    getSingleDetails: async (req, res) => {
        try {
            const { ma } = req.params;
            const data = await dichVuModel.layChiTietDvLe(ma);

            if (!data) {
                return res.status(404).json({ success: false, message: "Không tìm thấy dịch vụ" });
            }

            res.status(200).json({
                success: true,
                data: data
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 9. Xóa dịch vụ
    delete: async (req, res) => {
        try {
            const { ma } = req.params;
            const data = await dichVuModel.xoa(ma);

            if (!data) {
                return res.status(404).json({ success: false, message: "Không tìm thấy dịch vụ để xóa" });
            }

            res.status(200).json({
                success: true,
                message: "Xóa dịch vụ thành công",
                data: data
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // --- Hàm dùng chung nội bộ (Private-style) ---
    _update: async (ma, { ten, gia, thoiLuong, dangHoatDong }) => {
        const updated = await dichVuModel.capNhat(ma, { ten, gia, thoiLuong, dangHoatDong });
        if (!updated) throw new Error("Không tìm thấy dịch vụ để cập nhật");
        return updated;
    },

    // 10. Cập nhật Dịch vụ lẻ
    updateSingle: async (req, res) => {
        try {
            const { ma } = req.params;
            const { ten, gia, thoiLuong, dangHoatDong, maVaiTro } = req.body;

            if (maVaiTro !== undefined && !maVaiTro) {
                return res.status(400).json({ success: false, message: "Vui lòng chọn loại nhân viên thực hiện!" });
            }

            // Đã chuyển sang dùng hàm gộp nội bộ để tự động check lỗi tồn tại dữ liệu giống updateCombo
            const updated = await controller._update(ma, { ten, gia, thoiLuong, dangHoatDong });

            if (maVaiTro) {
                await vaiTroThucHienDichVuLe.capNhat(ma, maVaiTro);
            }

            res.status(200).json({
                success: true,
                message: "Cập nhật dịch vụ lẻ thành công",
                data: updated
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 11. Cập nhật Combo
    updateCombo: async (req, res) => {
        try {
            const { ma } = req.params;
            const { ten, gia, thoiLuong, dangHoatDong, cacMaDVLe } = req.body;

            if (cacMaDVLe && cacMaDVLe.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "Combo phải bao gồm ít nhất 2 dịch vụ lẻ!"
                });
            }

            const updated = await controller._update(ma, { ten, gia, thoiLuong, dangHoatDong });
            await chiTietDichVuGoiModel.capNhat(ma, cacMaDVLe);

            res.status(200).json({
                success: true,
                message: "Cập nhật gói dịch vụ thành công",
                data: updated
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },
    searchServiceByName: async (req, res) => {
        try {
            const { ten } = req.query;

            if (!ten || ten.trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng nhập từ khóa tìm kiếm (ten)!"
                });
            }

            // 🎯 PHAO CỨU SINH: Chuẩn hóa mọi kiểu gõ tiếng Việt về Unicode Dựng Sẵn (NFC)
            const tuKhoaChuanHoa = ten.trim().normalize('NFC');

            // Truyền chuỗi đã chuẩn hóa xuống Model
            const data = await dichVuModel.timTheoTen(tuKhoaChuanHoa);

            res.status(200).json({
                success: true,
                message: `Tìm thấy ${data.length} dịch vụ khớp với từ khóa "${ten}"`,
                data: data
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },
};

module.exports = {
    controller
};