/**
 * 夜间模式切换功能
 * 功能：
 * 1. 切换日间/夜间模式
 * 2. 保存用户偏好到 localStorage
 * 3. 页面加载时自动应用保存的主题
 * 4. 响应系统主题变化（可选）
 */

(function() {
  'use strict';

  // 配置
  const CONFIG = {
    storageKey: 'theme',
    defaultTheme: 'light',
    darkModeClass: 'dark-mode',
    toggleButtonId: 'theme-toggle',
    themeIconId: 'theme-icon'
  };

  // 图标配置
  const ICONS = {
    light: 'fa-sun-o',
    dark: 'fa-moon-o'
  };

  /**
   * 获取当前主题
   */
  function getCurrentTheme() {
    return localStorage.getItem(CONFIG.storageKey) || CONFIG.defaultTheme;
  }

  /**
   * 设置主题
   * @param {string} theme - 'light' 或 'dark'
   */
  function setTheme(theme) {
    // 设置 data-theme 属性
    document.documentElement.setAttribute('data-theme', theme);

    // 保存到 localStorage
    localStorage.setItem(CONFIG.storageKey, theme);

    // 更新图标
    updateThemeIcon(theme);

    // 触发自定义事件（供其他脚本使用）
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  /**
   * 切换主题
   */
  function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }

  /**
   * 更新主题图标
   * @param {string} theme - 'light' 或 'dark'
   */
  function updateThemeIcon(theme) {
    const icon = document.getElementById(CONFIG.themeIconId);
    if (icon) {
      // 移除旧图标类
      icon.classList.remove(ICONS.light, ICONS.dark);
      // 添加新图标类
      icon.classList.add(theme === 'dark' ? ICONS.dark : ICONS.light);
    }
  }

  /**
   * 初始化主题切换按钮
   */
  function initToggleButton() {
    const toggleButton = document.getElementById(CONFIG.toggleButtonId);

    if (toggleButton) {
      toggleButton.addEventListener('click', function(e) {
        e.preventDefault();
        toggleTheme();
      });

      // 添加键盘支持
      toggleButton.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      });

      // 添加悬停提示
      toggleButton.setAttribute('title',
        getCurrentTheme() === 'dark' ? '切换到日间模式' : '切换到夜间模式'
      );
    }
  }

  /**
   * 自动检测系统主题（可选功能）
   */
  function detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * 监听系统主题变化（可选功能）
   */
  function watchSystemTheme() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      // 使用现代 API
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', function(e) {
          // 只在用户没有手动设置过主题时自动切换
          if (!localStorage.getItem(CONFIG.storageKey)) {
            setTheme(e.matches ? 'dark' : 'light');
          }
        });
      }
    }
  }

  /**
   * 初始化函数
   */
  function init() {
    // 1. 应用保存的主题或默认主题
    const currentTheme = getCurrentTheme();
    setTheme(currentTheme);

    // 2. 初始化切换按钮
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initToggleButton);
    } else {
      initToggleButton();
    }

    // 3. 监听系统主题变化（可选）
    watchSystemTheme();

    // 4. 添加键盘快捷键支持
    document.addEventListener('keydown', function(e) {
      // Ctrl/Cmd + Shift + D 切换主题
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleTheme();
      }
    });

    console.log('主题切换功能已初始化，当前主题:', currentTheme);
  }

  // 页面加载时立即初始化
  init();

  // 导出 API（供其他脚本使用）
  window.ThemeManager = {
    toggle: toggleTheme,
    set: setTheme,
    get: getCurrentTheme,
    ICONS: ICONS
  };

})();
