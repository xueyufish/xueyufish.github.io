/**
 * 文章目录自动生成功能
 * 功能：提取 h2/h3 标题生成目录、滚动高亮当前章节、移动端展开/收起
 * 对应 Markdown：##(h2)、###(h3)
 */

(function() {
  'use strict';

  const CONFIG = {
    tocContainerId: 'toc-container',
    tocListId: 'toc-list',
    tocToggleId: 'toc-toggle',
    tocCloseId: 'toc-close',
    tocButtonId: 'toc-button',
    tocOverlayId: 'toc-overlay',
    tocClass: 'article-toc',
    activeClass: 'active',
    titleMinLevel: 1,
    titleMaxLevel: 3,
    scrollOffset: 100,
    throttleDelay: 100
  };

  let headings = [];
  let tocLinks = [];
  let isMobile = false;
  let tocVisible = false;

  /**
   * 初始化目录功能
   */
  function initTOC() {
    const postContainer = document.querySelector('.post-container');

    if (!postContainer) {
      console.log('TOC: Post container not found, TOC disabled');
      return;
    }

    // 检测移动端
    checkMobile();
    window.addEventListener('resize', debounce(checkMobile, 250));

    // 提取标题
    headings = extractHeadings(postContainer);

    if (headings.length === 0) {
      console.log('TOC: No headings found, TOC disabled');
      return;
    }

    // 生成目录
    generateTOC();

    // 添加锚点到标题
    addAnchorsToHeadings();

    // 恢复目录状态
    restoreTOCState();

    // 绑定事件
    bindEvents();

    // 初始化滚动监听
    initScrollSpy();

    console.log(`TOC: Successfully initialized with ${headings.length} headings`);
  }

  /**
   * 检测是否为移动端
   */
  function checkMobile() {
    isMobile = window.innerWidth <= 991;
  }

  /**
   * 提取文章标题
   */
  function extractHeadings(container) {
    const selectors = [];
    for (let i = CONFIG.titleMinLevel; i <= CONFIG.titleMaxLevel; i++) {
      selectors.push(`h${i}`);
    }

    const headingElements = container.querySelectorAll(selectors.join(','));
    const result = [];

    headingElements.forEach((heading) => {
      if (heading.classList.contains('post-title')) {
        return;
      }

      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent.trim();

      if (text) {
        result.push({
          element: heading,
          level: level,
          text: text,
          id: `heading-${result.length}`
        });
      }
    });

    return result;
  }

  /**
   * 生成目录 HTML
   */
  function generateTOC() {
    const tocContainer = document.getElementById(CONFIG.tocContainerId);
    if (!tocContainer) {
      console.error('TOC: Container not found');
      return;
    }

    // 创建关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toc-close-btn';
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', '关闭目录');
    closeBtn.addEventListener('click', closeTOC);
    tocContainer.appendChild(closeBtn);

    const tocList = document.createElement('ul');
    tocList.id = CONFIG.tocListId;
    tocList.className = 'toc-list';

    let currentH2Item = null;
    let currentSubList = null;

    headings.forEach((heading, index) => {
      const li = createTOCItem(heading, index);
      const link = li.querySelector('a');
      if (link) {
        tocLinks.push(link);
      }

      if (heading.level === 1) {
        li.classList.add('toc-level-top');
        tocList.appendChild(li);
        currentH2Item = null;
        currentSubList = null;
      } else if (heading.level === 2) {
        // h2 直接添加到主列表
        tocList.appendChild(li);
        currentH2Item = li;
        currentSubList = null;
      } else if (heading.level === 3) {
        // h3 添加到上一个 h2 的子列表
        if (currentH2Item && !currentSubList) {
          // 创建子列表并添加到当前 h2 项
          currentSubList = document.createElement('ul');
          currentSubList.className = 'toc-sub-list';
          currentH2Item.appendChild(currentSubList);
        }

        if (currentSubList) {
          currentSubList.appendChild(li);
        } else {
          // 如果没有 h2 作为父级，直接添加到主列表（降级处理）
          console.warn('TOC: h3 found without parent h2, adding to main list');
          tocList.appendChild(li);
        }
      }
    });

    tocContainer.appendChild(tocList);

    // 创建重新打开按钮
    createToggleButton();
  }

  /**
   * 创建重新打开按钮
   */
  function createToggleButton() {
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'toc-toggle-btn';
    toggleBtn.className = 'toc-toggle-btn';
    toggleBtn.innerHTML = '📋';
    toggleBtn.setAttribute('aria-label', '显示目录');
    toggleBtn.addEventListener('click', openTOC);
    document.body.appendChild(toggleBtn);
  }

  /**
   * 创建目录项
   */
  function createTOCItem(heading, index) {
    const li = document.createElement('li');
    li.className = `toc-item toc-level-${heading.level}`;
    li.setAttribute('data-level', heading.level);

    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.text;
    link.className = 'toc-link';
    link.setAttribute('data-index', index);

    li.appendChild(link);
    return li;
  }

  /**
   * 为标题添加锚点
   */
  function addAnchorsToHeadings() {
    headings.forEach(heading => {
      heading.element.id = heading.id;

      // 添加跳转链接图标（可选）
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.className = 'heading-anchor';
      link.innerHTML = '<i class="fa fa-link"></i>';
      link.setAttribute('aria-label', '段落链接');

      heading.element.appendChild(link);
    });
  }

  /**
   * 绑定事件
   */
  function bindEvents() {
    // 目录链接点击
    tocLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const index = parseInt(this.getAttribute('data-index'));
        const heading = headings[index];
        scrollToHeading(heading);

        // 移动端点击后关闭目录
        if (isMobile) {
          closeTOCMobile();
        }
      });
    });

    // 移动端切换按钮
    const tocButton = document.getElementById(CONFIG.tocButtonId);
    if (tocButton) {
      tocButton.addEventListener('click', toggleTOCMobile);
    }

    // 移动端关闭按钮
    const tocClose = document.getElementById(CONFIG.tocCloseId);
    if (tocClose) {
      tocClose.addEventListener('click', closeTOCMobile);
    }

    // 移动端遮罩层
    const tocOverlay = document.getElementById(CONFIG.tocOverlayId);
    if (tocOverlay) {
      tocOverlay.addEventListener('click', closeTOCMobile);
    }

    // ESC 键关闭移动端目录
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isMobile && tocVisible) {
        closeTOCMobile();
      }
    });
  }

  /**
   * 滚动到指定标题
   */
  function scrollToHeading(heading) {
    const element = heading.element;
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - CONFIG.scrollOffset;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    // 更新高亮状态
    updateActiveHeading(heading);
  }

  /**
   * 初始化滚动监听
   */
  function initScrollSpy() {
    let ticking = false;

    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          updateActiveOnScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /**
   * 滚动时更新高亮
   */
  function updateActiveOnScroll() {
    const scrollTop = window.pageYOffset;
    let activeHeading = null;

    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      const element = heading.element;
      const elementTop = element.getBoundingClientRect().top + scrollTop;

      if (scrollTop >= elementTop - CONFIG.scrollOffset - 50) {
        activeHeading = heading;
      } else {
        break;
      }
    }

    if (activeHeading) {
      updateActiveHeading(activeHeading);
    } else {
      clearActiveHeading();
    }
  }

  /**
   * 更新高亮标题
   */
  function updateActiveHeading(heading) {
    // 清除所有高亮
    tocLinks.forEach(link => {
      link.classList.remove(CONFIG.activeClass);
    });

    headings.forEach(h => {
      h.element.classList.remove(CONFIG.activeClass);
    });

    // 添加高亮
    const index = headings.indexOf(heading);
    if (index !== -1 && tocLinks[index]) {
      tocLinks[index].classList.add(CONFIG.activeClass);
      heading.element.classList.add(CONFIG.activeClass);
    }
  }

  /**
   * 清除所有高亮
   */
  function clearActiveHeading() {
    tocLinks.forEach(link => {
      link.classList.remove(CONFIG.activeClass);
    });

    headings.forEach(h => {
      h.element.classList.remove(CONFIG.activeClass);
    });
  }

  /**
   * 切换移动端目录
   */
  function toggleTOCMobile() {
    if (tocVisible) {
      closeTOCMobile();
    } else {
      openTOCMobile();
    }
  }

  /**
   * 打开移动端目录
   */
  function openTOCMobile() {
    const tocContainer = document.getElementById(CONFIG.tocContainerId);
    const tocOverlay = document.getElementById(CONFIG.tocOverlayId);

    if (tocContainer) {
      tocContainer.classList.add('toc-open');
    }
    if (tocOverlay) {
      tocOverlay.classList.add('toc-overlay-visible');
    }

    tocVisible = true;
    document.body.style.overflow = 'hidden';
  }

  /**
   * 关闭移动端目录
   */
  function closeTOCMobile() {
    const tocContainer = document.getElementById(CONFIG.tocContainerId);
    const tocOverlay = document.getElementById(CONFIG.tocOverlayId);

    if (tocContainer) {
      tocContainer.classList.remove('toc-open');
    }
    if (tocOverlay) {
      tocOverlay.classList.remove('toc-overlay-visible');
    }

    tocVisible = false;
    document.body.style.overflow = '';
  }

  /**
   * 关闭桌面端目录
   */
  function closeTOC() {
    const tocContainer = document.getElementById(CONFIG.tocContainerId);
    const toggleBtn = document.getElementById('toc-toggle-btn');

    if (tocContainer) {
      tocContainer.classList.add('toc-hidden');
    }
    if (toggleBtn) {
      toggleBtn.classList.add('visible');
    }

    // 保存状态到 localStorage
    try {
      localStorage.setItem('toc-hidden', 'true');
    } catch (e) {
      // 忽略 localStorage 错误
    }
  }

  /**
   * 打开桌面端目录
   */
  function openTOC() {
    const tocContainer = document.getElementById(CONFIG.tocContainerId);
    const toggleBtn = document.getElementById('toc-toggle-btn');

    if (tocContainer) {
      tocContainer.classList.remove('toc-hidden');
    }
    if (toggleBtn) {
      toggleBtn.classList.remove('visible');
    }

    // 保存状态到 localStorage
    try {
      localStorage.setItem('toc-hidden', 'false');
    } catch (e) {
      // 忽略 localStorage 错误
    }
  }

  /**
   * 恢复目录状态
   */
  function restoreTOCState() {
    // 只在桌面端恢复状态
    if (isMobile) {
      return;
    }

    try {
      const tocHidden = localStorage.getItem('toc-hidden');
      if (tocHidden === 'true') {
        closeTOC();
      }
    } catch (e) {
      // 忽略 localStorage 错误
    }
  }

  /**
   * 防抖函数
   */
  function debounce(func, wait) {
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

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTOC);
  } else {
    initTOC();
  }

})();
