// 项目经历页面密码验证
const PORTFOLIO_PASSWORD = 'myworks2024'; // 设置密码

// 检查密码函数
function checkPassword() {
    const passwordInput = document.getElementById('portfolio-password');
    const errorMessage = document.getElementById('password-error');
    const passwordPrompt = document.getElementById('password-prompt');
    const portfolioContent = document.getElementById('portfolio-content');
    
    const enteredPassword = passwordInput.value.trim();
    
    if (enteredPassword === '') {
        showError('请输入密码');
        return;
    }
    
    if (enteredPassword === PORTFOLIO_PASSWORD) {
        // 密码正确，显示作品内容
        passwordPrompt.style.display = 'none';
        portfolioContent.style.display = 'block';
        
        // 添加淡入动画
        portfolioContent.style.opacity = '0';
        setTimeout(() => {
            portfolioContent.style.transition = 'opacity 0.5s ease';
            portfolioContent.style.opacity = '1';
        }, 100);
        
        // 清除错误信息
        errorMessage.textContent = '';
        
        // 滚动到顶部
        scrollToTop();
    } else {
        // 密码错误
        showError('密码错误，请重试');
        passwordInput.value = '';
        
        // 添加输入框震动效果
        passwordInput.classList.add('shake');
        setTimeout(() => {
            passwordInput.classList.remove('shake');
        }, 500);
    }
}

// 显示错误信息
function showError(message) {
    const errorMessage = document.getElementById('password-error');
    errorMessage.textContent = message;
    errorMessage.style.opacity = '0';
    errorMessage.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        errorMessage.style.opacity = '1';
    }, 100);
}

// 监听回车键
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('portfolio-password');
    
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
        
        // 清除错误信息当用户开始输入时
        passwordInput.addEventListener('input', function() {
            const errorMessage = document.getElementById('password-error');
            if (errorMessage.textContent) {
                errorMessage.textContent = '';
            }
        });
    }
});

// 添加震动动画的CSS类（通过JavaScript动态添加）
function addShakeAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        .shake {
            animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
}

// 页面加载时添加震动动画样式
document.addEventListener('DOMContentLoaded', addShakeAnimation);

// 提示：密码是 myworks2024
console.log('提示：项目经历页面密码是 myworks2024');