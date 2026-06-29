const express = require('express');
const app = express();


app.use(express.json()); // Để đọc được dữ liệu JSON gửi lên
app.use(express.static('public')); // Cấu hình thư mục tĩnh

const { router: dichVuRouter} = require('./routes/dich_vu');

app.use("/api/dich-vu", dichVuRouter)


module.exports = app;