// Theme JavaScript for Sci-Fi Shopify Theme
(() => {
  // Theme initialization
  const theme = {
    init() {
      this.initScrollEffects();
      this.initAnimations();
      this.initGlowEffects();
      this.initMobileMenu();
      this.initCartFunctionality();
      this.initSearchFunctionality();
      this.initWishlist();
      this.initLazyLoading();
      this.initPerformanceMonitoring();
    },

    // Scroll effects
    initScrollEffects() {
      const header = document.querySelector('.header');
      if (!header) return;

      window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });
    },

    // Animation initialization
    initAnimations() {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      // Observe elements for animation
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
      });
    },

    // Glow effects for buttons
    initGlowEffects() {
      const glowButtons = document.querySelectorAll('.glow-button, .cyber-button');

      glowButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
          button.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.8), 0 0 60px rgba(135, 206, 235, 0.4)';
        });

        button.addEventListener('mouseleave', () => {
          button.style.boxShadow = '0 0 20px rgba(135, 206, 235, 0.3)';
        });
      });
    },

    // Mobile menu functionality
    initMobileMenu() {
      const menuToggle = document.querySelector('[data-menu-toggle]');
      const mobileMenu = document.querySelector('[data-mobile-menu]');

      if (!menuToggle || !mobileMenu) return;

      menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
      });
    },

    // Cart functionality
    initCartFunctionality() {
      // Cart drawer functionality
      const cartTriggers = document.querySelectorAll('[data-cart-trigger]');
      const cartDrawer = document.querySelector('[data-cart-drawer]');
      const cartClose = document.querySelector('[data-cart-close]');

      cartTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          cartDrawer?.classList.add('active');
        });
      });

      cartClose?.addEventListener('click', () => {
        cartDrawer?.classList.remove('active');
      });

      // Quantity selectors
      this.initQuantitySelectors();
    },

    // Quantity selectors
    initQuantitySelectors() {
      const quantitySelectors = document.querySelectorAll('.quantity-selector');

      quantitySelectors.forEach(selector => {
        const decreaseBtn = selector.querySelector('[data-decrease]');
        const increaseBtn = selector.querySelector('[data-increase]');
        const input = selector.querySelector('input');

        decreaseBtn?.addEventListener('click', () => {
          const currentValue = parseInt(input.value) || 1;
          if (currentValue > 1) {
            input.value = currentValue - 1;
            this.triggerQuantityChange(input);
          }
        });

        increaseBtn?.addEventListener('click', () => {
          const currentValue = parseInt(input.value) || 1;
          input.value = currentValue + 1;
          this.triggerQuantityChange(input);
        });
      });
    },

    triggerQuantityChange(input) {
      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);
    },

    // Search functionality
    initSearchFunctionality() {
      const searchTriggers = document.querySelectorAll('[data-search-trigger]');
      const searchOverlay = document.querySelector('[data-search-overlay]');
      const searchClose = document.querySelector('[data-search-close]');
      const searchInput = document.querySelector('[data-search-input]');

      searchTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          searchOverlay?.classList.add('active');
          searchInput?.focus();
        });
      });

      searchClose?.addEventListener('click', () => {
        searchOverlay?.classList.remove('active');
      });

      // Close search on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchOverlay?.classList.remove('active');
        }
      });
    },

    // Wishlist functionality
    initWishlist() {
      const wishlistButtons = document.querySelectorAll('[data-wishlist-toggle]');

      wishlistButtons.forEach(button => {
        const productId = button.dataset.productId;
        const isInWishlist = this.isInWishlist(productId);

        if (isInWishlist) {
          button.classList.add('active');
        }

        button.addEventListener('click', () => {
          this.toggleWishlist(productId, button);
        });
      });
    },

    isInWishlist(productId) {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      return wishlist.includes(productId);
    },

    toggleWishlist(productId, button) {
      let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

      if (this.isInWishlist(productId)) {
        wishlist = wishlist.filter(id => id !== productId);
        button.classList.remove('active');
        this.showNotification('已从愿望清单移除', 'info');
      } else {
        wishlist.push(productId);
        button.classList.add('active');
        this.showNotification('已添加到愿望清单', 'success');
      }

      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    },

    // Lazy loading
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
              }
            }
          });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
          imageObserver.observe(img);
        });
      }
    },

    // Performance monitoring
    initPerformanceMonitoring() {
      // Monitor Core Web Vitals
      this.measureLCP();
      this.measureFID();
      this.measureCLS();

      // Monitor page load time
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`Page load time: ${loadTime.toFixed(2)}ms`);
      });
    },

    measureLCP() {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log(`LCP: ${lastEntry.startTime.toFixed(2)}ms`);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      }
    },

    measureFID() {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            console.log(`FID: ${entry.processingStart - entry.startTime.toFixed(2)}ms`);
          });
        });
        observer.observe({ entryTypes: ['first-input'] });
      }
    },

    measureCLS() {
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              console.log(`CLS: ${clsValue.toFixed(4)}`);
            }
          });
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      }
    },

    // Notification system
    showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.textContent = message;

      // Add styles
      notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(0, 255, 136, 0.9)' : 'rgba(0, 170, 255, 0.9)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
      `;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    },

    // Utility functions
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

    throttle(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  };

  // Initialize theme when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => theme.init());
  } else {
    theme.init();
  }

  // Expose theme to global scope
  window.SciFiTheme = theme;
})();

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .animate-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  .animate-on-scroll.animate-in {
    opacity: 1;
    transform: translateY(0);
  }

  .header.scrolled {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
  }

  [data-mobile-menu].active,
  [data-cart-drawer].active,
  [data-search-overlay].active {
    transform: translateX(0);
  }

  .lazy {
    filter: blur(5px);
    transition: filter 0.3s;
  }

  .lazy.loaded {
    filter: blur(0);
  }
`;
document.head.appendChild(style);