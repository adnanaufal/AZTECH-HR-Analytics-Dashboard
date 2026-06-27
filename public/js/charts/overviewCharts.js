// ==========================================
// HR Analytics Dashboard — Overview Charts
// ==========================================
import { state } from '../state.js';
import { getChartColors, getAxisStyle, getTooltipStyle, getLegendStyle, isDark } from '../config.js';
import { fmtNum, fmtMonth, getOrCreateChart, getAge } from '../utils.js';

export function renderOverviewCharts(filteredEmps) {
  var emps = filteredEmps || state.DS.employees.filter(function (e) { return e.status === 'Aktif'; });
  var colors = getChartColors();
  var axis = getAxisStyle();
  var tooltip = getTooltipStyle();
  var legend = getLegendStyle();

  renderDeptDistribution(emps, colors, axis, tooltip);
  renderGenderDistribution(emps, colors, tooltip, legend);
  renderLevelDistribution(emps, colors, tooltip, legend);
  renderHeadcountTrend(colors, axis, tooltip);
  renderLocationDistribution(emps, colors, axis, tooltip);
  renderAgeDistribution(emps, colors, axis, tooltip);
}

function renderDeptDistribution(emps, colors, axis, tooltip) {
  var chart = getOrCreateChart(state, 'chart-dept-dist');
  if (!chart) return;

  var deptMap = {};
  emps.forEach(function (e) {
    deptMap[e.departemen] = (deptMap[e.departemen] || 0) + 1;
  });

  var depts = Object.keys(deptMap).sort(function (a, b) { return deptMap[b] - deptMap[a]; });
  var vals = depts.map(function (d) { return deptMap[d]; });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (p) { return p[0].name + '<br/>Karyawan: <b>' + fmtNum(p[0].value) + '</b>'; }
    }),
    grid: { left: '3%', right: '6%', bottom: '3%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'value' }, axis),
    yAxis: Object.assign({ type: 'category', data: depts, inverse: true }, axis),
    series: [{
      type: 'bar',
      data: vals.map(function (v, i) {
        return {
          value: v,
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: colors[i % colors.length] },
              { offset: 1, color: colors[(i + 1) % colors.length] }
            ])
          }
        };
      }),
      barWidth: '55%',
      label: {
        show: true,
        position: 'right',
        formatter: '{c} orang',
        color: isDark() ? '#94a3b8' : '#64748b',
        fontSize: 10,
        fontFamily: 'Inter'
      }
    }]
  });
}

function renderGenderDistribution(emps, colors, tooltip, legend) {
  var chart = getOrCreateChart(state, 'chart-gender-dist');
  if (!chart) return;

  var gMap = { L: 0, P: 0 };
  emps.forEach(function (e) { gMap[e.gender]++; });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'item',
      formatter: function (p) { return p.name + '<br/><b>' + p.value + '</b> (' + p.percent.toFixed(1) + '%)'; }
    }),
    legend: Object.assign({}, legend, { bottom: 10, data: ['Laki-laki', 'Perempuan'] }),
    series: [{
      type: 'pie',
      radius: ['48%', '75%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      label: {
        show: true,
        formatter: function (p) { return p.name + '\n' + p.percent.toFixed(1) + '%'; },
        color: isDark() ? '#94a3b8' : '#64748b',
        fontSize: 11,
        fontFamily: 'Inter'
      },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' } },
      data: [
        { name: 'Laki-laki', value: gMap.L, itemStyle: { color: colors[0] } },
        { name: 'Perempuan', value: gMap.P, itemStyle: { color: colors[4] } }
      ]
    }]
  });
}

