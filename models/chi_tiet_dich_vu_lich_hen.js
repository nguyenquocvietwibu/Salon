const { query } = require('../database');

const model = {
    // 1. Lấy tất cả dịch vụ đi kèm của một lịch hẹn cụ thể
    // (JOIN qua bảng dich_vu để lấy luôn tên, giá, thời lượng hiển thị lên hóa đơn/UI)
    layDichVuTheoLich: async (ma_lich_hen) => {
        const sql = `
            SELECT ctdv.ma_dich_vu, dv.ten, dv.gia, dv.thoi_luong, dv.loai
            FROM chi_tiet_dich_vu_lich_hen ctdv
            JOIN dich_vu dv ON ctdv.ma_dich_vu = dv.ma
            WHERE ctdv.ma_lich_hen = $1;
        `;
        const ketQua = await query(sql, [ma_lich_hen]);
        return ketQua.rows;
    },

    // 2. Thêm một dịch vụ vào lịch hẹn
    them: async (ma_lich_hen, ma_dich_vu) => {
        const sql = `
            INSERT INTO chi_tiet_dich_vu_lich_hen (ma_lich_hen, ma_dich_vu)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const ketQua = await query(sql, [ma_lich_hen, ma_dich_vu]);
        return ketQua.rows[0];
    },
}

module.exports = {
    model
}