const { query } = require('../database');

const model = {
    layTat: async () => {
        const ketQua = await query('SELECT * FROM dich_vu')
        return ketQua.rows;
    },
    them: async (ten, gia, thoiLuong, loai) => {
        const sql = `
            INSERT INTO dich_vu (ten, gia, thoi_luong, loai)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;

        const ketQua = await query(sql, [ten, gia, thoiLuong, loai]);

        // Với lệnh INSERT tạo dịch vụ mới, mình KHUYÊN NÊN trả về
        // dòng vừa tạo để lấy được cái 'ma' (ID) tự tăng
        return ketQua.rows[0];
    },
    xoa: async (ma) => {
        const sql = `DELETE FROM dich_vu WHERE ma = $1 RETURNING *`;
        const ketQua = await query(sql, [ma]);
        // Trả về dòng vừa xóa để Frontend biết nó đã mất cái gì
        return ketQua.rows[0];
    },
    capNhat: async (ma, { ten, gia, thoiLuong, dangHoatDong }) => {
        const sql = `
        UPDATE dich_vu 
        SET ten = $1, 
            gia = $2, 
            thoi_luong = $3,
            dang_hoat_dong = $4
        WHERE ma = $5
        RETURNING *;
    `;

        // Truyền tham số đúng thứ tự: ten, gia, thoiLuong, dangHoatDong, ma
        const ketQua = await query(sql, [ten, gia, thoiLuong, dangHoatDong, ma]);

        return ketQua.rows[0];
    },
    lay: async (ma) => {
        const sql = `SELECT * FROM dich_vu WHERE ma = $1`;
        const ketQua = await query(sql, [ma]);
        return ketQua.rows[0];
    },
    layChiTietDvLe: async (ma) => {
        const sql = `
        SELECT dv.*, 
               json_build_object(
                   'ma_vai_tro', vt.ma_vai_tro,
                   'ten_vai_tro', v.ten
               ) as vai_tro_thuc_hien
        FROM dich_vu dv
        LEFT JOIN vai_tro_thuc_hien_dich_vu_le vt ON dv.ma = vt.ma_dich_vu
        LEFT JOIN vai_tro v ON vt.ma_vai_tro = v.ma
        WHERE dv.ma = $1 AND dv.loai = 'Lẻ'
        GROUP BY dv.ma, vt.ma_vai_tro, v.ten
    `;
        const ketQua = await query(sql, [ma]);
        return ketQua.rows[0];
    },
    layChiTietDvGoi: async (ma) => {
        const sql = `
        SELECT dv.*, 
               json_agg(
                   json_build_object(
                       'ma_dich_vu', dv_le.ma,
                       'ten_dich_vu', dv_le.ten,
                       'ma_vai_tro', vtth.ma_vai_tro,
                       'ten_vai_tro', vt.ten
                   )
               ) as danh_sach_dich_vu_le
        FROM dich_vu dv
        LEFT JOIN chi_tiet_dich_vu_goi ct ON dv.ma = ct.ma_dich_vu_goi
        LEFT JOIN dich_vu dv_le ON ct.ma_dich_vu_le = dv_le.ma
        LEFT JOIN vai_tro_thuc_hien_dich_vu_le vtth ON dv_le.ma = vtth.ma_dich_vu
        LEFT JOIN vai_tro vt ON vtth.ma_vai_tro = vt.ma
        WHERE dv.ma = $1 and dv.loai = 'Gói'
        GROUP BY dv.ma
    `;
        const ketQua = await query(sql, [ma]);
        return ketQua.rows[0];
    },
    layTatLe: async () => {
        // Chỉ lấy thông tin cơ bản: Mã, Tên, Giá. Không cần JOIN vai trò.
        const sql = `SELECT * FROM dich_vu WHERE loai = 'Lẻ' ORDER BY ten ASC`;
        const ketQua = await query(sql);
        return ketQua.rows;
    },
    layTatGoi: async () => {
        // Chỉ lấy thông tin cơ bản: Mã, Tên, Giá. Không cần JOIN vai trò.
        const sql = `SELECT * FROM dich_vu WHERE loai = 'Gói' ORDER BY ten ASC`;
        const ketQua = await query(sql);
        return ketQua.rows;
    }
}
module.exports = {
    model
}
