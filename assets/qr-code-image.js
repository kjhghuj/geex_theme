// ============================================
// Cyber QR Code Image Component
// ============================================

class QRCodeImage extends HTMLElement {
  constructor() {
    super();
    this.identifier = this.getAttribute('data-identifier');
    this.width = parseInt(this.getAttribute('width')) || 200;
    this.height = parseInt(this.getAttribute('height')) || 200;
    this.alt = this.getAttribute('alt') || 'QR Code';

    if (!this.identifier) {
      console.warn('QRCodeImage: Missing data-identifier attribute');
      return;
    }

    this.init();
  }

  init() {
    this.generateCyberQRCode();
  }

  generateCyberQRCode() {
    // 创建主容器
    const qrWrapper = document.createElement('div');
    qrWrapper.className = 'cyber-qr-wrapper';
    qrWrapper.style.cssText = `
      position: relative;
      width: ${this.width}px;
      height: ${this.height}px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // 创建QR码Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = Math.min(this.width, this.height) * 0.8;

    canvas.width = size;
    canvas.height = size;
    canvas.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
    `;

    // 生成QR码图案
    this.drawCyberQRPattern(ctx, size);

    qrWrapper.appendChild(canvas);

    // 添加赛博效果层
    this.addCyberEffects(qrWrapper, canvas);

    // 替换当前元素内容
    this.innerHTML = '';
    this.appendChild(qrWrapper);

    // 启动动画
    this.animateQRCode();
  }

