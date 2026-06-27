// ==========================================
// HR Analytics Dashboard — Dummy Data Generator
// ~500 employees, ~200 recruitment, 30 months metrics
// ==========================================

// Seeded random for reproducibility
function seededRandom(seed) {
  var s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

var rand = seededRandom(42);

function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }
function randFloat(min, max) { return rand() * (max - min) + min; }

// Gaussian random (Box-Muller)
function randGauss(mean, std) {
  var u1 = rand(), u2 = rand();
  var z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z * std;
}

// ── Name pools ──
var FIRST_NAMES_M = [
  'Budi', 'Andi', 'Dedi', 'Rudi', 'Eko', 'Agus', 'Hendra', 'Iman', 'Joko', 'Kurniawan',
  'Lukman', 'Mulyadi', 'Nanda', 'Oscar', 'Prasetyo', 'Rahmat', 'Surya', 'Teguh', 'Umar', 'Vino',
  'Wahyu', 'Yusuf', 'Zainal', 'Arief', 'Bambang', 'Cahyo', 'Dimas', 'Fauzi', 'Galih', 'Hafiz',
  'Irfan', 'Jefri', 'Krisna', 'Leo', 'Mahendra', 'Nugroho', 'Pandu', 'Reza', 'Sigit', 'Taufik',
  'Udin', 'Vicky', 'Wawan', 'Yoga', 'Zaki', 'Aditya', 'Bagas', 'Dwi', 'Fajar', 'Gilang',
  'Hadi', 'Indra', 'Kevin', 'Maulana', 'Nabil', 'Oka', 'Putra', 'Rizky', 'Sandy', 'Tommy',
  'Ilham', 'Raka', 'Firman', 'Adi', 'Bagus', 'Dani', 'Farel', 'Gibran', 'Hikmal', 'Ivan'
];

var FIRST_NAMES_F = [
  'Siti', 'Ani', 'Dewi', 'Rina', 'Wulan', 'Fitri', 'Lina', 'Maya', 'Nur', 'Putri',
  'Ratna', 'Sri', 'Tari', 'Utami', 'Vina', 'Wati', 'Yanti', 'Zahra', 'Amelia', 'Bunga',
  'Citra', 'Dian', 'Eka', 'Fanny', 'Gita', 'Hana', 'Intan', 'Julia', 'Kartika', 'Laras',
  'Mega', 'Nita', 'Oktavia', 'Puspita', 'Qory', 'Rosa', 'Sarah', 'Tina', 'Ulfa', 'Vera',
  'Widya', 'Xenia', 'Yuliana', 'Zelda', 'Anisa', 'Bella', 'Chelsea', 'Dina', 'Elsa', 'Farah',
  'Gina', 'Hesti', 'Ika', 'Jesica', 'Karina', 'Lisa', 'Mira', 'Nadya', 'Olga', 'Priska',
  'Rani', 'Santi', 'Tasya', 'Uci', 'Vivi', 'Winda', 'Yolanda', 'Zara', 'Aulia', 'Bela'
];

var LAST_NAMES = [
  'Santoso', 'Wijaya', 'Kusuma', 'Pratama', 'Saputra', 'Hidayat', 'Rahman', 'Putra', 'Nugraha', 'Susanto',
  'Prasetya', 'Wibowo', 'Utomo', 'Setiawan', 'Handoko', 'Gunawan', 'Firmansyah', 'Suryadi', 'Hermawan', 'Kurniadi',
  'Prabowo', 'Siregar', 'Nasution', 'Harahap', 'Simbolon', 'Hutapea', 'Panjaitan', 'Siahaan', 'Manurung', 'Sitorus',
  'Ramadhani', 'Syahputra', 'Lubis', 'Hutabarat', 'Tampubolon', 'Situmorang', 'Aritonang', 'Simanjuntak', 'Sinaga', 'Pardede',
  'Maharani', 'Permana', 'Adiputra', 'Laksono', 'Sutrisno', 'Haryanto', 'Sulistyo', 'Widodo', 'Supriadi', 'Sudarmo'
];

var DEPARTEMENTS = ['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Operations', 'Sales', 'Legal', 'IT Support'];

