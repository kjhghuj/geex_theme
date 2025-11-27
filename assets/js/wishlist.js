/**
 * 愿望清单功能模块
 * 处理产品收藏、愿望清单管理等功能
 */

class Wishlist {
  constructor() {
    this.items = [];
    this.isOpen = false;
    this.isLoading = false;

    this.init();
  }

  /**
   * 初始化愿望清单
   */
  init() {
    this.createTemplates();
    this.loadWishlist();
    this.bindEvents();
    this.updateTriggerButtons();
  }

  /**
   * 创建模板
   */
  createTemplates() {
    // 创建愿望清单模态框
    const template = document.getElementById('wishlist-template');
    if (template && !document.querySelector('[data-wishlist]')) {
      document.body.insertAdjacentHTML('beforeend', template.innerHTML);
    }

    // 创建触发按钮
    this.createTriggerButton();

    // 为所有产品添加收藏按钮
    this.addWishlistButtons();
  }

  /**
   * 创建触发按钮
   */
  createTriggerButton() {
    const triggerContainer = document.querySelector('[data-wishlist-trigger-container]');
    const existingTrigger = document.querySelector('[data-wishlist-trigger]');

    if (triggerContainer && !existingTrigger) {
      const triggerTemplate = document.getElementById('wishlist-trigger-template');
      if (triggerTemplate) {
        triggerContainer.insertAdjacentHTML('beforeend', triggerTemplate.innerHTML);
      }
    }
  }

