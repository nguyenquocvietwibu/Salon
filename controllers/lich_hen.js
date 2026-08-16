const { model: lichHenModel } = require('../models/lich_hen');
const { model: chiTietNhanVienModel } = require('../models/chi_tiet_nhan_vien_lich_hen');
const { model: chiTietDichVuModel } = require('../models/chi_tiet_dich_vu_lich_hen');

const controller = {
    // 1. Lấy tất cả lịch hẹn
    getAll: async (req, res) => {
        try {
            const data = await lichHenModel.layTat();
            res.status(200).json({
                success: true,
                data: data
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // 2. Tạo lịch hẹn mới (Bao gồm thêm nhân viên và dịch vụ đi kèm)
    addBooking: async (req, res) => {
        try {
            const {
                thoi_gian_bat_dau,
                thoi_gian_ket_thuc,
                sdt_khach,
                ten_khach,
                ma_chi_nhanh,
                ngay_hen,
                tong_gia,
                cac_ma_nhan_vien, // Mảng các ID nhân viên làm việc (Ví dụ: [1, 2])
                cac_ma_dich_vu    // Mảng các ID dịch vụ khách chọn (Ví dụ: [10, 15, 20])
            } = req.body;

            // 🚨 BƯỚC KIỂM TRA DỮ LIỆU ĐẦU VÀO (VALIDATION)
            if (
                !thoi_gian_bat_dau ||
                !thoi_gian_ket_thuc ||
                !sdt_khach ||
                !ten_khach ||
                !ma_chi_nhanh ||
                !ngay_hen ||
                tong_gia === undefined || tong_gia === null || // Tránh lỗi khi tổng giá = 0
                !cac_ma_nhan_vien || !Array.isArray(cac_ma_nhan_vien) || cac_ma_nhan_vien.length === 0 ||
                !cac_ma_dich_vu || !Array.isArray(cac_ma_dich_vu) || cac_ma_dich_vu.length === 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng nhập đầy đủ thông tin lịch hẹn, bao gồm cả dịch vụ và nhân viên!"
                });
            }
            // 🚨 KẾT THÚC BƯỚC KIỂM TRA

            // Bước A: Tạo lịch hẹn chính trước để lấy mã tự tăng (ma_lich_hen)
            const lichHenMoi = await lichHenModel.them(
                thoi_gian_bat_dau,
                thoi_gian_ket_thuc,
                sdt_khach,
                ten_khach,
                ma_chi_nhanh,
                ngay_hen,
                tong_gia
            );

            const maLichHen = lichHenMoi.ma;

            // Bước B: Thêm danh sách nhân viên vào bảng trung gian
            // Lúc này không cần if check nữa vì đã validate ở trên, nhưng giữ lại cho an toàn cũng được
            if (cac_ma_nhan_vien && Array.isArray(cac_ma_nhan_vien)) {
                for (const maNhanVien of cac_ma_nhan_vien) {
                    await chiTietNhanVienModel.them(maLichHen, maNhanVien);
                }
            }

            // Bước C: Thêm danh sách dịch vụ vào bảng trung gian
            if (cac_ma_dich_vu && Array.isArray(cac_ma_dich_vu)) {
                for (const maDichVu of cac_ma_dich_vu) {
                    await chiTietDichVuModel.them(maLichHen, maDichVu);
                }
            }

            // Trả về kết quả gộp thành công viên mãn
            res.status(201).json({
                success: true,
                message: "Đặt lịch hẹn thành công!",
                data: {
                    lich_hen: lichHenMoi,
                    nhan_vien_tham_gia: cac_ma_nhan_vien,
                    dich_vu_su_dung: cac_ma_dich_vu
                }
            });

        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message
            });
        }
    },

    // 3. API Duyệt đơn lịch hẹn (Hoặc cập nhật sang các trạng thái khác)
    approveBooking: async (req, res) => {
        try {
            const { ma } = req.params; // Mã lịch hẹn cần duyệt
            const { trang_thai, ma_le_tan_xac_nhan } = req.body;

            // 1. Kiểm tra dữ liệu đầu vào
            if (!ma || isNaN(ma) || !trang_thai || !ma_le_tan_xac_nhan) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng cung cấp đầy đủ mã lịch hẹn, trạng thái và mã lễ tân xác nhận!"
                });
            }

            const data = await lichHenModel.capNhatTrangThai(ma, trang_thai, ma_le_tan_xac_nhan);

            // 2. Nếu không tìm thấy mã lịch hẹn trong Database (data = undefined)
            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: `Không tìm thấy lịch hẹn có mã [${ma}] để cập nhật!`
                });
            }

            // 3. Trả về kết quả khi cập nhật thành công
            res.status(200).json({
                success: true,
                message: `Cập nhật trạng thái lịch hẹn sang [${trang_thai}] thành công`,
                data: data
            });

        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message
            });
        }
    },
    // API lấy khung giờ bận của nhân viên theo ngày phục vụ frontend render ô lịch rảnh
    getEmployeeScheduleByDate: async (req, res) => {
        try {
            // 1. Lấy dữ liệu từ Query String trên URL
            const { ma_nhan_vien, ngay_hen } = req.query;

            // 2. Kiểm tra tính hợp lệ (Validation) xem Frontend có truyền đủ không
            if (!ma_nhan_vien || !ngay_hen) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu tham số ma_nhan_vien hoặc ngay_hen (Định dạng đúng: YYYY-MM-DD)"
                });
            }

            // 3. Gọi xuống hàm Model
            const data = await lichHenModel.layTheoNhanVienTrongNgay(ma_nhan_vien, ngay_hen);

            // 4. Trả về kết quả bọc trong cấu trúc success chuẩn chỉnh
            res.status(200).json({
                success: true,
                message: `Lấy khung giờ bận ngày ${ngay_hen} của nhân viên mã ${ma_nhan_vien} thành công`,
                data: data // Mảng chứa các khoảng bận (bao gồm cả trạng thái Chờ duyệt và Đã duyệt)
            });

        } catch (err) {
            // Bẫy lỗi nếu hệ thống hoặc database có trục trặc
            res.status(500).json({
                success: false,
                error: err.message
            });
        }
    },
    getPendingAppointmentsByBranch: async (req, res) => {
        try {
            // 1. Lấy mã chi nhánh từ Query String trên URL (Ví dụ: /api/appointments?ma_chi_nhanh=1)
            const { ma } = req.query;

            // 2. Kiểm tra tính hợp lệ (Validation)
            if (!ma) {
                return res.status(400).json({
                    success: false,
                    message: "Thiếu tham số bắt buộc ma ở query string!"
                });
            }

            // 3. Gọi xuống hàm Model gộp đơn giản lấy lịch chờ duyệt mà bạn đã viết trước đó
            const data = await lichHenModel.layLichChoDuyetTheoChiNhanh(ma);

            // 4. Trả về kết quả thành công đúng cấu trúc của bạn
            res.status(200).json({
                success: true,
                message: `Lấy danh sách lịch hẹn chờ duyệt của chi nhánh mã ${ma} thành công`,
                data: data
            });

        } catch (err) {
            // Bẫy lỗi đồng bộ với hệ thống
            res.status(500).json({
                success: false,
                error: err.message
            });
        }
    },
    getById: async (req, res) => {
        try {
            const { ma } = req.params;

            if (!ma || isNaN(ma)) {
                return res.status(400).json({
                    success: false,
                    message: "Mã lịch hẹn (ma) không hợp lệ!"
                });
            }

            const data = await lichHenModel.layTheoMa(ma);

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: `Không tìm thấy lịch hẹn có mã [${ma}]!`
                });
            }

            res.status(200).json({
                success: true,
                message: "Lấy thông tin chi tiết lịch hẹn thành công",
                data: data
            });

        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message
            });
        }
    }

};


module.exports = {
    controller
};