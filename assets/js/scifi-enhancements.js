/**
 * 科幻主题增强功能模块
 * 包含动画效果、交互增强和性能优化
 */

class SciFiEnhancements {
  constructor() {
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isLoaded = false;

    this.init();
  }

  /**
   * 初始化所有增强功能
   */
  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initEnhancements());
    } else {
      this.initEnhancements();
    }
  }

  /**
   * 初始化增强功能
   */
  initEnhancements() {
    this.initParticleEffects();
    this.initMatrixRain();
    this.initGlitchEffect();
    this.initHoverEffects();
    this.initScrollAnimations();
    this.initLoadingAnimations();
    this.initSoundEffects();
    this.initPerformanceOptimizations();

    this.isLoaded = true;
    console.log('🚀 Sci-Fi Theme Enhancements loaded successfully');
  }

  /**
   * 粒子效果系统
   */
  initParticleEffects() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    particleContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      overflow: hidden;
    `;

    document.body.appendChild(particleContainer);

    // 创建粒子
    class Particle {
      constructor(container) {
        this.container = container;
        this.element = document.createElement('div');
        this.reset();
        container.appendChild(this.element);
      }

      reset() {
        const size = Math.random() * 3 + 1;
        this.x = Math.random() * window.innerWidth;
        this.y = window.innerHeight + 10;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = -Math.random() * 2 - 1;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.size = size;

        this.element.style.cssText = `
          position: absolute;
          left: ${this.x}px;
          top: ${this.y}px;
          width: ${this.size}px;
          height: ${this.size}px;
          background: rgba(135, 206, 235, ${this.opacity});
          border-radius: 50%;
          pointer-events: none;
          box-shadow: 0 0 ${this.size * 2}px rgba(135, 206, 235, ${this.opacity * 0.5});
        `;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= 0.003;

        if (this.opacity <= 0 || this.y < -10) {
          this.reset();
        }

        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        this.element.style.opacity = this.opacity;
      }
    }

    // 创建粒子数组
    const particles = [];
    const particleCount = Math.min(50, window.innerWidth / 20);

    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => {
        particles.push(new Particle(particleContainer));
      }, i * 100);
    }

    // 动画循环
    const animateParticles = () => {
      if (!this.isReducedMotion) {
        particles.forEach(particle => particle.update());
      }
      requestAnimationFrame(animateParticles);
    };

    animateParticles();
  }

  /**
   * 矩阵雨效果（用于特定区域）
   */
  initMatrixRain() {
    const matrixContainers = document.querySelectorAll('.matrix-rain');

    matrixContainers.forEach(container => {
      if (this.isReducedMotion) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        opacity: 0.1;
      `;

      container.style.position = 'relative';
      container.appendChild(canvas);

      const resizeCanvas = () => {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
      const matrixArray = matrix.split("");

      const fontSize = 10;
      const columns = canvas.width / fontSize;

      const drops = [];
      for (let x = 0; x < columns; x++) {
        drops[x] = 1;
      }

      const drawMatrix = () => {
        ctx.fillStyle = 'rgba(135, 206, 235, 0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#87ceeb';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
          const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);

          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      };

      setInterval(drawMatrix, 35);
    });
  }

  /**
   * 故障效果
   */
  initGlitchEffect() {
    const glitchElements = document.querySelectorAll('.glitch-text');

    glitchElements.forEach(element => {
      if (this.isReducedMotion) return;

      element.addEventListener('mouseenter', () => {
        element.style.animation = 'glitch 0.3s infinite';
      });

      element.addEventListener('mouseleave', () => {
        element.style.animation = '';
      });
    });

    // 添加故障动画CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes glitch {
        0%, 100% {
          text-shadow:
            0.05em 0 0 rgba(135, 206, 235, 0.75),
            -0.025em -0.05em 0 rgba(255, 255, 255, 0.5),
            0.025em 0.05em 0 rgba(74, 144, 226, 0.75);
        }
        25% {
          text-shadow:
            -0.05em -0.025em 0 rgba(135, 206, 235, 0.75),
            0.025em 0.025em 0 rgba(255, 255, 255, 0.5),
            -0.05em 0.05em 0 rgba(74, 144, 226, 0.75);
        }
        50% {
          text-shadow:
            0.025em 0.05em 0 rgba(135, 206, 235, 0.75),
            0.05em 0 0 rgba(255, 255, 255, 0.5),
            0 -0.05em 0 rgba(74, 144, 226, 0.75);
        }
        75% {
          text-shadow:
            -0.025em 0 0 rgba(135, 206, 235, 0.75),
            -0.025em -0.025em 0 rgba(255, 255, 255, 0.5),
            -0.025em 0.05em 0 rgba(74, 144, 226, 0.75);
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 悬停效果增强
   */
  initHoverEffects() {
    // 为按钮添加能量场效果
    const buttons = document.querySelectorAll('.glow-button, .btn-primary, .btn-secondary');

    buttons.forEach(button => {
      button.addEventListener('mouseenter', (e) => {
        const energyField = document.createElement('div');
        energyField.className = 'energy-field';
        energyField.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border: 2px solid rgba(135, 206, 235, 0.6);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          transition: all 0.4s ease-out;
          z-index: -1;
        `;

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(energyField);

        setTimeout(() => {
          energyField.style.width = '120%';
          energyField.style.height = '120%';
          energyField.style.opacity = '0';
        }, 10);

        setTimeout(() => {
          if (energyField.parentNode) {
            energyField.remove();
          }
        }, 400);
      });
    });

    // 为产品卡片添加3D倾斜效果
    const productCards = document.querySelectorAll('.product-card, .product-card-five');

    productCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        if (this.isReducedMotion) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /**
   * 滚动动画增强
   */
  initScrollAnimations() {
    if (this.isReducedMotion) return;

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

    // 观察需要动画的元素
    const animateElements = document.querySelectorAll(`
      .product-card,
      .category-card,
      .promo-banner,
      .policy-item,
      .section-title,
      .section-header
    `);

    animateElements.forEach(el => observer.observe(el));
  }

  /**
   * 加载动画
   */
  initLoadingAnimations() {
    // 页面加载完成动画
    window.addEventListener('load', () => {
      document.body.classList.add('loaded');

      // 逐个显示元素
      const elements = document.querySelectorAll('.animate-on-load');
      elements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('animate-in');
        }, index * 100);
      });
    });
  }

  /**
   * 音效系统
   */
  initSoundEffects() {
    // 创建音效管理器
    class SoundManager {
      constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.3;
        this.initSounds();
      }

      initSounds() {
        // 创建简单的音效
        this.sounds.click = this.createBeepSound(800, 0.1);
        this.sounds.hover = this.createBeepSound(600, 0.05);
        this.sounds.success = this.createBeepSound(1000, 0.2);
        this.sounds.error = this.createBeepSound(400, 0.2);
      }

      createBeepSound(frequency, duration) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        return () => {
          if (!this.enabled) return;

          oscillator.frequency.value = frequency;
          oscillator.type = 'sine';
          gainNode.gain.value = this.volume;

          oscillator.start();
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
          oscillator.stop(audioContext.currentTime + duration);
        };
      }

      play(soundName) {
        if (this.sounds[soundName]) {
          this.sounds[soundName]();
        }
      }
    }

    const soundManager = new SoundManager();

    // 为交互添加音效
    document.addEventListener('click', (e) => {
      if (e.target.closest('button, a, .glow-button')) {
        soundManager.play('click');
      }
    });

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('button, .glow-button, .product-card')) {
        soundManager.play('hover');
      }
    });
  }

  /**
   * 性能优化
   */
  initPerformanceOptimizations() {
    // 懒加载图片
    this.initLazyLoading();

    // 节流滚动事件
    this.throttleScroll();

    // 防抖调整大小事件
    this.debounceResize();
  }

  /**
   * 图片懒加载
   */
  initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  /**
   * 节流滚动事件
   */
  throttleScroll() {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // 滚动相关的更新逻辑
          this.updateScrollEffects();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /**
   * 防抖调整大小事件
   */
  debounceResize() {
    let resizeTimer;

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // 调整大小相关的逻辑
        this.updateLayout();
      }, 250);
    });
  }

  /**
   * 更新滚动效果
   */
  updateScrollEffects() {
    const scrollTop = window.pageYOffset;
    const header = document.querySelector('.main-header, .site-header');

    if (header) {
      if (scrollTop > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }

  /**
   * 更新布局
   */
  updateLayout() {
    // 响应式布局更新逻辑
    const isMobile = window.innerWidth < 768;
    document.body.classList.toggle('is-mobile', isMobile);
  }
}

// 初始化科幻增强功能
new SciFiEnhancements();

// 添加页面加载样式
const loadStyles = document.createElement('style');
loadStyles.textContent = `
  .particle-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    overflow: hidden;
  }

  .animate-on-load {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease-out;
  }

  .animate-on-load.animate-in {
    opacity: 1;
    transform: translateY(0);
  }

  .animate-in {
    animation: slideInUp 0.6s ease-out forwards;
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  body.loaded {
    overflow-x: hidden;
  }

  body.loaded .animate-on-load {
    opacity: 1;
    transform: translateY(0);
  }

  .energy-field {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: -1;
  }

  @media (prefers-reduced-motion: reduce) {
    .particle-container,
    .energy-field {
      display: none;
    }

    .animate-in {
      animation: none !important;
    }
  }
`;
document.head.appendChild(loadStyles);