  /**
   * 添加愿望清单按钮
   */
  addWishlistButtons() {
    const buttonTemplate = document.getElementById('wishlist-product-button-template');
    if (!buttonTemplate) return;

    // 查找产品卡片
    const productCards = document.querySelectorAll('.product-card:not(:has([data-wishlist-product-btn]))');

    productCards.forEach(card => {
      const productHandle = card.dataset.productHandle;
      const productId = card.dataset.productId;

      if (productHandle && productId) {
        const buttonHtml = buttonTemplate.innerHTML
          .replace(/{{ product\.handle }}/g, productHandle)
          .replace(/{{ product\.id }}/g, productId);

        // 查找操作按钮容器
        const actionsContainer = card.querySelector('.product-actions, .card-actions, .overlay-content');
        if (actionsContainer) {
          actionsContainer.insertAdjacentHTML('beforeend', buttonHtml);
        }
      }
    });
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    // 愿望清单触发按钮
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-wishlist-trigger]')) {
        e.preventDefault();
        this.open();
      }
    });

    // 关闭按钮
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-wishlist-close]')) {
        this.close();
      }
    });

    // 遮罩层点击
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-wishlist-overlay]')) {
        this.close();
      }
    });

    // 产品收藏按钮
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-wishlist-product-btn]')) {
        e.preventDefault();
        const button = e.target.closest('[data-wishlist-product-btn]');
        const productHandle = button.dataset.productHandle;
        const productId = button.dataset.productId;

        if (this.isInWishlist(productId)) {
          this.removeFromWishlist(productId);
        } else {
          this.addToWishlist(productHandle, productId);
        }
      }
    });

    // 移除按钮
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-wishlist-remove]')) {
        const productId = e.target.closest('[data-wishlist-remove]').dataset.productId;
        this.removeFromWishlist(productId);
      }
    });

    // 全部加入购物车
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-wishlist-add-all-to-cart]')) {
        this.addAllToCart();
      }
    });

    // 清空愿望清单
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-wishlist-clear-all]')) {
        this.clearWishlist();
      }
    });

    // 分享按钮
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-wishlist-share]')) {
        this.shareWishlist();
      }
    });

    // ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // 监听产品动态加载
    const observer = new MutationObserver(() => {
      this.addWishlistButtons();
      this.updateTriggerButtons();
    });

    const productGrid = document.querySelector('[data-products-container]');
    if (productGrid) {
      observer.observe(productGrid, { childList: true, subtree: true });
    }
  }

  /**
   * 添加到愿望清单
   */
  async addToWishlist(productHandle, productId) {
    try {
      // 检查是否已在愿望清单中
      if (this.isInWishlist(productId)) {
        if (window.ScifiTheme) {
          window.ScifiTheme.showNotification('产品已在愿望清单中', 'info');
        }
        return;
      }

      // 获取产品信息
      const product = await this.getProductData(productHandle);
      if (!product) {
        throw new Error('无法获取产品信息');
      }

      // 添加到愿望清单
      const item = {
        id: productId,
        handle: productHandle,
        title: product.title,
        price: product.price,
        compare_at_price: product.compare_at_price,
        image: product.featured_image,
        url: `/products/${productHandle}`,
        vendor: product.vendor,
        product_type: product.product_type,
        added_at: new Date().toISOString()
      };

      this.items.push(item);
      this.saveWishlist();
      this.updateUI();

      // 更新按钮状态
      this.updateProductButton(productId, true);

      // 显示成功消息
      if (window.ScifiTheme) {
        window.ScifiTheme.showNotification('已添加到愿望清单', 'success');
      }

      // 追踪事件
      this.trackWishlistEvent('add_to_wishlist', {
        product_id: productId,
        product_handle: productHandle,
        product_title: product.title,
        price: product.price
      });

    } catch (error) {
      console.error('Error adding to wishlist:', error);

      if (window.ScifiTheme) {
        window.ScifiTheme.showNotification('添加失败，请重试', 'error');
      }
    }
  }

  /**
   * 从愿望清单移除
   */
  removeFromWishlist(productId) {
    const itemIndex = this.items.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
      const item = this.items[itemIndex];

      // 添加移除动画
      const productElement = document.querySelector(`[data-wishlist-product="${productId}"]`);
      if (productElement) {
        productElement.classList.add('removing');

        setTimeout(() => {
          // 从数组中移除
          this.items.splice(itemIndex, 1);
          this.saveWishlist();
          this.updateUI();
          this.updateProductButton(productId, false);

          // 显示消息
          if (window.ScifiTheme) {
            window.ScifiTheme.showNotification('已从愿望清单移除', 'info');
          }

          // 追踪事件
          this.trackWishlistEvent('remove_from_wishlist', {
            product_id: productId,
            product_handle: item.handle,
            product_title: item.title,
            price: item.price
          });
        }, 300);
      } else {
        // 如果元素不存在，直接移除
        this.items.splice(itemIndex, 1);
        this.saveWishlist();
        this.updateUI();
        this.updateProductButton(productId, false);
      }
    }
  }

  /**
   * 清空愿望清单
   */
  clearWishlist() {
    if (this.items.length === 0) return;

    if (confirm('确定要清空愿望清单吗？')) {
      this.items = [];
      this.saveWishlist();
      this.updateUI();
      this.updateAllProductButtons(false);

      if (window.ScifiTheme) {
        window.ScifiTheme.showNotification('愿望清单已清空', 'info');
      }

      this.trackWishlistEvent('clear_wishlist');
    }
  }

  /**
   * 全部加入购物车
   */
  async addAllToCart() {
    if (this.items.length === 0) return;

    const availableItems = this.items.filter(item => {
      return !item.out_of_stock; // 这里需要检查产品库存
    });

    if (availableItems.length === 0) {
      if (window.ScifiTheme) {
        window.ScifiTheme.showNotification('没有可加入购物车的产品', 'warning');
      }
      return;
    }

    try {
      let successCount = 0;

      for (const item of availableItems) {
        try {
          await this.addToCart(item.id, 1);
          successCount++;
        } catch (error) {
          console.error(`Error adding ${item.title} to cart:`, error);
        }
      }

      if (successCount > 0) {
        if (window.ScifiTheme) {
          window.ScifiTheme.showNotification(`已添加 ${successCount} 件产品到购物车`, 'success');
        }

        // 可选：打开购物车
        if (window.cart) {
          window.cart.openCart();
        }

        this.trackWishlistEvent('add_all_to_cart', {
          success_count: successCount,
          total_count: availableItems.length
        });
      } else {
        throw new Error('没有产品成功添加到购物车');
      }

    } catch (error) {
      console.error('Error adding all to cart:', error);

      if (window.ScifiTheme) {
        window.ScifiTheme.showNotification('添加到购物车失败', 'error');
      }
    }
  }

  /**
   * 单个产品加入购物车
   */
  async addToCart(productId, quantity = 1) {
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        id: productId,
        quantity: quantity
      })
    });

    if (!response.ok) {
      throw new Error('Failed to add to cart');
    }

    return await response.json();
  }

  /**
   * 分享愿望清单
   */
  shareWishlist() {
    if (this.items.length === 0) {
      if (window.ScifiTheme) {
        window.ScifiTheme.showNotification('愿望清单为空，无法分享', 'warning');
      }
      return;
    }

    try {
      // 生成分享URL
      const shareUrl = this.generateShareUrl();

      // 生成分享文本
      const shareText = this.generateShareText();

      // 检查是否支持Web Share API
      if (navigator.share) {
        navigator.share({
          title: '我的愿望清单',
          text: shareText,
          url: shareUrl
        }).catch((error) => {
          console.log('Share cancelled:', error);
          // 用户取消分享，不显示错误
        });
      } else {
        // 回退到复制链接
        this.copyShareLink(shareUrl);
      }

      this.trackWishlistEvent('share_wishlist');

    } catch (error) {
      console.error('Error sharing wishlist:', error);

      if (window.ScifiTheme) {
        window.ScifiTheme.showNotification('分享失败', 'error');
      }
    }
  }

  /**
   * 生成分享URL
   */
  generateShareUrl() {
    // 创建包含愿望清单产品的URL
    const baseUrl = window.location.origin;
    const productIds = this.items.map(item => item.id).join(',');
    return `${baseUrl}/wishlist?products=${encodeURIComponent(productIds)}`;
  }

  /**
   * 生成分享文本
   */
  generateShareText() {
    const count = this.items.length;
    const totalValue = this.items.reduce((sum, item) => sum + parseFloat(item.price), 0);

    return `我收藏了 ${count} 件产品，总价值 ¥${totalValue.toFixed(2)}！快来看看吧~`;
  }

  /**
   * 复制分享链接
   */
  copyShareLink(url) {
    // 创建临时输入框
    const input = document.createElement('input');
    input.value = url;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);

    try {
      input.select();
      input.setSelectionRange(0, 99999); // 移动端兼容

      const successful = document.execCommand('copy');
      document.body.removeChild(input);

      if (successful) {
        if (window.ScifiTheme) {
          window.ScifiTheme.showNotification('链接已复制到剪贴板', 'success');
        }
      } else {
        throw new Error('Copy failed');
      }
    } catch (error) {
      document.body.removeChild(input);

      // 回退到选择文本
      window.prompt('复制链接:', url);
    }
  }

  /**
   * 打开愿望清单
   */
  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    this.renderWishlist();

    const wishlist = document.querySelector('[data-wishlist]');
    if (wishlist) {
      wishlist.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // 设置焦点
      const closeButton = wishlist.querySelector('[data-wishlist-close]');
      if (closeButton) {
        setTimeout(() => closeButton.focus(), 100);
      }
    }
  }

  /**
   * 关闭愿望清单
   */
  close() {
    if (!this.isOpen) return;

    const wishlist = document.querySelector('[data-wishlist]');
    if (wishlist) {
      wishlist.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    this.isOpen = false;
  }

  /**
   * 检查产品是否在愿望清单中
   */
  isInWishlist(productId) {
    return this.items.some(item => item.id === productId);
  }

  /**
   * 加载愿望清单数据
   */
  loadWishlist() {
    try {
      const saved = localStorage.getItem('wishlist');
      if (saved) {
        this.items = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      this.items = [];
    }
  }

  /**
   * 保存愿望清单数据
   */
  saveWishlist() {
    try {
      localStorage.setItem('wishlist', JSON.stringify(this.items));
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  }

  /**
   * 更新UI
   */
  updateUI() {
    this.updateTriggerButtons();
    this.updateTriggerCount();

    if (this.isOpen) {
      this.renderWishlist();
    }
  }

  /**
   * 更新触发按钮
   */
  updateTriggerButtons() {
    this.updateAllProductButtons();
  }

  /**
   * 更新产品按钮状态
   */
  updateProductButton(productId, isInWishlist) {
    const button = document.querySelector(`[data-wishlist-product-btn][data-product-id="${productId}"]`);
    if (button) {
      button.classList.toggle('is-added', isInWishlist);
      button.setAttribute('aria-label', isInWishlist ? '从愿望清单移除' : '添加到愿望清单');
    }
  }

  /**
   * 更新所有产品按钮
   */
  updateAllProductButtons() {
    document.querySelectorAll('[data-wishlist-product-btn]').forEach(button => {
      const productId = button.dataset.productId;
      const isInWishlist = this.isInWishlist(productId);

      button.classList.toggle('is-added', isInWishlist);
      button.setAttribute('aria-label', isInWishlist ? '从愿望清单移除' : '添加到愿望清单');
    });
  }

  /**
   * 更新触发按钮计数
   */
  updateTriggerCount() {
    const countElements = document.querySelectorAll('[data-wishlist-trigger-count]');
    countElements.forEach(element => {
      element.textContent = this.items.length;
      element.style.display = this.items.length > 0 ? 'flex' : 'none';
    });
  }

  /**
   * 渲染愿望清单
   */
  renderWishlist() {
    const loadingElement = document.querySelector('[data-wishlist-loading]');
    const emptyElement = document.querySelector('[data-wishlist-empty]');
    const productsElement = document.querySelector('[data-wishlist-products]');
    const statsElement = document.querySelector('[data-wishlist-stats]');
    const footerElement = document.querySelector('[data-wishlist-footer]');

    // 显示加载状态
    this.showLoading();

    setTimeout(() => {
      this.hideLoading();

      if (this.items.length === 0) {
        // 显示空状态
        emptyElement.style.display = 'block';
        productsElement.style.display = 'none';
        statsElement.style.display = 'none';
        footerElement.style.display = 'none';
      } else {
        // 显示产品列表
        emptyElement.style.display = 'none';
        productsElement.style.display = 'flex';
        statsElement.style.display = 'block';
        footerElement.style.display = 'block';

        this.renderProducts();
        this.renderStats();
      }
    }, 300);
  }

  /**
   * 渲染产品列表
   */
  renderProducts() {
    const productsContainer = document.querySelector('[data-wishlist-products]');
    if (!productsContainer) return;

    const productsHtml = this.items.map(item => `
      <div class="wishlist-product" data-wishlist-product="${item.id}">
        <div class="wishlist-product__image">
          ${item.image ? `
            <img src="${item.image}" alt="${item.title}" loading="lazy">
          ` : `
            <div class="placeholder-image">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
                <path d="M8 6L4 10v16a2 2 0 002 2h20a2 2 0 002-2V10l-4-4H8z"/>
              </svg>
            </div>
          `}
        </div>
        <div class="wishlist-product__details">
          <a href="${item.url}" class="wishlist-product__title">${item.title}</a>
          ${item.vendor ? `<div class="wishlist-product__variant">${item.vendor}</div>` : ''}
          <div class="wishlist-product__price">
            <span class="price-current">¥${(parseFloat(item.price) / 100).toFixed(2)}</span>
            ${item.compare_at_price && item.compare_at_price > item.price ? `
              <span class="price-original">¥${(parseFloat(item.compare_at_price) / 100).toFixed(2)}</span>
            ` : ''}
          </div>
          <div class="wishlist-product__actions">
            <button type="button"
                    class="wishlist-product__add-to-cart"
                    data-product-id="${item.id}"
                    data-wishlist-add-to-cart>
              加入购物车
            </button>
            <button type="button"
                    class="wishlist-product__remove"
                    data-product-id="${item.id}"
                    data-wishlist-remove>
              移除
            </button>
          </div>
        </div>
      </div>
    `).join('');

    productsContainer.innerHTML = productsHtml;

    // 绑定产品操作事件
    this.bindProductEvents();
  }

  /**
   * 渲染统计信息
   */
  renderStats() {
    const countElement = document.querySelector('[data-wishlist-count]');
    const totalElement = document.querySelector('[data-wishlist-total]');

    if (countElement) {
      countElement.textContent = this.items.length;
    }

    if (totalElement) {
      const totalValue = this.items.reduce((sum, item) => sum + parseFloat(item.price), 0);
      totalElement.textContent = `¥${(totalValue / 100).toFixed(2)}`;
    }
  }

  /**
   * 绑定产品操作事件
   */
  bindProductEvents() {
    // 加入购物车按钮
    document.querySelectorAll('[data-wishlist-add-to-cart]').forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const productId = button.dataset.productId;

        button.disabled = true;
        button.textContent = '添加中...';

        try {
          await this.addToCart(productId, 1);

          if (window.cart) {
            await window.cart.updateCart();
          }

          if (window.ScifiTheme) {
            window.ScifiTheme.showNotification('已添加到购物车', 'success');
          }

          this.trackWishlistEvent('add_to_cart_from_wishlist', {
            product_id: productId
          });

        } catch (error) {
          console.error('Error adding to cart from wishlist:', error);

          if (window.ScifiTheme) {
            window.ScifiTheme.showNotification('添加失败', 'error');
          }
        } finally {
          button.disabled = false;
          button.textContent = '加入购物车';
        }
      });
    });
  }

  /**
   * 显示加载状态
   */
  showLoading() {
    const loadingElement = document.querySelector('[data-wishlist-loading]');
    const productsElement = document.querySelector('[data-wishlist-products]');
    const emptyElement = document.querySelector('[data-wishlist-empty]');

    if (loadingElement) {
      loadingElement.style.display = 'flex';
    }
    if (productsElement) {
      productsElement.style.display = 'none';
    }
    if (emptyElement) {
      emptyElement.style.display = 'none';
    }
  }

  /**
   * 隐藏加载状态
   */
  hideLoading() {
    const loadingElement = document.querySelector('[data-wishlist-loading]');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  /**
   * 获取产品数据
   */
  async getProductData(handle) {
    try {
      const response = await fetch(`/products/${handle}.js`);
      if (!response.ok) {
        throw new Error('Product not found');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching product data:', error);
      return null;
    }
  }

  /**
   * 追踪愿望清单事件
   */
  trackWishlistEvent(eventName, parameters = {}) {
    // Google Analytics 4
    if (typeof gtag === 'function') {
      gtag('event', eventName, parameters);
    }

    // Facebook Pixel
    if (typeof fbq === 'function') {
      switch (eventName) {
        case 'add_to_wishlist':
          fbq('track', 'AddToWishlist', parameters);
          break;
        case 'add_to_cart_from_wishlist':
          fbq('track', 'AddToCart', parameters);
          break;
      }
    }

    // 其他分析平台...
  }

  /**
   * 销毁愿望清单实例
   */
  destroy() {
    // 清理事件监听器
    // 注意：由于事件是委托的，不需要单独移除
  }
}

// 初始化愿望清单功能
document.addEventListener('DOMContentLoaded', () => {
  window.Wishlist = Wishlist;
  window.wishlist = new Wishlist();
});

// 导出到全局作用域
window.Wishlist = Wishlist;