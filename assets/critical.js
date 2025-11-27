// ============================================
// Critical JavaScript for Sci-Fi Gift Card
// 立即执行的关键功能
// ============================================

(function() {
  'use strict';

  // 立即执行的初始化
  function initCritical() {
    // 设置CSS变量
    setCSSVariables();

    // 预加载字体
    preloadFonts();

    // 初始化错误处理
    initErrorHandling();

    // 添加加载完成类
    document.documentElement.classList.add('js-loaded');
  }

  // 设置CSS变量
  function setCSSVariables() {
    const root = document.documentElement;

    // 科幻主题颜色变量
    const sciFiColors = {
      '--color-primary': '#ffffff',
      '--color-secondary': '#87ceeb',
      '--color-accent': '#4a90e2',
      '--color-text-primary': '#333333',
      '--color-text-secondary': '#666666',
      '--color-text-light': '#999999',
      '--color-bg-primary': '#ffffff',
      '--color-bg-secondary': '#f8f9fa',
      '--color-success': '#28a745',
      '--color-error': '#dc3545',
      '--glow-primary': 'rgba(135, 206, 235, 0.6)',
      '--glow-secondary': 'rgba(74, 144, 226, 0.4)'
    };

    // 设置变量
    Object.entries(sciFiColors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // 设置字体变量
    root.style.setProperty('--font-family-primary', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    root.style.setProperty('--font-family-heading', 'Inter, "Helvetica Neue", Arial, sans-serif');
    root.style.setProperty('--font-family-monospace', '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace');
  }

  // 预加载字体
  function preloadFonts() {
    const fonts = [
      {
        family: 'Inter',
        weight: '400',
        display: 'swap'
      },
      {
        family: 'Inter',
        weight: '600',
        display: 'swap'
      },
      {
        family: 'Inter',
        weight: '700',
        display: 'swap'
      }
    ];

    fonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = `https://fonts.shopifycdn.com/css2?family=Inter:wght@${font.weight}&display=${font.display}`;
      document.head.appendChild(link);
    });
  }

  // 初始化错误处理
  function initErrorHandling() {
    // 全局错误处理
    window.addEventListener('error', function(event) {
      console.error('Critical JS Error:', event.error);

      // 如果是关键功能错误，显示友好的错误提示
      if (event.filename && event.filename.includes('gift-card')) {
        showFriendlyError('礼品卡功能暂时不可用，请刷新页面重试。');
      }
    });

    // Promise错误处理
    window.addEventListener('unhandledrejection', function(event) {
      console.error('Unhandled Promise Rejection:', event.reason);
      event.preventDefault();
    });
  }

  // 显示友好错误提示
  function showFriendlyError(message) {
    // 检查是否已经显示了错误提示
    if (document.querySelector('.critical-error-notice')) {
      return;
    }

    const errorNotice = document.createElement('div');
    errorNotice.className = 'critical-error-notice';
    errorNotice.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #dc3545, #c82333);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(220, 53, 69, 0.4);
        z-index: 9999;
        max-width: 300px;
        font-family: var(--font-family-primary);
        font-size: 14px;
        animation: slideInRight 0.3s ease-out;
      ">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </svg>
          <strong>系统提示</strong>
        </div>
        <div>${message}</div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          margin-top: 0.5rem;
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        ">关闭</button>
      </div>
    `;

    // 添加动画样式
    if (!document.querySelector('#error-notice-style')) {
      const style = document.createElement('style');
      style.id = 'error-notice-style';
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(errorNotice);

    // 5秒后自动移除
    setTimeout(() => {
      if (errorNotice.parentElement) {
        errorNotice.remove();
      }
    }, 5000);
  }

  // 检测用户偏好
  function detectUserPreferences() {
    // 检测减少动画偏好
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.setAttribute('data-reduced-motion', 'true');
    }

    // 检测深色模式偏好
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  // 性能监控
  function initPerformanceMonitoring() {
    if ('performance' in window) {
      // 监控关键渲染指标
      window.addEventListener('load', function() {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          const loadTime = perfData.loadEventEnd - perfData.navigationStart;

          // 如果加载时间过长，显示提示
          if (loadTime > 3000) {
            console.warn('Page load time is slow:', loadTime + 'ms');
          }
        }, 0);
      });
    }
  }

  // 工具函数：防抖
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 工具函数：节流
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // 导出到全局作用域
  window.CriticalJS = {
    debounce,
    throttle,
    showFriendlyError,
    setCSSVariables
  };

  // 立即初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initCritical();
      detectUserPreferences();
      initPerformanceMonitoring();
    });
  } else {
    initCritical();
    detectUserPreferences();
    initPerformanceMonitoring();
  }

})();