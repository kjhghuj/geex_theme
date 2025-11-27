/**
 * 购物车功能模块
 * 处理购物车的增删改查和侧边栏显示
 */

class Cart {
  constructor() {
    this.cart = null;
    this.isUpdating = false;

    this.init();
  }

  /**
   * 初始化购物车功能
   */
  init() {
    this.bindEvents();
    this.loadCart();
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    // 购物车侧边栏开关
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-cart-toggle]')) {
        e.preventDefault();
        this.toggleCart();
      }
    });

    // 关闭购物车
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-cart-close]')) {
        this.closeCart();
      }
    });

    // 遮罩层点击关闭
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-cart-overlay]')) {
        this.closeCart();
      }
    });

    // 数量更新
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-quantity-plus]')) {
        const input = e.target.closest('[data-quantity-item]').querySelector('input');
        this.updateQuantity(input, 1);
      }

      if (e.target.closest('[data-quantity-minus]')) {
        const input = e.target.closest('[data-quantity-item]').querySelector('input');
        this.updateQuantity(input, -1);
      }
    });

    // 直接修改数量
    document.addEventListener('change', (e) => {
      if (e.target.closest('[data-quantity-input]')) {
        this.updateQuantity(e.target);
      }
    });

    // 删除商品
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-cart-remove]')) {
        const key = e.target.closest('[data-cart-remove]').dataset.key;
        this.removeItem(key);
      }
    });

    // ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isCartOpen()) {
        this.closeCart();
      }
    });
  }

  /**
   * 加载购物车数据
   */
  async loadCart() {
    try {
      const response = await fetch('/cart.js');
      if (!response.ok) throw new Error('Failed to load cart');

      this.cart = await response.json();
      this.renderCart();

      // 更新购物车计数
      if (window.ScifiTheme) {
        window.ScifiTheme.updateCartCount(this.cart.item_count);
      }

      return this.cart;
    } catch (error) {
      console.error('Error loading cart:', error);
      this.showError('加载购物车失败');
      return null;
    }
  }

  /**
   * 渲染购物车内容
   */
  renderCart() {
    this.renderCartSidebar();
    this.renderCartPage();
  }

  /**
   * 渲染购物车侧边栏
   */
  renderCartSidebar() {
    const container = document.querySelector('[data-cart-sidebar]');
    if (!container) return;

    const itemsHtml = this.cart.items.map(item => `
      <div class="cart-item" data-key="${item.key}">
        <div class="cart-item__image">
          <img src="${item.image}" alt="${item.product_title}" loading="lazy">
        </div>
        <div class="cart-item__details">
          <h3 class="cart-item__title">${item.product_title}</h3>
          <div class="cart-item__variant">${item.variant_title || '默认选项'}</div>
          <div class="cart-item__price">
            ${this.formatMoney(item.final_price)}
            ${item.original_price > item.final_price ? `
              <s class="cart-item__original-price">${this.formatMoney(item.original_price)}</s>
            ` : ''}
          </div>
          <div class="cart-item__quantity" data-quantity-item>
            <button type="button" class="quantity-btn" data-quantity-minus>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 8h8"/>
              </svg>
            </button>
            <input type="number"
                   class="quantity-input"
                   data-quantity-input
                   value="${item.quantity}"
                   min="0"
                   max="${item.inventory_quantity || 999}">
            <button type="button" class="quantity-btn" data-quantity-plus>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 4v8M4 8h8"/>
              </svg>
            </button>
          </div>
        </div>
        <button type="button" class="cart-item__remove" data-cart-remove data-key="${item.key}">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 4l8 8M12 4l-8 8"/>
          </svg>
        </button>
      </div>
    `).join('');

    const subtotal = this.cart.total_price;
    const freeShippingThreshold = 50000; // $500.00 in cents
    const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
    const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

    container.innerHTML = `
      <div class="cart-sidebar__header">
        <h2 class="cart-sidebar__title">购物车 (${this.cart.item_count})</h2>
        <button type="button" class="cart-sidebar__close" data-cart-close>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="cart-sidebar__content">
        ${this.cart.items.length > 0 ? `
          <div class="cart-sidebar__items">
            ${itemsHtml}
          </div>

          <div class="cart-sidebar__shipping">
            <div class="shipping-progress">
              <div class="shipping-progress__bar">
                <div class="shipping-progress__fill" style="width: ${freeShippingProgress}%"></div>
              </div>
              <div class="shipping-progress__text">
                ${remainingForFreeShipping > 0 ?
                  `还差 ${this.formatMoney(remainingForFreeShipping)} 即可享受免费送货` :
                  '恭喜您已享受免费送货！'
                }
              </div>
            </div>
          </div>

          <div class="cart-sidebar__summary">
            <div class="summary-row">
              <span>小计</span>
              <span class="summary-row__price">${this.formatMoney(subtotal)}</span>
            </div>
            <div class="summary-row">
              <span>运费</span>
              <span>${remainingForFreeShipping > 0 ? '计算中' : '免费'}</span>
            </div>
            <div class="summary-row summary-row--total">
              <span>总计</span>
              <span class="summary-row__price">${this.formatMoney(subtotal)}</span>
            </div>
          </div>

          <div class="cart-sidebar__actions">
            <a href="/checkout" class="btn btn-primary btn--full">
              安全结账
            </a>
            <a href="/cart" class="btn btn-secondary btn--full">
              查看购物车
            </a>
          </div>

          <div class="cart-sidebar__trust">
            <div class="trust-badges">
              <div class="trust-badge">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2L2 7v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V7l-8-5z"/>
                </svg>
                <span>安全结账</span>
              </div>
              <div class="trust-badge">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                </svg>
                <span>快速配送</span>
              </div>
              <div class="trust-badge">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2L3 7v11h4v-7h6v7h4V7l-7-5z"/>
                </svg>
                <span>正品保证</span>
              </div>
            </div>
          </div>
        ` : `
          <div class="cart-sidebar__empty">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18v18h8V28h12v8h8V18L30 6H18z"/>
              </svg>
            </div>
            <h3 class="empty-title">购物车是空的</h3>
            <p class="empty-description">浏览我们的产品，找到您喜欢的商品</p>
            <a href="/collections/all" class="btn btn-primary">开始购物</a>
          </div>
        `}
      </div>

      <div class="cart-sidebar__overlay" data-cart-overlay></div>
    `;
  }

  /**
   * 渲染购物车页面
   */
  renderCartPage() {
    const container = document.querySelector('[data-cart-page]');
    if (!container) return;

    // 购物车页面的渲染逻辑
    // 这里可以根据需要实现详细的购物车页面渲染
  }

  /**
   * 切换购物车显示
   */
  toggleCart() {
    if (this.isCartOpen()) {
      this.closeCart();
    } else {
      this.openCart();
    }
  }

  /**
   * 打开购物车
   */
  openCart() {
    const cart = document.querySelector('[data-cart-sidebar]');
    if (!cart) return;

    cart.classList.add('open');
    document.body.style.overflow = 'hidden';

    // 设置焦点
    const closeButton = cart.querySelector('[data-cart-close]');
    if (closeButton) {
      setTimeout(() => closeButton.focus(), 100);
    }
  }

  /**
   * 关闭购物车
   */
  closeCart() {
    const cart = document.querySelector('[data-cart-sidebar]');
    if (!cart) return;

    cart.classList.remove('open');
    document.body.style.overflow = '';
  }

  /**
   * 检查购物车是否打开
   */
  isCartOpen() {
    const cart = document.querySelector('[data-cart-sidebar]');
    return cart && cart.classList.contains('open');
  }

  /**
   * 添加商品到购物车
   */
  async addItem(variantId, quantity = 1, properties = {}) {
    if (this.isUpdating) return;
    this.isUpdating = true;

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          id: variantId,
          quantity: quantity,
          properties: properties
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.description || '添加失败');
      }

      const result = await response.json();

      // 重新加载购物车
      await this.loadCart();

      // 显示成功消息
      if (window.ScifiTheme) {
        window.ScifiTheme.showNotification('已添加到购物车', 'success');
      }

      // 打开购物车侧边栏
      this.openCart();

      return result;

    } catch (error) {
      console.error('Error adding to cart:', error);

      if (window.ScifiTheme) {
        window.ScifiTheme.showNotification(error.message || '添加失败', 'error');
      }

      throw error;

    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * 更新商品数量
   */
  async updateQuantity(input, change = 0) {
    if (this.isUpdating) return;

    const item = input.closest('[data-key]') || input.closest('[data-quantity-item]');
    const key = item.dataset.key || input.closest('[data-key]').dataset.key;

    let newQuantity = parseInt(input.value) + change;
    if (newQuantity < 0) newQuantity = 0;

    if (newQuantity === 0) {
      this.removeItem(key);
      return;
    }

    this.isUpdating = true;

    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          id: key,
          quantity: newQuantity
        })
      });

      if (!response.ok) throw new Error('更新失败');

      await this.loadCart();

    } catch (error) {
      console.error('Error updating quantity:', error);

      if (window.ScifiTheme) {
        window.ScifiTheme.showNotification('更新数量失败', 'error');
      }

      // 恢复原始值
      const currentCart = await this.loadCart();
      const item = currentCart.items.find(item => item.key === key);
      if (item) {
        input.value = item.quantity;
      }

    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * 移除商品
   */
  async removeItem(key) {
    if (this.isUpdating) return;
    this.isUpdating = true;

    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          id: key,
          quantity: 0
        })
      });

      if (!response.ok) throw new Error('删除失败');

      await this.loadCart();

      if (window.ScifiTheme) {
        window.ScifiTheme.showNotification('已移除商品', 'success');
      }

    } catch (error) {
      console.error('Error removing item:', error);

      if (window.ScifiTheme) {
        window.ScifiTheme.showNotification('删除失败', 'error');
      }

    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * 清空购物车
   */
  async clearCart() {
    if (this.isUpdating) return;
    this.isUpdating = true;

    try {
      const response = await fetch('/cart/clear.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) throw new Error('清空失败');

      await this.loadCart();

      if (window.ScifiTheme) {
        window.ScifiTheme.showNotification('购物车已清空', 'success');
      }

    } catch (error) {
      console.error('Error clearing cart:', error);

      if (window.ScifiTheme) {
        window.ScifiTheme.showNotification('清空失败', 'error');
      }

    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * 应用折扣码
   */
  async applyDiscountCode(code) {
    if (this.isUpdating) return;
    this.isUpdating = true;

    try {
      const response = await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          discount: code
        })
      });

      if (!response.ok) throw new Error('折扣码无效');

      await this.loadCart();

      if (window.ScifiTheme) {
        window.ScifiTheme.showNotification('折扣码已应用', 'success');
      }

    } catch (error) {
      console.error('Error applying discount:', error);

      if (window.ScifiTheme) {
        window.ScifiTheme.showNotification('折扣码无效', 'error');
      }

    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * 更新购物车
   */
  async updateCart() {
    return await this.loadCart();
  }

  /**
   * 格式化价格
   */
  formatMoney(cents) {
    return (cents / 100).toFixed(2);
  }

  /**
   * 显示错误信息
   */
  showError(message) {
    if (window.ScifiTheme) {
      window.ScifiTheme.showNotification(message, 'error');
    }
  }
}

// 初始化购物车功能
document.addEventListener('DOMContentLoaded', () => {
  window.Cart = Cart;
  window.cart = new Cart();
});

// 导出到全局作用域
window.Cart = Cart;