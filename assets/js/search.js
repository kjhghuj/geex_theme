/**
 * 搜索功能模块
 * 处理搜索表单、建议、实时搜索等功能
 */

class Search {
  constructor() {
    this.searchInput = document.querySelector('[data-search-input]');
    this.searchForm = document.querySelector('[data-search-form]');
    this.clearButton = document.querySelector('[data-search-clear]');
    this.suggestions = document.querySelector('[data-search-suggestions]');
    this.suggestionsList = document.querySelector('[data-suggestions-list]');
    this.searchType = document.querySelector('[data-search-type]');
    this.sortSelect = document.querySelector('[data-sort-select]');
    this.perPageSelect = document.querySelector('[data-per-page-select]');

    this.suggestionsData = [];
    this.isSearching = false;
    this.searchTimeout = null;

    this.init();
  }

  /**
   * 初始化搜索功能
   */
  init() {
    this.bindEvents();
    this.loadPopularSearches();
    this.setupSearchSuggestions();
    this.initializeState();
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    // 搜索输入
    if (this.searchInput) {
      this.searchInput.addEventListener('input', this.debounce((e) => {
        this.onInputChange(e);
      }, 300));

      this.searchInput.addEventListener('focus', () => {
        this.onInputFocus();
      });

      this.searchInput.addEventListener('blur', () => {
        setTimeout(() => this.hideSuggestions(), 200);
      });

      this.searchInput.addEventListener('keydown', (e) => {
        this.onKeyDown(e);
      });
    }

    // 搜索表单提交
    if (this.searchForm) {
      this.searchForm.addEventListener('submit', (e) => {
        this.onFormSubmit(e);
      });
    }

    // 清除按钮
    if (this.clearButton) {
      this.clearButton.addEventListener('click', () => {
        this.clearSearch();
      });
    }

    // 排序选择
    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', () => {
        this.onSortChange();
      });
    }

    // 每页显示数量
    if (this.perPageSelect) {
      this.perPageSelect.addEventListener('change', () => {
        this.onPerPageChange();
      });
    }

    // 搜索类型选择
    if (this.searchType) {
      this.searchType.addEventListener('change', () => {
        this.onTypeChange();
      });
    }

    // 点击外部关闭建议
    document.addEventListener('click', (e) => {
      if (!this.searchForm?.contains(e.target)) {
        this.hideSuggestions();
      }
    });
  }

  /**
   * 输入变化处理
   */
  onInputChange(e) {
    const value = e.target.value.trim();

    // 更新清除按钮显示
    this.toggleClearButton(value);

    if (value.length >= 2) {
      this.fetchSuggestions(value);
    } else {
      this.hideSuggestions();
    }
  }

  /**
   * 输入框焦点处理
   */
  onInputFocus() {
    const value = this.searchInput.value.trim();
    if (value.length >= 2 && this.suggestionsData.length > 0) {
      this.showSuggestions();
    }
  }

  /**
   * 键盘事件处理
   */
  onKeyDown(e) {
    const suggestions = this.suggestionsList?.querySelectorAll('.suggestion-item');
    if (!suggestions || suggestions.length === 0) return;

    const currentIndex = this.getCurrentSuggestionIndex(suggestions);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectNextSuggestion(suggestions, currentIndex);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.selectPreviousSuggestion(suggestions, currentIndex);
        break;
      case 'Enter':
        const activeSuggestion = suggestions[currentIndex];
        if (activeSuggestion) {
          e.preventDefault();
          this.applySuggestion(activeSuggestion);
        }
        break;
      case 'Escape':
        this.hideSuggestions();
        this.searchInput.blur();
        break;
    }
  }

  /**
   * 表单提交处理
   */
  onFormSubmit(e) {
    const searchTerm = this.searchInput.value.trim();
    if (!searchTerm) {
      e.preventDefault();
      this.searchInput.focus();
      return;
    }

    // 添加搜索分析
    this.trackSearch(searchTerm);

    // 保存搜索历史
    this.saveSearchHistory(searchTerm);
  }

  /**
   * 清除搜索
   */
  clearSearch() {
    this.searchInput.value = '';
    this.toggleClearButton(false);
    this.hideSuggestions();
    this.searchInput.focus();

    // 触发清除事件
    const event = new CustomEvent('searchCleared', {
      detail: { searchInstance: this }
    });
    document.dispatchEvent(event);
  }

  /**
   * 排序变化处理
   */
  onSortChange() {
    const url = new URL(window.location.href);
    url.searchParams.set('sort_by', this.sortSelect.value);
    window.location.href = url.toString();
  }

  /**
   * 每页显示数量变化处理
   */
  onPerPageChange() {
    const url = new URL(window.location.href);
    url.searchParams.set('per_page', this.perPageSelect.value);
    url.searchParams.delete('page'); // 重置到第一页
    window.location.href = url.toString();
  }

  /**
   * 搜索类型变化处理
   */
  onTypeChange() {
    const url = new URL(window.location.href);
    if (this.searchType.value) {
      url.searchParams.set('type', this.searchType.value);
    } else {
      url.searchParams.delete('type');
    }
    window.location.href = url.toString();
  }

  /**
   * 获取搜索建议
   */
  async fetchSuggestions(query) {
    if (this.isSearching) return;

    this.isSearching = true;

    try {
      // 先从本地缓存获取
      const cached = this.getCachedSuggestions(query);
      if (cached) {
        this.displaySuggestions(cached);
        this.isSearching = false;
        return;
      }

      // 使用Shopify的搜索API获取建议
      const searchTypes = this.searchType?.value || '';
      const searchUrl = `/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=${searchTypes}&resources[limit]=10`;

      const response = await fetch(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        throw new Error('搜索建议获取失败');
      }

      const data = await response.json();
      const suggestions = this.processSuggestionsData(data);

      // 缓存建议数据
      this.cacheSuggestions(query, suggestions);

      this.displaySuggestions(suggestions);

    } catch (error) {
      console.error('Error fetching search suggestions:', error);

      // 如果API失败，尝试从搜索历史获取建议
      const historySuggestions = this.getHistorySuggestions(query);
      if (historySuggestions.length > 0) {
        this.displaySuggestions(historySuggestions);
      }

    } finally {
      this.isSearching = false;
    }
  }

  /**
   * 处理建议数据
   */
  processSuggestionsData(data) {
    const suggestions = [];

    // 处理产品建议
    if (data.resources?.results?.products) {
      data.resources.results.products.forEach(product => {
        suggestions.push({
          type: 'product',
          title: product.title,
          url: product.url,
          image: product.featured_image?.url,
          price: product.price,
          category: product.product_type
        });
      });
    }

    // 处理文章建议
    if (data.resources?.results?.articles) {
      data.resources.results.articles.forEach(article => {
        suggestions.push({
          type: 'article',
          title: article.title,
          url: article.url,
          image: article.image?.url,
          summary: article.summary,
          published_at: article.published_at
        });
      });
    }

    // 处理页面建议
    if (data.resources?.results?.pages) {
      data.resources.results.pages.forEach(page => {
        suggestions.push({
          type: 'page',
          title: page.title,
          url: page.url,
          summary: page.body_html?.replace(/<[^>]*>/g, '').substring(0, 100)
        });
      });
    }

    // 处理收藏建议
    if (data.resources?.results?.collections) {
      data.resources.results.collections.forEach(collection => {
        suggestions.push({
          type: 'collection',
          title: collection.title,
          url: collection.url,
          image: collection.featured_image?.url,
          product_count: collection.products_count
        });
      });
    }

    return suggestions.slice(0, 8); // 限制建议数量
  }

  /**
   * 显示搜索建议
   */
  displaySuggestions(suggestions) {
    if (!this.suggestions || !this.suggestionsList) return;

    this.suggestionsData = suggestions;

    if (suggestions.length === 0) {
      this.hideSuggestions();
      return;
    }

    const suggestionsHtml = suggestions.map((suggestion, index) => `
      <li class="suggestion-item" data-index="${index}" data-suggestion='${JSON.stringify(suggestion)}'>
        <a href="${suggestion.url}" class="suggestion-link">
          ${suggestion.image ? `
            <div class="suggestion-image">
              <img src="${suggestion.image}" alt="${suggestion.title}" loading="lazy">
            </div>
          ` : ''}
          <div class="suggestion-content">
            <div class="suggestion-title">${this.highlightMatch(suggestion.title)}</div>
            ${suggestion.category ? `<div class="suggestion-category">${suggestion.category}</div>` : ''}
            ${suggestion.price ? `<div class="suggestion-price">${this.formatMoney(suggestion.price)}</div>` : ''}
            ${suggestion.product_count ? `<div class="suggestion-count">${suggestion.product_count} 件产品</div>` : ''}
            ${suggestion.summary ? `<div class="suggestion-summary">${suggestion.summary.substring(0, 80)}...</div>` : ''}
            <div class="suggestion-type">${this.getTypeLabel(suggestion.type)}</div>
          </div>
        </a>
      </li>
    `).join('');

    this.suggestionsList.innerHTML = suggestionsHtml;
    this.showSuggestions();

    // 绑定建议点击事件
    this.bindSuggestionEvents();
  }

  /**
   * 绑定建议事件
   */
  bindSuggestionEvents() {
    const suggestionItems = this.suggestionsList.querySelectorAll('.suggestion-item');
    suggestionItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.applySuggestion(item);
      });
    });
  }

  /**
   * 应用建议
   */
  applySuggestion(item) {
    const suggestion = JSON.parse(item.dataset.suggestion);
    this.searchInput.value = suggestion.title;
    this.hideSuggestions();

    // 追踪建议点击
    this.trackSuggestionClick(suggestion);

    // 跳转到建议页面
    window.location.href = suggestion.url;
  }

  /**
   * 显示建议
   */
  showSuggestions() {
    if (!this.suggestions) return;
    this.suggestions.style.display = 'block';
    this.suggestions.setAttribute('aria-hidden', 'false');
  }

  /**
   * 隐藏建议
   */
  hideSuggestions() {
    if (!this.suggestions) return;
    this.suggestions.style.display = 'none';
    this.suggestions.setAttribute('aria-hidden', 'true');
  }

  /**
   * 获取当前建议索引
   */
  getCurrentSuggestionIndex(suggestions) {
    for (let i = 0; i < suggestions.length; i++) {
      if (suggestions[i].classList.contains('selected')) {
        return i;
      }
    }
    return -1;
  }

  /**
   * 选择下一个建议
   */
  selectNextSuggestion(suggestions, currentIndex) {
    let nextIndex = currentIndex + 1;
    if (nextIndex >= suggestions.length) {
      nextIndex = 0;
    }

    this.selectSuggestion(suggestions, currentIndex, nextIndex);
  }

  /**
   * 选择上一个建议
   */
  selectPreviousSuggestion(suggestions, currentIndex) {
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = suggestions.length - 1;
    }

    this.selectSuggestion(suggestions, currentIndex, prevIndex);
  }

  /**
   * 选择建议
   */
  selectSuggestion(suggestions, currentIndex, newIndex) {
    if (currentIndex >= 0) {
      suggestions[currentIndex].classList.remove('selected');
    }
    suggestions[newIndex].classList.add('selected');
    suggestions[newIndex].scrollIntoView({ block: 'nearest' });
  }

  /**
   * 高亮匹配文本
   */
  highlightMatch(text) {
    const query = this.searchInput.value.trim();
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * 获取类型标签
   */
  getTypeLabel(type) {
    const labels = {
      product: '产品',
      article: '文章',
      page: '页面',
      collection: '收藏'
    };
    return labels[type] || type;
  }

  /**
   * 切换清除按钮显示
   */
  toggleClearButton(show) {
    if (!this.clearButton) return;

    if (show && this.searchInput.value.trim()) {
      this.clearButton.classList.add('visible');
    } else {
      this.clearButton.classList.remove('visible');
    }
  }

  /**
   * 初始化状态
   */
  initializeState() {
    // 恢复搜索类型
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    if (type && this.searchType) {
      this.searchType.value = type;
    }

    // 恢复排序
    const sortBy = urlParams.get('sort_by');
    if (sortBy && this.sortSelect) {
      this.sortSelect.value = sortBy;
    }

    // 恢复每页显示数量
    const perPage = urlParams.get('per_page');
    if (perPage && this.perPageSelect) {
      this.perPageSelect.value = perPage;
    }

    // 初始化清除按钮状态
    this.toggleClearButton(this.searchInput?.value.trim());
  }

  /**
   * 加载热门搜索
   */
  async loadPopularSearches() {
    try {
      // 这里可以从Shopify metafields或自定义API获取热门搜索
      const popularSearches = this.getPopularSearches();

      // 在搜索建议底部显示热门搜索
      if (this.suggestionsList && popularSearches.length > 0) {
        const popularHtml = `
          <li class="suggestion-separator"></li>
          <li class="suggestion-header">
            <div class="suggestion-title">热门搜索</div>
          </li>
          ${popularSearches.map(term => `
            <li class="suggestion-item suggestion-popular" data-term="${term}">
              <a href="/search?q=${encodeURIComponent(term)}" class="suggestion-link">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="suggestion-icon">
                  <path d="M14 2v4a1 1 0 01-1 1H9a1 1 0 110-2h2V3a1 1 0 011-1z"/>
                </svg>
                <div class="suggestion-content">
                  <div class="suggestion-title">${term}</div>
                </div>
              </a>
            </li>
          `).join('')}
        `;
        this.suggestionsList.insertAdjacentHTML('beforeend', popularHtml);
      }
    } catch (error) {
      console.error('Error loading popular searches:', error);
    }
  }

  /**
   * 获取热门搜索词
   */
  getPopularSearches() {
    // 这里可以从多种来源获取热门搜索：
    // 1. Shopify metafields
    // 2. Google Analytics热门搜索
    // 3. 本地存储的搜索频率
    // 4. 静态配置

    const staticPopular = ['手机', '耳机', '充电器', '平板电脑', '智能手表', '蓝牙音箱', '笔记本电脑', '游戏机'];

    // 尝试从本地存储获取热门搜索
    const stored = localStorage.getItem('popularSearches');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing popular searches:', e);
      }
    }

    return staticPopular;
  }

  /**
   * 缓存建议
   */
  cacheSuggestions(query, suggestions) {
    const cache = this.getSuggestionsCache();
    cache[query] = {
      suggestions,
      timestamp: Date.now()
    };
    localStorage.setItem('searchSuggestionsCache', JSON.stringify(cache));
  }

  /**
   * 获取缓存的建议
   */
  getCachedSuggestions(query) {
    const cache = this.getSuggestionsCache();
    const cached = cache[query];

    if (!cached) return null;

    // 检查缓存是否过期（5分钟）
    const now = Date.now();
    const cacheAge = now - cached.timestamp;
    if (cacheAge > 5 * 60 * 1000) {
      delete cache[query];
      localStorage.setItem('searchSuggestionsCache', JSON.stringify(cache));
      return null;
    }

    return cached.suggestions;
  }

  /**
   * 获取建议缓存
   */
  getSuggestionsCache() {
    try {
      const cached = localStorage.getItem('searchSuggestionsCache');
      return cached ? JSON.parse(cached) : {};
    } catch (e) {
      console.error('Error getting suggestions cache:', e);
      return {};
    }
  }

  /**
   * 保存搜索历史
   */
  saveSearchHistory(searchTerm) {
    const history = this.getSearchHistory();
    const timestamp = Date.now();

    // 移除重复项
    const filteredHistory = history.filter(item => item.term !== searchTerm);

    // 添加到开头
    filteredHistory.unshift({
      term: searchTerm,
      timestamp: timestamp
    });

    // 限制历史记录数量
    const limitedHistory = filteredHistory.slice(0, 20);

    localStorage.setItem('searchHistory', JSON.stringify(limitedHistory));
  }

  /**
   * 获取搜索历史
   */
  getSearchHistory() {
    try {
      const history = localStorage.getItem('searchHistory');
      return history ? JSON.parse(history) : [];
    } catch (e) {
      console.error('Error getting search history:', e);
      return [];
    }
  }

  /**
   * 获取历史建议
   */
  getHistorySuggestions(query) {
    const history = this.getSearchHistory();
    return history
      .filter(item => item.term.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map(item => ({
        type: 'history',
        title: item.term,
        url: `/search?q=${encodeURIComponent(item.term)}`
      }));
  }

  /**
   * 设置搜索建议功能
   */
  setupSearchSuggestions() {
    // 添加键盘导航支持
    this.searchInput?.setAttribute('autocomplete', 'off');
    this.searchInput?.setAttribute('aria-autocomplete', 'list');
    this.searchInput?.setAttribute('aria-controls', 'search-suggestions');
  }

  /**
   * 追踪搜索事件
   */
  trackSearch(searchTerm) {
    // Google Analytics
    if (typeof gtag === 'function') {
      gtag('event', 'search', {
        search_term: searchTerm
      });
    }

    // Facebook Pixel
    if (typeof fbq === 'function') {
      fbq('track', 'Search', {
        search_string: searchTerm
      });
    }

    // 其他分析平台...
  }

  /**
   * 追踪建议点击
   */
  trackSuggestionClick(suggestion) {
    if (typeof gtag === 'function') {
      gtag('event', 'search_suggestion_click', {
        suggestion_type: suggestion.type,
        suggestion_title: suggestion.title
      });
    }
  }

  /**
   * 格式化价格
   */
  formatMoney(cents) {
    return (cents / 100).toFixed(2);
  }

  /**
   * 防抖函数
   */
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
  }

  /**
   * 销毁搜索实例
   */
  destroy() {
    // 清理事件监听器
    if (this.searchInput) {
      this.searchInput.removeEventListener('input', this.onInputChange);
      this.searchInput.removeEventListener('focus', this.onInputFocus);
      this.searchInput.removeEventListener('keydown', this.onKeyDown);
    }

    if (this.searchForm) {
      this.searchForm.removeEventListener('submit', this.onFormSubmit);
    }

    if (this.clearButton) {
      this.clearButton.removeEventListener('click', this.clearSearch);
    }

    if (this.sortSelect) {
      this.sortSelect.removeEventListener('change', this.onSortChange);
    }

    if (this.perPageSelect) {
      this.perPageSelect.removeEventListener('change', this.onPerPageChange);
    }

    if (this.searchType) {
      this.searchType.removeEventListener('change', this.onTypeChange);
    }

    // 清理定时器
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}

// 初始化搜索功能
document.addEventListener('DOMContentLoaded', () => {
  window.search = new Search();
});

// 导出到全局作用域
window.Search = Search;