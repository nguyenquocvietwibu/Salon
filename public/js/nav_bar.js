    const mainContent = document.getElementById("main-content");

    // Map URL sang file HTML trong thư mục mới
    const routeMap = {
        "/": "/html/main_content_bodies/home.html",
        "/dich-vu": "/html/main_content_bodies/service.html",
        "/chi-nhanh-salon": "/html/main_content_bodies/salon_branch.html",
        "/dat-lich": "/html/main_content_bodies/booking.html"
    };

    async function loadPage(url) {
        const filePath = routeMap[url] || routeMap["/"];
        
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error("Không tải được trang");
            
            const html = await response.text();
            mainContent.innerHTML = html;
            
            // Cập nhật URL trình duyệt
            window.history.pushState({}, "", url);
            
            // Cập nhật class selected
            updateMenuSelection(url);
        } catch (error) {
            mainContent.error("Lỗi tải nội dung:", error);
        }
    }

    function updateMenuSelection(currentUrl) {
        document.querySelectorAll('.menu-item').forEach(link => {
            const li = link.closest('li');
            li.classList.remove('selected');
            if (link.getAttribute("href") === currentUrl) {
                li.classList.add('selected');
            }
        });
    }

    // Bắt sự kiện click
    document.querySelectorAll('.menu-item').forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const url = link.getAttribute("href");
            loadPage(url);
        });
    });

    // Load nội dung mặc định khi vào trang lần đầu
    loadPage(window.location.pathname);