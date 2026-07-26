const { query } = require('../database');

const model = {
    // 1. Lấy tất cả lịch hẹn (JOIN với chi nhánh để lấy thêm tên chi nhánh hiển thị cho đẹp)
    layTat: async () => {
        const sql = `
            SELECT lh.*, cn.ten AS ten_chi_nhanh
            FROM lich_hen lh
            LEFT JOIN chi_nhanh cn ON lh.ma_chi_nhanh = cn.ma
            ORDER BY lh.ngay_hen DESC, lh.thoi_gian_bat_dau DESC;
        `;
        const ketQua = await query(sql);
        return ketQua.rows;
    },

    // 2. Thêm mới lịch hẹn (Dành cho khách đặt lịch)
    them: async (thoi_gian_bat_dau, thoi_gian_ket_thuc, sdt_khach, ten_khach, ma_chi_nhanh, ngay_hen, tong_gia) => {
        const sql = `
            INSERT INTO lich_hen (
                thoi_gian_bat_dau, thoi_gian_ket_thuc, sdt_khach, 
                ten_khach, ma_chi_nhanh, ngay_hen, tong_gia, trang_thai
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        // Mặc định khi khách đặt lịch trên web/app thì trạng thái sẽ là 'Chờ duyệt'
        const trangThaiMacDinh = 'Chờ duyệt';
        
        const ketQua = await query(sql, [
            thoi_gian_bat_dau, thoi_gian_ket_thuc, sdt_khach, 
            ten_khach, ma_chi_nhanh, ngay_hen, tong_gia, trangThaiMacDinh
        ]);
        return ketQua.rows[0];
    },

    // 3. Cập nhật trạng thái lịch hẹn (Khi lễ tân Duyệt lịch hoặc Hoàn thành cuộc hẹn)
    capNhatTrangThai: async (ma, trang_thai, ma_le_tan_xac_nhan) => {
        const sql = `
            UPDATE lich_hen
            SET trang_thai = $1, ma_le_tan_xac_nhan = $2
            WHERE ma = $3
            RETURNING *;
        `;
        const ketQua = await query(sql, [trang_thai, ma_le_tan_xac_nhan, ma]);
        return ketQua.rows[0];
    },
    layTheoNhanVienTrongNgay: async (ma_nhan_vien, ngay_hen) => {
        const sql = `
            SELECT lh.ma, lh.thoi_gian_bat_dau, lh.thoi_gian_ket_thuc, lh.trang_thai
            FROM lich_hen lh
            JOIN chi_tiet_nhan_vien_lich_hen ctnv ON lh.ma = ctnv.ma_lich_hen
            WHERE ctnv.ma_nhan_vien = $1 
              AND lh.ngay_hen = $2
              AND lh.trang_thai != 'Hủy' -- Không tính những lịch đã bị hủy
            ORDER BY lh.thoi_gian_bat_dau ASC;
        `;
        const ketQua = await query(sql, [ma_nhan_vien, ngay_hen]);
        return ketQua.rows;
    },
    layLichChoDuyetTheoChiNhanh: async (ma_chi_nhanh) => {
        const sql = `
            SELECT * FROM lich_hen 
            WHERE ma_chi_nhanh = $1 AND trang_thai = 'Chờ duyệt'
            ORDER BY ngay_hen DESC, thoi_gian_bat_dau DESC;
        `;
        
        const ketQua = await query(sql, [ma_chi_nhanh]);
        return ketQua.rows;
    }
}

module.exports = {
    model
}