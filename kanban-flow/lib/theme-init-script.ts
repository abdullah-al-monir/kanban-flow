export const themeConfigInitScript = `
(function () {
  try {
    var raw = localStorage.getItem('kanban-theme-config');
    var colorTheme = 'slate';
    var darkBg = 'zinc';
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.state) {
        colorTheme = parsed.state.colorTheme || colorTheme;
        darkBg = parsed.state.darkBg || darkBg;
      }
    }
    document.documentElement.classList.add('theme-' + colorTheme, 'dark-bg-' + darkBg);
  } catch (e) {}
})();
`
