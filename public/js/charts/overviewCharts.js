// ==========================================
// HR Analytics Dashboard — Overview Charts (Mathical Neubrutalist)
// ==========================================
import { state } from '../state.js';
import { getChartColors, getAxisStyle, getTooltipStyle, getLegendStyle, isDark } from '../config.js';
import { fmtNum, fmtMonth, getOrCreateChart, getAge } from '../utils.js';

export function renderOverviewCharts(filteredEmps) {
  var emps = filteredEmps || state.DS.employees.filter(function (e) { return e.status === 'Aktif'; });
  var colors = getChartColors();

  renderDeptDistribution(emps, colors);
  renderGenderDistribution(emps, colors);
  renderLevelDistribution(emps, colors);
  renderHeadcountTrend(colors);
  renderLocationDistribution(emps, colors);
  renderAgeDistribution(emps, colors);
}

function renderDeptDistribution(emps, colors) {
  var chart = getOrCreateChart(state, 'chart-dept-dist');
  if (!chart) return;

  var axis = getAxisStyle('cream');
  var tooltip = getTooltipStyle('cream');

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
    grid: { left: '3%', right: '8%', bottom: '3%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'value' }, axis),
    yAxis: Object.assign({ type: 'category', data: depts, inverse: true }, axis),
    series: [{
      type: 'bar',
      showBackground: true,
      backgroundStyle: {
        color: 'rgba(0, 0, 0, 0.06)',
        borderRadius: [0, 50, 50, 0]
      },
      data: vals.map(function (v, i) {
        return {
          value: v,
          itemStyle: {
            borderRadius: [0, 50, 50, 0],
            borderColor: '#000000',
            borderWidth: 2,
            color: colors[i % colors.length]
          }
        };
      }),
      barWidth: 24,
      label: {
        show: true,
        position: 'right',
        formatter: '{c} orang',
        color: '#000000',
        fontSize: 10,
        fontFamily: 'KaioTRIAL',
        fontWeight: 700
      }
    }]
  });
}

function renderGenderDistribution(emps, colors) {
  var chart = getOrCreateChart(state, 'chart-gender-dist');
  if (!chart) return;

  var tooltip = getTooltipStyle('pink');
  var legend = getLegendStyle('pink');

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
      radius: ['45%', '70%'],
      center: ['50%', '42%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderColor: '#000000',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: function (p) { return p.name + '\n' + p.percent.toFixed(1) + '%'; },
        color: '#000000',
        fontSize: 10,
        fontFamily: 'KaioTRIAL',
        fontWeight: 700
      },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' } },
      data: [
        { name: 'Laki-laki', value: gMap.L, itemStyle: { color: colors[0] } },
        { name: 'Perempuan', value: gMap.P, itemStyle: { color: colors[1] } }
      ]
    }]
  });
}

function renderLevelDistribution(emps, colors) {
  var chart = getOrCreateChart(state, 'chart-level-dist');
  if (!chart) return;

  var tooltip = getTooltipStyle('cream');
  var legend = getLegendStyle('cream');

  var levelOrder = ['Junior', 'Mid', 'Senior', 'Lead', 'Executive'];
  var levelMap = {};
  emps.forEach(function (e) { levelMap[e.level] = (levelMap[e.level] || 0) + 1; });

  var data = levelOrder.filter(function (l) { return levelMap[l]; }).map(function (l, i) {
    return {
      name: l,
      value: levelMap[l],
      itemStyle: { color: colors[i % colors.length] }
    };
  });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'item',
      formatter: function (p) { return p.name + '<br/><b>' + p.value + '</b> (' + p.percent.toFixed(1) + '%)'; }
    }),
    legend: Object.assign({}, legend, { bottom: 10 }),
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '42%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderColor: '#000000',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: function (p) { return p.name + '\n' + p.percent.toFixed(1) + '%'; },
        color: '#000000',
        fontSize: 10,
        fontFamily: 'KaioTRIAL',
        fontWeight: 700
      },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' } },
      data: data
    }]
  });
}

function renderHeadcountTrend(colors) {
  var chart = getOrCreateChart(state, 'chart-headcount-trend');
  if (!chart) return;

  var axis = getAxisStyle('purple');
  var tooltip = getTooltipStyle('purple');

  var monthly = state.DS.monthly;
  var months = monthly.map(function (m) { return fmtMonth(m.bulan); });
  var headcounts = monthly.map(function (m) { return m.total_karyawan; });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      formatter: function (p) { return '<b>' + p[0].axisValue + '</b><br/>Total Karyawan: <b>' + fmtNum(p[0].value) + '</b>'; }
    }),
    grid: { left: '3%', right: '4%', bottom: '12%', top: '6%', containLabel: true },
    xAxis: Object.assign({ type: 'category', data: months, boundaryGap: false, axisLabel: { rotate: 45, fontSize: 9 } }, axis),
    yAxis: Object.assign({ type: 'value' }, axis),
    series: [{
      type: 'line',
      data: headcounts,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { width: 4, color: '#ffffff' },
      itemStyle: { color: '#ffffff', borderColor: '#000000', borderWidth: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(255, 255, 255, 0.3)' },
          { offset: 1, color: 'transparent' }
        ])
      }
    }]
  });
}

function renderLocationDistribution(emps, colors) {
  var chart = getOrCreateChart(state, 'chart-location-dist');
  if (!chart) return;

  var axis = getAxisStyle('cream');
  var tooltip = getTooltipStyle('cream');

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
    grid: { left: '3%', right: '4%', bottom: '3%', top: '6%', containLabel: true },
    xAxis: Object.assign({ type: 'category', data: locs }, axis),
    yAxis: Object.assign({ type: 'value' }, axis),
    series: [{
      type: 'bar',
      showBackground: true,
      backgroundStyle: {
        color: 'rgba(0, 0, 0, 0.06)',
        borderRadius: [50, 50, 0, 0]
      },
      data: vals.map(function (v, i) {
        return {
          value: v,
          itemStyle: {
            borderRadius: [50, 50, 0, 0],
            borderColor: '#000000',
            borderWidth: 2,
            color: colors[i % colors.length]
          }
        };
      }),
      barWidth: 24
    }]
  });
}

function renderAgeDistribution(emps, colors) {
  var chart = getOrCreateChart(state, 'chart-age-dist');
  if (!chart) return;

  var axis = getAxisStyle('pink');
  var tooltip = getTooltipStyle('pink');

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
    grid: { left: '3%', right: '4%', bottom: '3%', top: '6%', containLabel: true },
    xAxis: Object.assign({ type: 'category', data: buckets.map(function (b) { return b.label; }) }, axis),
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
            color: colors[i % colors.length]
          }
        };
      }),
      barWidth: 24
    }]
  });
}
