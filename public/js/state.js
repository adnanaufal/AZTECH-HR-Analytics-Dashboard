// ==========================================
// HR Analytics Dashboard — Global State
// ==========================================

export const state = {
  // Dataset containers
  DS: {
    employees: [],
    recruitment: [],
    monthly: []
  },

  // ECharts instances registry
  charts: {},

  // Table state
  tableState: {
    dataset: 'employees',
    page: 1,
    pageSize: 25,
    sortCol: null,
    sortDir: null,
    search: '',
    departemen: '',
    lokasi: '',
    status: '',
    level: ''
  }
};
