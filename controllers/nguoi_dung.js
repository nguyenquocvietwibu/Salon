const { model: nguoiDungModel } = require('../models/nguoi_dung');
const { model: nhanVienModel } = require('../models/nhan_vien');

const controller = {
    // 1. Lấy tất cả người dùng hệ thống (Đã chuẩn hóa JSON trả về)
    getAll: async (req, res) => {
        try {
            const data = await nguoiDungModel.layTat();
            res.status(200).json({
                success: true,
                data: data
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🎯 HÀM MỚI 1: Lấy danh sách tất cả Khách hàng
    getCustomers: async (req, res) => {
        try {
            const data = await nguoiDungModel.layTatKhachHang();
            res.status(200).json({
                success: true,
                message: "Lấy danh sách khách hàng thành công",
                data: data
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 🎯 HÀM MỚI 2: Lấy danh sách tất cả Nhân viên (Mọi bộ phận chứa chữ "Nhân viên")
    getStaffs: async (req, res) => {
        try {
            const data = await nguoiDungModel.layTatNhanVien();
            res.status(200).json({
                success: true,
                message: "Lấy danh sách nhân viên theo vai trò thành công",
                data: data
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 2. Tạo nhân viên mới (Bao gồm insert bảng nguoi_dung và nhan_vien)
    addStaff: async (req, res) => {
        try {
            const { ten, ma_vai_tro, sdt, dang_kich_hoat, ma_chi_nhanh } = req.body;

            // 1. Tạo người dùng trước để lấy mã tự tăng
            const nguoiDungMoi = await nguoiDungModel.them(ten, ma_vai_tro, sdt, dang_kich_hoat);
            
            // 2. Lấy mã đó tạo tiếp nhân viên
            const nhanVienMoi = await nhanVienModel.them(nguoiDungMoi.ma, ma_chi_nhanh);

            // 3. Trả về đúng cục data gộp sạch sẽ là xong
            res.status(201).json({
                success: true,
                message: "Thêm nhân viên mới thành công",
                data: {
                    ma: nguoiDungMoi.ma,
                    ten: nguoiDungMoi.ten,
                    sdt: nguoiDungMoi.sdt,
                    ma_vai_tro: nguoiDungMoi.ma_vai_tro,
                    dang_kich_hoat: nguoiDungMoi.dang_kich_hoat,
                    ma_chi_nhanh: nhanVienMoi.ma_chi_nhanh
                }
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // 3. Cập nhật thông tin nhân viên
    updateStaff: async (req, res) => {
        try {
            // Lấy mã nhân viên từ params (ví dụ: /api/staff/12)
            const { ma } = req.params; 
            // Nhận dữ liệu cần chỉnh sửa từ body gửi lên
            const { ten, sdt, dang_kich_hoat, ma_chi_nhanh } = req.body;

            // 1. Cập nhật thông tin cơ bản ở bảng nguoi_dung trước
            const nguoiDungSua = await nguoiDungModel.capNhat(ma, ten, sdt, dang_kich_hoat);

            // 2. Cập nhật tiếp thông tin chi nhánh ở bảng nhan_vien
            const nhanVienSua = await nhanVienModel.capNhat(ma, ma_chi_nhanh);

            // 3. Trả về cục data gộp sạch sẽ, đồng bộ cấu trúc với addStaff
            res.status(200).json({
                success: true,
                message: "Cập nhật thông tin nhân viên thành công",
                data: {
                    ma: nguoiDungSua.ma,
                    ten: nguoiDungSua.ten,
                    sdt: nguoiDungSua.sdt,
                    ma_vai_tro: nguoiDungSua.ma_vai_tro, // Giữ nguyên mã vai trò không cho sửa
                    dang_kich_hoat: nguoiDungSua.dang_kich_hoat,
                    ma_chi_nhanh: nhanVienSua.ma_chi_nhanh
                }
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },
    searchCustomerByName: async (req, res) => {
        try {
            const { ten } = req.query;
            if (!ten || ten.trim() === "") {
                return res.status(400).json({ success: false, message: "Vui lòng nhập tên khách hàng!" });
            }
            const tuKhoaChuanHoa = ten.trim().normalize('NFC');
            const data = await nguoiDungModel.timKhachHangTheoTen(tuKhoaChuanHoa);
            res.status(200).json({
                success: true,
                message: `Tìm thấy ${data.length} khách hàng khớp với từ khóa "${ten}"`,
                data: data
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Tìm kiếm nhân viên theo tên
    searchStaffByName: async (req, res) => {
        try {
            const { ten } = req.query;
            if (!ten || ten.trim() === "") {
                return res.status(400).json({ success: false, message: "Vui lòng nhập tên nhân viên!" });
            }
             const tuKhoaChuanHoa = ten.trim().normalize('NFC');
            const data = await nguoiDungModel.timNhanVienTheoTen(tuKhoaChuanHoa);
            res.status(200).json({
                success: true,
                message: `Tìm thấy ${data.length} nhân viên khớp với từ khóa "${ten}"`,
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