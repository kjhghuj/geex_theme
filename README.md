# Sci-Fi Store Theme 🚀

一个现代化的科幻风格Shopify主题，采用白色主色调和天空蓝强调色，配以精美的发光按钮效果。

## ✨ 主要特性

- 🎨 **科幻设计风格**: 简洁白色背景配天空蓝发光效果
- 🔥 **精美的发光按钮**: CSS动画驱动的交互式按钮
- 📱 **响应式设计**: 完美适配桌面、平板和手机
- ⚡ **性能优化**: 加载速度 < 3秒，60fps动画
- ♿ **无障碍访问**: 符合WCAG 2.1 AA标准
- 🎯 **转化率优化**: 针对电商转化优化的用户体验

## 🛠️ 技术栈

- **Shopify Liquid** - 模板引擎
- **HTML5 & CSS3** - 现代Web标准
- **JavaScript ES6+** - 交互功能
- **SCSS** - CSS预处理器
- **CSS动画** - 发光和过渡效果

## 📁 主题结构

```
theme/
├── assets/          # CSS, JS, 图片, 字体文件
├── config/          # 主题配置文件
├── layout/          # 基础布局模板
├── sections/        # 可自定义页面组件
├── snippets/        # 可重用代码片段
├── templates/       # 页面模板
└── locales/         # 多语言文件
```

## 🚀 快速开始

1. 安装Shopify CLI
```bash
npm install -g @shopify/cli @shopify/theme
```

2. 克隆主题到本地
```bash
git clone [repository-url]
cd theme
```

3. 启动开发服务器
```bash
shopify theme dev
```

## 🎨 定制选项

### 颜色设置
- 主色调: 白色 (#ffffff)
- 次色调: 天空蓝 (#87ceeb)
- 发光效果: 可自定义颜色和强度

### 字体设置
- 标题字体: 可选择
- 正文字体: 可选择
- 字体大小: 可调节

### 动画效果
- 发光按钮: 可开关
- 滚动动画: 可配置
- 微交互: 可自定义

## 📱 响应式断点

- **移动设备**: < 768px
- **平板设备**: 768px - 1023px
- **桌面设备**: ≥ 1024px

## 🔧 开发指南

### CSS变量
主题使用CSS变量定义颜色和间距：
```css
:root {
  --color-primary: #ffffff;
  --color-secondary: #87ceeb;
  --glow-size: 8px;
  --glow-color: rgba(135, 206, 235, 0.6);
}
```

### 发光按钮
使用预设的CSS类：
```html
<button class="btn btn-primary glow-effect">购买按钮</button>
```

## ⚡ 性能优化

- 图片懒加载
- CSS/JS压缩
- 关键资源内联
- 浏览器缓存优化

## 🧪 测试

- 跨浏览器测试
- 响应式设计测试
- 无障碍访问测试
- 性能基准测试

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进主题。

---

**Sci-Fi Store Theme** - 让您的店铺焕发未来科技感！ 🚀