const { query } = require('../database');

const model = {
    // 1. Lấy tất cả chi nhánh
    layTat: async () => {
        // Sử dụng ST_AsGeoJSON để chuyển đổi dữ liệu không gian thành chuỗi JSON
        const sql = `
            SELECT ma, ten, dia_chi, ST_AsGeoJSON(hinh_hoc_dia_ly)::json AS hinh_hoc_dia_ly 
            FROM chi_nhanh;
        `;
        const ketQua = await query(sql);
        return ketQua.rows;
    },

    // 2. Thêm mới chi nhánh
    // hinh_hoc_dia_ly truyền vào có thể là một chuỗi GeoJSON (VD: '{"type":"Point","coordinates":[105.8,21.0]}')
    them: async (ten, dia_chi, hinh_hoc_dia_ly, dang_kich_hoat = true) => {
        const sql = `
            INSERT INTO chi_nhanh (ten, dia_chi, hinh_hoc_dia_ly, dang_kich_hoat)
            VALUES ($1, $2, ST_GeomFromGeoJSON($3), $4)
            RETURNING ma, ten, dia_chi, dang_kich_hoat, ST_AsGeoJSON(hinh_hoc_dia_ly)::json AS hinh_hoc_dia_ly;
        `;
        const ketQua = await query(sql, [ten, dia_chi, hinh_hoc_dia_ly, dang_kich_hoat]);
        return ketQua.rows[0];
    },
    // Bổ sung vào object model trong models/chi_nhanh.js
    layTheoMa: async (ma) => {
        const sql = `
        SELECT ma, ten, dia_chi, dang_kich_hoat, ST_AsGeoJSON(hinh_hoc_dia_ly)::json AS hinh_hoc_dia_ly 
        FROM chi_nhanh
        WHERE ma = $1;
    `;
        const ketQua = await query(sql, [ma]);
        return ketQua.rows[0];
    },

    // 3. Cập nhật thông tin chi nhánh
    capNhat: async (ma, ten, dia_chi, hinh_hoc_dia_ly, dang_kich_hoat) => {
        const sql = `
            UPDATE chi_nhanh 
            SET ten = $1, dia_chi = $2, hinh_hoc_dia_ly = ST_GeomFromGeoJSON($3), dang_kich_hoat = $4
            WHERE ma = $5
            RETURNING ma, ten, dia_chi, dang_kich_hoat, ST_AsGeoJSON(hinh_hoc_dia_ly)::json AS hinh_hoc_dia_ly;
        `;
        const ketQua = await query(sql, [ten, dia_chi, hinh_hoc_dia_ly, dang_kich_hoat, ma]);
        return ketQua.rows[0];
    },
    timGanNhat: async (longitude, latitude) => {
        const sql = `
            SELECT * FROM chi_nhanh
            ORDER BY hinh_hoc_dia_ly <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
            LIMIT 1;
        `;

        const ketQua = await query(sql, [longitude, latitude]);
        return ketQua.rows[0];
    },
    timTheoTen: async (ten_tim_kiem) => {
        // Sử dụng % để tìm các tên có chứa cụm từ tìm kiếm (Ví dụ: %đống đa%)
        const tuKhoa = `%${ten_tim_kiem}%`;

        const sql = `
            SELECT * FROM chi_nhanh
            WHERE ten ILIKE $1
            ORDER BY ma ASC;
        `;

        const ketQua = await query(sql, [tuKhoa]);
        return ketQua.rows; // Trả về mảng các chi nhánh khớp từ khóa
    },
    layTheoMa: async (ma) => {
        const sql = `
            SELECT ma, ten, dia_chi, ST_AsGeoJSON(hinh_hoc_dia_ly)::json AS hinh_hoc_dia_ly 
            FROM chi_nhanh
            WHERE ma = $1;
        `;
        const ketQua = await query(sql, [ma]);
        return ketQua.rows[0];
    },
    // timKhachHangTheoTen: async (ten_tim_kiem) => {
    //     // Đưa từ khóa về chữ thường và bọc % để tìm gần đúng
    //     const tuKhoa = `%${ten_tim_kiem.toLowerCase()}%`;

    //     const sql = `
    //         SELECT nd.*, vt.ten AS ten_vai_tro
    //         FROM nguoi_dung nd
    //         JOIN vai_tro vt ON nd.ma_vai_tro = vt.ma
    //         WHERE vt.ten ILIKE 'Khách hàng' 
    //           AND LOWER(nd.ten) LIKE $1
    //         ORDER BY nd.ma ASC;
    //     `;

    //     const ketQua = await query(sql, [tuKhoa]);
    //     return ketQua.rows;
    // },

    // // 2. Tìm kiếm NHÂN VIÊN theo tên (Tìm trong các vai trò chứa chữ "Nhân viên")
    // timNhanVienTheoTen: async (ten_tim_kiem) => {
    //     const tuKhoa = `%${ten_tim_kiem.toLowerCase()}%`;

    //     const sql = `
    //         SELECT nd.*, vt.ten AS ten_vai_tro
    //         FROM nguoi_dung nd
    //         JOIN vai_tro vt ON nd.ma_vai_tro = vt.ma
    //         WHERE vt.ten ILIKE '%Nhân viên%' 
    //           AND LOWER(nd.ten) LIKE $1
    //         ORDER BY nd.ma ASC;
    //     `;

    //     const ketQua = await query(sql, [tuKhoa]);
    //     return ketQua.rows;
    // }
};

module.exports = {
    model
};