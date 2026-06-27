// ==========================================
// HR Analytics Dashboard — Performance Charts
// ==========================================
import { state } from '../state.js';
import { getChartColors, getAxisStyle, getTooltipStyle, getLegendStyle, isDark } from '../config.js';
import { fmtNum, rp, fmtMonth, pctRaw, getOrCreateChart } from '../utils.js';

export function renderPerformance(filteredEmps) {
  var emps = filteredEmps || state.DS.employees.filter(function (e) { return e.status === 'Aktif'; });
  var colors = getChartColors();
  var axis = getAxisStyle();
  var tooltip = getTooltipStyle();
  var legend = getLegendStyle();

  renderRatingDistribution(emps, colors, axis, tooltip);
  renderPerfByDeptRadar(emps, colors, tooltip, legend);
  renderPerfVsComp(emps, colors, axis, tooltip);
  renderPerfTrend(colors, axis, tooltip);
  renderTopPerformers(emps, colors, axis, tooltip);
  renderBellCurve(emps, colors, axis, tooltip);
}

function renderRatingDistribution(emps, colors, axis, tooltip) {
  var chart = getOrCreateChart(state, 'chart-rating-dist');
  if (!chart) return;

  var labels = ['Needs Improvement', 'Below Expectations', 'Meets Expectations', 'Exceeds Expectations', 'Outstanding'];
  var counts = [0, 0, 0, 0, 0];

  emps.forEach(function (e) {
    var idx = labels.indexOf(e.performance_label);
    if (idx >= 0) counts[idx]++;
  });

  var barColors = [colors[4], colors[3], colors[0], colors[1], colors[5]];

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (p) { return p[0].name + '<br/><b>' + p[0].value + '</b> karyawan'; }
    }),
    grid: { left: '3%', right: '4%', bottom: '3%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'category', data: labels, axisLabel: { rotate: 20, fontSize: 9 } }, axis),
    yAxis: Object.assign({ type: 'value' }, axis),
    series: [{
      type: 'bar',
      data: counts.map(function (c, i) {
        return {
          value: c,
          itemStyle: { borderRadius: [6, 6, 0, 0], color: barColors[i] }
        };
      }),
      barWidth: '50%',
      label: {
        show: true,
        position: 'top',
        formatter: '{c}',
        color: isDark() ? '#94a3b8' : '#64748b',
        fontSize: 11,
        fontWeight: 'bold',
        fontFamily: 'Inter'
      }
    }]
  });
}

function renderPerfByDeptRadar(emps, colors, tooltip, legend) {
  var chart = getOrCreateChart(state, 'chart-perf-radar');
  if (!chart) return;

  var deptMap = {};
  emps.forEach(function (e) {
    if (!deptMap[e.departemen]) deptMap[e.departemen] = { total: 0, count: 0 };
    deptMap[e.departemen].total += e.performance_score;
    deptMap[e.departemen].count++;
  });

  var depts = Object.keys(deptMap).sort();
  var vals = depts.map(function (d) {
    return Math.round((deptMap[d].total / deptMap[d].count) * 100) / 100;
  });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {}),
    radar: {
      indicator: depts.map(function (d) { return { name: d, max: 5 }; }),
      shape: 'polygon',
      radius: '65%',
      axisName: {
        color: isDark() ? '#94a3b8' : '#64748b',
        fontSize: 10,
        fontFamily: 'Inter'
      },
      axisLine: { lineStyle: { color: isDark() ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' } },
      splitLine: { lineStyle: { color: isDark() ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' } },
      splitArea: { show: false }
    },
    series: [{
      type: 'radar',
      data: [{
        value: vals,
        name: 'Avg Performance',
        areaStyle: { color: colors[0] + '30' },
        lineStyle: { color: colors[0], width: 2 },
        itemStyle: { color: colors[0] },
        symbol: 'circle',
        symbolSize: 6
      }],
      emphasis: { areaStyle: { color: colors[0] + '50' } }
    }]
  });
}

function renderPerfVsComp(emps, colors, axis, tooltip) {
  var chart = getOrCreateChart(state, 'chart-perf-vs-comp');
  if (!chart) return;

  var deptColors = {};
  var depts = [];
  var deptSet = new Set();
  emps.forEach(function (e) { deptSet.add(e.departemen); });
  depts = Array.from(deptSet).sort();
  depts.forEach(function (d, i) { deptColors[d] = colors[i % colors.length]; });

  var data = emps.map(function (e) {
    return {
      value: [e.performance_score, e.total_kompensasi, e.nama, e.departemen],
      itemStyle: { color: deptColors[e.departemen] + 'AA' }
    };
  });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      formatter: function (p) {
        return '<b>' + p.value[2] + '</b><br/>' +
          'Departemen: ' + p.value[3] + '<br/>' +
          'Score: <b>' + p.value[0] + '</b><br/>' +
          'Kompensasi: <b>' + rp(p.value[1]) + '</b>';
      }
    }),
    grid: { left: '3%', right: '4%', bottom: '8%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'value', name: 'Performance Score', min: 1, max: 5 }, axis),
    yAxis: Object.assign({ type: 'value', name: 'Total Kompensasi', axisLabel: { formatter: function (v) { return (v / 1000000).toFixed(0) + 'jt'; } } }, axis),
    series: [{
      type: 'scatter',
      data: data,
      symbolSize: 8,
      emphasis: { itemStyle: { borderColor: '#fff', borderWidth: 2 } }
    }]
  });
}

