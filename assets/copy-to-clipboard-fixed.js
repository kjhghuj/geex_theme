// ============================================
// Copy to Clipboard Component for Sci-Fi Theme - CORRECTED VERSION
// ============================================

function copyGiftCode() {
    console.log('🔗 复制礼品卡代码功能被调用');

    const codeElement = document.getElementById('giftCardCode');
    const successElement = document.getElementById('copySuccess');
    const copyButton = document.getElementById('copyButton');

    if (codeElement && copyButton && successElement) {
        const giftCode = codeElement.textContent;
        console.log('🔗 复制的礼品卡代码:', giftCode);


        try {
            // 尝试使用现代 Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(giftCode).then(() => {
                    console.log('✅ 使用现代API复制成功');
                    showSuccessMessage();
                }).catch(error => {
                    console.error('❌ 现代API复制失败，使用降级方案:', error);
                    fallbackCopyTextToClipboard(giftCode);
                    showSuccessMessage();
                });
            } else {
                // 降级方案：使用 document.execCommand
                fallbackCopyTextToClipboard(giftCode);
                console.log('✅ 使用降级方案复制成功');
                showSuccessMessage();
            }
        } catch (error) {
            console.error('❌ 复制失败:', error);
            showErrorMessage();
        }
    } else {
        console.error('❌ 未找到必要的DOM元素');
        console.log('Code element:', codeElement);
        console.log('Button element:', copyButton);
        console.log('Success element:', successElement);
    }
}

// 隐藏复制按钮的函数
function hideCopyButton() {
    const copyButton = document.getElementById('copyButton');
    if (copyButton) {
        // 添加隐藏动画类
        copyButton.classList.add('hiding');

        // 300ms后完全隐藏
        setTimeout(() => {
            copyButton.style.display = 'none';
            copyButton.style.visibility = 'hidden';
            copyButton.style.opacity = '0';
            copyButton.style.transform = 'scale(0.8)';
        }, 300);
    }
}

// 显示成功消息的函数
function showSuccessMessage() {
    const successElement = document.getElementById('copySuccess');
    if (successElement) {
        // 确保是成功状态的内容
        successElement.innerHTML = `
            <span class="success-icon">✅</span>
            <span class="success-text">COPIED!</span>
        `;

        // 重置样式，添加弹窗效果
        successElement.style.position = 'fixed';
        successElement.style.top = '50%';
        successElement.style.left = '50%';
        successElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
        successElement.style.opacity = '0';
        successElement.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        successElement.style.zIndex = '10000';

        // 移除错误类，添加显示动画类
        successElement.classList.remove('error');
        successElement.classList.add('showing');

        // 触发弹窗动画
        requestAnimationFrame(() => {
            successElement.style.transform = 'translate(-50%, -50%) scale(1)';
            successElement.style.opacity = '1';
        });

        // 3秒后开始隐藏动画
        setTimeout(() => {
            successElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
            successElement.style.opacity = '0';

            // 等待动画完成后隐藏元素
            setTimeout(() => {
                successElement.style.display = 'none';
                successElement.classList.remove('showing');
            }, 400);
        }, 3000);
    }
}

// 显示错误消息的函数
function showErrorMessage() {
    const successElement = document.getElementById('copySuccess');
    if (successElement) {
        // 设置错误状态的内容
        successElement.innerHTML = `
            <span class="error-icon">⚠️</span>
            <span class="error-text">复制失败，请手动选择复制</span>
        `;

        // 重置样式，添加弹窗效果
        successElement.style.position = 'fixed';
        successElement.style.top = '50%';
        successElement.style.left = '50%';
        successElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
        successElement.style.opacity = '0';
        successElement.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        successElement.style.zIndex = '10000';

        // 添加错误类和显示动画类
        successElement.classList.add('error', 'showing');

        // 触发弹窗动画
        requestAnimationFrame(() => {
            successElement.style.transform = 'translate(-50%, -50%) scale(1)';
            successElement.style.opacity = '1';
        });

        // 3秒后开始隐藏动画
        setTimeout(() => {
            successElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
            successElement.style.opacity = '0';

            // 等待动画完成后隐藏元素
            setTimeout(() => {
                successElement.style.display = 'none';
                successElement.classList.remove('error', 'showing');
            }, 400);
        }, 3000);
    }
}

// 隐藏消息的函数
function hideMessage() {
    const successElement = document.getElementById('copySuccess');
    if (successElement) {
        // 添加隐藏动画
        successElement.classList.remove('showing');
        successElement.style.opacity = '0';
        successElement.style.transform = 'translate(-50%, -50%) scale(0.8)';

        // 300ms后完全隐藏
        setTimeout(() => {
            successElement.style.display = 'none';
            successElement.classList.remove('error', 'showing');
        }, 300);
    }
}

// 降级复制方案
function fallbackCopyTextToClipboard(text) {
    console.log('🔄 使用降级复制方案');

    const textArea = document.createElement('textarea');
    textArea.value = text;

    // 设置样式以避免页面滚动
    textArea.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 2em;
        height: 2em;
        padding: 0;
        border: none;
        outline: none;
        box-shadow: none;
        background: transparent;
    `;

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (!successful) {
            throw new Error('execCommand copy command returned false');
        }

        console.log('✅ 降级方案执行成功');
    } catch (error) {
        console.error('❌ 降级方案执行失败:', error);
        document.body.removeChild(textArea);
        throw error;
    }
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 复制功能脚本已加载');

    // 确保复制按钮存在
    const copyButton = document.getElementById('copyButton');
    if (copyButton) {
        console.log('✅ 复制按钮已找到');

        // 为复制按钮添加点击效果
        copyButton.addEventListener('click', function(event) {
            event.preventDefault();

            // 立即添加点击动画
            this.style.transform = 'scale(0.95)';
            this.style.transition = 'transform 0.1s ease';

            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    } else {
        console.warn('⚠️ 未找到复制按钮');
    }

    // 确保成功消息元素存在
    const successElement = document.getElementById('copySuccess');
    if (successElement) {
        console.log('✅ 成功消息元素已找到');
    } else {
        console.warn('⚠️ 未找到成功消息元素');
    }

    // 确保礼品卡代码元素存在
    const codeElement = document.getElementById('giftCardCode');
    if (codeElement) {
        console.log('✅ 礼品卡代码元素已找到');
        console.log('📋 礼品卡代码内容:', codeElement.textContent);
    } else {
        console.warn('⚠️ 未找到礼品卡代码元素');
    }
});

// 添加键盘支持 (无障碍性)
document.addEventListener('keydown', function(event) {
    // 当用户聚焦在复制按钮上并按Enter或空格键时
    if (event.key === 'Enter' || event.key === ' ') {
        const focusedElement = document.activeElement;
        if (focusedElement && focusedElement.id === 'copyButton') {
            event.preventDefault();
            copyGiftCode();
        }
    }
});

// 导出函数供全局使用
window.copyGiftCode = copyGiftCode;
window.hideCopyButton = hideCopyButton;
window.showSuccessMessage = showSuccessMessage;
window.showErrorMessage = showErrorMessage;

console.log('🚀 复制功能模块加载完成');