var JABATAN_MAP = {
  'Junior': ['Staff', 'Junior Staff', 'Associate'],
  'Mid': ['Staff', 'Senior Staff', 'Analyst'],
  'Senior': ['Senior Staff', 'Specialist', 'Senior Analyst'],
  'Lead': ['Supervisor', 'Team Lead', 'Manager'],
  'Executive': ['Senior Manager', 'Director', 'VP']
};

var LEVELS = ['Junior', 'Mid', 'Senior', 'Lead', 'Executive'];
var LOKASI = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Yogyakarta'];
var STATUS_LIST = ['Aktif', 'Resign', 'Terminated', 'Pensiun'];
var ALASAN_KELUAR = ['Resign Sukarela', 'Pindah Perusahaan', 'PHK', 'Pensiun', 'Kontrak Habis', 'Alasan Pribadi'];
var SUMBER_REKRUTMEN = ['LinkedIn', 'Referral Karyawan', 'Job Fair', 'Website Karir', 'Head Hunter', 'Campus Hiring', 'Indeed', 'Glassdoor'];
var PERFORMANCE_LABELS = ['Needs Improvement', 'Below Expectations', 'Meets Expectations', 'Exceeds Expectations', 'Outstanding'];

// Salary ranges by level (base salary in Rupiah)
var SALARY_RANGES = {
  'Junior':    { min: 5000000,  max: 9000000 },
  'Mid':       { min: 8000000,  max: 14000000 },
  'Senior':    { min: 12000000, max: 22000000 },
  'Lead':      { min: 18000000, max: 35000000 },
  'Executive': { min: 30000000, max: 65000000 }
};

// Department salary multiplier
var DEPT_MULTIPLIER = {
  'Engineering': 1.15,
  'Human Resources': 0.95,
  'Finance': 1.10,
  'Marketing': 1.05,
  'Operations': 0.92,
  'Sales': 1.08,
  'Legal': 1.12,
  'IT Support': 1.00
};

