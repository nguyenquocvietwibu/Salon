const { query } = require('../database');

const model = {
    // 1. Lấy tất cả nhân viên tham gia vào một lịch hẹn cụ thể
    // (JOIN qua bảng nguoi_dung để lấy tên, sdt của nhân viên đó hiển thị lên UI)
    layNhanVienTheoLich: async (ma_lich_hen) => {
        const sql = `
            SELECT ctnv.ma_nhan_vien, nd.ten, nd.sdt, nd.ma_vai_tro
            FROM chi_tiet_nhan_vien_lich_hen ctnv
            JOIN nguoi_dung nd ON ctnv.ma_nhan_vien = nd.ma
            WHERE ctnv.ma_lich_hen = $1;
        `;
        const ketQua = await query(sql, [ma_lich_hen]);
        return ketQua.rows;
    },

    // 2. Gán một nhân viên vào một lịch hẹn
    them: async (ma_lich_hen, ma_nhan_vien) => {
        const sql = `
            INSERT INTO chi_tiet_nhan_vien_lich_hen (ma_lich_hen, ma_nhan_vien)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const ketQua = await query(sql, [ma_lich_hen, ma_nhan_vien]);
        return ketQua.rows[0];
    },
}

module.exports = {
    model
}