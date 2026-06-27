// ==========================================
// HR Analytics Dashboard — Main Entry Point
// AZ Tech
// ==========================================
import { state } from './state.js';
import { fmtNum, rp, pctRaw } from './utils.js';
import { isDark } from './config.js';
import { generateAllData } from './dummyData.js';
import { setupFilters } from './filters.js';

// Charts
import { renderOverviewCharts } from './charts/overviewCharts.js';
import { renderCompensation } from './charts/compensationCharts.js';
import { renderTurnover } from './charts/turnoverCharts.js';
import { renderRecruitment } from './charts/recruitmentCharts.js';
import { renderPerformance } from './charts/performanceCharts.js';
import { renderTable } from './components/dataTable.js';

var activeTab = 'overview';

// ═══════════════════════════════════════════════════
// THEME HELPER
// ═══════════════════════════════════════════════════
function localSetTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('hr-dashboard-theme', theme);
  var icon = document.getElementById('theme-icon');
  if (icon) icon.innerHTML = theme === 'dark' ? '&#9788;' : '&#9790;';
  // Re-render active tab for theme-aware charts
  Object.values(state.charts).forEach(function (c) { if (c) c.dispose(); });
  state.charts = {};
  renderActiveTab();
}

// ═══════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════
function init() {
  var loadEl = document.getElementById('loading-state');
  var errEl = document.getElementById('error-state');
  var subEl = document.getElementById('loading-sub');

  try {
    loadEl.style.display = 'flex';
    errEl.style.display = 'none';

    subEl.textContent = 'Generating HR data...';

    // Generate dummy data
    var data = generateAllData();
    state.DS.employees = data.employees;
    state.DS.recruitment = data.recruitment;
    state.DS.monthly = data.monthly;

    subEl.textContent = 'Mempersiapkan dashboard...';

    // Restore theme
    var savedTheme = localStorage.getItem('hr-dashboard-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    var icon = document.getElementById('theme-icon');
    if (icon) icon.innerHTML = savedTheme === 'dark' ? '&#9788;' : '&#9790;';

    renderKPIs();
    setupFilters();

    loadEl.style.display = 'none';
    document.getElementById('kpi-row').style.display = 'flex';
    document.getElementById('tab-nav').classList.add('visible');

    // Initialize Lucide icons
    if (window.lucide) window.lucide.createIcons();

    renderActiveTab();
    updateNavButtons();

    // GSAP entrance animations
    runEntranceAnimations();

  } catch (err) {
    console.error('[Dashboard]', err);
    loadEl.style.display = 'none';
    errEl.style.display = 'flex';
    document.getElementById('error-title').textContent = 'Gagal Memuat Data';
    document.getElementById('error-desc').textContent = err.message;
  }
}

// ═══════════════════════════════════════════════════
// KPIs with CountUp
// ═══════════════════════════════════════════════════
function renderKPIs() {
  var emps = state.DS.employees;
  var monthly = state.DS.monthly;
  var recs = state.DS.recruitment;

  var activeEmps = emps.filter(function (e) { return e.status === 'Aktif'; });

  // KPI 1: Total Karyawan Aktif
  var totalActive = activeEmps.length;

  // KPI 2: Avg Kompensasi
  var totalComp = 0;
  activeEmps.forEach(function (e) { totalComp += e.total_kompensasi; });
  var avgComp = activeEmps.length > 0 ? Math.round(totalComp / activeEmps.length) : 0;

  // KPI 3: Turnover Rate YTD (2026)
  var ytd2026 = monthly.filter(function (m) { return m.bulan.startsWith('2026'); });
  var totalTermYtd = 0;
  ytd2026.forEach(function (m) { totalTermYtd += m.terminations; });
  var avgHeadcountYtd = 0;
  ytd2026.forEach(function (m) { avgHeadcountYtd += m.total_karyawan; });
  avgHeadcountYtd = ytd2026.length > 0 ? avgHeadcountYtd / ytd2026.length : 1;
  var turnoverRateYtd = Math.round((totalTermYtd / avgHeadcountYtd) * 1000) / 10;

  // KPI 4: Avg Time-to-Fill
  var closedRecs = recs.filter(function (r) { return r.status === 'Closed' && r.time_to_fill_days; });
  var totalTTF = 0;
  closedRecs.forEach(function (r) { totalTTF += r.time_to_fill_days; });
  var avgTTF = closedRecs.length > 0 ? Math.round(totalTTF / closedRecs.length) : 0;

  function animateKPI(id, val, formatFn, options) {
    var el = document.getElementById(id);
    if (!el) return;
    if (window.countUp && window.countUp.CountUp) {
      var opt = Object.assign({ duration: 1.8, separator: '.', useGrouping: true }, options || {});
      if (formatFn) opt.formattingFn = formatFn;
      new window.countUp.CountUp(id, val, opt).start();
    } else {
      el.textContent = formatFn ? formatFn(val) : fmtNum(val);
    }
  }

  // 1. Active employees
  animateKPI('kpi-active', totalActive);
  var deptCount = new Set(activeEmps.map(function (e) { return e.departemen; })).size;
  document.getElementById('kpi-active-sub').textContent = deptCount + ' departemen • ' + new Set(activeEmps.map(function (e) { return e.lokasi; })).size + ' lokasi';

  // 2. Avg compensation
  animateKPI('kpi-avg-comp', avgComp, rp);
  document.getElementById('kpi-avg-comp-sub').textContent = 'Per karyawan (gaji + tunjangan + bonus)';

  // 3. Turnover rate
  animateKPI('kpi-turnover', turnoverRateYtd, function (n) { return n.toFixed(1) + '%'; }, { decimalPlaces: 1, decimal: '.' });
  document.getElementById('kpi-turnover-sub').textContent = 'Year-to-Date 2026 (' + totalTermYtd + ' karyawan keluar)';

  // 4. Avg time-to-fill
  animateKPI('kpi-ttf', avgTTF, function (n) { return Math.round(n) + ' hari'; });
  document.getElementById('kpi-ttf-sub').textContent = 'Dari ' + closedRecs.length + ' posisi closed';
}

// ═══════════════════════════════════════════════════
// GSAP ENTRANCE ANIMATIONS
// ═══════════════════════════════════════════════════
function runEntranceAnimations() {
  if (!window.gsap) return;

  // KPI cards row & global filters
  gsap.from(['#kpi-row', '#global-filter-wrapper'], {
    y: 30, opacity: 0, duration: 0.6,
    stagger: 0.08,
    ease: 'power3.out', delay: 0.1
  });

  // Tab nav
  gsap.from('#tab-nav', {
    y: 20, opacity: 0, duration: 0.5,
    ease: 'power2.out', delay: 0.4
  });

  // Cards entrance animation for active tab (overview)
  var cards = document.querySelectorAll('#tab-overview .card');
  if (cards.length > 0) {
    gsap.from(cards, {
      y: 30, opacity: 0, duration: 0.5, stagger: 0.06,
      ease: 'power3.out', delay: 0.3,
      onComplete: function () {
        gsap.set(cards, { clearProps: 'opacity,transform' });
      }
    });
  }
}

// ═══════════════════════════════════════════════════
// FILTER HELPERS
// ═══════════════════════════════════════════════════
function getFilteredEmployees(prefix) {
  var emps = state.DS.employees.filter(function (e) { return e.status === 'Aktif'; });

  var deptEl = document.getElementById('filter-dept-' + prefix);
  if (deptEl && deptEl.value) {
    var dept = deptEl.value;
    emps = emps.filter(function (e) { return e.departemen === dept; });
  }

  var levelEl = document.getElementById('filter-level-' + prefix);
  if (levelEl && levelEl.value) {
    var level = levelEl.value;
    emps = emps.filter(function (e) { return e.level === level; });
  }

  var lokasiEl = document.getElementById('filter-lokasi-' + prefix);
  if (lokasiEl && lokasiEl.value) {
    var lokasi = lokasiEl.value;
    emps = emps.filter(function (e) { return e.lokasi === lokasi; });
  }

  return emps;
}

function getFilteredTurnoverEmployees() {
  var emps = state.DS.employees;

  var deptEl = document.getElementById('filter-dept-turnover');
  if (deptEl && deptEl.value) {
    var dept = deptEl.value;
    emps = emps.filter(function (e) { return e.departemen === dept; });
  }

  var alasanEl = document.getElementById('filter-alasan-turnover');
  if (alasanEl && alasanEl.value) {
    var alasan = alasanEl.value;
    emps = emps.filter(function (e) { return e.alasan_keluar === alasan || e.status === 'Aktif'; });
  }

  return emps;
}

function getFilteredRecruitment() {
  var recs = state.DS.recruitment;

  var deptEl = document.getElementById('filter-dept-recruit');
  if (deptEl && deptEl.value) {
    var dept = deptEl.value;
    recs = recs.filter(function (r) { return r.departemen === dept; });
  }

  var sumberEl = document.getElementById('filter-sumber-recruit');
  if (sumberEl && sumberEl.value) {
    var sumber = sumberEl.value;
    recs = recs.filter(function (r) { return r.sumber === sumber; });
  }

  var statusEl = document.getElementById('filter-status-recruit');
  if (statusEl && statusEl.value) {
    var status = statusEl.value;
    recs = recs.filter(function (r) { return r.status === status; });
  }

  return recs;
}

// ═══════════════════════════════════════════════════
// TABS & ROUTING
// ═══════════════════════════════════════════════════
function renderActiveTab() {
  if (activeTab === 'overview') renderOverviewCharts(getFilteredEmployees('overview'));
  else if (activeTab === 'compensation') renderCompensation(getFilteredEmployees('comp'));
  else if (activeTab === 'turnover') renderTurnover(getFilteredTurnoverEmployees());
  else if (activeTab === 'recruitment') renderRecruitment(getFilteredRecruitment());
  else if (activeTab === 'performance') renderPerformance(getFilteredEmployees('perf'));
  else if (activeTab === 'table') renderTable();
}

var TABS_LIST = ['overview', 'compensation', 'turnover', 'recruitment', 'performance', 'table'];

function updateNavButtons() {
  var prevBtn = document.getElementById('btn-nav-prev');
  var nextBtn = document.getElementById('btn-nav-next');
  if (!prevBtn || !nextBtn) return;

  var idx = TABS_LIST.indexOf(activeTab);
  prevBtn.disabled = (idx <= 0);
  nextBtn.disabled = (idx >= TABS_LIST.length - 1);
}

function switchTab(tabId) {
  var tabBtn = document.querySelector('.tab[data-tab="' + tabId + '"]');
  if (!tabBtn) return;

  document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
  tabBtn.classList.add('active');
  activeTab = tabId;

  document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
  var panel = document.getElementById('tab-' + activeTab);
  if (panel) panel.classList.add('active');

  // Switch filter bar visibility
  document.querySelectorAll('#global-filter-wrapper .filter-bar').forEach(function (fb) {
    fb.classList.remove('active');
  });
  var activeFb = document.getElementById('fb-' + activeTab);
  if (activeFb) activeFb.classList.add('active');

  // Scroll main container to top on tab switch
  var mainCont = document.querySelector('.main-container');
  if (mainCont) mainCont.scrollTop = 0;

  renderActiveTab();
  updateNavButtons();

  // Re-trigger GSAP for newly visible cards
  if (window.gsap) {
    var cards = document.querySelectorAll('#tab-' + activeTab + ' .card');
    if (cards.length > 0) {
      gsap.killTweensOf(cards);
      gsap.set(cards, { clearProps: 'all' });
      gsap.from(cards, {
        y: 30, opacity: 0, duration: 0.5, stagger: 0.06,
        ease: 'power3.out',
        onComplete: function () {
          gsap.set(cards, { clearProps: 'opacity,transform' });
        }
      });
    }
  }
}

function setupTabs() {
  document.querySelectorAll('.tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var tabId = this.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
}

// ═══════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  init();
  setupTabs();

  // Floating tab navigation
  var prevBtn = document.getElementById('btn-nav-prev');
  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      var idx = TABS_LIST.indexOf(activeTab);
      if (idx > 0) {
        switchTab(TABS_LIST[idx - 1]);
      }
    });
  }

  var nextBtn = document.getElementById('btn-nav-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      var idx = TABS_LIST.indexOf(activeTab);
      if (idx < TABS_LIST.length - 1) {
        switchTab(TABS_LIST[idx + 1]);
      }
    });
  }

  // Theme toggle
  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () { localSetTheme(isDark() ? 'light' : 'dark'); });
  }

  // Retry button
  var btnRetry = document.getElementById('btn-retry');
  if (btnRetry) btnRetry.addEventListener('click', function () { init(); });

  // ── Overview filters ──
  ['filter-dept-overview', 'filter-lokasi-overview'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', function () { if (activeTab === 'overview') renderOverviewCharts(getFilteredEmployees('overview')); });
  });
  var btnResetOverview = document.getElementById('btn-reset-overview');
  if (btnResetOverview) {
    btnResetOverview.addEventListener('click', function () {
      document.getElementById('filter-dept-overview').value = '';
      document.getElementById('filter-lokasi-overview').value = '';
      if (activeTab === 'overview') renderOverviewCharts(getFilteredEmployees('overview'));
    });
  }

  // ── Compensation filters ──
  ['filter-dept-comp', 'filter-level-comp', 'filter-lokasi-comp'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', function () { if (activeTab === 'compensation') renderCompensation(getFilteredEmployees('comp')); });
  });
  var btnResetComp = document.getElementById('btn-reset-comp');
  if (btnResetComp) {
    btnResetComp.addEventListener('click', function () {
      document.getElementById('filter-dept-comp').value = '';
      document.getElementById('filter-level-comp').value = '';
      document.getElementById('filter-lokasi-comp').value = '';
      if (activeTab === 'compensation') renderCompensation(getFilteredEmployees('comp'));
    });
  }

  // ── Turnover filters ──
  ['filter-dept-turnover', 'filter-alasan-turnover'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', function () { if (activeTab === 'turnover') renderTurnover(getFilteredTurnoverEmployees()); });
  });
  var btnResetTurnover = document.getElementById('btn-reset-turnover');
  if (btnResetTurnover) {
    btnResetTurnover.addEventListener('click', function () {
      document.getElementById('filter-dept-turnover').value = '';
      document.getElementById('filter-alasan-turnover').value = '';
      if (activeTab === 'turnover') renderTurnover(getFilteredTurnoverEmployees());
    });
  }

  // ── Recruitment filters ──
  ['filter-dept-recruit', 'filter-sumber-recruit', 'filter-status-recruit'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', function () { if (activeTab === 'recruitment') renderRecruitment(getFilteredRecruitment()); });
  });
  var btnResetRecruit = document.getElementById('btn-reset-recruit');
  if (btnResetRecruit) {
    btnResetRecruit.addEventListener('click', function () {
      document.getElementById('filter-dept-recruit').value = '';
      document.getElementById('filter-sumber-recruit').value = '';
      document.getElementById('filter-status-recruit').value = '';
      if (activeTab === 'recruitment') renderRecruitment(getFilteredRecruitment());
    });
  }

  // ── Performance filters ──
  ['filter-dept-perf', 'filter-level-perf'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', function () { if (activeTab === 'performance') renderPerformance(getFilteredEmployees('perf')); });
  });
  var btnResetPerf = document.getElementById('btn-reset-perf');
  if (btnResetPerf) {
    btnResetPerf.addEventListener('click', function () {
      document.getElementById('filter-dept-perf').value = '';
      document.getElementById('filter-level-perf').value = '';
      if (activeTab === 'performance') renderPerformance(getFilteredEmployees('perf'));
    });
  }

  // ── Table controls ──
  var filtDataset = document.getElementById('table-filter-dataset');
  if (filtDataset) {
    filtDataset.addEventListener('change', function () {
      state.tableState.dataset = this.value;
      state.tableState.page = 1;
      state.tableState.sortCol = null;
      state.tableState.sortDir = null;
      renderTable();
    });
  }

  var filtSearch = document.getElementById('table-filter-search');
  if (filtSearch) {
    filtSearch.addEventListener('input', function () {
      state.tableState.search = this.value;
      state.tableState.page = 1;
      renderTable();
    });
  }

  ['departemen', 'lokasi', 'status'].forEach(function (f) {
    var el = document.getElementById('table-filter-' + f);
    if (el) {
      el.addEventListener('change', function () {
        state.tableState[f] = this.value;
        state.tableState.page = 1;
        renderTable();
      });
    }
  });

  var btnResetTable = document.getElementById('btn-reset-table');
  if (btnResetTable) {
    btnResetTable.addEventListener('click', function () {
      document.getElementById('table-filter-departemen').value = '';
      document.getElementById('table-filter-lokasi').value = '';
      document.getElementById('table-filter-status').value = '';
      document.getElementById('table-filter-search').value = '';
      state.tableState.departemen = '';
      state.tableState.lokasi = '';
      state.tableState.status = '';
      state.tableState.search = '';
      state.tableState.page = 1;
      if (activeTab === 'table') renderTable();
    });
  }

  var btnPrev = document.getElementById('btn-prev');
  if (btnPrev) btnPrev.addEventListener('click', function () { state.tableState.page--; renderTable(); });

  var btnNext = document.getElementById('btn-next');
  if (btnNext) btnNext.addEventListener('click', function () { state.tableState.page++; renderTable(); });

  // Resize handler
  window.addEventListener('resize', function () {
    Object.values(state.charts).forEach(function (c) { if (c) c.resize(); });
  });
});