// ══════════════════════════════════════════════
// GENERATE EMPLOYEES (~500)
// ══════════════════════════════════════════════
function generateEmployees() {
  var employees = [];
  var totalCount = 500;
  var activeCount = 350;

  for (var i = 0; i < totalCount; i++) {
    var gender = rand() < 0.55 ? 'L' : 'P';
    var firstName = gender === 'L' ? pick(FIRST_NAMES_M) : pick(FIRST_NAMES_F);
    var lastName = pick(LAST_NAMES);
    var nama = firstName + ' ' + lastName;

    // Age 22–58
    var birthYear = randInt(1968, 2004);
    var birthMonth = randInt(1, 12);
    var birthDay = randInt(1, 28);
    var tanggalLahir = birthYear + '-' + String(birthMonth).padStart(2, '0') + '-' + String(birthDay).padStart(2, '0');

    // Join date: 2018–2026
    var joinYear = randInt(2018, 2026);
    var joinMonth = randInt(1, joinYear === 2026 ? 6 : 12);
    var joinDay = randInt(1, 28);
    var tanggalMasuk = joinYear + '-' + String(joinMonth).padStart(2, '0') + '-' + String(joinDay).padStart(2, '0');

    var departemen = pick(DEPARTEMENTS);
    var level = pick(LEVELS);
    // Bias: older employees more likely to be senior
    var age = 2026 - birthYear;
    if (age > 45 && rand() < 0.5) level = pick(['Lead', 'Executive']);
    if (age < 28 && rand() < 0.6) level = pick(['Junior', 'Mid']);

    var jabatan = pick(JABATAN_MAP[level]);
    var lokasi = pick(LOKASI);

    // Status
    var isActive = i < activeCount;
    var status, tanggalKeluar, alasanKeluar;
    if (isActive) {
      status = 'Aktif';
      tanggalKeluar = null;
      alasanKeluar = null;
    } else {
      // Randomly assign exit status
      var exitRand = rand();
      if (exitRand < 0.55) status = 'Resign';
      else if (exitRand < 0.75) status = 'Terminated';
      else if (exitRand < 0.9) status = 'Pensiun';
      else status = 'Kontrak Habis';

      // Exit date: after join date, before now
      var exitYear = Math.max(joinYear + 1, randInt(2023, 2026));
      var exitMonth = randInt(1, exitYear === 2026 ? 6 : 12);
      var exitDay = randInt(1, 28);
      tanggalKeluar = exitYear + '-' + String(exitMonth).padStart(2, '0') + '-' + String(exitDay).padStart(2, '0');

      if (status === 'Resign') alasanKeluar = pick(['Resign Sukarela', 'Pindah Perusahaan', 'Alasan Pribadi']);
      else if (status === 'Terminated') alasanKeluar = 'PHK';
      else if (status === 'Pensiun') alasanKeluar = 'Pensiun';
      else alasanKeluar = 'Kontrak Habis';
    }

    // Compensation
    var salaryRange = SALARY_RANGES[level];
    var multiplier = DEPT_MULTIPLIER[departemen] || 1.0;
    var gajiPokok = Math.round(randFloat(salaryRange.min, salaryRange.max) * multiplier / 100000) * 100000;
    var tunjanganTransport = Math.round(gajiPokok * randFloat(0.1, 0.2) / 100000) * 100000;
    var tunjanganMakan = Math.round(gajiPokok * randFloat(0.08, 0.15) / 100000) * 100000;
    var tunjanganKesehatan = Math.round(gajiPokok * randFloat(0.12, 0.25) / 100000) * 100000;
    var bonusTahunan = Math.round(gajiPokok * randFloat(0.5, 2.5) / 100000) * 100000;
    var totalKompensasi = gajiPokok + tunjanganTransport + tunjanganMakan + tunjanganKesehatan + bonusTahunan;

    // Performance score (bell curve centered at 3.2)
    var perfScore = Math.round(Math.min(5, Math.max(1, randGauss(3.2, 0.8))) * 10) / 10;
    var perfLabel;
    if (perfScore < 1.5) perfLabel = 'Needs Improvement';
    else if (perfScore < 2.5) perfLabel = 'Below Expectations';
    else if (perfScore < 3.5) perfLabel = 'Meets Expectations';
    else if (perfScore < 4.5) perfLabel = 'Exceeds Expectations';
    else perfLabel = 'Outstanding';

    // Recruitment source
    var sumberRekrutmen = pick(SUMBER_REKRUTMEN);
    var waktuRekrutmen = randInt(10, 90);

    employees.push({
      employee_id: 'EMP-' + String(i + 1).padStart(3, '0'),
      nama: nama,
      gender: gender,
      tanggal_lahir: tanggalLahir,
      tanggal_masuk: tanggalMasuk,
      tanggal_keluar: tanggalKeluar,
      departemen: departemen,
      jabatan: jabatan,
      level: level,
      lokasi: lokasi,
      status: status,
      gaji_pokok: gajiPokok,
      tunjangan_transport: tunjanganTransport,
      tunjangan_makan: tunjanganMakan,
      tunjangan_kesehatan: tunjanganKesehatan,
      bonus_tahunan: bonusTahunan,
      total_kompensasi: totalKompensasi,
      performance_score: perfScore,
      performance_label: perfLabel,
      alasan_keluar: alasanKeluar,
      sumber_rekrutmen: sumberRekrutmen,
      waktu_rekrutmen_hari: waktuRekrutmen
    });
  }

  // Generate 55 additional employees with 'Needs Improvement' or 'Below Expectations' performance ratings
  for (var i = 500; i < 555; i++) {
    var gender = rand() < 0.55 ? 'L' : 'P';
    var firstName = gender === 'L' ? pick(FIRST_NAMES_M) : pick(FIRST_NAMES_F);
    var lastName = pick(LAST_NAMES);
    var nama = firstName + ' ' + lastName;

    var birthYear = randInt(1975, 2003);
    var birthMonth = randInt(1, 12);
    var birthDay = randInt(1, 28);
    var tanggalLahir = birthYear + '-' + String(birthMonth).padStart(2, '0') + '-' + String(birthDay).padStart(2, '0');

    var joinYear = randInt(2021, 2025);
    var joinMonth = randInt(1, 12);
    var joinDay = randInt(1, 28);
    var tanggalMasuk = joinYear + '-' + String(joinMonth).padStart(2, '0') + '-' + String(joinDay).padStart(2, '0');

    var departemen = pick(DEPARTEMENTS);
    var level = pick(LEVELS);
    var jabatan = pick(JABATAN_MAP[level]);
    var lokasi = pick(LOKASI);

    // All are active employees
    var status = 'Aktif';
    var tanggalKeluar = null;
    var alasanKeluar = null;

    // Compensation
    var salaryRange = SALARY_RANGES[level];
    var multiplier = DEPT_MULTIPLIER[departemen] || 1.0;
    var gajiPokok = Math.round(randFloat(salaryRange.min, salaryRange.max) * multiplier / 100000) * 100000;
    var tunjanganTransport = Math.round(gajiPokok * randFloat(0.1, 0.2) / 100000) * 100000;
    var tunjanganMakan = Math.round(gajiPokok * randFloat(0.08, 0.15) / 100000) * 100000;
    var tunjanganKesehatan = Math.round(gajiPokok * randFloat(0.12, 0.25) / 100000) * 100000;
    var bonusTahunan = Math.round(gajiPokok * randFloat(0.5, 2.5) / 100000) * 100000;
    var totalKompensasi = gajiPokok + tunjanganTransport + tunjanganMakan + tunjanganKesehatan + bonusTahunan;

    // Specific performance scores
    var isNeedsImprovement = (i % 2 === 0);
    var perfScore, perfLabel;
    if (isNeedsImprovement) {
      // Needs Improvement (1.0 to 1.4)
      perfScore = Math.round(randFloat(1.0, 1.4) * 10) / 10;
      perfLabel = 'Needs Improvement';
    } else {
      // Below Expectations (1.5 to 2.4)
      perfScore = Math.round(randFloat(1.5, 2.4) * 10) / 10;
      perfLabel = 'Below Expectations';
    }

    var sumberRekrutmen = pick(SUMBER_REKRUTMEN);
    var waktuRekrutmen = randInt(15, 75);

    employees.push({
      employee_id: 'EMP-' + String(i + 1).padStart(3, '0'),
      nama: nama,
      gender: gender,
      tanggal_lahir: tanggalLahir,
      tanggal_masuk: tanggalMasuk,
      tanggal_keluar: tanggalKeluar,
      departemen: departemen,
      jabatan: jabatan,
      level: level,
      lokasi: lokasi,
      status: status,
      gaji_pokok: gajiPokok,
      tunjangan_transport: tunjanganTransport,
      tunjangan_makan: tunjanganMakan,
      tunjangan_kesehatan: tunjanganKesehatan,
      bonus_tahunan: bonusTahunan,
      total_kompensasi: totalKompensasi,
      performance_score: perfScore,
      performance_label: perfLabel,
      alasan_keluar: alasanKeluar,
      sumber_rekrutmen: sumberRekrutmen,
      waktu_rekrutmen_hari: waktuRekrutmen
    });
  }

  return employees;
}

