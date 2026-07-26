const { query } = require('../database');

const model = {
    layTat: async () => {
        const ketQua = await query('SELECT * FROM nguoi_dung')
        return ketQua.rows;
    },
    them: async (ten, ma_vai_tro, sdt, dang_kich_hoat) => {
        const sql = `
            INSERT INTO nguoi_dung (ten, ma_vai_tro, sdt, dang_kich_hoat)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;

        const ketQua = await query(sql, [ten, ma_vai_tro, sdt, dang_kich_hoat]);

        // Với lệnh INSERT tạo dịch vụ mới, mình KHUYÊN NÊN trả về
        // dòng vừa tạo để lấy được cái 'ma' (ID) tự tăng
        return ketQua.rows[0];
    },
    capNhat: async (ma, ten, sdt, dang_kich_hoat) => {
        const sql = `
            UPDATE nguoi_dung 
            SET ten = $1, sdt = $2, dang_kich_hoat = $3
            WHERE ma = $4
            RETURNING *;
        `;
        const ketQua = await query(sql, [ten, sdt, dang_kich_hoat, ma]);
        
        // Trả về dòng dữ liệu sau khi đã sửa đổi thành công
        return ketQua.rows[0];
    },
    // 2. Lấy tất cả người dùng có vai trò là Khách hàng
    layTatKhachHang: async () => {
        const sql = `
            SELECT nd.*, vt.ten AS ten_vai_tro
            FROM nguoi_dung nd
            JOIN vai_tro vt ON nd.ma_vai_tro = vt.ma
            WHERE vt.ten ILIKE $1
            ORDER BY nd.ma ASC;
        `;
        // Tìm chính xác cụm "Khách hàng" (ILIKE giúp không phân biệt hoa thường)
        const ketQua = await query(sql, ['Khách hàng']);
        return ketQua.rows;
    },

    // 3. Lấy tất cả người dùng có vai trò chứa chữ "Nhân viên"
    layTatNhanVien: async () => {
        const sql = `
            SELECT nd.*, vt.ten AS ten_vai_tro
            FROM nguoi_dung nd
            JOIN vai_tro vt ON nd.ma_vai_tro = vt.ma
            WHERE vt.ten ILIKE $1
            ORDER BY nd.ma ASC;
        `;
        // Bọc trong dấu % để tìm kiếm gần đúng: Chỉ cần chứa chữ "Nhân viên" là được
        const ketQua = await query(sql, ['%Nhân viên%']);
        return ketQua.rows;
    },
    timKhachHangTheoTen: async (ten_tim_kiem) => {
        // Đưa từ khóa về chữ thường và bọc % để tìm gần đúng
        const tuKhoa = `%${ten_tim_kiem.toLowerCase()}%`;
        
        const sql = `
            SELECT nd.*, vt.ten AS ten_vai_tro
            FROM nguoi_dung nd
            JOIN vai_tro vt ON nd.ma_vai_tro = vt.ma
            WHERE vt.ten ILIKE 'Khách hàng' 
              AND LOWER(nd.ten) LIKE $1
            ORDER BY nd.ma ASC;
        `;
        
        const ketQua = await query(sql, [tuKhoa]);
        return ketQua.rows;
    },
    
    layTheoSDT: async (sdt) => {
        const sql = `
            SELECT nd.*, vt.ten AS ten_vai_tro
            FROM nguoi_dung nd
            LEFT JOIN vai_tro vt ON nd.ma_vai_tro = vt.ma
            WHERE nd.sdt = $1
        `;
        const ketQua = await query(sql, [sdt]);
        return ketQua.rows[0];
    },
    // 2. Tìm kiếm NHÂN VIÊN theo tên (Tìm trong các vai trò chứa chữ "Nhân viên")
    timNhanVienTheoTen: async (ten_tim_kiem) => {
        const tuKhoa = `%${ten_tim_kiem.toLowerCase()}%`;
        
        const sql = `
            SELECT nd.*, vt.ten AS ten_vai_tro
            FROM nguoi_dung nd
            JOIN vai_tro vt ON nd.ma_vai_tro = vt.ma
            WHERE vt.ten ILIKE '%Nhân viên%' 
              AND LOWER(nd.ten) LIKE $1
            ORDER BY nd.ma ASC;
        `;
        
        const ketQua = await query(sql, [tuKhoa]);
        return ketQua.rows;
    }
}

module.exports = {
    model
}
