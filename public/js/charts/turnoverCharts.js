// ==========================================
// HR Analytics Dashboard — Turnover Charts
// ==========================================
import { state } from '../state.js';
import { getChartColors, getAxisStyle, getTooltipStyle, getLegendStyle, isDark } from '../config.js';
import { fmtNum, pctRaw, fmtMonth, getOrCreateChart, getTenureMonths } from '../utils.js';

export function renderTurnover(filteredEmps) {
  var emps = filteredEmps || state.DS.employees;
  var monthly = state.DS.monthly;
  var colors = getChartColors();
  var axis = getAxisStyle();
  var tooltip = getTooltipStyle();
  var legend = getLegendStyle();

  renderTurnoverTrend(monthly, colors, axis, tooltip, legend);
  renderExitReasons(emps, colors, tooltip, legend);
  renderTurnoverByDept(emps, colors, axis, tooltip);
  renderRetentionByLevel(emps, colors, axis, tooltip);
  renderAvgTenureExit(emps, colors, axis, tooltip);
  renderTurnoverHeatmap(emps, colors, axis, tooltip);
}

function renderTurnoverTrend(monthly, colors, axis, tooltip, legend) {
  var chart = getOrCreateChart(state, 'chart-turnover-trend');
  if (!chart) return;

  var months = monthly.map(function (m) { return fmtMonth(m.bulan); });
  var rates = monthly.map(function (m) { return m.turnover_rate; });
  var terms = monthly.map(function (m) { return m.terminations; });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      formatter: function (p) {
        var s = '<b>' + p[0].axisValue + '</b><br/>';
        p.forEach(function (item) {
          s += item.marker + ' ' + item.seriesName + ': <b>' + (item.seriesIndex === 0 ? pctRaw(item.value) : item.value) + '</b><br/>';
        });
        return s;
      }
    }),
    legend: Object.assign({}, legend, { data: ['Turnover Rate (%)', 'Jumlah Keluar'], bottom: 0 }),
    grid: { left: '3%', right: '4%', bottom: '14%', top: '8%', containLabel: true },
    xAxis: Object.assign({ type: 'category', data: months, axisLabel: { rotate: 45, fontSize: 9 } }, axis),
    yAxis: [
      Object.assign({ type: 'value', name: 'Rate (%)', position: 'left' }, axis),
      Object.assign({ type: 'value', name: 'Jumlah', position: 'right' }, axis)
    ],
    series: [
      {
        name: 'Turnover Rate (%)',
        type: 'line',
        data: rates,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 3, color: colors[4] },
        itemStyle: { color: colors[4] },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: colors[4] + '40' }, { offset: 1, color: 'transparent' }]) }
      },
      {
        name: 'Jumlah Keluar',
        type: 'bar',
        yAxisIndex: 1,
        data: terms,
        barWidth: '40%',
        itemStyle: { color: colors[0] + '80', borderRadius: [4, 4, 0, 0] }
      }
    ]
  });
}

function renderExitReasons(emps, colors, tooltip, legend) {
  var chart = getOrCreateChart(state, 'chart-exit-reasons');
  if (!chart) return;

  var exitEmps = emps.filter(function (e) { return e.status !== 'Aktif' && e.alasan_keluar; });
  var reasonMap = {};
  exitEmps.forEach(function (e) {
    reasonMap[e.alasan_keluar] = (reasonMap[e.alasan_keluar] || 0) + 1;
  });

  var data = Object.keys(reasonMap).map(function (r) {
    return { name: r, value: reasonMap[r] };
  }).sort(function (a, b) { return b.value - a.value; });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'item',
      formatter: function (p) { return p.name + '<br/><b>' + p.value + '</b> orang (' + p.percent.toFixed(1) + '%)'; }
    }),
    legend: Object.assign({}, legend, {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      data: data.map(function (d) { return d.name; })
    }),
    series: [{
      type: 'pie',
      radius: ['45%', '72%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      label: { show: false, position: 'center' },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold',
          fontFamily: 'Outfit',
          formatter: '{b}\n{c} orang\n({d}%)',
          color: isDark() ? '#e2e8f0' : '#1e293b',
          lineHeight: 18
        },
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' }
      },
      data: data.map(function (d, i) {
        return { name: d.name, value: d.value, itemStyle: { color: colors[i % colors.length] } };
      })
    }]
  });
}