// ══════════════════════════════════════════════
// GENERATE RECRUITMENT PIPELINE (~200)
// ══════════════════════════════════════════════
function generateRecruitment() {
  var pipeline = [];
  var POSITIONS = [
    'Data Engineer', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'Product Manager',
    'UX Designer', 'HR Specialist', 'Finance Analyst', 'Marketing Executive', 'Sales Representative',
    'Operations Manager', 'Legal Counsel', 'IT Support Specialist', 'Business Analyst', 'QA Engineer',
    'Fullstack Developer', 'Data Scientist', 'Content Writer', 'Digital Marketing Specialist', 'Recruitment Officer',
    'Accounting Staff', 'Customer Success Manager', 'Mobile Developer', 'Cloud Architect', 'Security Engineer',
    'Graphic Designer', 'Social Media Specialist', 'Supply Chain Analyst', 'Project Manager', 'Compliance Officer'
  ];

  var HIRING_MANAGERS = [
    'Ahmad Rizky', 'Diana Putri', 'Budi Setiawan', 'Rina Maharani', 'Eko Prasetyo',
    'Siti Nurhaliza', 'Joko Widodo', 'Maya Sari', 'Fajar Nugroho', 'Lina Oktavia'
  ];

  for (var i = 0; i < 200; i++) {
    var posisi = pick(POSITIONS);
    var departemen = pick(DEPARTEMENTS);
    var openYear = randInt(2024, 2026);
    var openMonth = randInt(1, openYear === 2026 ? 6 : 12);
    var openDay = randInt(1, 28);
    var tanggalOpen = openYear + '-' + String(openMonth).padStart(2, '0') + '-' + String(openDay).padStart(2, '0');

    var jumlahPelamar = randInt(15, 120);
    var shortlisted = Math.round(jumlahPelamar * randFloat(0.15, 0.35));
    var interviewed = Math.round(shortlisted * randFloat(0.3, 0.7));
    var offered = Math.round(interviewed * randFloat(0.2, 0.6));
    var hired = Math.min(offered, randInt(0, Math.max(1, offered)));

    var statusRand = rand();
    var reqStatus, tanggalClose, timeToFill;
    if (statusRand < 0.55) {
      reqStatus = 'Closed';
      timeToFill = randInt(15, 90);
      var closeDate = new Date(tanggalOpen);
      closeDate.setDate(closeDate.getDate() + timeToFill);
      tanggalClose = closeDate.toISOString().split('T')[0];
    } else if (statusRand < 0.85) {
      reqStatus = 'Open';
      tanggalClose = null;
      timeToFill = null;
    } else {
      reqStatus = 'On Hold';
      tanggalClose = null;
      timeToFill = null;
    }

    pipeline.push({
      req_id: 'REQ-' + openYear + '-' + String(i + 1).padStart(3, '0'),
      posisi: posisi,
      departemen: departemen,
      tanggal_open: tanggalOpen,
      tanggal_close: tanggalClose,
      jumlah_pelamar: jumlahPelamar,
      shortlisted: shortlisted,
      interviewed: interviewed,
      offered: offered,
      hired: hired,
      status: reqStatus,
      hiring_manager: pick(HIRING_MANAGERS),
      sumber: pick(SUMBER_REKRUTMEN),
      time_to_fill_days: timeToFill
    });
  }

  return pipeline;
}

