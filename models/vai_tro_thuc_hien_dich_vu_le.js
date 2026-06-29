const { query } = require('../database');

const model = {
    layTat: async () => {
        const ketQua = await query('SELECT * FROM vai_tro_thuc_hien_dich_vu_le');
        return ketQua.rows;
    },
    // 1. Chỉ thêm mới
    them: async (maDichVu, maVaiTro) => {
        const sql = `INSERT INTO vai_tro_thuc_hien_dich_vu_le (ma_dich_vu, ma_vai_tro) VALUES ($1, $2)`;
        await query(sql, [maDichVu, maVaiTro]);
    },
    // 2. Chỉ cập nhật
    capNhat: async (maDichVu, maVaiTro) => {
        const sql = `UPDATE vai_tro_thuc_hien_dich_vu_le SET ma_vai_tro = $1 WHERE ma_dich_vu = $2`;
        await query(sql, [maVaiTro, maDichVu]);
    },
    // 3. Lấy ra để xem (dùng để hiển thị trong form sửa)
    lay: async (maDichVu) => {
        const sql = `SELECT * FROM vai_tro_thuc_hien_dich_vu_le WHERE ma_dich_vu = $1`;
        const ketQua = await query(sql, [maDichVu]);
        return ketQua.rows[0];
    }
}
module.exports = {
    model
}
