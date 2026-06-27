// ==========================================
// HR Analytics Dashboard — Filter Population
// ==========================================
import { state } from './state.js';

export function setupFilters() {
  var emps = state.DS.employees;

  // Collect unique values
  var departements = new Set();
  var lokasis = new Set();
  var levels = new Set();
  var statuses = new Set();
  var sumbers = new Set();
  var alasans = new Set();

  emps.forEach(function (e) {
    if (e.departemen) departements.add(e.departemen);
    if (e.lokasi) lokasis.add(e.lokasi);
    if (e.level) levels.add(e.level);
    if (e.status) statuses.add(e.status);
    if (e.sumber_rekrutmen) sumbers.add(e.sumber_rekrutmen);
    if (e.alasan_keluar) alasans.add(e.alasan_keluar);
  });

  // Recruitment sources
  state.DS.recruitment.forEach(function (r) {
    if (r.sumber) sumbers.add(r.sumber);
    if (r.departemen) departements.add(r.departemen);
  });

  function populateSelect(id, values) {
    var el = document.getElementById(id);
    if (!el) return;
    var current = el.value;
    // Keep first option (default "All")
    while (el.options.length > 1) el.remove(1);
    Array.from(values).sort().forEach(function (v) {
      el.add(new Option(v, v));
    });
    if (values.has(current)) el.value = current;
  }

  // Overview filters
  populateSelect('filter-dept-overview', departements);
  populateSelect('filter-lokasi-overview', lokasis);

  // Compensation filters
  populateSelect('filter-dept-comp', departements);
  populateSelect('filter-level-comp', levels);
  populateSelect('filter-lokasi-comp', lokasis);

  // Turnover filters
  populateSelect('filter-dept-turnover', departements);
  populateSelect('filter-alasan-turnover', alasans);

  // Recruitment filters
  populateSelect('filter-dept-recruit', departements);
  populateSelect('filter-sumber-recruit', sumbers);

  // Performance filters
  populateSelect('filter-dept-perf', departements);
  populateSelect('filter-level-perf', levels);

  // Table filters
  populateSelect('table-filter-departemen', departements);
  populateSelect('table-filter-lokasi', lokasis);
  populateSelect('table-filter-status', statuses);
}
