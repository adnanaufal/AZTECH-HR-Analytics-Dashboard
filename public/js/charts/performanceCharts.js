// ==========================================
// HR Analytics Dashboard — Performance Charts (Mathical Neubrutalist)
// ==========================================
import { state } from '../state.js';
import { getChartColors, getAxisStyle, getTooltipStyle, getLegendStyle, isDark } from '../config.js';
import { fmtNum, rp, fmtMonth, pctRaw, getOrCreateChart } from '../utils.js';

export function renderPerformance(filteredEmps) {
  var emps = filteredEmps || state.DS.employees.filter(function (e) { return e.status === 'Aktif'; });
  var colors = getChartColors();

  renderRatingDistribution(emps, colors);
  renderPerfByDeptRadar(emps, colors);
  renderPerfVsComp(emps, colors);
  renderPerfTrend(colors);
  renderTopPerformers(emps, colors);
  renderBellCurve(emps, colors);
}

function renderRatingDistribution(emps, colors) {
  var chart = getOrCreateChart(state, 'chart-rating-dist');
  if (!chart) return;

  var axis = getAxisStyle('cream');
  var tooltip = getTooltipStyle('cream');

  var labels = ['Needs Improvement', 'Below Expectations', 'Meets Expectations', 'Exceeds Expectations', 'Outstanding'];
  var counts = [0, 0, 0, 0, 0];

  emps.forEach(function (e) {
    var idx = labels.indexOf(e.performance_label);
    if (idx >= 0) counts[idx]++;
  });

  var barColors = [colors[7], colors[3], colors[0], colors[1], colors[2]];

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (p) { return p[0].name + '<br/><b>' + p[0].value + '</b> karyawan'; }
    }),
    grid: { left: '3%', right: '4%', bottom: '3%', top: '6%', containLabel: true },
    xAxis: Object.assign({ type: 'category', data: labels, axisLabel: { rotate: 20, fontSize: 9 } }, axis),
    yAxis: Object.assign({ type: 'value' }, axis),
    series: [{
      type: 'bar',
      showBackground: true,
      backgroundStyle: {
        color: 'rgba(0, 0, 0, 0.06)',
        borderRadius: [50, 50, 0, 0]
      },
      data: counts.map(function (c, i) {
        return {
          value: c,
          itemStyle: {
            borderRadius: [50, 50, 0, 0],
            borderColor: '#000000',
            borderWidth: 2,
            color: barColors[i % barColors.length]
          }
        };
      }),
      barWidth: 24,
      label: {
        show: true,
        position: 'top',
        formatter: '{c}',
        color: '#000000',
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: 'KaioTRIAL'
      }
    }]
  });
}

function renderPerfByDeptRadar(emps, colors) {
  var chart = getOrCreateChart(state, 'chart-perf-radar');
  if (!chart) return;

  var tooltip = getTooltipStyle('pink');
  var legend = getLegendStyle('pink');

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
        color: '#000000',
        fontSize: 10,
        fontFamily: 'KaioTRIAL',
        fontWeight: 800
      },
      axisLine: { lineStyle: { color: '#000000', width: 2 } },
      splitLine: { lineStyle: { color: 'rgba(0, 0, 0, 0.15)', width: 1, type: 'dashed' } },
      splitArea: { show: false }
    },
    series: [{
      type: 'radar',
      data: [{
        value: vals,
        name: 'Avg Performance',
        areaStyle: { color: colors[0] + '35' },
        lineStyle: { color: colors[0], width: 3 },
        itemStyle: { color: colors[0], borderColor: '#000000', borderWidth: 2 },
        symbol: 'circle',
        symbolSize: 8
      }],
      emphasis: { areaStyle: { color: colors[0] + '50' } }
    }]
  });
}

