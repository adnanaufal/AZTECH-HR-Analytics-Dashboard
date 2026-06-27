// ==========================================
// HR Analytics Dashboard — Config & Theme
// ==========================================

export function isDark() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

// Chart color palette (blue monochromatic theme matching user's request)
export function getChartColors() {
  return isDark()
    ? ['#BDE8F5', '#9ecce8', '#82b2db', '#6599cf', '#4988C4', '#3772b1', '#265b9d', '#1C4D8D', '#14376c', '#0F2854']
    : ['#0F2854', '#14376c', '#1C4D8D', '#265b9d', '#3772b1', '#4988C4', '#6599cf', '#82b2db', '#9ecce8', '#BDE8F5'];
}

// ECharts theme-aware defaults
export function getAxisStyle() {
  return {
    axisLine: { lineStyle: { color: isDark() ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' } },
    axisTick: { lineStyle: { color: isDark() ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' } },
    axisLabel: { color: isDark() ? '#94a3b8' : '#64748b', fontSize: 11, fontFamily: 'Inter' },
    splitLine: { lineStyle: { color: isDark() ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' } },
    nameTextStyle: { color: isDark() ? '#94a3b8' : '#64748b', fontFamily: 'Inter', fontSize: 11 }
  };
}

export function getTooltipStyle() {
  return {
    backgroundColor: isDark() ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.97)',
    borderColor: isDark() ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)',
    textStyle: { color: isDark() ? '#e2e8f0' : '#1e293b', fontFamily: 'Inter', fontSize: 12 },
    borderWidth: 1,
    borderRadius: 8,
    padding: [10, 14],
    extraCssText: 'box-shadow: 0 8px 24px rgba(0,0,0,0.2);'
  };
}

export function getLegendStyle() {
  return {
    textStyle: { color: isDark() ? '#94a3b8' : '#64748b', fontFamily: 'Inter', fontSize: 11 },
    icon: 'roundRect',
    itemWidth: 12,
    itemHeight: 8,
    itemGap: 16
  };
}

export function getTitleStyle(text) {
  return {
    text: text || '',
    show: false
  };
}
