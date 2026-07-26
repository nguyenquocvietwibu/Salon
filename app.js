const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

app.use(cors());
app.use(express.json());

// 1. Phục vụ file tĩnh từ thư mục public
// Khi user truy cập /, Express tự tìm index.html trong public
app.use(express.static(path.join(__dirname, 'public')));

// 2. Các router API
const { router: dichVuRouter} = require('./routes/dich_vu');
const { router: chiNhanhRouter} = require('./routes/chi_nhanh');
const { router: nguoiDungRouter} = require('./routes/nguoi_dung');
const { router: lichHenRouter} = require('./routes/lich_hen');

app.use("/api/dich-vu", dichVuRouter);
app.use("/api/chi-nhanh", chiNhanhRouter);
app.use("/api/nguoi-dung", nguoiDungRouter);
app.use("/api/lich-hen", lichHenRouter);

// 3. SPA Fallback: Mọi request không phải API thì trả về index.html
// Đặt file index.html trong thư mục public
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;