function renderPerfTrend(colors, axis, tooltip) {
  var chart = getOrCreateChart(state, 'chart-perf-trend');
  if (!chart) return;

  var monthly = state.DS.monthly;
  var months = monthly.map(function (m) { return fmtMonth(m.bulan); });
  var perfs = monthly.map(function (m) { return m.avg_performance; });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      formatter: function (p) { return '<b>' + p[0].axisValue + '</b><br/>Avg Score: <b>' + p[0].value.toFixed(2) + '</b>'; }
    }),
    grid: { left: '3%', right: '4%', bottom: '8%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'category', data: months, axisLabel: { rotate: 45, fontSize: 9 } }, axis),
    yAxis: Object.assign({ type: 'value', min: 1, max: 5, name: 'Avg Score' }, axis),
    series: [{
      type: 'line',
      data: perfs,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 3, color: colors[5] },
      itemStyle: { color: colors[5] },
      markLine: {
        silent: true,
        data: [{ yAxis: 3, name: 'Target', lineStyle: { color: colors[3], type: 'dashed' }, label: { formatter: 'Target: 3.0', color: isDark() ? '#94a3b8' : '#64748b', fontSize: 10 } }]
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colors[5] + '40' },
          { offset: 1, color: 'transparent' }
        ])
      }
    }]
  });
}

function renderTopPerformers(emps, colors, axis, tooltip) {
  var chart = getOrCreateChart(state, 'chart-top-performers');
  if (!chart) return;

  var sorted = emps.slice().sort(function (a, b) { return b.performance_score - a.performance_score; }).slice(0, 15);
  sorted.reverse();

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (p) {
        var emp = sorted[p[0].dataIndex];
        return '<b>' + p[0].name + '</b><br/>' +
          emp.jabatan + ' — ' + emp.departemen + '<br/>' +
          'Score: <b>' + p[0].value + '</b>';
      }
    }),
    grid: { left: '3%', right: '6%', bottom: '3%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'value', min: 0, max: 5 }, axis),
    yAxis: Object.assign({ type: 'category', data: sorted.map(function (e) { return e.nama; }), inverse: false }, axis),
    series: [{
      type: 'bar',
      data: sorted.map(function (e, i) {
        return {
          value: e.performance_score,
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            color: e.performance_score >= 4.5 ? colors[5] : (e.performance_score >= 4 ? colors[0] : colors[1])
          }
        };
      }),
      barWidth: '55%',
      label: {
        show: true,
        position: 'right',
        formatter: function (p) { return p.value.toFixed(1); },
        color: isDark() ? '#94a3b8' : '#64748b',
        fontSize: 10,
        fontFamily: 'Inter'
      }
    }]
  });
}

function renderBellCurve(emps, colors, axis, tooltip) {
  var chart = getOrCreateChart(state, 'chart-bell-curve');
  if (!chart) return;

  // Create distribution
  var bins = [];
  for (var s = 1.0; s <= 5.0; s += 0.2) {
    bins.push({ label: s.toFixed(1), min: s - 0.1, max: s + 0.1, count: 0 });
  }

  emps.forEach(function (e) {
    for (var i = 0; i < bins.length; i++) {
      if (e.performance_score >= bins[i].min && e.performance_score < bins[i].max) {
        bins[i].count++;
        break;
      }
    }
  });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      formatter: function (p) { return 'Score: ' + p[0].axisValue + '<br/>Karyawan: <b>' + p[0].value + '</b>'; }
    }),
    grid: { left: '3%', right: '4%', bottom: '3%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'category', data: bins.map(function (b) { return b.label; }), boundaryGap: false }, axis),
    yAxis: Object.assign({ type: 'value' }, axis),
    series: [{
      type: 'line',
      data: bins.map(function (b) { return b.count; }),
      smooth: 0.6,
      symbol: 'none',
      lineStyle: { width: 3, color: colors[5] },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colors[5] + '60' },
          { offset: 0.5, color: colors[0] + '30' },
          { offset: 1, color: 'transparent' }
        ])
      },
      markLine: {
        silent: true,
        data: [
          { xAxis: '3.2', name: 'Mean', lineStyle: { color: colors[3], type: 'dashed', width: 2 }, label: { formatter: 'Mean ≈ 3.2', color: isDark() ? '#94a3b8' : '#64748b', fontSize: 10 } }
        ]
      }
    }]
  });
}
