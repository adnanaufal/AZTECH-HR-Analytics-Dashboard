// ==========================================
// HR Analytics Dashboard — Config & Theme (Mathical Neubrutalist UI)
// ==========================================

export function isDark() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

// Chart color palette (Mathical neubrutalist colors)
export function getChartColors() {
  return ['#5B42FF', '#FF6BE5', '#D5F34A', '#FFAB40', '#9A9365', '#818cf8', '#22c55e', '#ef4444'];
}

// ECharts neubrutalist axis styling (cardTheme: 'cream' | 'pink' | 'purple' | 'dark')
export function getAxisStyle(cardTheme = 'cream') {
  const isLightText = cardTheme === 'purple' || (cardTheme === 'dark' && isDark());
  const color = isLightText ? '#ffffff' : '#000000';
  const gridLineColor = isLightText ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
  const borderLineColor = isLightText ? 'rgba(255, 255, 255, 0.3)' : '#000000';

  return {
    axisLine: {
      lineStyle: { color: borderLineColor, width: 2 }
    },
    axisTick: {
      show: true,
      lineStyle: { color: borderLineColor, width: 2 }
    },
    axisLabel: {
      color: color,
      fontSize: 10,
      fontFamily: 'KaioTRIAL',
      fontWeight: 700
    },
    splitLine: {
      show: true,
      lineStyle: { color: gridLineColor, width: 1, type: 'dashed' }
    },
    nameTextStyle: {
      color: color,
      fontFamily: 'KaioTRIAL',
      fontSize: 10,
      fontWeight: 800
    }
  };
}

// Neubrutalist Tooltip Styling
export function getTooltipStyle(cardTheme = 'cream') {
  return {
    backgroundColor: '#000000',
    borderColor: '#000000',
    borderWidth: 2,
    borderRadius: 12,
    padding: [10, 14],
    textStyle: {
      color: '#ffffff',
      fontFamily: 'KaioTRIAL',
      fontSize: 11,
      fontWeight: 700
    },
    extraCssText: 'box-shadow: 4px 4px 0px rgba(0,0,0,0.15); border: 2px solid #000;'
  };
}

// Neubrutalist Legend Styling
export function getLegendStyle(cardTheme = 'cream') {
  const isLightText = cardTheme === 'purple' || (cardTheme === 'dark' && isDark());
  const color = isLightText ? '#ffffff' : '#000000';

  return {
    textStyle: {
      color: color,
      fontFamily: 'KaioTRIAL',
      fontSize: 10,
      fontWeight: 700
    },
    icon: 'rect',
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 16
  };
}

export function getTitleStyle(text) {
  return {
    text: text || '',
    show: false
  };
}

// Helper to return Neubrutalist Capsule/Pill Bar series options
export function getCapsuleBarOptions(data, color, isHorizontal = false) {
  return {
    type: 'bar',
    barWidth: 24,
    showBackground: true,
    backgroundStyle: {
      color: 'rgba(0, 0, 0, 0.08)',
      borderRadius: [100, 100, 100, 100]
    },
    itemStyle: {
      color: color || '#FFAB40',
      borderRadius: [100, 100, 100, 100],
      borderColor: '#000000',
      borderWidth: 2
    },
    data: data
  };
}
