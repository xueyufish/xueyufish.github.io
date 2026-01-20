/**
 * 图片懒加载功能
 * 使用 Intersection Observer API 实现高性能的图片懒加载
 */

(function() {
  'use strict';

  // 配置
  const CONFIG = {
    // 图片根属性
    dataAttribute: 'src',
    // 加载时的占位符
    placeholder: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    // 提前加载像素
    rootMargin: '50px 0px',
    // 图片加载完成的类名
    loadedClass: 'lazy-loaded',
    // 图片加载中的类名
    loadingClass: 'lazy-loading'
  };

  let observer = null;

  /**
   * 初始化懒加载
   */
  function initLazyLoad() {
    // 检查浏览器支持
    if (!('IntersectionObserver' in window)) {
      // 不支持 IntersectionObserver，直接加载所有图片
      loadAllImages();
      console.log('LazyLoad: IntersectionObserver not supported, loading all images');
      return;
    }

    // 创建 Intersection Observer
    observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          loadImage(img);
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: CONFIG.rootMargin,
      threshold: 0.01
    });

    // 查找所有需要懒加载的图片
    const lazyImages = document.querySelectorAll('img[data-src]');

    if (lazyImages.length === 0) {
      console.log('LazyLoad: No lazy images found');
      return;
    }

    // 观察所有图片
    lazyImages.forEach(function(img) {
      // 设置占位符
      if (!img.src) {
        img.src = CONFIG.placeholder;
      }
      observer.observe(img);
    });

    console.log('LazyLoad: Initialized with ' + lazyImages.length + ' images');
  }

  /**
   * 加载单张图片
   */
  function loadImage(img) {
    const src = img.getAttribute('data-src');

    if (!src) {
      console.warn('LazyLoad: Image has no data-src attribute', img);
      return;
    }

    // 添加加载中类名
    img.classList.add(CONFIG.loadingClass);

    // 创建新的 Image 对象来预加载
    const tempImg = new Image();

    tempImg.onload = function() {
      // 加载成功
      img.src = src;
      img.classList.remove(CONFIG.loadingClass);
      img.classList.add(CONFIG.loadedClass);

      // 移除 data-src 属性
      img.removeAttribute('data-src');

      // 可选：添加淡入效果
      img.style.opacity = '0';
      setTimeout(function() {
        img.style.transition = 'opacity 0.3s ease';
        img.style.opacity = '1';
      }, 10);
    };

    tempImg.onerror = function() {
      // 加载失败
      console.error('LazyLoad: Failed to load image', src);
      img.classList.remove(CONFIG.loadingClass);
      img.classList.add('lazy-error');
    };

    // 开始加载
    tempImg.src = src;
  }

  /**
   * 加载所有图片（用于不支持 IntersectionObserver 的浏览器）
   */
  function loadAllImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(function(img) {
      loadImage(img);
    });
  }

  /**
   * 动态添加新的懒加载图片
   */
  function addLazyImage(img) {
    if (!img) return;

    if (!observer) {
      // 没有初始化 observer，直接加载
      loadImage(img);
      return;
    }

    // 设置占位符
    if (!img.src) {
      img.src = CONFIG.placeholder;
    }

    // 观察图片
    observer.observe(img);
  }

  /**
   * 手动触发加载
   */
  function forceLoad(img) {
    if (!img) return;

    if (observer) {
      observer.unobserve(img);
    }

    loadImage(img);
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoad);
  } else {
    initLazyLoad();
  }

  // 导出到全局（供外部调用）
  window.LazyLoad = {
    add: addLazyImage,
    load: forceLoad,
    init: initLazyLoad
  };

})();
