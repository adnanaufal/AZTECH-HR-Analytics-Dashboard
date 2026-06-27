// ==========================================
// HR Analytics Dashboard — Recruitment Charts (Mathical Neubrutalist)
// ==========================================
import { state } from '../state.js';
import { getChartColors, getAxisStyle, getTooltipStyle, getLegendStyle, isDark } from '../config.js';
import { fmtNum, fmtMonth, pctRaw, getOrCreateChart } from '../utils.js';

export function renderRecruitment(filteredRecruitment) {
  var recs = filteredRecruitment || state.DS.recruitment;
  var colors = getChartColors();

  renderFunnel(recs, colors);
  renderTimeToFill(recs, colors);
  renderRecruitSource(recs, colors);
  renderHiringTrend(colors);
  renderPipelineStatus(recs, colors);
  renderOfferAcceptance(recs, colors);
}

function renderFunnel(recs, colors) {
  var chart = getOrCreateChart(state, 'chart-funnel');
  if (!chart) return;

  var tooltip = getTooltipStyle('cream');

  var totalApplicants = 0, totalShortlisted = 0, totalInterviewed = 0, totalOffered = 0, totalHired = 0;
  recs.forEach(function (r) {
    totalApplicants += r.jumlah_pelamar;
    totalShortlisted += r.shortlisted;
    totalInterviewed += r.interviewed;
    totalOffered += r.offered;
    totalHired += r.hired;
  });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'item',
      formatter: function (p) { return p.name + ': <b>' + fmtNum(p.value) + '</b>'; }
    }),
    series: [{
      type: 'funnel',
      left: '15%',
      right: '25%',
      top: '5%',
      bottom: '5%',
      width: '60%',
      min: 0,
      max: totalApplicants,
      minSize: '10%',
      maxSize: '100%',
      sort: 'descending',
      gap: 6,
      label: {
        show: true,
        position: 'right',
        formatter: function (p) { return p.name + ': ' + fmtNum(p.value); },
        color: '#000000',
        fontSize: 11,
        fontWeight: 'bold',
        fontFamily: 'KaioTRIAL',
        lineHeight: 16
      },
      labelLine: {
        show: true,
        lineStyle: {
          color: '#000000',
          width: 2,
          type: 'dashed'
        }
      },
      itemStyle: {
        borderColor: '#000000',
        borderWidth: 2
      },
      emphasis: { label: { fontSize: 13, fontWeight: 'bold' } },
      data: [
        { value: totalApplicants, name: 'Pelamar', itemStyle: { color: colors[0] } },
        { value: totalShortlisted, name: 'Shortlisted', itemStyle: { color: colors[1] } },
        { value: totalInterviewed, name: 'Interview', itemStyle: { color: colors[3] } },
        { value: totalOffered, name: 'Offered', itemStyle: { color: colors[5] } },
        { value: totalHired, name: 'Hired', itemStyle: { color: colors[2] } }
      ]
    }]
  });
}

function renderTimeToFill(recs, colors) {
  var chart = getOrCreateChart(state, 'chart-time-to-fill');
  if (!chart) return;

  var axis = getAxisStyle('purple');
  var tooltip = getTooltipStyle('purple');

  var closedRecs = recs.filter(function (r) { return r.status === 'Closed' && r.time_to_fill_days; });
  var deptMap = {};
  closedRecs.forEach(function (r) {
    if (!deptMap[r.departemen]) deptMap[r.departemen] = { total: 0, count: 0 };
    deptMap[r.departemen].total += r.time_to_fill_days;
    deptMap[r.departemen].count++;
  });

  var depts = Object.keys(deptMap).sort(function (a, b) {
    return (deptMap[b].total / deptMap[b].count) - (deptMap[a].total / deptMap[a].count);
  });
  var vals = depts.map(function (d) { return Math.round(deptMap[d].total / deptMap[d].count); });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (p) {
        var dept = depts[p[0].dataIndex];
        return '<b>' + dept + '</b><br/>Avg Time-to-Fill: <b>' + p[0].value + ' hari</b><br/>(' + deptMap[dept].count + ' posisi)';
      }
    }),
    grid: { left: '3%', right: '8%', bottom: '3%', top: '4%', containLabel: true },
    xAxis: Object.assign({ type: 'value', name: 'Hari' }, axis),
    yAxis: Object.assign({ type: 'category', data: depts, inverse: true }, axis),
    series: [{
      type: 'bar',
      showBackground: true,
      backgroundStyle: {
        color: 'rgba(255, 255, 255, 0.1)',
        borderRadius: [0, 50, 50, 0]
      },
      data: vals.map(function (v, i) {
        return {
          value: v,
          itemStyle: {
            borderRadius: [0, 50, 50, 0],
            borderColor: '#000000',
            borderWidth: 2,
            color: v > 50 ? colors[1] : (v > 35 ? colors[3] : colors[2])
          }
        };
      }),
      barWidth: 22,
      label: {
        show: true,
        position: 'right',
        formatter: function (p) { return p.value + ' hari'; },
        color: '#ffffff',
        fontSize: 10,
        fontFamily: 'KaioTRIAL',
        fontWeight: 700
      }
    }]
  });
}

