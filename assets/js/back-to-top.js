/**
 * 回到顶部按钮功能
 * 功能：
 * 1. 滚动超过 300px 后显示按钮
 * 2. 点击按钮平滑滚动到顶部
 * 3. 响应式优化
 */

(function() {
  'use strict';

  // 配置
  const CONFIG = {
    buttonId: 'back-to-top',
    showOffset: 300, // 滚动多少像素后显示
    scrollDuration: 600 // 滚动动画持续时间（毫秒）
  };

  let backButton = null;
  let isVisible = false;

  /**
   * 初始化回到顶部按钮
   */
  function init() {
    // 查找按钮
    backButton = document.getElementById(CONFIG.buttonId);

    if (!backButton) {
      console.warn('回到顶部按钮未找到');
      return;
    }

    // 绑定事件
    bindEvents();

    // 初始检查
    checkScroll();

    console.log('回到顶部功能已初始化');
  }

  /**
   * 绑定事件
   */
  function bindEvents() {
    // 滚动事件
    window.addEventListener('scroll', throttle(checkScroll, 100), { passive: true });

    // 点击事件
    backButton.addEventListener('click', scrollToTop);

    // 键盘支持
    backButton.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToTop();
      }
    });
  }

  /**
   * 检查滚动位置并显示/隐藏按钮
   */
  function checkScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const shouldShow = scrollTop > CONFIG.showOffset;

    if (shouldShow !== isVisible) {
      isVisible = shouldShow;
      updateVisibility();
    }
  }

  /**
   * 更新按钮可见性
   */
  function updateVisibility() {
    if (isVisible) {
      backButton.classList.add('visible');
      backButton.setAttribute('aria-hidden', 'false');
    } else {
      backButton.classList.remove('visible');
      backButton.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * 平滑滚动到顶部
   */
  function scrollToTop() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop === 0) {
      return;
    }

    // 使用原生平滑滚动
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      // 降级方案：使用动画
      animateScrollToTop();
    }
  }

  /**
   * 动画滚动到顶部（降级方案）
   */
  function animateScrollToTop() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / CONFIG.scrollDuration, 1);

      // easeOutCubic 缓动函数
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const newScrollTop = scrollTop * (1 - easeProgress);

      window.scrollTo(0, newScrollTop);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  /**
   * 节流函数
   */
  function throttle(func, wait) {
    let timeout;
    let lastRun = 0;

    return function(...args) {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun;

      clearTimeout(timeout);

      if (timeSinceLastRun >= wait) {
        func.apply(this, args);
        lastRun = now;
      } else {
        timeout = setTimeout(() => {
          func.apply(this, args);
          lastRun = Date.now();
        }, wait - timeSinceLastRun);
      }
    };
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 导出 API（供其他脚本使用）
  window.BackToTop = {
    show: function() {
      isVisible = true;
      updateVisibility();
    },
    hide: function() {
      isVisible = false;
      updateVisibility();
    },
    scroll: scrollToTop
  };

})();
