// ==========================================
// HR Analytics Dashboard — Data Table Component
// ==========================================
import { state } from '../state.js';
import { str, fmtNum, rp, fmtDate } from '../utils.js';

export function renderTable() {
  var ds = state.tableState.dataset;
  var rows, columns;

  if (ds === 'employees') {
    rows = state.DS.employees;
    columns = [
      { key: 'employee_id', label: 'ID' },
      { key: 'nama', label: 'Nama' },
      { key: 'gender', label: 'Gender' },
      { key: 'departemen', label: 'Departemen' },
      { key: 'jabatan', label: 'Jabatan' },
      { key: 'level', label: 'Level' },
      { key: 'lokasi', label: 'Lokasi' },
      { key: 'status', label: 'Status', badge: true },
      { key: 'tanggal_masuk', label: 'Tgl Masuk', format: 'date' },
      { key: 'gaji_pokok', label: 'Gaji Pokok', format: 'currency' },
      { key: 'total_kompensasi', label: 'Total Kompensasi', format: 'currency' },
      { key: 'performance_score', label: 'Perf. Score' },
      { key: 'performance_label', label: 'Perf. Label' }
    ];
  } else if (ds === 'recruitment') {
    rows = state.DS.recruitment;
    columns = [
      { key: 'req_id', label: 'REQ ID' },
      { key: 'posisi', label: 'Posisi' },
      { key: 'departemen', label: 'Departemen' },
      { key: 'tanggal_open', label: 'Tgl Open', format: 'date' },
      { key: 'tanggal_close', label: 'Tgl Close', format: 'date' },
      { key: 'jumlah_pelamar', label: 'Pelamar' },
      { key: 'shortlisted', label: 'Shortlist' },
      { key: 'interviewed', label: 'Interview' },
      { key: 'offered', label: 'Offered' },
      { key: 'hired', label: 'Hired' },
      { key: 'status', label: 'Status', badge: true },
      { key: 'sumber', label: 'Sumber' },
      { key: 'time_to_fill_days', label: 'TTF (hari)' }
    ];
  } else {
    rows = state.DS.monthly;
    columns = [
      { key: 'bulan', label: 'Bulan' },
      { key: 'total_karyawan', label: 'Total Karyawan' },
      { key: 'new_hires', label: 'New Hires' },
      { key: 'terminations', label: 'Keluar' },
      { key: 'turnover_rate', label: 'Turnover %' },
      { key: 'avg_gaji', label: 'Avg Gaji', format: 'currency' },
      { key: 'total_payroll', label: 'Total Payroll', format: 'currency' },
      { key: 'avg_performance', label: 'Avg Perf' },
      { key: 'training_hours', label: 'Training (jam)' },
      { key: 'absensi_rate', label: 'Absensi %' }
    ];
  }

  // Apply filters
  var filtered = rows.slice();

  var search = (state.tableState.search || '').toLowerCase().trim();
  if (search) {
    filtered = filtered.filter(function (r) {
      return columns.some(function (col) {
        var val = str(r[col.key]).toLowerCase();
        return val.indexOf(search) >= 0;
      });
    });
  }

  if (state.tableState.departemen) {
    filtered = filtered.filter(function (r) { return r.departemen === state.tableState.departemen; });
  }
  if (state.tableState.lokasi && ds === 'employees') {
    filtered = filtered.filter(function (r) { return r.lokasi === state.tableState.lokasi; });
  }
  if (state.tableState.status) {
    filtered = filtered.filter(function (r) { return r.status === state.tableState.status; });
  }

  // Sort
  if (state.tableState.sortCol) {
    var sc = state.tableState.sortCol;
    var dir = state.tableState.sortDir === 'asc' ? 1 : -1;
    filtered.sort(function (a, b) {
      var va = a[sc], vb = b[sc];
      if (va === null || va === undefined) va = '';
      if (vb === null || vb === undefined) vb = '';
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  }

  // Pagination
  var page = state.tableState.page;
  var pageSize = state.tableState.pageSize;
  var totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  if (page > totalPages) page = totalPages;
  if (page < 1) page = 1;
  state.tableState.page = page;

  var start = (page - 1) * pageSize;
  var pageRows = filtered.slice(start, start + pageSize);

  // Render header
  var thead = document.getElementById('table-head');
  var headerHtml = '<tr>';
  columns.forEach(function (col) {
    var cls = '';
    if (state.tableState.sortCol === col.key) {
      cls = state.tableState.sortDir === 'asc' ? 'sort-asc' : 'sort-desc';
    }
    headerHtml += '<th class="' + cls + '" data-col="' + col.key + '">' + col.label + '</th>';
  });
  headerHtml += '</tr>';
  thead.innerHTML = headerHtml;

  // Click handlers for sort
  thead.querySelectorAll('th').forEach(function (th) {
    th.addEventListener('click', function () {
      var colKey = this.getAttribute('data-col');
      if (state.tableState.sortCol === colKey) {
        state.tableState.sortDir = state.tableState.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.tableState.sortCol = colKey;
        state.tableState.sortDir = 'asc';
      }
      renderTable();
    });
  });

  // Render body
  var tbody = document.getElementById('table-body');
  if (pageRows.length === 0) {
    tbody.innerHTML = '<tr><td class="empty" colspan="' + columns.length + '">Tidak ada data ditemukan</td></tr>';
  } else {
    var bodyHtml = '';
    pageRows.forEach(function (row) {
      bodyHtml += '<tr>';
      columns.forEach(function (col) {
        var val = row[col.key];
        var display = '';

        if (col.badge && val) {
          var badgeCls = 'badge ';
          var lower = String(val).toLowerCase();
          if (lower === 'aktif') badgeCls += 'badge-aktif';
          else if (lower === 'resign') badgeCls += 'badge-resign';
          else if (lower === 'terminated') badgeCls += 'badge-terminated';
          else if (lower === 'pensiun') badgeCls += 'badge-pensiun';
          else if (lower === 'open') badgeCls += 'badge-open';
          else if (lower === 'closed') badgeCls += 'badge-closed';
          else if (lower === 'on hold') badgeCls += 'badge-hold';
          else badgeCls += 'badge-aktif';
          display = '<span class="' + badgeCls + '">' + val + '</span>';
        } else if (col.format === 'currency') {
          display = val !== null && val !== undefined ? rp(val) : '-';
        } else if (col.format === 'date') {
          display = val ? fmtDate(val) : '-';
        } else {
          display = val !== null && val !== undefined ? String(val) : '-';
        }

        bodyHtml += '<td>' + display + '</td>';
      });
      bodyHtml += '</tr>';
    });
    tbody.innerHTML = bodyHtml;
  }

  // Pager
  var pgInfo = document.getElementById('pg-info');
  if (pgInfo) {
    pgInfo.textContent = 'Menampilkan ' + (start + 1) + '–' + Math.min(start + pageSize, filtered.length) + ' dari ' + fmtNum(filtered.length) + ' data';
  }

  var btnPrev = document.getElementById('btn-prev');
  var btnNext = document.getElementById('btn-next');
  if (btnPrev) btnPrev.disabled = page <= 1;
  if (btnNext) btnNext.disabled = page >= totalPages;
}
