// ==========================================
// HR Analytics Dashboard — Compensation Charts
// ==========================================
import { state } from '../state.js';
import { getChartColors, getAxisStyle, getTooltipStyle, getLegendStyle, isDark } from '../config.js';
import { fmtNum, rp, getOrCreateChart } from '../utils.js';

export function renderCompensation(filteredEmps) {
  var emps = filteredEmps || state.DS.employees.filter(function (e) { return e.status === 'Aktif'; });
  var colors = getChartColors();
  var axis = getAxisStyle();
  var tooltip = getTooltipStyle();
  var legend = getLegendStyle();

  renderAvgSalaryByDept(emps, colors, axis, tooltip);
  renderCompDistribution(emps, colors, axis, tooltip);
  renderCompComposition(emps, colors, axis, tooltip, legend);
  renderCompByLevel(emps, colors, axis, tooltip, legend);
  renderGenderPayGap(emps, colors, axis, tooltip, legend);
  renderTopCompensation(emps, colors, axis, tooltip);
}

function renderAvgSalaryByDept(emps, colors, axis, tooltip) {
  var chart = getOrCreateChart(state, 'chart-avg-salary-dept');
  if (!chart) return;

  var deptMap = {};
  emps.forEach(function (e) {
    if (!deptMap[e.departemen]) deptMap[e.departemen] = { total: 0, count: 0 };
    deptMap[e.departemen].total += e.gaji_pokok;
    deptMap[e.departemen].count++;
  });

  var depts = Object.keys(deptMap).sort(function (a, b) {
    return (deptMap[b].total / deptMap[b].count) - (deptMap[a].total / deptMap[a].count);
  });
  var vals = depts.map(function (d) { return Math.round(deptMap[d].total / deptMap[d].count); });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (p) { return p[0].name + '<br/>Avg Gaji: <b>' + rp(p[0].value) + '</b>'; }
    }),
    grid: { left: '3%', right: '6%', bottom: '3%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'value', axisLabel: { formatter: function (v) { return 'Rp ' + (v / 1000000).toFixed(0) + 'jt'; } } }, axis),
    yAxis: Object.assign({ type: 'category', data: depts, inverse: true }, axis),
    series: [{
      type: 'bar',
      data: vals,
      barWidth: '55%',
      itemStyle: {
        borderRadius: [0, 6, 6, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: colors[0] },
          { offset: 1, color: colors[1] }
        ])
      },
      label: {
        show: true,
        position: 'right',
        formatter: function (p) { return rp(p.value); },
        color: isDark() ? '#94a3b8' : '#64748b',
        fontSize: 10,
        fontFamily: 'Inter'
      }
    }]
  });
}

function renderCompDistribution(emps, colors, axis, tooltip) {
  var chart = getOrCreateChart(state, 'chart-comp-distribution');
  if (!chart) return;

  // Create histogram buckets
  var buckets = [
    { label: '< 10jt', min: 0, max: 10000000 },
    { label: '10-20jt', min: 10000000, max: 20000000 },
    { label: '20-30jt', min: 20000000, max: 30000000 },
    { label: '30-50jt', min: 30000000, max: 50000000 },
    { label: '50-75jt', min: 50000000, max: 75000000 },
    { label: '75-100jt', min: 75000000, max: 100000000 },
    { label: '> 100jt', min: 100000000, max: Infinity }
  ];

  var counts = buckets.map(function () { return 0; });
  emps.forEach(function (e) {
    for (var i = 0; i < buckets.length; i++) {
      if (e.total_kompensasi >= buckets[i].min && e.total_kompensasi < buckets[i].max) {
        counts[i]++;
        break;
      }
    }
  });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    }),
    grid: { left: '3%', right: '4%', bottom: '3%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'category', data: buckets.map(function (b) { return b.label; }) }, axis),
    yAxis: Object.assign({ type: 'value' }, axis),
    series: [{
      type: 'bar',
      data: counts,
      barWidth: '60%',
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: function (params) { return colors[params.dataIndex % colors.length]; }
      }
    }]
  });
}

function renderCompComposition(emps, colors, axis, tooltip, legend) {
  var chart = getOrCreateChart(state, 'chart-comp-composition');
  if (!chart) return;

  var deptMap = {};
  emps.forEach(function (e) {
    if (!deptMap[e.departemen]) deptMap[e.departemen] = { gaji: 0, tunjangan: 0, bonus: 0, count: 0 };
    deptMap[e.departemen].gaji += e.gaji_pokok;
    deptMap[e.departemen].tunjangan += e.tunjangan_transport + e.tunjangan_makan + e.tunjangan_kesehatan;
    deptMap[e.departemen].bonus += e.bonus_tahunan;
    deptMap[e.departemen].count++;
  });

  var depts = Object.keys(deptMap).sort();

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (p) {
        var s = '<b>' + p[0].axisValue + '</b><br/>';
        p.forEach(function (item) {
          s += item.marker + ' ' + item.seriesName + ': <b>' + rp(item.value) + '</b><br/>';
        });
        return s;
      }
    }),
    legend: Object.assign({}, legend, { data: ['Gaji Pokok', 'Tunjangan', 'Bonus Tahunan'], bottom: 0 }),
    grid: { left: '3%', right: '4%', bottom: '14%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'category', data: depts, axisLabel: { rotate: 30 } }, axis),
    yAxis: Object.assign({ type: 'value', axisLabel: { formatter: function (v) { return (v / 1000000).toFixed(0) + 'jt'; } } }, axis),
    series: [
      {
        name: 'Gaji Pokok',
        type: 'bar',
        stack: 'total',
        data: depts.map(function (d) { return Math.round(deptMap[d].gaji / deptMap[d].count); }),
        itemStyle: { color: colors[0], borderRadius: [0, 0, 0, 0] }
      },
      {
        name: 'Tunjangan',
        type: 'bar',
        stack: 'total',
        data: depts.map(function (d) { return Math.round(deptMap[d].tunjangan / deptMap[d].count); }),
        itemStyle: { color: colors[1] }
      },
      {
        name: 'Bonus Tahunan',
        type: 'bar',
        stack: 'total',
        data: depts.map(function (d) { return Math.round(deptMap[d].bonus / deptMap[d].count); }),
        itemStyle: { color: colors[3], borderRadius: [6, 6, 0, 0] }
      }
    ]
  });
}

