/**
 * 数量选择器功能模块
 * 处理数量增减、输入验证、库存限制等
 */

class QuantitySelector {
  constructor(container) {
    this.container = container;
    this.input = container.querySelector('[data-quantity-input]');
    this.minusBtn = container.querySelector('[data-quantity-minus]');
    this.plusBtn = container.querySelector('[data-quantity-plus]');

    this.min = parseInt(this.input.min) || 1;
    this.max = parseInt(this.input.max) || 999;
    this.value = parseInt(this.input.value) || this.min;

    this.init();
  }

  /**
   * 初始化数量选择器
   */
  init() {
    this.bindEvents();
    this.updateButtonStates();
    this.validateValue();
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    // 增加按钮
    if (this.plusBtn) {
      this.plusBtn.addEventListener('click', () => {
        this.increase();
      });
    }

    // 减少按钮
    if (this.minusBtn) {
      this.minusBtn.addEventListener('click', () => {
        this.decrease();
      });
    }

    // 输入框变化
    if (this.input) {
      this.input.addEventListener('change', (e) => {
        this.onInputChange(e);
      });

      this.input.addEventListener('input', () => {
        this.validateInput();
      });

      // 键盘事件
      this.input.addEventListener('keydown', (e) => {
        this.onKeyDown(e);
      });

      // 焦点事件
      this.input.addEventListener('focus', () => {
        this.input.select();
      });
    }

    // 滚轮事件
    this.container.addEventListener('wheel', (e) => {
      if (document.activeElement === this.input) {
        e.preventDefault();
        if (e.deltaY < 0) {
          this.increase();
        } else {
          this.decrease();
        }
      }
    });
  }

  /**
   * 增加数量
   */
  increase() {
    if (this.value < this.max) {
      this.value++;
      this.updateValue();
      this.triggerChange();
    }
  }

  /**
   * 减少数量
   */
  decrease() {
    if (this.value > this.min) {
      this.value--;
      this.updateValue();
      this.triggerChange();
    }
  }

  /**
   * 设置数量
   */
  setValue(newValue, silent = false) {
    const oldValue = this.value;
    this.value = this.clampValue(newValue);

    if (oldValue !== this.value) {
      this.updateValue();
      if (!silent) {
        this.triggerChange();
      }
    }
  }

  /**
   * 获取数量
   */
  getValue() {
    return this.value;
  }

  /**
   * 输入框变化处理
   */
  onInputChange(e) {
    const newValue = parseInt(e.target.value) || this.min;
    this.setValue(newValue);
  }

