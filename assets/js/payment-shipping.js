/**
 * 支付和配送功能模块
 * 处理支付方式选择、配送方式计算和表单验证
 */

class PaymentShippingManager {
  constructor() {
    this.selectedPaymentGateway = null;
    this.selectedShippingMethod = null;
    this.cartTotal = {{ cart.total_price | json }} || 0;
    this.customerEmail = '{{ customer.email }}' || null;

    this.init();
  }

  init() {
    this.bindEvents();
    this.initPaymentGateways();
    this.initShippingRates();
    this.loadSavedPreferences();
  }

  bindEvents() {
    // 支付方式选择
    document.addEventListener('paymentMethodSelected', (e) => {
      this.handlePaymentMethodSelection(e.detail);
    });

    // 配送方式选择
    document.addEventListener('shippingMethodSelected', (e) => {
      this.handleShippingMethodSelection(e.detail);
    });

    // 表单提交处理
    const checkoutForm = document.querySelector('[data-checkout-form]');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        this.handleCheckoutSubmit(e);
      });
    }

    // 地址变更时重新计算配送费
    const addressInputs = document.querySelectorAll('[data-address-input]');
    addressInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.calculateShippingRates();
      });
    });

    // 支付偏好设置
    const preferenceInputs = document.querySelectorAll('[data-preference-input]');
    preferenceInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.saveShippingPreferences();
      });
    });
  }

  initPaymentGateways() {
    // 初始化支付方式
    const gateways = document.querySelectorAll('[data-payment-gateway]');

    gateways.forEach(gateway => {
      const gatewayId = gateway.dataset.gatewayId;

      // 加载支付网关特定脚本
      this.loadPaymentGatewayScript(gatewayId);

      // 设置支付方式特定验证
      this.setupPaymentGatewayValidation(gatewayId);
    });
  }

  initShippingRates() {
    // 初始化配送费率
    this.calculateShippingRates();

    // 实时费率更新
    this.startRealTimeRateUpdates();
  }

  async loadPaymentGatewayScript(gatewayId) {
    const gatewayScripts = {
      'stripe': 'https://js.stripe.com/v3/',
      'paypal': 'https://www.paypal.com/sdk/js',
      'apple_pay': null, // 原生支持
      'google_pay': 'https://pay.google.com/gp/p/js/view',
      'alipay': 'https://gw.alipayobjects.com/as/g/h5-alipay/0.6.16/alipay.h5.min.js',
      'wechat_pay': 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js'
    };

    const scriptUrl = gatewayScripts[gatewayId];
    if (scriptUrl && !document.querySelector(`[data-gateway-script="${gatewayId}"]`)) {
      try {
        await this.loadScript(scriptUrl);
        console.log(`Payment gateway ${gatewayId} loaded successfully`);
      } catch (error) {
        console.error(`Failed to load payment gateway ${gatewayId}:`, error);
      }
    }
  }

  loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  setupPaymentGatewayValidation(gatewayId) {
    const validators = {
      'stripe': () => this.validateStripeForm(),
      'paypal': () => this.validatePayPalForm(),
      'apple_pay': () => this.validateApplePayForm(),
      'google_pay': () => this.validateGooglePayForm(),
      'alipay': () => this.validateAlipayForm(),
      'wechat_pay': () => this.validateWeChatForm()
    };

    const validator = validators[gatewayId];
    if (validator) {
      this.paymentGatewayValidators = this.paymentGatewayValidators || {};
      this.paymentGatewayValidators[gatewayId] = validator;
    }
  }

  handlePaymentMethodSelection(detail) {
    this.selectedPaymentGateway = detail.gatewayId;

    // 更新UI状态
    this.updatePaymentMethodUI(detail.gatewayId);

    // 预处理支付方式
    this.preprocessPaymentMethod(detail.gatewayId);

    // 更新配送选项
    this.updateShippingOptionsForPayment(detail.gatewayId);

    // 保存选择
    this.savePaymentMethodPreference(detail.gatewayId);

    // 触发分析事件
    this.trackPaymentMethodSelection(detail.gatewayId);
  }

  handleShippingMethodSelection(detail) {
    this.selectedShippingMethod = detail.methodId;

    // 更新UI状态
    this.updateShippingMethodUI(detail.methodId);

    // 重新计算总价
    this.updateOrderTotal(detail.price);

    // 更新配送时间预估
    this.updateDeliveryEstimate(detail.deliveryDays);

    // 保存选择
    this.saveShippingMethodPreference(detail.methodId);

    // 触发分析事件
    this.trackShippingMethodSelection(detail.methodId);
  }

  async calculateShippingRates() {
    const addressForm = document.querySelector('[data-address-form]');
    if (!addressForm) return;

    try {
      // 收集地址信息
      const address = this.collectAddressData(addressForm);

      // 显示加载状态
      this.showShippingRatesLoading();

      // 调用配送费率API
      const rates = await this.fetchShippingRates(address);

      // 更新UI
      this.updateShippingRatesUI(rates);

      // 计算预计送达时间
      this.calculateDeliveryEstimates(rates);

    } catch (error) {
      console.error('Failed to calculate shipping rates:', error);
      this.showShippingRatesError();
    }
  }

  collectAddressData(form) {
    const inputs = form.querySelectorAll('input, select');
    const data = {};

    inputs.forEach(input => {
      if (input.name && input.value) {
        data[input.name] = input.value;
      }
    });

    return data;
  }

  async fetchShippingRates(address) {
    // 模拟API调用 - 在实际项目中需要替换为真实的API端点
    const mockRates = [
      {
        id: 'standard',
        name: '标准配送',
        price: this.cartTotal > 500 ? 0 : 1000, // 满500免运费
        delivery_days: 3,
        description: '标准快递配送'
      },
      {
        id: 'express',
        name: '快速配送',
        price: 2000,
        delivery_days: 1,
        description: '次日达快递'
      },
      {
        id: 'economy',
        name: '经济配送',
        price: 500,
        delivery_days: 7,
        description: '经济实惠的配送方式'
      }
    ];

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800));

    return mockRates;
  }

  updateShippingRatesUI(rates) {
    const ratesContainer = document.querySelector('[data-shipping-rates]');
    if (!ratesContainer) return;

    ratesContainer.innerHTML = rates.map(rate => `
      <div class="shipping-method" data-shipping-rate="${rate.id}" data-rate-price="${rate.price}" data-delivery-days="${rate.delivery_days}">
        <input type="radio" name="shipping_rate" value="${rate.id}" id="shipping_rate_${rate.id}" class="shipping-rate-radio">
        <label class="shipping-method-label" for="shipping_rate_${rate.id}">
          <div class="shipping-method-info">
            <div class="shipping-method-name">
              ${rate.name}
              ${rate.price === 0 ? '<span class="shipping-badge free">免费</span>' : ''}
            </div>
            <div class="shipping-method-details">${rate.description}</div>
            <div class="shipping-method-time">${rate.delivery_days}个工作日送达</div>
          </div>
          <div class="shipping-method-price">
            ${rate.price === 0 ? '<span class="free-shipping">免费配送</span>' : `<span class="price">${this.formatMoney(rate.price)}</span>`}
          </div>
        </label>
      </div>
    `).join('');

    // 重新绑定事件
    this.bindShippingMethodEvents();
  }

  bindShippingMethodEvents() {
    const methods = document.querySelectorAll('.shipping-method');
    methods.forEach(method => {
      const radio = method.querySelector('.shipping-rate-radio');

      method.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT') {
          this.selectShippingMethod(method);
        }
      });

      radio.addEventListener('change', () => {
        if (radio.checked) {
          this.selectShippingMethod(method);
        }
      });
    });
  }

  selectShippingMethod(method) {
    // 移除其他选中状态
    document.querySelectorAll('.shipping-method').forEach(m => {
      m.classList.remove('selected');
    });

    // 添加选中状态
    method.classList.add('selected');

    // 更新radio
    const radio = method.querySelector('.shipping-rate-radio');
    if (radio) radio.checked = true;

    // 触发选择事件
    const event = new CustomEvent('shippingMethodSelected', {
      detail: {
        methodId: method.dataset.shippingRate,
        price: method.dataset.ratePrice,
        deliveryDays: method.dataset.deliveryDays
      }
    });
    document.dispatchEvent(event);
  }

  updateOrderTotal(shippingPrice) {
    const shippingCost = parseInt(shippingPrice) || 0;
    const total = this.cartTotal + shippingCost;

    // 更新总价显示
    const totalElements = document.querySelectorAll('[data-order-total]');
    totalElements.forEach(element => {
      element.textContent = this.formatMoney(total);
    });

    // 更新配送费显示
    const shippingElements = document.querySelectorAll('[data-shipping-cost]');
    shippingElements.forEach(element => {
      element.textContent = shippingCost === 0 ? '免费' : this.formatMoney(shippingCost);
    });
  }

  async handleCheckoutSubmit(event) {
    const form = event.target;

    // 验证表单
    if (!await this.validateCheckoutForm(form)) {
      event.preventDefault();
      return;
    }

    // 处理支付
    const paymentResult = await this.processPayment();
    if (!paymentResult.success) {
      event.preventDefault();
      this.showPaymentError(paymentResult.error);
      return;
    }

    // 显示处理状态
    this.showProcessingState();
  }

  async validateCheckoutForm(form) {
    let isValid = true;

    // 验证支付方式
    if (!this.selectedPaymentGateway) {
      this.showFieldError('payment_gateway', '请选择支付方式');
      isValid = false;
    }

    // 验证配送方式
    if (!this.selectedShippingMethod) {
      this.showFieldError('shipping_method', '请选择配送方式');
      isValid = false;
    }

    // 验证支付方式特定表单
    if (this.selectedPaymentGateway) {
      const validator = this.paymentGatewayValidators?.[this.selectedPaymentGateway];
      if (validator) {
        const paymentValid = await validator();
        if (!paymentValid) {
          isValid = false;
        }
      }
    }

    // 验证地址表单
    const addressValid = await this.validateAddressForm(form);
    if (!addressValid) {
      isValid = false;
    }

    return isValid;
  }

  async processPayment() {
    try {
      this.showPaymentProcessing();

      const paymentData = {
        gateway: this.selectedPaymentGateway,
        amount: this.calculateTotalAmount(),
        currency: 'CNY',
        customer: {
          email: this.customerEmail
        },
        billing_address: this.getBillingAddress(),
        shipping_address: this.getShippingAddress()
      };

      // 根据支付方式调用相应的支付处理
      const result = await this.processGatewayPayment(this.selectedPaymentGateway, paymentData);

      return result;
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: '支付处理失败，请重试'
      };
    }
  }

  async processGatewayPayment(gateway, paymentData) {
    const processors = {
      'stripe': () => this.processStripePayment(paymentData),
      'paypal': () => this.processPayPalPayment(paymentData),
      'apple_pay': () => this.processApplePayPayment(paymentData),
      'google_pay': () => this.processGooglePayPayment(paymentData),
      'alipay': () => this.processAlipayPayment(paymentData),
      'wechat_pay': () => this.processWeChatPayment(paymentData)
    };

    const processor = processors[gateway];
    if (processor) {
      return await processor();
    }

    return {
      success: false,
      error: '不支持的支付方式'
    };
  }

  // 各支付方式处理函数
  async processStripePayment(paymentData) {
    // Stripe支付处理逻辑
    // 这里需要集成Stripe API
    return {
      success: true,
      paymentIntent: 'pi_example'
    };
  }

  async processPayPalPayment(paymentData) {
    // PayPal支付处理逻辑
    return {
      success: true,
      paypalOrderId: 'PAYID_example'
    };
  }

  async processAlipayPayment(paymentData) {
    // 支付宝支付处理逻辑
    return {
      success: true,
      alipayOrderId: '2024_example'
    };
  }

  // UI更新函数
  updatePaymentMethodUI(gatewayId) {
    // 更新支付方式UI状态
    const methods = document.querySelectorAll('[data-payment-gateway]');
    methods.forEach(method => {
      method.classList.remove('selected');
      if (method.dataset.gatewayId === gatewayId) {
        method.classList.add('selected');
      }
    });
  }

  updateShippingMethodUI(methodId) {
    // 更新配送方式UI状态
    const methods = document.querySelectorAll('[data-shipping-rate]');
    methods.forEach(method => {
      method.classList.remove('selected');
      if (method.dataset.shippingRate === methodId) {
        method.classList.add('selected');
      }
    });
  }

  showShippingRatesLoading() {
    const container = document.querySelector('[data-shipping-methods]');
    if (container) {
      container.classList.add('loading');
    }
  }

  showShippingRatesError() {
    const container = document.querySelector('[data-shipping-methods]');
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          <p>无法获取配送费率，请检查地址信息或稍后重试</p>
        </div>
      `;
    }
  }

  showPaymentProcessing() {
    const button = document.querySelector('[data-checkout-submit]');
    if (button) {
      button.disabled = true;
      button.innerHTML = '处理中... <span class="loading-spinner"></span>';
    }
  }

  showPaymentError(error) {
    const errorContainer = document.querySelector('[data-payment-error]');
    if (errorContainer) {
      errorContainer.textContent = error;
      errorContainer.style.display = 'block';
    }
  }

  showProcessingState() {
    // 显示处理状态
    const overlay = document.createElement('div');
    overlay.className = 'processing-overlay';
    overlay.innerHTML = `
      <div class="processing-modal">
        <div class="processing-spinner"></div>
        <h3>正在处理订单</h3>
        <p>请稍候，我们正在安全处理您的订单...</p>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  // 工具函数
  formatMoney(amount) {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount / 100);
  }

  calculateTotalAmount() {
    return this.cartTotal;
  }

  getBillingAddress() {
    // 获取账单地址
    return {};
  }

  getShippingAddress() {
    // 获取配送地址
    return {};
  }

  // 本地存储
  savePaymentMethodPreference(gatewayId) {
    localStorage.setItem('preferredPaymentGateway', gatewayId);
  }

  saveShippingMethodPreference(methodId) {
    localStorage.setItem('preferredShippingMethod', methodId);
  }

  saveShippingPreferences() {
    const preferences = {
      signatureRequired: document.getElementById('signature_required')?.checked,
      smsNotifications: document.getElementById('sms_notifications')?.checked,
      emailNotifications: document.getElementById('email_notifications')?.checked,
      deliveryInstructions: document.getElementById('delivery_instructions')?.value,
      preferredDeliveryTime: document.getElementById('preferred_delivery_time')?.value
    };

    localStorage.setItem('shippingPreferences', JSON.stringify(preferences));
  }

  loadSavedPreferences() {
    // 加载保存的偏好设置
    const savedPaymentGateway = localStorage.getItem('preferredPaymentGateway');
    const savedShippingMethod = localStorage.getItem('preferredShippingMethod');
    const savedPreferences = localStorage.getItem('shippingPreferences');

    if (savedPaymentGateway) {
      const gateway = document.querySelector(`[data-gateway-id="${savedPaymentGateway}"]`);
      if (gateway) {
        this.selectPaymentMethod(gateway);
      }
    }

    if (savedShippingMethod) {
      const method = document.querySelector(`[data-shipping-rate="${savedShippingMethod}"]`);
      if (method) {
        this.selectShippingMethod(method);
      }
    }

    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        this.applyShippingPreferences(preferences);
      } catch (error) {
        console.error('Failed to load shipping preferences:', error);
      }
    }
  }

  applyShippingPreferences(preferences) {
    // 应用保存的偏好设置
    if (preferences.signatureRequired !== undefined) {
      const checkbox = document.getElementById('signature_required');
      if (checkbox) checkbox.checked = preferences.signatureRequired;
    }

    if (preferences.smsNotifications !== undefined) {
      const checkbox = document.getElementById('sms_notifications');
      if (checkbox) checkbox.checked = preferences.smsNotifications;
    }

    if (preferences.emailNotifications !== undefined) {
      const checkbox = document.getElementById('email_notifications');
      if (checkbox) checkbox.checked = preferences.emailNotifications;
    }

    if (preferences.deliveryInstructions) {
      const textarea = document.getElementById('delivery_instructions');
      if (textarea) textarea.value = preferences.deliveryInstructions;
    }

    if (preferences.preferredDeliveryTime) {
      const select = document.getElementById('preferred_delivery_time');
      if (select) select.value = preferences.preferredDeliveryTime;
    }
  }

  startRealTimeRateUpdates() {
    // 实时费率更新
    setInterval(() => {
      this.calculateShippingRates();
    }, 5 * 60 * 1000); // 每5分钟更新一次
  }

  // 分析跟踪
  trackPaymentMethodSelection(gatewayId) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'payment_method_selected', {
        payment_gateway: gatewayId,
        cart_value: this.cartTotal
      });
    }
  }

  trackShippingMethodSelection(methodId) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'shipping_method_selected', {
        shipping_method: methodId,
        cart_value: this.cartTotal
      });
    }
  }
}

// 初始化支付和配送管理器
document.addEventListener('DOMContentLoaded', () => {
  window.paymentShippingManager = new PaymentShippingManager();
});

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaymentShippingManager;
}