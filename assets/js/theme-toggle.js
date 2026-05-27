(function() {
  'use strict';

  const CONFIG = {
    storageKey: 'theme',
    defaultTheme: 'system',
    buttonSelector: '.theme-toggle-btn',
    activeClass: 'active'
  };

  function getStoredTheme() {
    return localStorage.getItem(CONFIG.storageKey) || CONFIG.defaultTheme;
  }

  function getEffectiveTheme(theme) {
    if (theme === 'system') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }

  function setTheme(theme) {
    const effective = getEffectiveTheme(theme);
    document.documentElement.setAttribute('data-theme', effective);
    localStorage.setItem(CONFIG.storageKey, theme);
    updateButtons(theme);
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: effective, preference: theme } }));
  }

  function updateButtons(activeTheme) {
    const buttons = document.querySelectorAll(CONFIG.buttonSelector);
    buttons.forEach(function(btn) {
      const btnTheme = btn.getAttribute('data-theme');
      if (btnTheme === activeTheme) {
        btn.classList.add(CONFIG.activeClass);
      } else {
        btn.classList.remove(CONFIG.activeClass);
      }
    });
  }

  function watchSystemTheme() {
    if (window.matchMedia) {
      var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', function() {
          if (getStoredTheme() === 'system') {
            setTheme('system');
          }
        });
      }
    }
  }

  function initButtons() {
    var buttons = document.querySelectorAll(CONFIG.buttonSelector);
    buttons.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var theme = btn.getAttribute('data-theme');
        setTheme(theme);
      });
    });
  }

  function init() {
    var currentTheme = getStoredTheme();
    setTheme(currentTheme);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initButtons);
    } else {
      initButtons();
    }

    watchSystemTheme();

    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        var current = getStoredTheme();
        var next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
        setTheme(next);
      }
    });
  }

  init();

  window.ThemeManager = {
    set: setTheme,
    get: getStoredTheme,
    getEffective: function() { return getEffectiveTheme(getStoredTheme()); }
  };

})();
