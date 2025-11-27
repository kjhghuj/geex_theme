/**
 * 主题主JavaScript文件
 * 整合所有主题功能的入口点
 */

// 全局配置
window.ScifiTheme = window.ScifiTheme || {
  version: '1.0.0',
  settings: {
    cartType: 'drawer', // 'drawer' or 'page'
    enableQuickView: true,
    enableWishlist: true,
    enableCompare: false,
    enableAjaxCart: true
  },

  // 通知系统
  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
      <div class="notification__content">
        <span class="notification__message">${message}</span>
        <button type="button" class="notification__close" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 6.586L2.707 1.293A1 1 0 101.293 2.707L6.586 8l-5.293 5.293a1 1 0 101.414 1.414L8 9.414l5.293 5.293a1 1 0 001.414-1.414L9.414 8l5.293-5.293a1 1 0 00-1.414-1.414L8 6.586z"/>
          </svg>
        </button>
      </div>
    `;

    // 添加样式
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--color-bg-primary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 400px;
      padding: 16px;
    `;

    // 根据类型设置颜色
    const colors = {
      success: 'var(--color-success)',
      error: 'var(--color-error)',
      warning: 'var(--color-warning)',
      info: 'var(--color-secondary)'
    };

    notification.style.borderLeft = `4px solid ${colors[type] || colors.info}`;

    document.body.appendChild(notification);

    // 显示动画
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // 关闭功能
    const closeNotification = () => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    };

    // 点击关闭按钮
    notification.querySelector('.notification__close').addEventListener('click', closeNotification);

    // 自动关闭
    setTimeout(closeNotification, duration);
  },

  // 购物车计数更新
  updateCartCount(count) {
    const cartCountElements = document.querySelectorAll('[data-cart-count]');
    cartCountElements.forEach(element => {
      element.textContent = count;

      // 添加动画效果
      element.style.transform = 'scale(1.2)';
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 200);
    });
  },

  // 格式化价格
  formatMoney(cents, format = '') {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }

    const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    const formatString = format || '{{amount}}';

    function defaultOption(opt, def) {
      return typeof opt === 'undefined' ? def : opt;
    }

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultOption(precision, 2);
      thousands = defaultOption(thousands, ',');
      decimal = defaultOption(decimal, '.');

      if (isNaN(number) || number === null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      const parts = number.split('.');
      const dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      const cents_part = parts[1] ? decimal + parts[1] : '';

      return dollars + cents_part;
    }

    let value = '';

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
      default:
        value = formatWithDelimiters(cents, 2);
    }

    return formatString.replace(placeholderRegex, value);
  },

  // 防抖函数
  debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  // 节流函数
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // 检测元素是否在视口中
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // 平滑滚动到元素
  scrollToElement(element, offset = 0) {
    if (!element) return;

    const elementTop = element.offsetTop - offset;
    window.scrollTo({
      top: elementTop,
      behavior: 'smooth'
    });
  },

  // 获取产品数据
  async getProductData(handle) {
    try {
      const response = await fetch(`/products/${handle}.js`);
      if (!response.ok) throw new Error('Product not found');
      return await response.json();
    } catch (error) {
      console.error('Error fetching product data:', error);
      return null;
    }
  },

  // 本地存储操作
  storage: {
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Error setting localStorage:', error);
      }
    },

    get(key) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error('Error getting localStorage:', error);
        return null;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing localStorage:', error);
      }
    }
  },

  // 初始化所有功能模块
  init() {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.loadModules();
      });
    } else {
      this.loadModules();
    }
  },

  // 加载功能模块
  loadModules() {
    // 初始化购物车功能
    if (window.Cart) {
      window.cart = new Cart();
    }

    // 初始化快速查看功能
    if (window.QuickView && this.settings.enableQuickView) {
      // QuickView 已经在自己的文件中初始化
    }

    // 初始化产品页面功能
    if (window.ProductPage) {
      window.productPage = new ProductPage();
    }

    // 初始化搜索功能
    if (window.Search) {
      window.search = new Search();
    }

    // 初始化移动端导航
    this.initMobileNavigation();

    // 初始化返回顶部按钮
    this.initBackToTop();

    // 初始化滚动监听
    this.initScrollListeners();

    // 初始化图片延迟加载
    this.initLazyLoading();

    // 初始化表单验证
    this.initFormValidation();

    console.log('Scifi Theme initialized successfully');
  },

  // 移动端导航
  initMobileNavigation() {
    const mobileMenuToggle = document.querySelector('[data-mobile-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    const overlay = document.querySelector('[data-overlay]');

    if (!mobileMenuToggle || !mobileMenu) return;

    const openMenu = () => {
      mobileMenu.classList.add('open');
      overlay?.classList.add('active');
      document.body.style.overflow = 'hidden';
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = () => {
      mobileMenu.classList.remove('open');
      overlay?.classList.remove('active');
      document.body.style.overflow = '';
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
    };

    mobileMenuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    overlay?.addEventListener('click', closeMenu);

    // ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMenu();
      }
    });
  },

  // 返回顶部按钮
  initBackToTop() {
    const backToTopBtn = document.querySelector('[data-back-to-top]');
    if (!backToTopBtn) return;

    const showBackToTop = this.throttle(() => {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }, 100);

    window.addEventListener('scroll', showBackToTop);

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  },

  // 滚动监听
  initScrollListeners() {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollEffects = () => {
      const currentScrollY = window.scrollY;

      // 头部显示/隐藏
      const header = document.querySelector('[data-header]');
      if (header) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          header.classList.add('header--hidden');
        } else {
          header.classList.remove('header--hidden');
        }
      }

      // 滚动方向类
      document.body.classList.toggle('scrolling-up', currentScrollY < lastScrollY);
      document.body.classList.toggle('scrolling-down', currentScrollY > lastScrollY);

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  },

  // 图片延迟加载
  initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;

            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }

            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
              img.removeAttribute('data-srcset');
            }

            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px'
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    } else {
      // 回退方案
      document.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
        img.classList.add('loaded');
      });
    }
  },

  // 表单验证
  initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');

    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
        }
      });
    });
  },

  // 验证表单
  validateForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;

    inputs.forEach(input => {
      if (input.hasAttribute('required') && !input.value.trim()) {
        this.showFieldError(input, '此字段是必填的');
        isValid = false;
      } else if (input.type === 'email' && input.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value)) {
          this.showFieldError(input, '请输入有效的邮箱地址');
          isValid = false;
        } else {
          this.clearFieldError(input);
        }
      } else {
        this.clearFieldError(input);
      }
    });

    return isValid;
  },

  // 显示字段错误
  showFieldError(field, message) {
    this.clearFieldError(field);

    field.classList.add('error');

    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;

    field.parentNode.appendChild(errorElement);
  },

  // 清除字段错误
  clearFieldError(field) {
    field.classList.remove('error');

    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }
};

// 页面加载完成后初始化主题
window.ScifiTheme.init();

// 导出到全局作用域（用于向后兼容）
window.theme = window.ScifiTheme;