function renderPerfVsComp(emps, colors) {
  var chart = getOrCreateChart(state, 'chart-perf-vs-comp');
  if (!chart) return;

  var axis = getAxisStyle('cream');
  var tooltip = getTooltipStyle('cream');

  var deptColors = {};
  var depts = [];
  var deptSet = new Set();
  emps.forEach(function (e) { deptSet.add(e.departemen); });
  depts = Array.from(deptSet).sort();
  depts.forEach(function (d, i) { deptColors[d] = colors[i % colors.length]; });

  var data = emps.map(function (e) {
    return {
      value: [e.performance_score, e.total_kompensasi, e.nama, e.departemen],
      itemStyle: { color: deptColors[e.departemen], borderColor: '#000000', borderWidth: 1 }
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
    grid: { left: '3%', right: '4%', bottom: '8%', top: '6%', containLabel: true },
    xAxis: Object.assign({ type: 'value', name: 'Performance Score', min: 1, max: 5 }, axis),
    yAxis: Object.assign({ type: 'value', name: 'Total Kompensasi', axisLabel: { formatter: function (v) { return (v / 1000000).toFixed(0) + 'jt'; } } }, axis),
    series: [{
      type: 'scatter',
      data: data,
      symbolSize: 10,
      emphasis: { itemStyle: { borderColor: '#000000', borderWidth: 3 } }
    }]
  });
}

function renderPerfTrend(colors) {
  var chart = getOrCreateChart(state, 'chart-perf-trend');
  if (!chart) return;

  var axis = getAxisStyle('purple');
  var tooltip = getTooltipStyle('purple');

  var monthly = state.DS.monthly;
  var months = monthly.map(function (m) { return fmtMonth(m.bulan); });
  var perfs = monthly.map(function (m) { return m.avg_performance; });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      formatter: function (p) { return '<b>' + p[0].axisValue + '</b><br/>Avg Score: <b>' + p[0].value.toFixed(2) + '</b>'; }
    }),
    grid: { left: '3%', right: '4%', bottom: '12%', top: '6%', containLabel: true },
    xAxis: Object.assign({ type: 'category', data: months, axisLabel: { rotate: 45, fontSize: 9 } }, axis),
    yAxis: Object.assign({ type: 'value', min: 1, max: 5, name: 'Avg Score' }, axis),
    series: [{
      type: 'line',
      data: perfs,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { width: 4, color: '#ffffff' },
      itemStyle: { color: '#ffffff', borderColor: '#000000', borderWidth: 2 },
      markLine: {
        silent: true,
        data: [{ yAxis: 3, name: 'Target', lineStyle: { color: '#ffffff', type: 'dashed', width: 2 }, label: { formatter: 'Target: 3.0', color: '#ffffff', fontSize: 10, fontWeight: 700 } }]
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(255, 255, 255, 0.25)' },
          { offset: 1, color: 'transparent' }
        ])
      }
    }]
  });
}

function renderTopPerformers(emps, colors) {
  var chart = getOrCreateChart(state, 'chart-top-performers');
  if (!chart) return;

  var axis = getAxisStyle('pink');
  var tooltip = getTooltipStyle('pink');

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
    grid: { left: '3%', right: '8%', bottom: '3%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'value', min: 0, max: 5 }, axis),
    yAxis: Object.assign({ type: 'category', data: sorted.map(function (e) { return e.nama; }), inverse: false }, axis),
    series: [{
      type: 'bar',
      showBackground: true,
      backgroundStyle: {
        color: 'rgba(0, 0, 0, 0.06)',
        borderRadius: [0, 50, 50, 0]
      },
      data: sorted.map(function (e, i) {
        return {
          value: e.performance_score,
          itemStyle: {
            borderRadius: [0, 50, 50, 0],
            borderColor: '#000000',
            borderWidth: 2,
            color: e.performance_score >= 4.5 ? colors[2] : (e.performance_score >= 4 ? colors[0] : colors[1])
          }
        };
      }),
      barWidth: 22,
      label: {
        show: true,
        position: 'right',
        formatter: function (p) { return p.value.toFixed(1); },
        color: '#000000',
        fontSize: 10,
        fontFamily: 'KaioTRIAL',
        fontWeight: 700
      }
    }]
  });
}

function renderBellCurve(emps, colors) {
  var chart = getOrCreateChart(state, 'chart-bell-curve');
  if (!chart) return;

  var axis = getAxisStyle('cream');
  var tooltip = getTooltipStyle('cream');

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
      lineStyle: { width: 4, color: '#5B42FF' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(91, 66, 255, 0.45)' },
          { offset: 1, color: 'transparent' }
        ])
      },
      markLine: {
        silent: true,
        data: [
          { xAxis: '3.2', name: 'Mean', lineStyle: { color: '#000000', type: 'dashed', width: 2 }, label: { formatter: 'Mean ≈ 3.2', color: '#000000', fontSize: 10, fontWeight: 700 } }
        ]
      }
    }]
  });
}
