// ============================================
// Simplified Copy Function for Sci-Fi Theme
// ============================================

// 全局函数 - 直接调用复制功能
function copyGiftCode() {
    console.log('🔗 开始复制礼品卡代码');

    const codeElement = document.getElementById('giftCardCode');
    const successElement = document.getElementById('copySuccess');
    const copyButton = document.getElementById('copyButton');

    if (!codeElement || !successElement || !copyButton) {
        console.error('❌ 未找到必要的DOM元素');
        alert('页面元素加载失败，请刷新页面重试');
        return;
    }

    const giftCode = codeElement.textContent;
    console.log('🔗 要复制的代码:', giftCode);

    // 立即隐藏复制按钮
    copyButton.style.display = 'none';
    copyButton.style.visibility = 'hidden';
    copyButton.style.opacity = '0';

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
}

// 显示成功消息
function showSuccessMessage() {
    const successElement = document.getElementById('copySuccess');
    if (!successElement) {
        console.error('❌ 未找到成功消息元素');
        return;
    }

    // 设置成功消息内容
    successElement.innerHTML = `
        <span class="success-icon">✅</span>
        <span class="success-text">COPIED!</span>
    `;

    // 设置弹窗样式
    successElement.style.position = 'fixed';
    successElement.style.top = '50%';
    successElement.style.left = '50%';
    successElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
    successElement.style.opacity = '0';
    successElement.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    successElement.style.zIndex = '10000';
    successElement.style.display = 'flex';
    successElement.style.alignItems = 'center';
    successElement.style.justifyContent = 'center';
    successElement.style.gap = '0.75rem';
    successElement.style.minWidth = '200px';
    successElement.style.minHeight = '56px';

    // 蓝色底色白色字体
    successElement.style.background = 'rgba(65, 105, 225, 0.95)';
    successElement.style.color = 'white';
    successElement.style.padding = '0.875rem 2rem';
    successElement.style.borderRadius = '16px';
    successElement.style.border = '1px solid rgba(135, 206, 235, 0.6)';
    successElement.style.backdropFilter = 'blur(20px)';
    successElement.style.fontWeight = '600';
    successElement.style.fontSize = '1rem';
    successElement.style.letterSpacing = '0.05em';
    successElement.style.textAlign = 'center';
    successElement.style.boxShadow = `
        0 20px 40px rgba(65, 105, 225, 0.5),
        0 8px 16px rgba(65, 105, 225, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2)
    `;

    // 移除之前的类
    successElement.classList.remove('error');
    successElement.classList.add('showing');

    // 触发弹窗动画
    requestAnimationFrame(() => {
        successElement.style.transform = 'translate(-50%, -50%) scale(1)';
        successElement.style.opacity = '1';
    });

    // 3秒后隐藏
    setTimeout(() => {
        successElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
        successElement.style.opacity = '0';

        setTimeout(() => {
            successElement.style.display = 'none';
            successElement.classList.remove('showing');
        }, 400);
    }, 3000);
}

// 显示错误消息
function showErrorMessage() {
    const successElement = document.getElementById('copySuccess');
    if (!successElement) {
        console.error('❌ 未找到成功消息元素');
        return;
    }

    // 设置错误消息内容
    successElement.innerHTML = `
        <span class="error-icon">⚠️</span>
        <span class="error-text">复制失败，请手动选择复制</span>
    `;

    // 设置弹窗样式
    successElement.style.position = 'fixed';
    successElement.style.top = '50%';
    successElement.style.left = '50%';
    successElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
    successElement.style.opacity = '0';
    successElement.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    successElement.style.zIndex = '10000';
    successElement.style.display = 'flex';
    successElement.style.alignItems = 'center';
    successElement.style.justifyContent = 'center';
    successElement.style.gap = '0.75rem';
    successElement.style.minWidth = '200px';
    successElement.style.minHeight = '56px';

    // 红色底色白色字体
    successElement.style.background = 'rgba(239, 68, 68, 0.95)';
    successElement.style.color = 'white';
    successElement.style.padding = '0.875rem 2rem';
    successElement.style.borderRadius = '16px';
    successElement.style.border = '1px solid rgba(239, 68, 68, 0.4)';
    successElement.style.backdropFilter = 'blur(20px)';
    successElement.style.fontWeight = '600';
    successElement.style.fontSize = '1rem';
    successElement.style.letterSpacing = '0.05em';
    successElement.style.textAlign = 'center';
    successElement.style.boxShadow = `
        0 20px 40px rgba(239, 68, 68, 0.5),
        0 8px 16px rgba(239, 68, 68, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2)
    `;

    // 添加错误类
    successElement.classList.add('error', 'showing');

    // 触发弹窗动画
    requestAnimationFrame(() => {
        successElement.style.transform = 'translate(-50%, -50%) scale(1)';
        successElement.style.opacity = '1';
    });

    // 3秒后隐藏
    setTimeout(() => {
        successElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
        successElement.style.opacity = '0';

        setTimeout(() => {
            successElement.style.display = 'none';
            successElement.classList.remove('error', 'showing');
        }, 400);
    }, 3000);
}

// 降级复制方案
function fallbackCopyTextToClipboard(text) {
    console.log('🔄 使用降级复制方案');

    const textArea = document.createElement('textarea');
    textArea.value = text;
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

// 页面加载完成后绑定事件
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 简化复制功能已加载');

    // 为复制按钮添加点击效果
    const copyButton = document.getElementById('copyButton');
    if (copyButton) {
        copyButton.addEventListener('click', function(event) {
            // 阻止默认行为
            if (event) {
                event.preventDefault();
            }

            // 添加点击动画
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });

        console.log('✅ 复制按钮事件已绑定');
    } else {
        console.error('❌ 未找到复制按钮');
    }

    // 添加键盘支持
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            const focusedElement = document.activeElement;
            if (focusedElement && focusedElement.id === 'copyButton') {
                event.preventDefault();
                copyGiftCode();
            }
        }
    });

    console.log('🚀 复制功能初始化完成');
});

// 导出函数
window.copyGiftCode = copyGiftCode;
window.showSuccessMessage = showSuccessMessage;
window.showErrorMessage = showErrorMessage;