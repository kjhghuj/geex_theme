/**
 * 产品变体选择器功能
 * 处理变体选择、价格更新、库存状态等
 */

class VariantSelector {
  constructor(container, product) {
    this.container = container;
    this.product = product;
    this.variants = product.variants;
    this.currentVariant = product.selected_or_first_available_variant;

    this.init();
  }

  /**
   * 初始化变体选择器
   */
  init() {
    this.bindEvents();
    this.updateVariantInfo();
    this.updateMedia();
    this.updatePrice();
    this.updateButtons();
    this.updateAvailability();
    this.updateSKU();
    this.updateHistory();
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    // 下拉菜单变化
    const selects = this.container.querySelectorAll('[data-option-select]');
    selects.forEach(select => {
      select.addEventListener('change', (e) => {
        this.onVariantChange();
      });
    });

    // 按钮点击
    const buttons = this.container.querySelectorAll('[data-option-buttons] button');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const optionIndex = button.dataset.optionIndex;
        const value = button.dataset.value;

        // 更新选中状态
        const optionButtons = this.container.querySelectorAll(`[data-option-buttons="${optionIndex}"] button`);
        optionButtons.forEach(btn => {
          btn.removeAttribute('aria-pressed');
        });
        button.setAttribute('aria-pressed', 'true');

        // 更新选中值显示
        const selectedValue = this.container.querySelector(`[data-selected-value="${optionIndex}"]`);
        if (selectedValue) {
          selectedValue.textContent = value;
        }

        this.onVariantChange();
      });
    });
  }

  /**
   * 变体变化处理
   */
  onVariantChange() {
    this.getCurrentVariant();

    if (this.currentVariant) {
      this.updateVariantInfo();
      this.updateMedia();
      this.updatePrice();
      this.updateButtons();
      this.updateAvailability();
      this.updateSKU();
      this.updatePickupAvailability();
      this.updateHistory();
      this.triggerVariantChangeEvent();
    }
  }

  /**
   * 获取当前选中的变体
   */
  getCurrentVariant() {
    const options = [];

    // 获取每个选项的选中值
    const optionCount = this.product.options.length;
    for (let i = 0; i < optionCount; i++) {
      let selectedValue;

      // 检查下拉菜单
      const select = this.container.querySelector(`[data-option-select="${i}"]`);
      if (select) {
        selectedValue = select.value;
      } else {
        // 检查按钮
        const selectedButton = this.container.querySelector(`[data-option-buttons="${i}"] button[aria-pressed="true"]`);
        if (selectedButton) {
          selectedValue = selectedButton.dataset.value;
        }
      }

      if (selectedValue) {
        options.push(selectedValue);
      }
    }

    // 查找匹配的变体
    this.currentVariant = this.variants.find(variant => {
      return options.every((option, index) => {
        return variant.options[index] === option;
      });
    }) || null;
  }

  /**
   * 更新变体信息
   */
  updateVariantInfo() {
    // SKU
    const skuElement = this.container.querySelector('[data-variant-sku]');
    if (skuElement) {
      skuElement.textContent = this.currentVariant?.sku || 'N/A';
    }

    // 条形码
    const barcodeElement = this.container.querySelector('[data-variant-barcode]');
    if (barcodeElement) {
      barcodeElement.textContent = this.currentVariant?.barcode || 'N/A';
    }

    // 重量
    const weightElement = this.container.querySelector('[data-variant-weight]');
    if (weightElement) {
      if (this.currentVariant && this.currentVariant.weight > 0) {
        weightElement.textContent = this.formatWeight(this.currentVariant.weight);
      } else {
        weightElement.textContent = 'N/A';
      }
    }

    // 库存状态
    const inventoryElement = this.container.querySelector('[data-variant-inventory]');
    if (inventoryElement && this.currentVariant) {
      inventoryElement.textContent = this.getInventoryStatus(this.currentVariant);
    }

    // 缺货通知显示/隐藏
    const notifyElement = this.container.querySelector('[data-variant-notify]');
    if (notifyElement) {
      notifyElement.style.display = this.currentVariant?.available ? 'none' : 'block';
    }
  }

  /**
   * 更新媒体（图片）
   */
  updateMedia() {
    if (!this.currentVariant?.featured_media) return;

    const mediaId = `Media-${this.currentVariant.featured_media.id}`;
    const mediaGallery = document.querySelector('[data-media-gallery]');

    if (mediaGallery) {
      // 切换到对应的媒体项
      const mediaItems = mediaGallery.querySelectorAll('[data-media-item]');
      mediaItems.forEach(item => {
        item.classList.remove('active');
      });

      const currentMediaItem = mediaGallery.querySelector(`#${mediaId}`);
      if (currentMediaItem) {
        currentMediaItem.classList.add('active');
      }

      // 更新缩略图
      const thumbnails = mediaGallery.querySelectorAll('[data-thumbnail]');
      thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
        if (thumb.dataset.mediaId === this.currentVariant.featured_media.id.toString()) {
          thumb.classList.add('active');
        }
      });
    }
  }

  /**
   * 更新价格
   */
  updatePrice() {
    const priceElements = document.querySelectorAll('[data-product-price]');
    const comparePriceElements = document.querySelectorAll('[data-product-compare-price]');
    const priceWrapperElements = document.querySelectorAll('[data-price-wrapper]');

    if (this.currentVariant) {
      // 更新常规价格
      priceElements.forEach(element => {
        element.textContent = this.formatMoney(this.currentVariant.price);
        element.classList.remove('hide');
      });

      // 更新对比价格
      if (this.currentVariant.compare_at_price > this.currentVariant.price) {
        comparePriceElements.forEach(element => {
          element.textContent = this.formatMoney(this.currentVariant.compare_at_price);
          element.classList.remove('hide');
        });
        priceWrapperElements.forEach(element => {
          element.classList.add('price--on-sale');
        });
      } else {
        comparePriceElements.forEach(element => {
          element.classList.add('hide');
        });
        priceWrapperElements.forEach(element => {
          element.classList.remove('price--on-sale');
        });
      }

      // 移除不可用价格类
      priceWrapperElements.forEach(element => {
        element.classList.remove('price--sold-out', 'price--unavailable');
      });
    } else {
      // 变体不可用
      priceWrapperElements.forEach(element => {
        element.classList.add('price--unavailable');
      });
    }
  }

  /**
   * 更新按钮状态
   */
  updateButtons() {
    const addToCartButton = document.querySelector('[data-add-to-cart]');
    const addToCartText = document.querySelector('[data-add-to-cart-text]');

    if (addToCartButton && addToCartText) {
      if (this.currentVariant) {
        if (this.currentVariant.available) {
          addToCartButton.disabled = false;
          addToCartText.textContent = '添加到购物车';
          addToCartButton.classList.remove('btn--sold-out');
        } else {
          addToCartButton.disabled = true;
          addToCartText.textContent = '缺货';
          addToCartButton.classList.add('btn--sold-out');
        }
      } else {
        addToCartButton.disabled = true;
        addToCartText.textContent = '不可用';
        addToCartButton.classList.add('btn--sold-out');
      }
    }

    // 更新数量选择器
    const quantityInput = document.querySelector('[data-quantity-input]');
    if (quantityInput) {
      quantityInput.disabled = !this.currentVariant?.available;
    }
  }

  /**
   * 更新可用性
   */
  updateAvailability() {
    const availableElement = document.querySelector('[data-product-available]');

    if (availableElement) {
      if (this.currentVariant) {
        availableElement.textContent = this.currentVariant.available ? '有货' : '缺货';
        availableElement.className = this.currentVariant.available ? 'in-stock' : 'out-of-stock';
      } else {
        availableElement.textContent = '不可用';
        availableElement.className = 'unavailable';
      }
    }

    // 更新库存指示器
    const stockIndicator = document.querySelector('[data-stock-indicator]');
    if (stockIndicator && this.currentVariant) {
      const stockCount = this.getStockCount(this.currentVariant);
      this.updateStockIndicator(stockIndicator, stockCount);
    }
  }

  /**
   * 更新SKU
   */
  updateSKU() {
    const skuElements = document.querySelectorAll('[data-product-sku]');
    skuElements.forEach(element => {
      element.textContent = this.currentVariant?.sku || 'N/A';
    });
  }

  /**
   * 更新本地取货可用性
   */
  updatePickupAvailability() {
    const pickupAvailability = document.querySelector('[data-pickup-availability]');
    if (!pickupAvailability) return;

    if (!this.currentVariant) {
      pickupAvailability.innerHTML = '';
      return;
    }

    const rootUrl = window.routes.root || '/';
    const variantSectionUrl = `${rootUrl}variants/${this.currentVariant.id}/?section_id=pickup-availability`;

    fetch(variantSectionUrl)
      .then(response => response.text())
      .then(text => {
        const sectionInnerHTML = new DOMParser()
          .parseFromString(text, 'text/html')
          .querySelector('.shopify-section');

        pickupAvailability.innerHTML = sectionInnerHTML.innerHTML;
      })
      .catch(error => {
        console.error('Error loading pickup availability:', error);
      });
  }

  /**
   * 更新浏览器历史
   */
  updateHistory() {
    if (!this.currentVariant) return;

    const url = new URL(window.location.href);
    if (url.searchParams.get('variant') !== this.currentVariant.id.toString()) {
      url.searchParams.set('variant', this.currentVariant.id);
      window.history.replaceState({}, '', url.href);
    }
  }

  /**
   * 触发变体变化事件
   */
  triggerVariantChangeEvent() {
    const event = new CustomEvent('variantChange', {
      detail: {
        variant: this.currentVariant,
        product: this.product
      }
    });
    document.dispatchEvent(event);
  }

  /**
   * 更新选项可用性
   */
  updateOptionsAvailability() {
    const optionCount = this.product.options.length;

    for (let optionIndex = 0; optionIndex < optionCount; optionIndex++) {
      const selectedValues = this.getSelectedValues();

      // 检查每个选项值的可用性
      const optionValues = this.product.options[optionIndex].values;
      optionValues.forEach(value => {
        const testValues = [...selectedValues];
        testValues[optionIndex] = value;

        const isAvailable = this.variants.some(variant => {
          return variant.options.every((option, index) => {
            return option === testValues[index] && variant.available;
          });
        });

        this.updateOptionAvailability(optionIndex, value, isAvailable);
      });
    }
  }

  /**
   * 更新单个选项的可用性
   */
  updateOptionAvailability(optionIndex, value, isAvailable) {
    // 更新下拉菜单
    const select = this.container.querySelector(`[data-option-select="${optionIndex}"]`);
    if (select) {
      const option = select.querySelector(`option[value="${value}"]`);
      if (option) {
        option.disabled = !isAvailable;
      }
    }

    // 更新按钮
    const button = this.container.querySelector(`[data-option-buttons="${optionIndex}"] [data-value="${value}"]`);
    if (button) {
      button.disabled = !isAvailable;
    }

    // 更新色卡
    const swatch = this.container.querySelector(`[data-option-buttons="${optionIndex}"] [data-value="${value}"]`);
    if (swatch && swatch.classList.contains('variant-swatch')) {
      const unavailableIndicator = swatch.querySelector('.variant-swatch__unavailable');
      if (unavailableIndicator) {
        unavailableIndicator.style.display = isAvailable ? 'none' : 'flex';
      }
    }
  }

  /**
   * 获取选中的值
   */
  getSelectedValues() {
    const values = [];

    for (let i = 0; i < this.product.options.length; i++) {
      const select = this.container.querySelector(`[data-option-select="${i}"]`);
      if (select) {
        values.push(select.value);
      } else {
        const button = this.container.querySelector(`[data-option-buttons="${i}"] button[aria-pressed="true"]`);
        if (button) {
          values.push(button.dataset.value);
        } else {
          values.push(null);
        }
      }
    }

    return values;
  }

  /**
   * 获取库存状态文本
   */
  getInventoryStatus(variant) {
    if (!variant.available) {
      return '缺货';
    }

    if (variant.inventory_management === null) {
      return '现货充足';
    }

    if (variant.inventory_quantity > 5) {
      return '现货充足';
    } else if (variant.inventory_quantity > 0) {
      return `仅剩 ${variant.inventory_quantity} 件`;
    } else if (variant.inventory_policy === 'continue') {
      return '预购中';
    } else {
      return '缺货';
    }
  }

  /**
   * 获取库存数量
   */
  getStockCount(variant) {
    if (!variant.inventory_management || variant.inventory_quantity <= 0) {
      return 0;
    }
    return variant.inventory_quantity;
  }

  /**
   * 更新库存指示器
   */
  updateStockIndicator(indicator, count) {
    indicator.className = 'stock-indicator';

    if (count === 0) {
      indicator.classList.add('stock--none');
      indicator.textContent = '缺货';
    } else if (count <= 5) {
      indicator.classList.add('stock--low');
      indicator.textContent = `仅剩 ${count} 件`;
    } else {
      indicator.classList.add('stock--available');
      indicator.textContent = '现货充足';
    }
  }

  /**
   * 格式化价格
   */
  formatMoney(cents) {
    return (cents / 100).toFixed(2);
  }

  /**
   * 格式化重量
   */
  formatWeight(grams) {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(1)} kg`;
    } else {
      return `${grams} g`;
    }
  }

  /**
   * 销毁组件
   */
  destroy() {
    // 清理事件监听器
    const selects = this.container.querySelectorAll('[data-option-select]');
    selects.forEach(select => {
      select.removeEventListener('change', this.onVariantChange);
    });

    const buttons = this.container.querySelectorAll('[data-option-buttons] button');
    buttons.forEach(button => {
      button.removeEventListener('click', this.onVariantChange);
    });
  }
}

// 初始化变体选择器
document.addEventListener('DOMContentLoaded', () => {
  const variantSelectors = document.querySelectorAll('[data-variant-selector]');

  variantSelectors.forEach(selector => {
    const variantsData = selector.querySelector('[data-product-variants]');
    if (variantsData) {
      try {
        const product = JSON.parse(variantsData.textContent);
        new VariantSelector(selector, product);
      } catch (error) {
        console.error('Error parsing product variants:', error);
      }
    }
  });
});

// 导出到全局作用域
window.VariantSelector = VariantSelector;