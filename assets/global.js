// ============================================
// Global JavaScript - 科幻主题核心功能
// ============================================

// 全局主题配置
window.ScifiTheme = {
  // 配置选项
  config: {
    animations: true,
    glowEffects: true,
    reducedMotion: false,
    scrollThreshold: 100,
    debounceDelay: 100
  },

  // 初始化
  init() {
    this.checkPreferences();
    this.bindEvents();
    this.initAnimations();
    this.initGlowEffects();
    this.initScrollEffects();
    console.log('Sci-Fi Theme Initialized 🚀');
  },

  // 检查用户偏好
  checkPreferences() {
    // 检查减少动画偏好
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.config.animations = false;
      this.config.glowEffects = false;
      this.config.reducedMotion = true;
      document.documentElement.setAttribute('data-reduced-motion', 'true');
    }

    // 监听系统主题变化
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        this.updateTheme(e.matches ? 'dark' : 'light');
      });
    }
  },

  // 绑定事件监听器
  bindEvents() {
    // DOM加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
    } else {
      this.onDOMReady();
    }

    // 滚动事件
    window.addEventListener('scroll', this.debounce(() => {
      this.handleScroll();
    }, this.config.debounceDelay));

    // 调整大小事件
    window.addEventListener('resize', this.debounce(() => {
      this.handleResize();
    }, this.config.debounceDelay));

    // 键盘导航
    document.addEventListener('keydown', (e) => this.handleKeydown(e));

    // 点击外部关闭模态框
    document.addEventListener('click', (e) => this.handleOutsideClick(e));
  },

  // DOM准备就绪
  onDOMReady() {
    this.initComponents();
    this.initAnimations();
    this.initLazyLoading();
    this.initTooltips();
  },

  // 初始化组件
  initComponents() {
    // 初始化按钮
    this.initButtons();

    // 初始化模态框
    this.initModals();

    // 初始化通知
    this.initNotifications();

    // 初始化表单验证
    this.initFormValidation();

    // 初始化购物车功能
    this.initCart();
  },

  // 初始化按钮功能
  initButtons() {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
      // 加载状态
      if (button.classList.contains('loading')) {
        this.setButtonLoading(button, true);
      }

      // 点击效果
      button.addEventListener('click', (e) => {
        if (!button.disabled && !button.classList.contains('loading')) {
          this.createRippleEffect(e, button);
        }
      });

      // 悬停效果增强
      button.addEventListener('mouseenter', () => {
        if (this.config.glowEffects && !button.disabled) {
          button.style.transform = 'translateY(-2px) scale(1.02)';
        }
      });

      button.addEventListener('mouseleave', () => {
        if (!button.disabled) {
          button.style.transform = '';
        }
      });
    });
  },

  // 创建涟漪效果
  createRippleEffect(event, button) {
    if (this.config.reducedMotion) return;

    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    // 添加涟漪样式
    if (!document.querySelector('#ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          transform: scale(0);
          animation: ripple-animation 0.6s linear-out;
          pointer-events: none;
        }
        @keyframes ripple-animation {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        .btn {
          position: relative;
          overflow: hidden;
        }
      `;
      document.head.appendChild(style);
    }

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  },

  // 设置按钮加载状态
  setButtonLoading(button, loading) {
    if (loading) {
      button.classList.add('loading');
      button.disabled = true;

      // 添加加载旋转器
      const spinner = document.createElement('span');
      spinner.className = 'btn__spinner';
      spinner.setAttribute('aria-hidden', 'true');

      const text = button.querySelector('.btn__text') || button;
      text.style.opacity = '0.7';

      if (!button.querySelector('.btn__spinner')) {
        button.insertBefore(spinner, button.firstChild);
      }
    } else {
      button.classList.remove('loading');
      button.disabled = false;

      const spinner = button.querySelector('.btn__spinner');
      if (spinner) spinner.remove();

      const text = button.querySelector('.btn__text') || button;
      text.style.opacity = '';
    }
  },

  // 初始化动画
  initAnimations() {
    if (!this.config.animations) return;

    // 渐入动画
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          // 如果是一次性动画，停止观察
          if (entry.target.classList.contains('fade-in') ||
              entry.target.classList.contains('slide-up') ||
              entry.target.classList.contains('scale-in')) {
            observer.unobserve(entry.target);
          }
        }
      });
    }, observerOptions);

    // 观察需要动画的元素
    document.querySelectorAll('.fade-in, .slide-up, .scale-in').forEach(el => {
      el.classList.add('fade-in');
      observer.observe(el);
    });
  },

  // 初始化发光效果
  initGlowEffects() {
    if (!this.config.glowEffects) return;

    // 为发光元素添加交互效果
    const glowElements = document.querySelectorAll('.glow-hover, .btn-glow');

    glowElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        element.style.filter = 'brightness(1.2)';
      });

      element.addEventListener('mouseleave', () => {
        element.style.filter = '';
      });
    });
  },

  // 初始化滚动效果
  initScrollEffects() {
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href !== '#') {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({
              behavior: this.config.animations ? 'smooth' : 'auto',
              block: 'start'
            });
          }
        }
      });
    });
  },

  // 处理滚动事件
  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // 更新CSS变量用于视差效果
    document.documentElement.style.setProperty('--scroll-y', `${scrollTop}px`);

    // 头部效果
    const header = document.querySelector('.site-header');
    if (header) {
      if (scrollTop > this.config.scrollThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // 返回顶部按钮
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
      if (scrollTop > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
  },

  // 处理调整大小事件
  handleResize() {
    // 更新视口高度CSS变量
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  },

  // 处理键盘事件
  handleKeydown(e) {
    // ESC键关闭模态框
    if (e.key === 'Escape') {
      this.closeAllModals();
    }

    // Tab键焦点管理
    if (e.key === 'Tab') {
      this.manageFocus(e);
    }
  },

  // 处理外部点击
  handleOutsideClick(e) {
    // 关闭点击外部的下拉菜单
    if (!e.target.closest('.dropdown')) {
      this.closeAllDropdowns();
    }
  },

  // 初始化模态框
  initModals() {
    const modals = document.querySelectorAll('[data-modal]');

    modals.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.dataset.modal;
        this.openModal(modalId);
      });
    });
  },

  // 打开模态框
  openModal(modalId) {
    const modal = document.querySelector(`#${modalId}`);
    const overlay = document.querySelector('.modal-overlay');

    if (modal && overlay) {
      overlay.classList.add('active');
      modal.classList.add('active');

      // 焦点管理
      const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      // 防止背景滚动
      document.body.style.overflow = 'hidden';

      // ARIA属性
      modal.setAttribute('aria-hidden', 'false');
      overlay.setAttribute('aria-hidden', 'false');
    }
  },

  // 关闭所有模态框
  closeAllModals() {
    const modals = document.querySelectorAll('.modal-content.active');
    const overlays = document.querySelectorAll('.modal-overlay.active');

    modals.forEach(modal => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    });

    overlays.forEach(overlay => {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
    });

    document.body.style.overflow = '';
  },

  // 初始化通知
  initNotifications() {
    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    notificationContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(notificationContainer);

    this.notificationContainer = notificationContainer;
  },

  // 显示通知
  showNotification(message, type = 'info', duration = 5000) {
    if (!this.notificationContainer) {
      this.initNotifications();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
      <div class="notification__content">${message}</div>
      <button class="notification__close" aria-label="关闭通知">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 6.586L2.707 1.293A1 1 0 001.293 2.707L6.586 8l-5.293 5.293a1 1 0 101.414 1.414L8 9.414l5.293 5.293a1 1 0 001.414-1.414L9.414 8l5.293-5.293a1 1 0 00-1.414-1.414L8 6.586z"/>
        </svg>
      </button>
    `;

    notification.style.pointerEvents = 'auto';
    notification.style.cssText += `
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    `;

    this.notificationContainer.appendChild(notification);

    // 动画显示
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);

    // 关闭按钮
    const closeBtn = notification.querySelector('.notification__close');
    closeBtn.addEventListener('click', () => this.closeNotification(notification));

    // 自动关闭
    if (duration > 0) {
      setTimeout(() => this.closeNotification(notification), duration);
    }
  },

  // 关闭通知
  closeNotification(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  },

  // 初始化工具提示
  initTooltips() {
    const tooltipTriggers = document.querySelectorAll('[data-tooltip]');

    tooltipTriggers.forEach(trigger => {
      trigger.addEventListener('mouseenter', (e) => this.showTooltip(e));
      trigger.addEventListener('mouseleave', () => this.hideTooltip());
      trigger.addEventListener('focus', (e) => this.showTooltip(e));
      trigger.addEventListener('blur', () => this.hideTooltip());
    });
  },

  // 显示工具提示
  showTooltip(event) {
    const trigger = event.target;
    const text = trigger.dataset.tooltip;

    if (!text) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip-popup';
    tooltip.textContent = text;
    tooltip.style.cssText = `
      position: absolute;
      background: var(--color-bg-dark);
      color: var(--color-text-inverse);
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      white-space: nowrap;
      z-index: 9999;
      opacity: 0;
      transform: translateY(5px);
      transition: all 0.2s ease-out;
      pointer-events: none;
    `;

    document.body.appendChild(tooltip);
    this.currentTooltip = tooltip;

    // 位置计算
    const rect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    let top = rect.top - tooltipRect.height - 10;

    // 边界检查
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10;
    }

    if (top < 10) {
      top = rect.bottom + 10;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    // 显示动画
    setTimeout(() => {
      tooltip.style.opacity = '1';
      tooltip.style.transform = 'translateY(0)';
    }, 50);
  },

  // 隐藏工具提示
  hideTooltip() {
    if (this.currentTooltip) {
      this.currentTooltip.style.opacity = '0';
      this.currentTooltip.style.transform = 'translateY(5px)';

      setTimeout(() => {
        if (this.currentTooltip && this.currentTooltip.parentNode) {
          this.currentTooltip.parentNode.removeChild(this.currentTooltip);
        }
        this.currentTooltip = null;
      }, 200);
    }
  },

  // 初始化懒加载
  initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;

            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              imageObserver.unobserve(img);

              img.addEventListener('load', () => {
                img.classList.add('loaded');
              });
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        img.classList.add('lazy');
        imageObserver.observe(img);
      });
    }
  },

  // 初始化表单验证
  initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');

    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
          this.showNotification('请修正表单中的错误', 'error');
        }
      });

      // 实时验证
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => {
          if (input.classList.contains('error')) {
            this.validateField(input);
          }
        });
      });
    });
  },

  // 验证表单
  validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  },

  // 验证字段
  validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');

    // 移除之前的错误状态
    field.classList.remove('error', 'success');

    let isValid = true;
    let errorMessage = '';

    // 必填验证
    if (required && !value) {
      isValid = false;
      errorMessage = '此字段为必填项';
    }

    // 邮箱验证
    else if (type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = '请输入有效的邮箱地址';
      }
    }

    // 最小长度验证
    else if (field.hasAttribute('minlength') && value.length < parseInt(field.dataset.minlength)) {
      isValid = false;
      errorMessage = `最少需要 ${field.dataset.minlength} 个字符`;
    }

    // 更新UI
    if (!isValid) {
      field.classList.add('error');
      this.showFieldError(field, errorMessage);
    } else {
      field.classList.add('success');
      this.hideFieldError(field);
    }

    return isValid;
  },

  // 显示字段错误
  showFieldError(field, message) {
    this.hideFieldError(field);

    const error = document.createElement('div');
    error.className = 'field-error';
    error.textContent = message;
    error.style.cssText = `
      color: var(--color-error);
      font-size: var(--font-size-sm);
      margin-top: 4px;
      display: block;
    `;

    field.parentNode.appendChild(error);
  },

  // 隐藏字段错误
  hideFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
  },

  // 初始化购物车功能
  initCart() {
    // 这里可以添加购物车相关的初始化代码
    // 例如：更新购物车数量、添加到购物车动画等

    this.updateCartCount();
  },

  // 更新购物车数量
  updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const count = this.getCartCount();

    cartCountElements.forEach(element => {
      if (count > 0) {
        element.textContent = count;
        element.style.display = 'flex';
      } else {
        element.style.display = 'none';
      }
    });
  },

  // 获取购物车数量（模拟）
  getCartCount() {
    // 这里应该从实际的购物车数据中获取
    // 现在返回模拟数据
    return 0;
  },

  // 工具函数：防抖
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // 工具函数：节流
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // 关闭所有下拉菜单
  closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown.active');
    dropdowns.forEach(dropdown => {
      dropdown.classList.remove('active');
    });
  },

  // 焦点管理
  manageFocus(e) {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  },

  // 更新主题
  updateTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    // 可以在这里添加主题切换的额外逻辑
    // 例如：更新图片、保存用户偏好等
  }
};

// 初始化主题
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.ScifiTheme.init();
  });
} else {
  window.ScifiTheme.init();
}

// 导出到全局作用域
window.ScifiTheme = ScifiTheme;