require('dotenv').config();
const app = require('./app');
const PORT = process.env.SV_PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});