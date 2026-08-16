const { query } = require('../database');

const model = {
    // Lấy tất cả nhân viên (phải JOIN với bảng nguoi_dung để lấy tên, sdt...)
    layTat: async () => {
        const sql = `
            SELECT nv.ma, nd.ten, nd.sdt, nd.dang_kich_hoat, nd.ma_vai_tro, nv.ma_chi_nhanh
            FROM nhan_vien nv
            JOIN nguoi_dung nd ON nv.ma = nd.ma;
        `;
        const ketQua = await query(sql);
        return ketQua.rows;
    },
    them: async (ma, ma_chi_nhanh) => {
        const sql = `
            INSERT INTO nhan_vien (ma, ma_chi_nhanh)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const ketQua = await query(sql, [ma, ma_chi_nhanh]);
        
        // Trả về dòng vừa insert thành công (chứa ma và ma_chi_nhanh)
        return ketQua.rows[0];
    },
    // SỬA Ở ĐÂY: Thêm hàm cập nhật thông tin riêng của nhân viên (Chi nhánh)
    capNhat: async (ma, ma_chi_nhanh) => {
        const sql = `
            UPDATE nhan_vien
            SET ma_chi_nhanh = $1
            WHERE ma = $2
            RETURNING *;
        `;
        const ketQua = await query(sql, [ma_chi_nhanh, ma]);
        
        // Trả về dòng sau khi sửa (chứa ma và ma_chi_nhanh mới)
        return ketQua.rows[0];
    },
    layTheoMa: async (ma) => {
    const sql = `
        SELECT 
            nd.ma,
            nd.ten,
            nd.sdt,
            nd.dang_kich_hoat,
            nd.ma_vai_tro,
            vt.ten AS ten_vai_tro,
            nv.ma_chi_nhanh,
            cn.ten AS ten_chi_nhanh
        FROM nhan_vien nv
        JOIN nguoi_dung nd ON nv.ma = nd.ma
        LEFT JOIN vai_tro vt ON nd.ma_vai_tro = vt.ma
        LEFT JOIN chi_nhanh cn ON nv.ma_chi_nhanh = cn.ma
        WHERE nv.ma = $1;
    `;
    const ketQua = await query(sql, [ma]);
    return ketQua.rows[0];
}
}

module.exports = {
    model
}