function renderRecruitSource(recs, colors) {
  var chart = getOrCreateChart(state, 'chart-recruit-source');
  if (!chart) return;

  var tooltip = getTooltipStyle('pink');
  var legend = getLegendStyle('pink');

  var sourceMap = {};
  recs.forEach(function (r) {
    sourceMap[r.sumber] = (sourceMap[r.sumber] || 0) + r.hired;
  });

  var data = Object.keys(sourceMap).map(function (s) {
    return { name: s, value: sourceMap[s] };
  }).sort(function (a, b) { return b.value - a.value; });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'item',
      formatter: function (p) { return p.name + '<br/><b>' + p.value + '</b> hired (' + p.percent.toFixed(1) + '%)'; }
    }),
    legend: Object.assign({}, legend, {
      orient: 'vertical',
      right: '5%',
      top: 'center'
    }),
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderColor: '#000000',
        borderWidth: 2
      },
      label: { show: false, position: 'center' },
      emphasis: {
        label: {
          show: true,
          fontSize: 12,
          fontWeight: 'bold',
          fontFamily: 'Outfit',
          formatter: '{b}\n{c} hired\n({d}%)',
          color: '#000000',
          lineHeight: 16
        },
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.15)' }
      },
      data: data.map(function (d, i) {
        return { name: d.name, value: d.value, itemStyle: { color: colors[i % colors.length] } };
      })
    }]
  });
}

function renderHiringTrend(colors) {
  var chart = getOrCreateChart(state, 'chart-hiring-trend');
  if (!chart) return;

  var axis = getAxisStyle('pink');
  var tooltip = getTooltipStyle('pink');

  var monthly = state.DS.monthly;
  var months = monthly.map(function (m) { return fmtMonth(m.bulan); });
  var hires = monthly.map(function (m) { return m.new_hires; });

  chart.setOption({
    tooltip: Object.assign({}, tooltip, {
      trigger: 'axis',
      formatter: function (p) { return '<b>' + p[0].axisValue + '</b><br/>New Hires: <b>' + p[0].value + '</b>'; }
    }),
    grid: { left: '3%', right: '4%', bottom: '12%', top: '6%', containLabel: true },
    xAxis: Object.assign({ type: 'category', data: months, axisLabel: { rotate: 45, fontSize: 9 } }, axis),
    yAxis: Object.assign({ type: 'value' }, axis),
    series: [{
      type: 'line',
      data: hires,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { width: 4, color: colors[0] },
      itemStyle: { color: colors[0], borderColor: '#000000', borderWidth: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colors[0] + '40' },
          { offset: 1, color: 'transparent' }
        ])
      }
    }]
  });
}

function renderPipelineStatus(recs, colors) {
  var chart = getOrCreateChart(state, 'chart-pipeline-status');
  if (!chart) return;

  var axis = getAxisStyle('cream');
  var tooltip = getTooltipStyle('cream');
  var legend = getLegendStyle('cream');

  var deptMap = {};
  recs.forEach(function (r) {
    if (!deptMap[r.departemen]) deptMap[r.departemen] = { Open: 0, Closed: 0, 'On Hold': 0 };
    deptMap[r.departemen][r.status]++;
  });

  var depts = Object.keys(deptMap).sort();

  chart.setOption({
    tooltip: Object.assign({}, tooltip, { trigger: 'axis', axisPointer: { type: 'shadow' } }),
    legend: Object.assign({}, legend, { data: ['Open', 'Closed', 'On Hold'], bottom: 0 }),
    grid: { left: '3%', right: '4%', bottom: '15%', top: '6%', containLabel: true },
    yAxis: Object.assign({ type: 'category', data: depts, inverse: true }, axis),
    xAxis: Object.assign({ type: 'value' }, axis),
    series: [
      {
        name: 'Open',
        type: 'bar',
        stack: 'total',
        data: depts.map(function (d) { return deptMap[d].Open; }),
        itemStyle: { color: colors[2], borderColor: '#000000', borderWidth: 2, borderRadius: [0, 0, 0, 0] }
      },
      {
        name: 'Closed',
        type: 'bar',
        stack: 'total',
        data: depts.map(function (d) { return deptMap[d].Closed; }),
        itemStyle: { color: colors[0], borderColor: '#000000', borderWidth: 2, borderRadius: [0, 0, 0, 0] }
      },
      {
        name: 'On Hold',
        type: 'bar',
        stack: 'total',
        data: depts.map(function (d) { return deptMap[d]['On Hold']; }),
        itemStyle: { color: colors[3], borderColor: '#000000', borderWidth: 2, borderRadius: [0, 50, 50, 0] }
      }
    ]
  });
}

function renderOfferAcceptance(recs, colors) {
  var chart = getOrCreateChart(state, 'chart-offer-acceptance');
  if (!chart) return;

  var tooltip = getTooltipStyle('cream');

  var totalOffered = 0, totalHired = 0;
  recs.forEach(function (r) {
    totalOffered += r.offered;
    totalHired += r.hired;
  });

  var rate = totalOffered > 0 ? Math.round((totalHired / totalOffered) * 1000) / 10 : 0;

  chart.setOption({
    tooltip: Object.assign({}, tooltip, { formatter: '{a} <br/>{b}: {c}%' }),
    series: [{
      name: 'Offer Acceptance',
      type: 'gauge',
      radius: '90%',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 10,
      progress: {
        show: true,
        width: 18,
        roundCap: true,
        itemStyle: {
          color: colors[0],
          borderColor: '#000000',
          borderWidth: 2
        }
      },
      pointer: { show: false },
      axisLine: { lineStyle: { width: 18, color: [[1, 'rgba(0, 0, 0, 0.08)']], borderColor: '#000000', borderWidth: 2 } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      title: {
        offsetCenter: [0, '30%'],
        fontSize: 10,
        fontFamily: 'KaioTRIAL',
        fontWeight: 700,
        color: '#000000'
      },
      detail: {
        valueAnimation: true,
        offsetCenter: [0, '-5%'],
        fontSize: 32,
        fontWeight: 900,
        fontFamily: 'Outfit',
        color: '#000000',
        formatter: '{value}%'
      },
      data: [{ value: rate, name: 'Offer Acceptance Rate' }]
    }]
  });
}