function renderCompByLevel(emps, colors, axis, tooltip, legend) {
  var chart = getOrCreateChart(state, 'chart-comp-level');
  if (!chart) return;

  var levelOrder = ['Junior', 'Mid', 'Senior', 'Lead', 'Executive'];
  var levelMap = {};
  emps.forEach(function (e) {
    if (!levelMap[e.level]) levelMap[e.level] = { total: 0, count: 0 };
    levelMap[e.level].total += e.total_kompensasi;
    levelMap[e.level].count++;
  });

  var levels = levelOrder.filter(function (l) { return levelMap[l]; });
  var vals = levels.map(function (l) { return Math.round(levelMap[l].total / levelMap[l].count); });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (p) { return p[0].name + '<br/>Avg Total: <b>' + rp(p[0].value) + '</b><br/>(' + (levelMap[p[0].name] ? levelMap[p[0].name].count : 0) + ' orang)'; }
    }),
    grid: { left: '3%', right: '4%', bottom: '3%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'category', data: levels }, axis),
    yAxis: Object.assign({ type: 'value', axisLabel: { formatter: function (v) { return (v / 1000000).toFixed(0) + 'jt'; } } }, axis),
    series: [{
      type: 'bar',
      data: vals.map(function (v, i) {
        return {
          value: v,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colors[i % colors.length] },
              { offset: 1, color: colors[(i + 1) % colors.length] }
            ])
          }
        };
      }),
      barWidth: '50%'
    }]
  });
}

function renderGenderPayGap(emps, colors, axis, tooltip, legend) {
  var chart = getOrCreateChart(state, 'chart-gender-pay');
  if (!chart) return;

  var deptGender = {};
  emps.forEach(function (e) {
    if (!deptGender[e.departemen]) deptGender[e.departemen] = { L: { total: 0, count: 0 }, P: { total: 0, count: 0 } };
    deptGender[e.departemen][e.gender].total += e.total_kompensasi;
    deptGender[e.departemen][e.gender].count++;
  });

  var depts = Object.keys(deptGender).sort();

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (p) {
        var s = '<b>' + p[0].axisValue + '</b><br/>';
        p.forEach(function (item) {
          s += item.marker + ' ' + item.seriesName + ': <b>' + rp(item.value) + '</b><br/>';
        });
        return s;
      }
    }),
    legend: Object.assign({}, legend, { data: ['Laki-laki', 'Perempuan'], bottom: 0 }),
    grid: { left: '3%', right: '4%', bottom: '14%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'category', data: depts, axisLabel: { rotate: 30 } }, axis),
    yAxis: Object.assign({ type: 'value', axisLabel: { formatter: function (v) { return (v / 1000000).toFixed(0) + 'jt'; } } }, axis),
    series: [
      {
        name: 'Laki-laki',
        type: 'bar',
        data: depts.map(function (d) {
          var g = deptGender[d].L;
          return g.count > 0 ? Math.round(g.total / g.count) : 0;
        }),
        itemStyle: { color: colors[0], borderRadius: [6, 6, 0, 0] },
        barGap: '10%'
      },
      {
        name: 'Perempuan',
        type: 'bar',
        data: depts.map(function (d) {
          var g = deptGender[d].P;
          return g.count > 0 ? Math.round(g.total / g.count) : 0;
        }),
        itemStyle: { color: colors[4], borderRadius: [6, 6, 0, 0] }
      }
    ]
  });
}

function renderTopCompensation(emps, colors, axis, tooltip) {
  var chart = getOrCreateChart(state, 'chart-top-comp');
  if (!chart) return;

  var sorted = emps.slice().sort(function (a, b) { return b.total_kompensasi - a.total_kompensasi; }).slice(0, 10);
  sorted.reverse();

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (p) {
        var emp = sorted[p[0].dataIndex];
        return '<b>' + p[0].name + '</b><br/>' +
          emp.jabatan + ' — ' + emp.departemen + '<br/>' +
          'Total: <b>' + rp(p[0].value) + '</b>';
      }
    }),
    grid: { left: '3%', right: '8%', bottom: '3%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'value', axisLabel: { formatter: function (v) { return (v / 1000000).toFixed(0) + 'jt'; } } }, axis),
    yAxis: Object.assign({ type: 'category', data: sorted.map(function (e) { return e.nama; }), inverse: false }, axis),
    series: [{
      type: 'bar',
      data: sorted.map(function (e, i) {
        return {
          value: e.total_kompensasi,
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: colors[0] },
              { offset: 1, color: colors[3] }
            ])
          }
        };
      }),
      barWidth: '55%',
      label: {
        show: true,
        position: 'right',
        formatter: function (p) { return rp(p.value); },
        color: isDark() ? '#94a3b8' : '#64748b',
        fontSize: 10,
        fontFamily: 'Inter'
      }
    }]
  });
}
