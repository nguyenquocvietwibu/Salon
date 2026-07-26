const { model: chiNhanhModel } = require('../models/chi_nhanh');

const controller = {
    // API Lấy tất cả chi nhánh
    getAll: async (req, res) => {
        try {
            const data = await chiNhanhModel.layTat();
            
            // Trả về danh sách chi nhánh, bên trong mỗi chi nhánh đã có sẵn object hinh_hoc_dia_ly
            res.status(200).json({
                success: true,
                data: data
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    // API Thêm chi nhánh
    addBranch: async (req, res) => {
        try {
            const { ten, dia_chi, hinh_hoc_dia_ly } = req.body;

            // Vì Model nhận vào chuỗi GeoJSON, ta stringify object tọa độ từ frontend gửi lên
            const geoJsonString = JSON.stringify(hinh_hoc_dia_ly);

            const data = await chiNhanhModel.them(ten, dia_chi, geoJsonString);

            res.status(201).json({
                success: true,
                message: "Thêm chi nhánh thành công",
                data: data // Trả về có sẵn object hinh_hoc_dia_ly nhờ phép ép kiểu ::json ở model
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    getNearestBranch: async (req, res) => {
        try {
            // Hứng kinh độ (lng) và vĩ độ (lat) từ Query String
            const { lng, lat } = req.query;

            if (!lng || !lat) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng cung cấp đủ kinh độ (lng) và vĩ độ (lat) của bạn!"
                });
            }

            // Gọi xuống hàm Model bản siêu đơn giản
            const data = await chiNhanhModel.timGanNhat(lng, lat);

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy chi nhánh nào xung quanh bạn."
                });
            }

            res.status(200).json({
                success: true,
                message: "Tìm chi nhánh gần nhất thành công",
                data: data
            });

        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message
            });
        }
    },
    // API Cập nhật chi nhánh
    updateBranch: async (req, res) => {
        try {
            const { ma } = req.params;
            const { ten, dia_chi, hinh_hoc_dia_ly } = req.body;

            const geoJsonString = JSON.stringify(hinh_hoc_dia_ly);

            const data = await chiNhanhModel.capNhat(ma, ten, dia_chi, geoJsonString);

            res.status(200).json({
                success: true,
                message: "Cập nhật chi nhánh thành công",
                data: data
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    searchBranchByName: async (req, res) => {
        try {
            // Đã đổi thành hứng từ khóa từ query string là ?ten=...
            const { ten } = req.query;

            if (!ten || ten.trim() === "") {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng nhập từ khóa tìm kiếm (ten)!"
                });
            }
              const tuKhoaChuanHoa = ten.trim().normalize('NFC');
            // Gọi xuống hàm Model lọc gần đúng ILIKE với từ khóa đã trim
            const data = await chiNhanhModel.timTheoTen(tuKhoaChuanHoa);

            res.status(200).json({
                success: true,
                message: `Tìm thấy ${data.length} chi nhánh khớp với từ khóa "${ten}"`,
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
}
