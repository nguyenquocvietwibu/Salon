const { model: dichVuModel } = require('../models/dich_vu');
const { model: chiTietDichVuGoiModel } = require('../models/chi_tiet_dich_vu_goi');
const { model: vaiTroThucHienDichVuLe } = require('../models/vai_tro_thuc_hien_dich_vu_le');

const controller = {
    getAll: async (req, res) => {
        try {
            const data = await dichVuModel.layTat();
            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    get: async (req, res) => {
        try {
            const { ma } = req.params;
            const data = await dichVuModel.lay(ma);
            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    // Thêm dịch vụ lẻ
    addSingle: async (req, res) => {
        try {
            // Nhận thêm maVaiTro từ frontend gửi lên
            const { ten, gia, thoiLuong, maVaiTro } = req.body;

            // 1. Thêm dịch vụ vào bảng dich_vu trước
            const data = await dichVuModel.them(ten, gia, thoiLuong, "Lẻ");

            // 2. Nếu có gửi kèm maVaiTro thì thêm vào bảng vai trò thực hiện
            if (maVaiTro) {
                await vaiTroThucHienDichVuLe.them(data.ma, maVaiTro);
            }

            // Trả về kết quả sau khi đã thực hiện đủ 2 bước
            res.status(201).json({
                message: "Thêm dịch vụ lẻ và vai trò thành công",
                dichVu: data
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Thêm combo (gói)
    addCombo: async (req, res) => {
        try {
            // Giả sử req.body gửi lên: { ten, gia, thoiLuong, cacMaDVLe: [1, 2, 3] }
            const { ten, gia, thoiLuong, cacMaDVLe } = req.body;

            if (cacMaDVLe && cacMaDVLe.length < 2) return res.status(400).json({
                message: "Combo phải bao gồm ít nhất 2 dịch vụ lẻ!"
            });
            
            // 1. Thêm gói vào bảng dich_vu trước để lấy cái 'ma' (ID)
            const newCombo = await dichVuModel.them(ten, gia, thoiLuong, "Gói");

            await chiTietDichVuGoiModel.them(newCombo.ma, cacMaDVLe);

            res.status(201).json({ message: "Thêm combo thành công", goi: newCombo });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Lấy danh sách tất cả dịch vụ lẻ
    getAllSingle: async (req, res) => {
        try {
            const data = await dichVuModel.layTatLe(); // Gọi hàm tiếng Việt đã có ở Model
            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    // Lấy danh sách tất cả dịch vụ gói
    getAllCombo: async (req, res) => {
        try {
            const data = await dichVuModel.layTatGoi(); // Gọi hàm tiếng Việt đã có ở Model
            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    getComboDetails: async (req, res) => {
        try {
            const { ma } = req.params; // Lấy mã từ URL, ví dụ: /combo/:ma
            const data = await dichVuModel.layChiTietDvGoi(ma);

            if (!data) {
                return res.status(404).json({ message: "Không tìm thấy gói dịch vụ" });
            }

            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    getSingleDetails: async (req, res) => {
        try {
            const { ma } = req.params;
            const data = await dichVuModel.layChiTietDvLe(ma);

            if (!data) {
                return res.status(404).json({ message: "Không tìm thấy dịch vụ" });
            }

            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    delete: async (req, res) => {
        try {
            const { ma } = req.params; // Lấy mã cần xóa từ URL
            const data = await dichVuModel.xoa(ma); // Gọi hàm xóa đã có ở Model

            if (!data) {
                return res.status(404).json({ message: "Không tìm thấy dịch vụ để xóa" });
            }

            res.status(200).json({
                message: "Xóa dịch vụ thành công",
                data: data
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    // --- --- Hàm dùng chung (Private-style) ---
    _update: async (ma, { ten, gia, thoiLuong, dangHoatDong }) => {
        const updated = await dichVuModel.capNhat(ma, { ten, gia, thoiLuong, dangHoatDong });
        if (!updated) throw new Error("Không tìm thấy dịch vụ để cập nhật");
        return updated;
    },

    // --- Cập nhật Dịch vụ lẻ ---
    updateSingle: async (req, res) => {
        try {
            const { ma } = req.params;
            const { ten, gia, thoiLuong, dangHoatDong, maVaiTro } = req.body;

            // Validation: Nếu người dùng gửi maVaiTro lên thì phải là số hợp lệ
            if (maVaiTro !== undefined && !maVaiTro) {
                return res.status(400).json({ message: "Vui lòng chọn loại nhân viên thực hiện!" });
            }

            // Thực hiện cập nhật bảng dịch vụ
            const updated = await dichVuModel.capNhat(ma, { ten, gia, thoiLuong, dangHoatDong });

            // Cập nhật vai trò (luôn cập nhật vì đã bắt buộc chọn)
            if (maVaiTro) {
                await vaiTroThucHienDichVuLe.capNhat(ma, maVaiTro);
            }

            res.status(200).json({ message: "Cập nhật thành công", data: updated });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // --- Cập nhật Combo ---
    updateCombo: async (req, res) => {
        try {
            const { ma } = req.params;
            const { ten, gia, thoiLuong, dangHoatDong, cacMaDVLe } = req.body;
            // 1. Validation: Phải là mảng và có ít nhất 2 phần tử
            if (cacMaDVLe && cacMaDVLe.length < 2) return res.status(400).json({
                message: "Combo phải bao gồm ít nhất 2 dịch vụ lẻ!"
            });

            const updated = await controller._update(ma, { ten, gia, thoiLuong, dangHoatDong });
            await chiTietDichVuGoiModel.capNhat(ma, cacMaDVLe);

            res.status(200).json({ message: "Cập nhật gói dịch vụ thành công", data: updated });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = {
    controller
}