  drawCyberQRPattern(ctx, size) {
    const moduleSize = Math.max(3, Math.floor(size / 25));
    const modules = Math.floor(size / moduleSize);

    // 设置画布背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // 生成基于标识符的伪随机图案
    const seed = this.hashCode(this.identifier);

    // 绘制QR码主体
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        if (this.shouldFillModule(seed, row, col, modules)) {
          // 创建渐变色块
          const gradient = ctx.createLinearGradient(
            col * moduleSize, row * moduleSize,
            (col + 1) * moduleSize, (row + 1) * moduleSize
          );

          const brightness = this.pseudoRandom(seed + row * modules + col, 0, 100);
          gradient.addColorStop(0, `hsl(${200 + brightness}, 80%, ${30 + brightness / 5}%)`);
          gradient.addColorStop(1, `hsl(${220 + brightness}, 85%, ${20 + brightness / 10}%)`);

          ctx.fillStyle = gradient;
          ctx.fillRect(
            col * moduleSize,
            row * moduleSize,
            moduleSize - 1,
            moduleSize - 1
          );
        }
      }
    }

    // 添加定位标记（角标）
    this.drawCyberPositionMarkers(ctx, modules, moduleSize, seed);

    // 添加中心装饰
    this.drawCenterDecoration(ctx, size, seed);
  }

  shouldFillModule(seed, row, col, modules) {
    // 创建更复杂的伪随机模式
    const centerRow = Math.floor(modules / 2);
    const centerCol = Math.floor(modules / 2);
    const distanceFromCenter = Math.sqrt(
      Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
    );
    const maxDistance = Math.sqrt(
      Math.pow(centerRow, 2) + Math.pow(centerCol, 2)
    );

    // 基于距离和种子的复杂函数
    const baseValue = this.pseudoRandom(seed + row * modules + col, 0, 1000);
    const distanceFactor = (1 - distanceFromCenter / maxDistance) * 500;
    const timeFactor = Math.sin((seed + row * 7 + col * 13) * 0.01) * 250;

    return (baseValue + distanceFactor + timeFactor) % 1000 > 500;
  }

  drawCyberPositionMarkers(ctx, modules, moduleSize, seed) {
    const positions = [
      { row: 0, col: 0 },           // 左上
      { row: 0, col: modules - 7 },  // 右上
      { row: modules - 7, col: 0 }   // 左下
    ];

    positions.forEach(pos => {
      // 外层边框
      ctx.fillStyle = '#4169E1';
      ctx.fillRect(
        pos.col * moduleSize,
        pos.row * moduleSize,
        7 * moduleSize,
        7 * moduleSize
      );

      // 内层白色
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(
        pos.col * moduleSize + moduleSize,
        pos.row * moduleSize + moduleSize,
        5 * moduleSize,
        5 * moduleSize
      );

      // 中心图案
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(
        pos.col * moduleSize + 2 * moduleSize,
        pos.row * moduleSize + 2 * moduleSize,
        3 * moduleSize,
        3 * moduleSize
      );

      // 添加发光效果
      const glowGradient = ctx.createRadialGradient(
        pos.col * moduleSize + 3.5 * moduleSize,
        pos.row * moduleSize + 3.5 * moduleSize,
        0,
        pos.col * moduleSize + 3.5 * moduleSize,
        pos.row * moduleSize + 3.5 * moduleSize,
        4 * moduleSize
      );
      glowGradient.addColorStop(0, 'rgba(135, 206, 235, 0.5)');
      glowGradient.addColorStop(1, 'rgba(135, 206, 235, 0)');

      ctx.fillStyle = glowGradient;
      ctx.fillRect(
        pos.col * moduleSize,
        pos.row * moduleSize,
        7 * moduleSize,
        7 * moduleSize
      );
    });
  }

  drawCenterDecoration(ctx, size, seed) {
    const centerX = size / 2;
    const centerY = size / 2;
    const decorationSize = size / 8;

    // 绘制中心圆形装饰
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, decorationSize
    );
    gradient.addColorStop(0, 'rgba(65, 105, 225, 0.8)');
    gradient.addColorStop(0.5, 'rgba(135, 206, 235, 0.4)');
    gradient.addColorStop(1, 'rgba(135, 206, 235, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, decorationSize, 0, Math.PI * 2);
    ctx.fill();

    // 添加旋转的小点
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + seed * 0.001;
      const x = centerX + Math.cos(angle) * decorationSize * 1.5;
      const y = centerY + Math.sin(angle) * decorationSize * 1.5;

      ctx.fillStyle = `hsl(${120 + i * 30}, 100%, 60%)`;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  addCyberEffects(wrapper, canvas) {
    // 添加边框光效
    this.addGlowBorder(wrapper);

    // 添加粒子效果
    this.addQRParticles(wrapper);

    // 添加电路纹理
    this.addCircuitPattern(canvas);
  }

  
  addGlowBorder(wrapper) {
    const glowBorder = document.createElement('div');
    glowBorder.style.cssText = `
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      border: 1px solid transparent;
      border-radius: 12px;
      background: linear-gradient(45deg,
        transparent,
        rgba(0, 191, 255, 0.5),
        rgba(65, 105, 225, 0.5),
        transparent);
      animation: cyber-border-rotate 4s linear infinite;
      z-index: 5;
      pointer-events: none;
    `;

    wrapper.appendChild(glowBorder);
  }

  addQRParticles(wrapper) {
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'qr-particle';
      particle.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background: radial-gradient(circle, rgba(65, 105, 225, 0.8) 0%, transparent 70%);
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: qr-particle-float ${3 + Math.random() * 4}s ease-in-out infinite;
        animation-delay: ${Math.random() * 3}s;
        box-shadow: 0 0 6px rgba(65, 105, 225, 0.6);
        z-index: 3;
      `;
      wrapper.appendChild(particle);
    }
  }

  addCircuitPattern(canvas) {
    const ctx = canvas.getContext('2d');
    const size = canvas.width;

    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#4169E1';
    ctx.lineWidth = 1;

    // 绘制电路线条
    for (let i = 0; i < 5; i++) {
      const startX = Math.random() * size;
      const startY = Math.random() * size;
      const endX = Math.random() * size;
      const endY = Math.random() * size;

      ctx.beginPath();
      ctx.moveTo(startX, startY);

      // 创建L形路径
      const midX = startX + (endX - startX) * 0.7;
      ctx.lineTo(midX, startY);
      ctx.lineTo(midX, endY);
      ctx.lineTo(endX, endY);

      ctx.stroke();

      // 添加节点
      ctx.fillStyle = '#87CEEB';
      ctx.beginPath();
      ctx.arc(midX, startY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  animateQRCode() {
    const wrapper = this.querySelector('.cyber-qr-wrapper');
    if (!wrapper) return;

    // 初始状态
    wrapper.style.opacity = '0';
    wrapper.style.transform = 'scale(0.8) rotateX(45deg)';
    wrapper.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';

    // 启动动画
    setTimeout(() => {
      wrapper.style.opacity = '1';
      wrapper.style.transform = 'scale(1) rotateX(0deg)';
    }, 100);

    // 添加持续动画
    this.startContinuousAnimation();
  }

  startContinuousAnimation() {
    const canvas = this.querySelector('canvas');
    if (!canvas) return;

    // 呼吸效果
    setInterval(() => {
      const currentScale = canvas.style.transform.match(/scale\(([\d.]+)\)/);
      const scale = currentScale ? parseFloat(currentScale[1]) : 1;
      const newScale = scale === 1 ? 1.05 : 1;

      canvas.style.transform = `scale(${newScale})`;
      canvas.style.filter = `drop-shadow(0 0 ${newScale * 20}px rgba(0, 212, 255, 0.8))`;
    }, 2000);
  }

  // 工具函数
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  pseudoRandom(seed, min, max) {
    const x = Math.sin(seed) * 10000;
    return (x - Math.floor(x)) * (max - min) + min;
  }

  // 公共方法
  regenerate(identifier) {
    if (identifier) {
      this.identifier = identifier;
      this.setAttribute('data-identifier', identifier);
    }
    this.generateCyberQRCode();
  }
}

// 注册自定义元素
if ('customElements' in window) {
  customElements.define('qr-code-image', QRCodeImage);
}

// 确保初始化
window.initQRCodeImages = function() {
  const qrCodes = document.querySelectorAll('qr-code-image');
  qrCodes.forEach(qrCode => {
    if (!qrCode.initialized) {
      new QRCodeImage();
      qrCode.initialized = true;
    }
  });
};

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(window.initQRCodeImages, 100);
});

// 添加动画样式
const cyberQRStyles = document.createElement('style');
cyberQRStyles.textContent = `
  @keyframes cyber-scanner-move {
    0% {
      transform: translateY(-2px);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(100%);
      opacity: 0;
    }
  }

  @keyframes cyber-border-rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes qr-particle-float {
    0%, 100% {
      transform: translate(0, 0) scale(1);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    50% {
      transform: translate(calc(var(--random-x, 20px) - 10px), calc(var(--random-y, -30px) + 15px)) scale(1.5);
    }
    90% {
      opacity: 1;
    }
  }
`;
document.head.appendChild(cyberQRStyles);

// 向后兼容
window.initQRCodeImages = function() {
  const qrCodes = document.querySelectorAll('qr-code-image');
  qrCodes.forEach(qrCode => {
    if (!qrCode.initialized) {
      new QRCodeImage();
      qrCode.initialized = true;
    }
  });
};

// 初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initQRCodeImages);
} else {
  window.initQRCodeImages();
}