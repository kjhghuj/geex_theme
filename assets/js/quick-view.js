/**
 * 产品快速查看功能模块
 * 提供快速查看产品详情的模态框功能
 */

class QuickView {
  constructor() {
    this.isOpen = false;
    this.currentProductHandle = null;
    this.products = [];
    this.currentIndex = 0;
    this.isLoading = false;

    this.init();
  }

  /**
   * 初始化快速查看功能
   */
  init() {
    this.createTemplates();
    this.bindEvents();
    this.setupKeyboardNavigation();
    this.setupFocusTrap();
  }

  /**
   * 创建模板
   */
  createTemplates() {
    // 创建快速查看模态框
    const template = document.getElementById('quick-view-template');
    if (template && !document.querySelector('[data-quick-view]')) {
      document.body.insertAdjacentHTML('beforeend', template.innerHTML);
    }

    // 为所有产品卡片添加快速查看按钮
    this.addQuickViewTriggers();
  }

  /**
   * 添加快速查看触发按钮
   */
  addQuickViewTriggers() {
    const triggerTemplate = document.getElementById('quick-view-trigger-template');
    if (!triggerTemplate) return;

    const productCards = document.querySelectorAll('.product-card:not(:has(.quick-view-trigger))');

    productCards.forEach(card => {
      const productHandle = card.dataset.productHandle;
      if (productHandle) {
        const triggerHtml = triggerTemplate.innerHTML.replace('{{ product.handle }}', productHandle)
          .replace(/{{ 'products\.product\.quick_view' \| t: title: product\.title }}/g, '快速查看');

        card.insertAdjacentHTML('beforeend', triggerHtml);
      }
    });
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    // 快速查看触发按钮
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-quick-view-trigger]');
      if (trigger) {
        e.preventDefault();
        const productHandle = trigger.dataset.productHandle;
        this.open(productHandle);
      }
    });

    // 关闭按钮
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-quick-view-close]')) {
        this.close();
      }
    });

    // 遮罩层点击
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-quick-view-overlay]')) {
        this.close();
      }
    });

    // 导航按钮
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-quick-view-prev]')) {
        this.navigate(-1);
      }
      if (e.target.closest('[data-quick-view-next]')) {
        this.navigate(1);
      }
    });

    // 重试按钮
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-quick-view-retry]')) {
        const productHandle = this.currentProductHandle;
        this.loadProduct(productHandle);
      }
    });

    // ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // 监听产品网格更新，重新添加触发按钮
    const observer = new MutationObserver(() => {
      this.addQuickViewTriggers();
    });

    const productGrid = document.querySelector('[data-products-container]');
    if (productGrid) {
      observer.observe(productGrid, { childList: true, subtree: true });
    }
  }

  /**
   * 设置键盘导航
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.navigate(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.navigate(1);
          break;
      }
    });
  }

  /**
   * 设置焦点陷阱
   */
  setupFocusTrap() {
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen || e.key !== 'Tab') return;

      const quickView = document.querySelector('[data-quick-view]');
      const focusableElements = quickView.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }

  /**
   * 打开快速查看
   */
  async open(productHandle) {
    if (this.isLoading || this.isOpen) return;

    this.currentProductHandle = productHandle;
    this.isOpen = true;
    this.isLoading = true;

    const quickView = document.querySelector('[data-quick-view]');
    if (!quickView) return;

    // 显示模态框
    quickView.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // 设置加载状态
    this.setLoadingState(true);
    this.hideError();

    // 加载产品信息
    await this.loadProduct(productHandle);

    // 设置焦点
    const closeButton = quickView.querySelector('[data-quick-view-close]');
    if (closeButton) {
      setTimeout(() => closeButton.focus(), 100);
    }

    // 发送分析事件
    this.trackQuickView(productHandle);
  }

  /**
   * 关闭快速查看
   */
  close() {
    if (!this.isOpen) return;

    const quickView = document.querySelector('[data-quick-view]');
    if (!quickView) return;

    this.isOpen = false;
    this.isLoading = false;

    // 隐藏模态框
    quickView.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // 重置状态
    setTimeout(() => {
      this.resetContent();
    }, 300);

    // 恢复焦点到触发元素
    const trigger = document.querySelector(`[data-quick-view-trigger="${this.currentProductHandle}"]`);
    if (trigger) {
      trigger.focus();
    }
  }

  /**
   * 加载产品信息
   */
  async loadProduct(productHandle) {
    try {
      const productUrl = `/products/${productHandle}?view=quick-view`;

      const response = await fetch(productUrl, {
        headers: {
          'Accept': 'text/html',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();

      // 解析产品信息
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // 提取产品数据
      const productData = this.extractProductData(doc);

      // 渲染产品内容
      this.renderProduct(productData);

      // 设置导航状态
      this.updateNavigation();

      this.setLoadingState(false);

    } catch (error) {
      console.error('Error loading product for quick view:', error);
      this.showError(error.message);
      this.setLoadingState(false);
    }
  }

  /**
   * 提取产品数据
   */
  extractProductData(doc) {
    const productJson = doc.querySelector('#ProductJson-quick-view');
    let product = {};

    if (productJson) {
      try {
        product = JSON.parse(productJson.textContent);
      } catch (e) {
        console.error('Error parsing product JSON:', e);
      }
    }

    // 如果没有JSON数据，从DOM中提取
    if (!product.id) {
      product = {
        id: doc.querySelector('[data-product-id]')?.dataset.productId || '',
        title: doc.querySelector('.product-title')?.textContent || '',
        handle: doc.querySelector('[data-product-handle]')?.dataset.productHandle || '',
        price: doc.querySelector('.price-item')?.textContent || '',
        description: doc.querySelector('.product-description')?.innerHTML || '',
        images: this.extractImages(doc),
        variants: this.extractVariants(doc),
        available: doc.querySelector('[data-product-available]')?.dataset.productAvailable === 'true'
      };
    }

    return product;
  }

  /**
   * 提取产品图片
   */
  extractImages(doc) {
    const images = [];
    const imageElements = doc.querySelectorAll('.product-gallery img');

    imageElements.forEach(img => {
      images.push({
        src: img.src,
        alt: img.alt || '',
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    });

    return images;
  }

  /**
   * 提取产品变体
   */
  extractVariants(doc) {
    const variants = [];
    const variantElements = doc.querySelectorAll('[data-variant]');

    variantElements.forEach(element => {
      variants.push({
        id: element.dataset.variantId,
        title: element.dataset.variantTitle,
        price: element.dataset.variantPrice,
        available: element.dataset.variantAvailable === 'true'
      });
    });

    return variants;
  }

  /**
   * 渲染产品内容
   */
  renderProduct(product) {
    const container = document.querySelector('[data-quick-view-product]');
    if (!container) return;

    const productHtml = `
      <div class="quick-view__gallery">
        ${this.renderGallery(product.images)}
      </div>
      <div class="quick-view__info">
        <h2 class="quick-view__title">${this.escapeHtml(product.title)}</h2>
        <div class="quick-view__price">${this.renderPrice(product)}</div>
        <div class="quick-view__description">${product.description || ''}</div>

        ${product.variants && product.variants.length > 1 ? `
          <div class="quick-view__variants">
            <div class="variant-selector" data-variant-selector>
              ${this.renderVariants(product.variants)}
            </div>
          </div>
        ` : ''}

        <div class="quick-view__actions">
          <div class="quick-view__quantity">
            <label for="quantity-quick-view">{{ 'products.product.quantity' | t }}:</label>
            <input type="number" id="quantity-quick-view" name="quantity" value="1" min="1" class="quantity-input">
          </div>

          <div class="quick-view__buttons">
            <button type="button" class="btn btn-primary quick-view__add-to-cart" data-add-to-cart data-variant-id="${product.variants?.[0]?.id || ''}" ${!product.available ? 'disabled' : ''}>
              ${product.available ? '{{ 'products.product.add_to_cart' | t }}' : '{{ 'products.product.sold_out' | t }}'}
            </button>
            <button type="button" class="btn btn-secondary quick-view__view-full" data-view-full data-product-handle="${product.handle}">
              {{ 'products.product.view_full_details' | t }}
            </button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = productHtml;
    container.style.display = 'block';

    // 绑定产品特定事件
    this.bindProductEvents(product);
  }

  /**
   * 渲染图片画廊
   */
  renderGallery(images) {
    if (!images || images.length === 0) {
      return '<div class="quick-view__no-image">{{ 'products.product.no_image' | t }}</div>';
    }

    return `
      <div class="quick-view__image-container">
        <img src="${images[0].src}"
             alt="${images[0].alt}"
             class="quick-view__image"
             loading="lazy">
        ${images.length > 1 ? `
          <div class="quick-view__image-indicators">
            ${images.map((_, index) => `
              <button type="button" class="image-indicator ${index === 0 ? 'active' : ''}" data-image-index="${index}">
                <span class="sr-only">Image ${index + 1}</span>
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * 渲染价格
   */
  renderPrice(product) {
    if (!product.price) return '';

    return `
      <span class="price-item ${product.compare_at_price > product.price ? 'price-item--sale' : ''}">
        ${this.formatMoney(product.price)}
      </span>
      ${product.compare_at_price > product.price ? `
        <span class="price-item price-item--regular">
          ${this.formatMoney(product.compare_at_price)}
        </span>
      ` : ''}
    `;
  }

  /**
   * 渲染变体选择器
   */
  renderVariants(variants) {
    return `
      <div class="variant-options">
        ${variants.map(variant => `
          <label class="variant-option">
            <input type="radio" name="variant" value="${variant.id}" ${!variant.available ? 'disabled' : ''}>
            <span class="variant-swatch">${variant.title}</span>
          </label>
        `).join('')}
      </div>
    `;
  }

  /**
   * 绑定产品特定事件
   */
  bindProductEvents(product) {
    const container = document.querySelector('[data-quick-view-product');
    if (!container) return;

    // 添加到购物车按钮
    const addToCartBtn = container.querySelector('[data-add-to-cart]');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        const variantId = addToCartBtn.dataset.variantId;
        const quantity = container.querySelector('.quantity-input').value;
        this.addToCart(variantId, quantity);
      });
    }

    // 查看完整详情按钮
    const viewFullBtn = container.querySelector('[data-view-full]');
    if (viewFullBtn) {
      viewFullBtn.addEventListener('click', () => {
        window.location.href = `/products/${product.handle}`;
      });
    }

    // 变体选择
    const variantInputs = container.querySelectorAll('input[name="variant"]');
    variantInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const variantId = e.target.value;
        const selectedVariant = product.variants.find(v => v.id.toString() === variantId);
        if (selectedVariant) {
          this.updateSelectedVariant(selectedVariant);
        }
      });
    });

    // 图片指示器
    const imageIndicators = container.querySelectorAll('.image-indicator');
    imageIndicators.forEach(indicator => {
      indicator.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.imageIndex);
        this.showImage(index);
      });
    });
  }

  /**
   * 导航到其他产品
   */
  navigate(direction) {
    if (!this.products.length) return;

    this.currentIndex += direction;

    if (this.currentIndex < 0) {
      this.currentIndex = this.products.length - 1;
    } else if (this.currentIndex >= this.products.length) {
      this.currentIndex = 0;
    }

    const nextProduct = this.products[this.currentIndex];
    if (nextProduct && nextProduct.handle) {
      this.loadProduct(nextProduct.handle);
    }
  }

  /**
   * 更新导航状态
   */
  updateNavigation() {
    const prevBtn = document.querySelector('[data-quick-view-prev]');
    const nextBtn = document.querySelector('[data-quick-view-next]');
    const indicators = document.querySelector('[data-quick-view-indicators]');

    if (!this.products.length) {
      prevBtn?.setAttribute('disabled', 'disabled');
      nextBtn?.setAttribute('disabled', 'disabled');
      return;
    }

    prevBtn?.removeAttribute('disabled');
    nextBtn?.removeAttribute('disabled');

    // 更新指示器
    if (indicators) {
      indicators.innerHTML = this.products.map((_, index) => `
        <span class="indicator ${index === this.currentIndex ? 'active' : ''}"></span>
      `).join('');
    }
  }

  /**
   * 设置加载状态
   */
  setLoadingState(loading) {
    this.isLoading = loading;
    const loadingEl = document.querySelector('[data-quick-view-loading]');
    const productEl = document.querySelector('[data-quick-view-product]');

    if (loading) {
      loadingEl.style.display = 'flex';
      productEl.style.display = 'none';
    } else {
      loadingEl.style.display = 'none';
    }
  }

  /**
   * 显示错误状态
   */
  showError(message) {
    const errorEl = document.querySelector('[data-quick-view-error]');
    if (errorEl) {
      const errorMessage = errorEl.querySelector('.error-message');
      if (errorMessage) {
        errorMessage.textContent = message || '加载失败，请重试';
      }
      errorEl.style.display = 'flex';
    }
  }

  /**
   * 隐藏错误状态
   */
  hideError() {
    const errorEl = document.querySelector('[data-quick-view-error]');
    if (errorEl) {
      errorEl.style.display = 'none';
    }
  }

  /**
   * 重置内容
   */
  resetContent() {
    const container = document.querySelector('[data-quick-view-product]');
    if (container) {
      container.innerHTML = '';
      container.style.display = 'none';
    }
    this.hideError();
    this.currentProductHandle = null;
    this.currentIndex = 0;
  }

  /**
   * 添加到购物车
   */
  async addToCart(variantId, quantity = 1) {
    if (!variantId) return;

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          id: variantId,
          quantity: parseInt(quantity)
        })
      });

      if (!response.ok) {
        throw new Error('添加到购物车失败');
      }

      const result = await response.json();

      // 更新购物车显示
      if (window.cart) {
        await window.cart.updateCart();
      }

      // 显示成功消息
      if (window.ScifiTheme && window.ScifiTheme.showNotification) {
        window.ScifiTheme.showNotification('已添加到购物车', 'success');
      }

      // 可选：关闭快速查看
      setTimeout(() => {
        this.close();
      }, 1500);

    } catch (error) {
      console.error('Error adding to cart:', error);

      if (window.ScifiTheme && window.ScifiTheme.showNotification) {
        window.ScifiTheme.showNotification('添加失败，请重试', 'error');
      }
    }
  }

  /**
   * 更新选中的变体
   */
  updateSelectedVariant(variant) {
    const addToCartBtn = document.querySelector('[data-add-to-cart]');
    const priceContainer = document.querySelector('.quick-view__price');

    if (addToCartBtn) {
      addToCartBtn.dataset.variantId = variant.id;
      addToCartBtn.textContent = variant.available ? '添加到购物车' : '缺货';
      addToCartBtn.disabled = !variant.available;
    }

    if (priceContainer && variant.price) {
      priceContainer.innerHTML = this.renderPrice(variant);
    }
  }

  /**
   * 显示指定索引的图片
   */
  showImage(index) {
    const container = document.querySelector('[data-quick-view-product]');
    if (!container) return;

    const image = container.querySelector('.quick-view__image');
    const indicators = container.querySelectorAll('.image-indicator');

    // 这里需要根据实际的图片数据来更新
    // 实际实现中应该存储所有图片URL
    if (image) {
      // 更新图片src
      image.style.opacity = '0';
      setTimeout(() => {
        // image.src = images[index].src;
        image.style.opacity = '1';
      }, 150);
    }

    // 更新指示器状态
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === index);
    });
  }

  /**
   * 格式化价格
   */
  formatMoney(cents) {
    // Shopify价格格式化
    return (cents / 100).toFixed(2);
  }

  /**
   * 转义HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 追踪快速查看事件
   */
  trackQuickView(productHandle) {
    // Google Analytics 4
    if (typeof gtag === 'function') {
      gtag('event', 'view_item', {
        event_category: 'engagement',
        event_label: 'quick_view',
        item_id: productHandle
      });
    }

    // 其他分析平台...
  }
}

// 初始化快速查看功能
document.addEventListener('DOMContentLoaded', () => {
  window.quickView = new QuickView();
});

// 导出到全局作用域
window.QuickView = QuickView;