// ══════════════════════════════════════════════
// GENERATE MONTHLY METRICS (Jan 2024 – Jun 2026 = 30 months)
// ══════════════════════════════════════════════
function generateMonthlyMetrics(employees) {
  var metrics = [];
  var startYear = 2024;
  var endYear = 2026;
  var endMonth = 6;

  for (var y = startYear; y <= endYear; y++) {
    var maxMonth = (y === endYear) ? endMonth : 12;
    for (var m = 1; m <= maxMonth; m++) {
      var ym = y + '-' + String(m).padStart(2, '0');
      var ymEnd = ym + '-28';

      // Count active employees at this point in time
      var activeAtMonth = employees.filter(function (e) {
        return e.tanggal_masuk <= ymEnd && (!e.tanggal_keluar || e.tanggal_keluar >= ym + '-01');
      });

      var newHires = employees.filter(function (e) {
        return e.tanggal_masuk.startsWith(ym);
      }).length;

      var terminations = employees.filter(function (e) {
        return e.tanggal_keluar && e.tanggal_keluar.startsWith(ym);
      }).length;

      var totalKaryawan = activeAtMonth.length;
      var turnoverRate = totalKaryawan > 0 ? (terminations / totalKaryawan) * 100 : 0;

      var totalGaji = 0;
      activeAtMonth.forEach(function (e) { totalGaji += e.gaji_pokok; });
      var avgGaji = totalKaryawan > 0 ? Math.round(totalGaji / totalKaryawan) : 0;
      var totalPayroll = totalGaji;

      var totalPerf = 0;
      activeAtMonth.forEach(function (e) { totalPerf += e.performance_score; });
      var avgPerf = totalKaryawan > 0 ? Math.round((totalPerf / totalKaryawan) * 100) / 100 : 0;

      var trainingHours = randInt(100, 800);
      var absensiRate = Math.round(randFloat(1.5, 6.5) * 10) / 10;

      metrics.push({
        bulan: ym,
        total_karyawan: totalKaryawan,
        new_hires: newHires,
        terminations: terminations,
        turnover_rate: Math.round(turnoverRate * 100) / 100,
        avg_gaji: avgGaji,
        total_payroll: totalPayroll,
        avg_performance: avgPerf,
        training_hours: trainingHours,
        absensi_rate: absensiRate
      });
    }
  }

  return metrics;
}

// ══════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════
export function generateAllData() {
  var employees = generateEmployees();
  var recruitment = generateRecruitment();
  var monthly = generateMonthlyMetrics(employees);

  return {
    employees: employees,
    recruitment: recruitment,
    monthly: monthly
  };
}