  /**
   * 键盘事件处理
   */
  onKeyDown(e) {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        this.increase();
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.decrease();
        break;
      case 'Home':
        e.preventDefault();
        this.setValue(this.min);
        break;
      case 'End':
        e.preventDefault();
        this.setValue(this.max);
        break;
      case 'PageUp':
        e.preventDefault();
        this.setValue(Math.min(this.value + 10, this.max));
        break;
      case 'PageDown':
        e.preventDefault();
        this.setValue(Math.max(this.value - 10, this.min));
        break;
    }
  }

  /**
   * 验证输入
   */
  validateInput() {
    const value = this.input.value;

    // 只允许数字
    if (!/^\d*$/.test(value)) {
      this.input.value = this.value;
      return false;
    }

    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < this.min) {
      this.input.value = this.min;
      return false;
    }

    if (numValue > this.max) {
      this.input.value = this.max;
      return false;
    }

    return true;
  }

  /**
   * 验证值
   */
  validateValue() {
    this.value = this.clampValue(this.value);
    this.updateValue();
  }

  /**
   * 限制值在有效范围内
   */
  clampValue(value) {
    const numValue = parseInt(value) || this.min;
    return Math.max(this.min, Math.min(numValue, this.max));
  }

  /**
   * 更新输入框值
   */
  updateValue() {
    if (this.input) {
      this.input.value = this.value;
    }
    this.updateButtonStates();
    this.updateInventoryDisplay();
  }

  /**
   * 更新按钮状态
   */
  updateButtonStates() {
    if (this.minusBtn) {
      this.minusBtn.disabled = this.value <= this.min;
    }

    if (this.plusBtn) {
      this.plusBtn.disabled = this.value >= this.max;
    }
  }

  /**
   * 更新库存显示
   */
  updateInventoryDisplay() {
    const inventoryInfo = this.container.querySelector('.quantity-inventory');
    if (!inventoryInfo) return;

    const currentVariant = this.getCurrentVariant();
    if (!currentVariant || !currentVariant.inventory_management) {
      inventoryInfo.style.display = 'none';
      return;
    }

    inventoryInfo.style.display = 'block';
    const inventoryQuantity = currentVariant.inventory_quantity || 0;

    let html = '';
    if (this.value > inventoryQuantity && inventoryQuantity > 0) {
      html = `
        <div class="inventory-info inventory--low">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm1 4a1 1 0 00-2 0v4a1 1 0 001 1h3a1 1 0 100-2H9V5z"/>
          </svg>
          <span>库存不足 (剩余 ${inventoryQuantity} 件)</span>
        </div>
      `;
    } else if (inventoryQuantity === 0) {
      if (currentVariant.inventory_policy === 'continue') {
        html = `
          <div class="inventory-info inventory--backorder">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM8 4a1 1 0 011 1v2h2a1 1 0 110 2H9v2a1 1 0 11-2 0V9H5a1 1 0 110-2h2V5a1 1 0 011-1z"/>
            </svg>
            <span>预购商品</span>
          </div>
        `;
      } else {
        html = `
          <div class="inventory-info inventory--sold-out">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3 8H5a1 1 0 110-2h6a1 1 0 110 2z"/>
            </svg>
            <span>缺货</span>
          </div>
        `;
      }
    } else if (inventoryQuantity <= 10) {
      html = `
        <div class="inventory-info inventory--low">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm1 4a1 1 0 00-2 0v4a1 1 0 001 1h3a1 1 0 100-2H9V5z"/>
          </svg>
          <span>仅剩 ${inventoryQuantity} 件</span>
        </div>
      `;
    } else {
      html = `
        <div class="inventory-info inventory--available">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.5 7.5l-4 4a.5.5 0 01-.71 0l-2-2a.5.5 0 11.71-.71L7.5 11.09l3.65-3.65a.5.5 0 01.7.71z"/>
          </svg>
          <span>现货充足</span>
        </div>
      `;
    }

    inventoryInfo.innerHTML = html;
  }

  /**
   * 获取当前产品变体
   */
  getCurrentVariant() {
    // 尝试从全局获取变体信息
    if (window.product && window.product.variants) {
      const variantSelects = document.querySelectorAll('[data-variant-select]');
      if (variantSelects.length > 0) {
        // 根据选中的选项查找变体
        const selectedOptions = [];
        variantSelects.forEach((select, index) => {
          selectedOptions[index] = select.value;
        });

        return window.product.variants.find(variant => {
          return selectedOptions.every((option, index) => {
            return variant.options[index] === option;
          });
        });
      } else {
        return window.product.selected_or_first_available_variant;
      }
    }

    return null;
  }

  /**
   * 设置最大值
   */
  setMax(newMax) {
    this.max = parseInt(newMax) || 999;
    this.validateValue();
  }

  /**
   * 设置最小值
   */
  setMin(newMin) {
    this.min = parseInt(newMin) || 1;
    this.validateValue();
  }

  /**
   * 禁用选择器
   */
  disable() {
    this.input.disabled = true;
    this.minusBtn.disabled = true;
    this.plusBtn.disabled = true;
    this.container.classList.add('is-disabled');
  }

  /**
   * 启用选择器
   */
  enable() {
    this.input.disabled = false;
    this.updateButtonStates();
    this.container.classList.remove('is-disabled');
  }

  /**
   * 显示错误状态
   */
  showError(message) {
    this.container.classList.add('has-error');
    this.container.classList.remove('has-success');

    // 显示错误消息
    let errorElement = this.container.querySelector('.quantity-error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'quantity-error';
      this.container.appendChild(errorElement);
    }
    errorElement.textContent = message;
  }

  /**
   * 显示成功状态
   */
  showSuccess(message) {
    this.container.classList.add('has-success');
    this.container.classList.remove('has-error');

    // 显示成功消息
    let successElement = this.container.querySelector('.quantity-success');
    if (!successElement) {
      successElement = document.createElement('div');
      successElement.className = 'quantity-success';
      this.container.appendChild(successElement);
    }
    successElement.textContent = message;
  }

  /**
   * 清除状态
   */
  clearState() {
    this.container.classList.remove('has-error', 'has-success');

    const errorElement = this.container.querySelector('.quantity-error');
    if (errorElement) {
      errorElement.remove();
    }

    const successElement = this.container.querySelector('.quantity-success');
    if (successElement) {
      successElement.remove();
    }
  }

  /**
   * 显示加载状态
   */
  showLoading() {
    this.container.classList.add('is-loading');
  }

  /**
   * 隐藏加载状态
   */
  hideLoading() {
    this.container.classList.remove('is-loading');
  }

  /**
   * 触发变化事件
   */
  triggerChange() {
    const event = new CustomEvent('quantityChange', {
      detail: {
        value: this.value,
        container: this.container
      },
      bubbles: true
    });
    this.container.dispatchEvent(event);

    // 同时触发标准的change事件
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * 重置为默认值
   */
  reset() {
    this.value = this.min;
    this.updateValue();
    this.clearState();
  }

  /**
   * 销毁组件
   */
  destroy() {
    // 移除事件监听器
    if (this.minusBtn) {
      this.minusBtn.removeEventListener('click', this.decrease);
    }
    if (this.plusBtn) {
      this.plusBtn.removeEventListener('click', this.increase);
    }
    if (this.input) {
      this.input.removeEventListener('change', this.onInputChange);
      this.input.removeEventListener('input', this.validateInput);
      this.input.removeEventListener('keydown', this.onKeyDown);
      this.input.removeEventListener('focus', this.input.select);
    }
  }
}