function renderTurnoverByDept(emps, colors, axis, tooltip) {
  var chart = getOrCreateChart(state, 'chart-turnover-dept');
  if (!chart) return;

  var deptMap = {};
  emps.forEach(function (e) {
    if (!deptMap[e.departemen]) deptMap[e.departemen] = { total: 0, exited: 0 };
    deptMap[e.departemen].total++;
    if (e.status !== 'Aktif') deptMap[e.departemen].exited++;
  });

  var depts = Object.keys(deptMap).sort(function (a, b) {
    var rateA = deptMap[a].total > 0 ? (deptMap[a].exited / deptMap[a].total) * 100 : 0;
    var rateB = deptMap[b].total > 0 ? (deptMap[b].exited / deptMap[b].total) * 100 : 0;
    return rateB - rateA;
  });

  var rates = depts.map(function (d) {
    return deptMap[d].total > 0 ? Math.round((deptMap[d].exited / deptMap[d].total) * 1000) / 10 : 0;
  });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (p) {
        var dept = depts[p[0].dataIndex];
        return '<b>' + dept + '</b><br/>Turnover: <b>' + pctRaw(p[0].value) + '</b><br/>(' + deptMap[dept].exited + '/' + deptMap[dept].total + ')';
      }
    }),
    grid: { left: '3%', right: '6%', bottom: '3%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'value', max: 100, axisLabel: { formatter: '{value}%' } }, axis),
    yAxis: Object.assign({ type: 'category', data: depts, inverse: true }, axis),
    series: [{
      type: 'bar',
      data: rates.map(function (r, i) {
        return {
          value: r,
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            color: r > 35 ? colors[4] : (r > 25 ? colors[3] : colors[0])
          }
        };
      }),
      barWidth: '55%',
      label: {
        show: true,
        position: 'right',
        formatter: function (p) { return pctRaw(p.value); },
        color: isDark() ? '#94a3b8' : '#64748b',
        fontSize: 10,
        fontFamily: 'Inter'
      }
    }]
  });
}

function renderRetentionByLevel(emps, colors, axis, tooltip) {
  var chart = getOrCreateChart(state, 'chart-retention-level');
  if (!chart) return;

  var levelOrder = ['Junior', 'Mid', 'Senior', 'Lead', 'Executive'];
  var levelMap = {};
  emps.forEach(function (e) {
    if (!levelMap[e.level]) levelMap[e.level] = { total: 0, active: 0 };
    levelMap[e.level].total++;
    if (e.status === 'Aktif') levelMap[e.level].active++;
  });

  var levels = levelOrder.filter(function (l) { return levelMap[l]; });
  var rates = levels.map(function (l) {
    return levelMap[l].total > 0 ? Math.round((levelMap[l].active / levelMap[l].total) * 1000) / 10 : 0;
  });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (p) {
        var lv = levels[p[0].dataIndex];
        return '<b>' + lv + '</b><br/>Retention: <b>' + pctRaw(p[0].value) + '</b><br/>(' + levelMap[lv].active + '/' + levelMap[lv].total + ')';
      }
    }),
    grid: { left: '3%', right: '6%', bottom: '3%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'value', max: 100, axisLabel: { formatter: '{value}%' } }, axis),
    yAxis: Object.assign({ type: 'category', data: levels, inverse: true }, axis),
    series: [{
      type: 'bar',
      data: rates.map(function (r, i) {
        return {
          value: r,
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: colors[3] },
              { offset: 1, color: colors[1] }
            ])
          }
        };
      }),
      barWidth: '55%',
      label: {
        show: true,
        position: 'right',
        formatter: function (p) { return pctRaw(p.value); },
        color: isDark() ? '#94a3b8' : '#64748b',
        fontSize: 10,
        fontFamily: 'Inter'
      }
    }]
  });
}

