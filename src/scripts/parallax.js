window.addEventListener('scroll', function() {
    const scrollY = window.scrollY || window.pageYOffset; // 获取页面滚动距离
    const parallaxBackground = document.getElementById('parallax1');
    parallaxBackground.style.transform = `translateY(-${scrollY * 0.5}px)`; // 调整背景位置
});