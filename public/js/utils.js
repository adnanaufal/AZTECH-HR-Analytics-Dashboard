// ==========================================
// HR Analytics Dashboard — Utility Helpers
// ==========================================

/** Safe string extraction */
export function str(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object' && v.value !== undefined) return String(v.value);
  return String(v).trim();
}

/** Safe number extraction */
export function num(v) {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'object' && v.value !== undefined) v = v.value;
  var n = Number(v);
  return isNaN(n) ? 0 : n;
}

/** Format number with dot separator: 1234567 → "1.234.567" */
export function fmtNum(n) {
  if (n === null || n === undefined) return '0';
  return Math.round(n).toLocaleString('id-ID');
}

/** Format currency Rupiah: 8500000 → "Rp 8.500.000" */
export function rp(n) {
  if (n === null || n === undefined) return 'Rp 0';
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

/** Format percentage: 0.1234 → "12.3%" */
export function pct(n, decimals) {
  if (decimals === undefined) decimals = 1;
  return (n * 100).toFixed(decimals) + '%';
}

/** Format a raw percentage value: 12.34 → "12.3%" */
export function pctRaw(n, decimals) {
  if (decimals === undefined) decimals = 1;
  return Number(n).toFixed(decimals) + '%';
}

/** Get age from birth date */
export function getAge(birthDate) {
  var today = new Date('2026-06-27');
  var birth = new Date(birthDate);
  var age = today.getFullYear() - birth.getFullYear();
  var m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/** Get tenure in months */
export function getTenureMonths(startDate, endDate) {
  var start = new Date(startDate);
  var end = endDate ? new Date(endDate) : new Date('2026-06-27');
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

/** Format months to readable: 26 → "2 thn 2 bln" */
export function fmtTenure(months) {
  var y = Math.floor(months / 12);
  var m = months % 12;
  if (y > 0 && m > 0) return y + ' thn ' + m + ' bln';
  if (y > 0) return y + ' thn';
  return m + ' bln';
}

/** Short date format: "2024-03-15" → "15 Mar 2024" */
export function fmtDate(dateStr) {
  if (!dateStr) return '-';
  var d = new Date(dateStr);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

/** Month label: "2024-03" → "Mar 2024" */
export function fmtMonth(ym) {
  if (!ym) return '';
  var parts = ym.split('-');
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  return months[parseInt(parts[1]) - 1] + ' ' + parts[0];
}

/** Initialize or get ECharts instance */
export function getOrCreateChart(state, containerId) {
  var container = document.getElementById(containerId);
  if (!container) return null;
  if (state.charts[containerId]) {
    state.charts[containerId].dispose();
  }
  var chart = echarts.init(container);
  state.charts[containerId] = chart;
  return chart;
}
