const { query } = require('../database');

const model = {
    layTat: async () => {
        const ketQua = await query('SELECT * FROM chi_tiet_dich_vu_goi');
        return ketQua.rows;
    },
    them: async (maDVGoi, cacMaDVLe) => {
        const sql = `
            INSERT INTO chi_tiet_dich_vu_goi (ma_dich_vu_goi, ma_dich_vu_le)
            SELECT $1, unnest($2::int[])
        `;
        await query(sql, [maDVGoi, cacMaDVLe]);
    },
    xoa: async (maDVGoi) => {
        // --- ĐÃ THÊM DÒNG NÀY ---
        const sql = `DELETE FROM chi_tiet_dich_vu_goi WHERE ma_dich_vu_goi = $1 RETURNING *`;
        // ------------------------
        const ketQua = await query(sql, [maDVGoi]);
        return ketQua.rows;
    },
    capNhat: async (maDVGoi, cacMaDVLe) => {
        // 1. Xóa sạch cũ bằng hàm xoa có sẵn
        await model.xoa(maDVGoi);

        // 2. Thêm mới nếu có danh sách dịch vụ
        if (cacMaDVLe && cacMaDVLe.length > 0) {
            await model.them(maDVGoi, cacMaDVLe);
        }
    }  
}

module.exports = {
    model
}