// 初始化所有数量选择器
document.addEventListener('DOMContentLoaded', () => {
  const quantitySelectors = document.querySelectorAll('[data-quantity-selector]');

  quantitySelectors.forEach(selector => {
    // 创建实例并存储在元素上
    selector.quantitySelector = new QuantitySelector(selector);
  });

  // 监听产品变体变化事件
  document.addEventListener('variantChange', (e) => {
    const variant = e.detail.variant;
    if (!variant) return;

    // 更新所有数量选择器的最大值
    quantitySelectors.forEach(selector => {
      const quantitySelector = selector.quantitySelector;
      if (quantitySelector) {
        // 如果变体有库存限制，设置最大值
        if (variant.inventory_management === 'shopify' && variant.inventory_policy === 'deny') {
          quantitySelector.setMax(variant.inventory_quantity || 1);
        } else {
          quantitySelector.setMax(999);
        }

        // 如果变体不可用，禁用数量选择器
        if (!variant.available) {
          quantitySelector.disable();
        } else {
          quantitySelector.enable();
        }

        // 重置数量为1
        quantitySelector.reset();
      }
    });
  });

  // 监听数量变化事件，可以用于更新总价等
  document.addEventListener('quantityChange', (e) => {
    const { value, container } = e.detail;

    // 这里可以添加处理逻辑，比如：
    // - 更新总价显示
    // - 验证库存
    // - 发送分析事件

    console.log('Quantity changed to:', value);
  });
});

// 导出到全局作用域
window.QuantitySelector = QuantitySelector;