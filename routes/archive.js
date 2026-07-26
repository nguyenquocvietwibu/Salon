// Khi vào trang chủ
// app.get('/dich-vu', (req, res) => {
//     renderIndexWithMainContent(res, req, 'main content bodies/service', { 
//         title: 'Dịch vụ - Bright Salon' 
//     });
// });

// app.get('/', (req, res) => {
//     renderIndexWithMainContent(res, req, 'main content bodies/home');
// });

// app.get('/chi-nhanh-salon', (req, res) => {
//     renderIndexWithMainContent(res, req, 'main content bodies/salon_branch', { 
//         title: 'Chi nhánh - Bright Salon' 
//     });
// });

// // Khi vào trang đặt lịch
// app.get('/dat-lich', (req, res) => {
//     renderIndexWithMainContent(res, req, 'main content bodies/booking', { 
//         title: 'Đặt lịch - Bright Salon' 
//     });
// });

// const renderIndexWithMainContent = (res, req, viewPath, extraData = {}) => {
//     res.render('index', {
//         mainContentBody: viewPath,
//         title: extraData.title || defaultTitle,
//         user: (req.session && req.session.user) ? req.session.user : null,
        
//         // 🎯 THÊM DÒNG NÀY: Truyền đường dẫn hiện tại xuống cho EJS dùng
//         currentUrl: req.url, 
        
//         ...extraData
//     });
// };