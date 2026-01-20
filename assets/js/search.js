/**
 * 本地搜索功能
 * 支持标题、内容、标签模糊搜索
 */

(function() {
  'use strict';

  const CONFIG = {
    searchIndexPath: '/search/index.json',
    inputId: 'search-input',
    resultsId: 'search-results',
    loadingId: 'search-loading',
    buttonId: 'search-button',
    debounceDelay: 300,
    maxResults: 10,
    minQueryLength: 1
  };

  let searchData = [];
  let searchIndexLoaded = false;
  let debounceTimer = null;

  /**
   * 初始化搜索功能
   */
  function initSearch() {
    const searchInput = document.getElementById(CONFIG.inputId);
    const searchButton = document.getElementById(CONFIG.buttonId);

    if (!searchInput) {
      console.warn('Search input not found');
      return;
    }

    // 加载搜索索引
    loadSearchIndex();

    // 监听输入事件
    searchInput.addEventListener('input', function(e) {
      handleInput(e.target.value);
    });

    // 监听按钮点击
    if (searchButton) {
      searchButton.addEventListener('click', function() {
        performSearch(searchInput.value);
      });
    }

    // 监听回车键
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch(searchInput.value);
      }
      if (e.key === 'Escape') {
        clearResults();
        searchInput.blur();
      }
    });

    // 点击外部关闭结果
    document.addEventListener('click', function(e) {
      const searchContainer = document.querySelector('.search-container');
      if (searchContainer && !searchContainer.contains(e.target)) {
        clearResults();
      }
    });
  }

  /**
   * 加载搜索索引文件
   */
  function loadSearchIndex() {
    showLoading(true);

    fetch(CONFIG.searchIndexPath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        searchData = data;
        searchIndexLoaded = true;
        showLoading(false);
        console.log(`Search index loaded: ${searchData.length} posts`);
      })
      .catch(error => {
        console.error('Failed to load search index:', error);
        showLoading(false);
        showError('搜索功能暂时不可用');
      });
  }

  /**
   * 处理输入事件（防抖）
   */
  function handleInput(query) {
    clearTimeout(debounceTimer);

    if (query.length < CONFIG.minQueryLength) {
      clearResults();
      return;
    }

    debounceTimer = setTimeout(() => {
      performSearch(query);
    }, CONFIG.debounceDelay);
  }

  /**
   * 执行搜索
   */
  function performSearch(query) {
    if (!searchIndexLoaded || !query || query.trim().length < CONFIG.minQueryLength) {
      clearResults();
      return;
    }

    const trimmedQuery = query.trim().toLowerCase();
    const results = searchPosts(trimmedQuery);
    displayResults(results, trimmedQuery);
  }

  /**
   * 搜索文章
   * 支持标题、内容、标签模糊匹配
   */
  function searchPosts(query) {
    const results = [];

    searchData.forEach(post => {
      const title = (post.title || '').toLowerCase();
      const content = (post.content || '').toLowerCase();
      const excerpt = (post.excerpt || '').toLowerCase();
      const tags = (post.tags || []).map(t => t.toLowerCase()).join(' ');
      const categories = (post.categories || []).map(c => c.toLowerCase()).join(' ');

      // 计算相关性得分
      let score = 0;

      // 标题匹配（权重最高）
      if (title.includes(query)) {
        score += 100;
        // 完全匹配额外加分
        if (title === query) score += 50;
      }

      // 标签匹配（权重高）
      if (tags.includes(query)) {
        score += 50;
      }

      // 分类匹配
      if (categories.includes(query)) {
        score += 30;
      }

      // 摘要匹配
      if (excerpt.includes(query)) {
        score += 20;
      }

      // 内容匹配
      if (content.includes(query)) {
        score += 10;
      }

      // 计算匹配次数
      const titleCount = (title.match(new RegExp(query, 'g')) || []).length;
      const contentCount = (content.match(new RegExp(query, 'g')) || []).length;

      score += titleCount * 5 + contentCount;

      if (score > 0) {
        results.push({
          ...post,
          score: score
        });
      }
    });

    // 按相关性得分排序
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, CONFIG.maxResults);
  }

  /**
   * 显示搜索结果
   */
  function displayResults(results, query) {
    const resultsContainer = document.getElementById(CONFIG.resultsId);

    if (!resultsContainer) {
      return;
    }

    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="search-no-results">
          未找到与 "<strong>${escapeHtml(query)}</strong>" 相关的文章
        </div>
      `;
      resultsContainer.style.display = 'block';
      return;
    }

    const html = results.map((post, index) => {
      const highlightedTitle = highlightText(post.title, query);
      const highlightedExcerpt = highlightText(post.excerpt || post.content.substring(0, 200) + '...', query);

      return `
        <div class="search-result-item" data-index="${index}">
          <a href="${post.url}" class="search-result-link">
            <div class="search-result-title">${highlightedTitle}</div>
            <div class="search-result-excerpt">${highlightedExcerpt}</div>
            <div class="search-result-meta">
              ${post.date ? `<span class="search-result-date">${formatDate(post.date)}</span>` : ''}
              ${post.tags && post.tags.length > 0 ? `
                <span class="search-result-tags">
                  ${post.tags.map(tag => `<span class="search-result-tag">${escapeHtml(tag)}</span>`).join('')}
                </span>
              ` : ''}
            </div>
          </a>
        </div>
      `;
    }).join('');

    resultsContainer.innerHTML = html;
    resultsContainer.style.display = 'block';
  }

  /**
   * 高亮匹配文本
   */
  function highlightText(text, query) {
    if (!text) return '';

    const escapedText = escapeHtml(text);
    const escapedQuery = escapeRegex(query);

    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return escapedText.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  /**
   * 清空搜索结果
   */
  function clearResults() {
    const resultsContainer = document.getElementById(CONFIG.resultsId);
    if (resultsContainer) {
      resultsContainer.innerHTML = '';
      resultsContainer.style.display = 'none';
    }
  }

  /**
   * 显示/隐藏加载状态
   */
  function showLoading(show) {
    const loadingEl = document.getElementById(CONFIG.loadingId);
    if (loadingEl) {
      loadingEl.style.display = show ? 'block' : 'none';
    }
  }

  /**
   * 显示错误信息
   */
  function showError(message) {
    const resultsContainer = document.getElementById(CONFIG.resultsId);
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="search-error">
          ${escapeHtml(message)}
        </div>
      `;
      resultsContainer.style.display = 'block';
    }
  }

  /**
   * 格式化日期
   */
  function formatDate(dateStr) {
    try {
      const date = new Date(dateStr);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('zh-CN', options);
    } catch (e) {
      return dateStr;
    }
  }

  /**
   * HTML 转义
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 正则表达式转义
   */
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }

})();