function renderAvgTenureExit(emps, colors, axis, tooltip) {
  var chart = getOrCreateChart(state, 'chart-tenure-exit');
  if (!chart) return;

  var exitEmps = emps.filter(function (e) { return e.status !== 'Aktif' && e.tanggal_keluar; });
  var deptTenure = {};
  exitEmps.forEach(function (e) {
    if (!deptTenure[e.departemen]) deptTenure[e.departemen] = { total: 0, count: 0 };
    deptTenure[e.departemen].total += getTenureMonths(e.tanggal_masuk, e.tanggal_keluar);
    deptTenure[e.departemen].count++;
  });

  var depts = Object.keys(deptTenure).sort(function (a, b) {
    return (deptTenure[b].total / deptTenure[b].count) - (deptTenure[a].total / deptTenure[a].count);
  });
  var vals = depts.map(function (d) { return Math.round(deptTenure[d].total / deptTenure[d].count); });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (p) {
        var dept = depts[p[0].dataIndex];
        return '<b>' + dept + '</b><br/>Avg Masa Kerja: <b>' + p[0].value + ' bulan</b><br/>(' + deptTenure[dept].count + ' orang keluar)';
      }
    }),
    grid: { left: '3%', right: '4%', bottom: '3%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'category', data: depts, axisLabel: { rotate: 30 } }, axis),
    yAxis: Object.assign({ type: 'value', name: 'Bulan' }, axis),
    series: [{
      type: 'bar',
      data: vals.map(function (v, i) {
        return {
          value: v,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: colors[i % colors.length]
          }
        };
      }),
      barWidth: '50%'
    }]
  });
}

function renderTurnoverHeatmap(emps, colors, axis, tooltip) {
  var chart = getOrCreateChart(state, 'chart-turnover-heatmap');
  if (!chart) return;

  var exitEmps = emps.filter(function (e) { return e.status !== 'Aktif' && e.tanggal_keluar; });
  var monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  var depts = [];
  var deptSet = new Set();
  emps.forEach(function (e) { deptSet.add(e.departemen); });
  depts = Array.from(deptSet).sort();

  var data = [];
  var maxVal = 0;

  depts.forEach(function (dept, di) {
    for (var m = 0; m < 12; m++) {
      var count = exitEmps.filter(function (e) {
        if (e.departemen !== dept || !e.tanggal_keluar) return false;
        var exitMonth = new Date(e.tanggal_keluar).getMonth();
        return exitMonth === m;
      }).length;
      data.push([m, di, count]);
      if (count > maxVal) maxVal = count;
    }
  });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      formatter: function (p) {
        return '<b>' + depts[p.value[1]] + '</b><br/>' +
          'Bulan: ' + monthLabels[p.value[0]] + '<br/>' +
          'Keluar: <b>' + p.value[2] + '</b> orang';
      }
    }),
    grid: { left: '3%', right: '8%', bottom: '12%', top: '4%', containLabel: true },
    xAxis: { type: 'category', data: monthLabels, splitArea: { show: true }, axisLabel: { color: isDark() ? '#94a3b8' : '#64748b', fontSize: 11, fontFamily: 'Inter' } },
    yAxis: { type: 'category', data: depts, splitArea: { show: true }, axisLabel: { color: isDark() ? '#94a3b8' : '#64748b', fontSize: 11, fontFamily: 'Inter' } },
    visualMap: {
      min: 0,
      max: Math.max(maxVal, 1),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: {
        color: isDark()
          ? ['#0F2854', '#15396b', '#1C4D8D', '#4988C4', '#BDE8F5']
          : ['#ebf6fa', '#BDE8F5', '#4988C4', '#1C4D8D', '#0F2854']
      },
      textStyle: { color: isDark() ? '#94a3b8' : '#64748b', fontFamily: 'Inter' }
    },
    series: [{
      type: 'heatmap',
      data: data,
      label: { show: true, color: isDark() ? '#e2e8f0' : '#1e293b', fontSize: 10, fontFamily: 'Inter' },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' } }
    }]
  });
}
