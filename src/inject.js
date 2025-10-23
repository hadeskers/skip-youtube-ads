(function () {
    console.log("HADESKER: YouTube Ad Skipper injected");
    if (!location.href.startsWith("https://www.youtube.com/")) return;

    const TARGET_RATE = 16;
    const DEBOUNCE_MS = 200; // thời gian chờ giữa các lần gọi thực sự
    const skipAds = {
        count: 0,
        lastSkip: 0,
    };

    let debounceTimer = null;

    function showToast(message) {
        let toast = document.getElementById("yt-skip-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "yt-skip-toast";
            toast.style.position = "fixed";
            toast.style.top = "20px";
            toast.style.left = "50%";
            toast.style.transform = "translateX(-50%)";
            toast.style.zIndex = "999999";
            toast.style.background = "rgb(255 3 3)";
            toast.style.color = "#fff";
            toast.style.padding = "10px 16px";
            toast.style.borderRadius = "8px";
            toast.style.fontSize = "24px";
            toast.style.fontFamily = "sans-serif";
            toast.style.opacity = "0";
            toast.style.transition = "opacity 0.3s ease";
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.opacity = "1";
        clearTimeout(toast._hideTimer);
        toast._hideTimer = setTimeout(() => {
            toast.style.opacity = "0";
        }, 4000);
    }

    function setAdVideoRate() {
        const adContainer = document.querySelector("div.ad-showing");
        if (!adContainer) return;

        const video = document.querySelector("div.ad-showing video");
        if (!video) return;

        if (video.playbackRate === TARGET_RATE) return;

        //video.currentTime = 999999; // Nếu sử dụng cách này thì bị yt cảnh báo vi phạm chính sách

        video.playbackRate = TARGET_RATE;
        video.defaultPlaybackRate = TARGET_RATE;

        showToast(`HADESKER: Đã bỏ qua quảng cáo lần: ${++skipAds.count}`);
    }

    function debounceSetAdVideoRate() {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(setAdVideoRate, DEBOUNCE_MS);
    }

    // Theo dõi DOM → debounce khi có thay đổi
    const mo = new MutationObserver(() => {
        debounceSetAdVideoRate();
    });
    mo.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true
    });

    // Áp dụng ngay khi load
    debounceSetAdVideoRate();

    // Khi điều hướng nội bộ của YouTube (SPA)
    window.addEventListener("yt-navigate-finish", () => {
        debounceSetAdVideoRate();
    });

    // Khi tab trở lại foreground
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            debounceSetAdVideoRate();
        }
    });
})();
