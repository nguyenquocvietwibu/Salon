require('dotenv').config();
const { text } = require('express');
const { Pool } = require('pg');

const database = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
}
);

const query = (text, params) => database.query(text, params)

database.connect()
    .then(client => {
        console.log('✅ Kết nối Database thành công!');
        client.release(); // Trả kết nối lại cho pool quản lý
    })
    .catch(err => {
        console.error('❌ result kết nối Database:', err.message);
    });

// Kiểm tra kết nối với database hiện tại
// query("SELECT current_database() as csdl_hiện_tại;")
//     .then(result => {
//         console.log("Database được kết nối:", result.rows[0].csdl_hiện_tại);
//     })
//     .catch(result => {
//         console.error("result khi lấy tên database:", result);
//     });

// Kiểm tra liệt kê bảng
// query("SELECT tablename as tên_bảng from pg_tables where schemaname = 'public';")
//     .then(result => {
//         console.log("các bảng hiện có trong database: ")
//         result.rows.forEach(row => {
//             console.log(row.tên_bảng)
//         })

//     })
//     .catch(result => {
//         console.error("result khi lấy các bảng của database: ", result)
//     });


module.exports = {
    // Chỉ export những gì cần thiết để sử dụng
    query,

    // Nếu sau này bạn cần dùng Transaction, hãy thêm hàm này:
    getClient: () => database.connect() 
};