function renderLevelDistribution(emps, colors, tooltip, legend) {
  var chart = getOrCreateChart(state, 'chart-level-dist');
  if (!chart) return;

  var levelOrder = ['Junior', 'Mid', 'Senior', 'Lead', 'Executive'];
  var levelMap = {};
  emps.forEach(function (e) { levelMap[e.level] = (levelMap[e.level] || 0) + 1; });

  var data = levelOrder.filter(function (l) { return levelMap[l]; }).map(function (l, i) {
    return { name: l, value: levelMap[l], itemStyle: { color: colors[i % colors.length] } };
  });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'item',
      formatter: function (p) { return p.name + '<br/><b>' + p.value + '</b> (' + p.percent.toFixed(1) + '%)'; }
    }),
    legend: Object.assign({}, legend, { bottom: 10 }),
    series: [{
      type: 'pie',
      radius: ['48%', '75%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      label: {
        show: true,
        formatter: function (p) { return p.name + '\n' + p.percent.toFixed(1) + '%'; },
        color: isDark() ? '#94a3b8' : '#64748b',
        fontSize: 11,
        fontFamily: 'Inter'
      },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' } },
      data: data
    }]
  });
}

function renderHeadcountTrend(colors, axis, tooltip) {
  var chart = getOrCreateChart(state, 'chart-headcount-trend');
  if (!chart) return;

  var monthly = state.DS.monthly;
  var months = monthly.map(function (m) { return fmtMonth(m.bulan); });
  var headcounts = monthly.map(function (m) { return m.total_karyawan; });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      formatter: function (p) { return '<b>' + p[0].axisValue + '</b><br/>Total Karyawan: <b>' + fmtNum(p[0].value) + '</b>'; }
    }),
    grid: { left: '3%', right: '4%', bottom: '8%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'category', data: months, boundaryGap: false, axisLabel: { rotate: 45, fontSize: 9 } }, axis),
    yAxis: Object.assign({ type: 'value' }, axis),
    series: [{
      type: 'line',
      data: headcounts,
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: { width: 3, color: colors[0] },
      itemStyle: { color: colors[0] },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colors[0] + '40' },
          { offset: 1, color: 'transparent' }
        ])
      }
    }]
  });
}

function renderLocationDistribution(emps, colors, axis, tooltip) {
  var chart = getOrCreateChart(state, 'chart-location-dist');
  if (!chart) return;

  var locMap = {};
  emps.forEach(function (e) { locMap[e.lokasi] = (locMap[e.lokasi] || 0) + 1; });

  var locs = Object.keys(locMap).sort(function (a, b) { return locMap[b] - locMap[a]; });
  var vals = locs.map(function (l) { return locMap[l]; });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (p) { return p[0].name + '<br/>Karyawan: <b>' + fmtNum(p[0].value) + '</b>'; }
    }),
    grid: { left: '3%', right: '4%', bottom: '3%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'category', data: locs }, axis),
    yAxis: Object.assign({ type: 'value' }, axis),
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

function renderAgeDistribution(emps, colors, axis, tooltip) {
  var chart = getOrCreateChart(state, 'chart-age-dist');
  if (!chart) return;

  var buckets = [
    { label: '< 25', min: 0, max: 25 },
    { label: '25-30', min: 25, max: 31 },
    { label: '31-35', min: 31, max: 36 },
    { label: '36-40', min: 36, max: 41 },
    { label: '41-45', min: 41, max: 46 },
    { label: '46-50', min: 46, max: 51 },
    { label: '> 50', min: 51, max: 100 }
  ];

  var counts = buckets.map(function () { return 0; });
  emps.forEach(function (e) {
    var age = getAge(e.tanggal_lahir);
    for (var i = 0; i < buckets.length; i++) {
      if (age >= buckets[i].min && age < buckets[i].max) {
        counts[i]++;
        break;
      }
    }
  });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (p) { return 'Usia: ' + p[0].name + '<br/>Karyawan: <b>' + p[0].value + '</b>'; }
    }),
    grid: { left: '3%', right: '4%', bottom: '3%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'category', data: buckets.map(function (b) { return b.label; }) }, axis),
    yAxis: Object.assign({ type: 'value' }, axis),
    series: [{
      type: 'bar',
      data: counts.map(function (c, i) {
        return {
          value: c,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colors[0] },
              { offset: 1, color: colors[1] }
            ])
          }
        };
      }),
      barWidth: '55%'
    }]
  });
}
