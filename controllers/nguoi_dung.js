const { model: nguoiDungModel } = require('../models/nguoi_dung');
const { model: nhanVienModel } = require('../models/nhan_vien');
const danhSachOTP = {};

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
    getByPhone: async (req, res) => {
        try {
            const { sdt } = req.query;

            if (!sdt) {
                return res.status(400).json({ success: false, message: "Thiếu số điện thoại!" });
            }

            const user = await nguoiDungModel.layTheoSDT(sdt);

            if (!user) {
                return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
            }

            res.status(200).json({ success: true, data: user });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },
    login: async (req, res) => {
        try {
            const { sdt, otp } = req.body;
            if (!sdt) return res.status(400).json({ success: false, message: "Thiếu SĐT!" });

            // Chưa có OTP -> Tạo và gửi OTP mới
            if (!otp) {
                const user = await nguoiDungModel.layTheoSDT(sdt);
                if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy SĐT!" });

                const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
                danhSachOTP[sdt] = { otp: otpCode, hetHan: Date.now() + 120000 };

                console.log(`[OTP ${sdt}]: ${otpCode}`);
                return res.status(200).json({ success: true, message: "Đã gửi OTP!" });
            }

            // Đã có OTP -> Kiểm tra xác thực
            const record = danhSachOTP[sdt];
            if (!record || Date.now() > record.hetHan || record.otp !== otp) {
                return res.status(400).json({ success: false, message: "OTP sai hoặc hết hạn!" });
            }

            delete danhSachOTP[sdt];
            const user = await nguoiDungModel.layTheoSDT(sdt);
            res.status(200).json({ success: true, data: user });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },
    // 2. Tạo nhân viên mới (Bao gồm insert bảng nguoi_dung và nhan_vien)
    addStaff: async (req, res) => {
        try {
            const { ten, ma_vai_tro, sdt, dang_kich_hoat, ma_chi_nhanh } = req.body;

            const nguoiDungMoi = await nguoiDungModel.them(ten, ma_vai_tro, sdt, dang_kich_hoat);
            const nhanVienMoi = await nhanVienModel.them(nguoiDungMoi.ma, ma_chi_nhanh);

            res.status(201).json({
                success: true,
                message: "Thêm nhân viên mới thành công",
                data: { ...nguoiDungMoi, ma_chi_nhanh: nhanVienMoi.ma_chi_nhanh }
            });

        } catch (err) {
            // 🌟 Bắt mã lỗi 23505 của PostgreSQL (Lỗi trùng UNIQUE như sdt, email...)
            if (err.code === '23505') {
                return res.status(400).json({
                    success: false,
                    message: "Số điện thoại này đã tồn tại trong hệ thống!"
                });
            }

            // Các lỗi hệ thống khác không lường trước được
            res.status(500).json({
                success: false,
                message: "Có lỗi xảy ra từ máy chủ, vui lòng thử lại sau!",
                error: err.message
            });
        }
    },
    // 🌟 BỔ SUNG: Hàm Cập nhật thông tin chung cho Người dùng
    update: async (req, res) => {
        try {
            const { ma } = req.params;
            const { ten, sdt, dang_kich_hoat } = req.body;

            const userUpdated = await nguoiDungModel.capNhat(ma, ten, sdt, dang_kich_hoat);

            if (!userUpdated) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy người dùng cần cập nhật!"
                });
            }

            res.status(200).json({
                success: true,
                message: "Cập nhật thông tin người dùng thành công",
                data: userUpdated
            });
        } catch (err) {
            // Bắt lỗi trùng SĐT khi cập nhật
            if (err.code === '23505') {
                return res.status(400).json({
                    success: false,
                    message: "Số điện thoại này đã được sử dụng bởi người dùng khác!"
                });
            }
            res.status(500).json({ success: false, error: err.message });
        }
    },
    // 3. Cập nhật thông tin nhân viên
    updateStaff: async (req, res) => {
        try {
            const { ma } = req.params;
            const { ten, sdt, dang_kich_hoat, ma_chi_nhanh } = req.body;

            const nguoiDungSua = await nguoiDungModel.capNhat(ma, ten, sdt, dang_kich_hoat);
            const nhanVienSua = await nhanVienModel.capNhat(ma, ma_chi_nhanh);

            res.status(200).json({
                success: true,
                message: "Cập nhật thông tin nhân viên thành công",
                data: {
                    ma: nguoiDungSua.ma,
                    ten: nguoiDungSua.ten,
                    sdt: nguoiDungSua.sdt,
                    ma_vai_tro: nguoiDungSua.ma_vai_tro,
                    dang_kich_hoat: nguoiDungSua.dang_kich_hoat,
                    ma_chi_nhanh: nhanVienSua.ma_chi_nhanh
                }
            });
        } catch (err) {
            // 🌟 Bắt lỗi trùng SĐT khi cập nhật
            if (err.code === '23505') {
                return res.status(400).json({
                    success: false,
                    message: "Số điện thoại này đã được sử dụng bởi người dùng khác!"
                });
            }

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
    // 🎯 HÀM MỚI bổ sung: Lấy thông tin người dùng theo Mã (ID)
    getById: async (req, res) => {
        try {
            // Lấy id từ req.params (Ví dụ route dạng: GET /api/nguoi-dung/:id)
            const { ma } = req.params;

            if (!ma || isNaN(ma)) {
                return res.status(400).json({
                    success: false,
                    message: "Mã người dùng (ma) không hợp lệ!"
                });
            }

            const user = await nguoiDungModel.layTheoMa(ma);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy người dùng!"
                });
            }

            res.status(200).json({
                success: true,
                data: user
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
    getStaffById: async (req, res) => {
        try {
            const { ma } = req.params;
            const staff = await nhanVienModel.layTheoMa(ma);

            // Nếu ID tồn tại ở bảng nguoi_dung nhưng không phải Nhân viên -> Trả về 404
            if (!staff) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy nhân viên với mã này!"
                });
            }

            res.status(200).json({
                success: true,
                data: staff
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },
    updateActiveStatus: async (req, res) => {
        try {
            const { ma } = req.params;
            const { dang_kich_hoat } = req.body;

            // Kiểm tra dữ liệu đầu vào bắt buộc phải là boolean (true/false)
            if (typeof dang_kich_hoat !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: "Giá trị 'dang_kich_hoat' bắt buộc phải là true hoặc false!"
                });
            }

            const nguoiDung = await nguoiDungModel.suaKichHoat(ma, dang_kich_hoat);

            if (!nguoiDung) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy người dùng!"
                });
            }

            res.status(200).json({
                success: true,
                message: `Đã ${dang_kich_hoat ? 'kích hoạt' : 'hủy kích hoạt'} tài khoản thành công!`,
                data: nguoiDung
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
};

module.exports = {
    controller
};