/**
 * Micro Project 3 - Machine Learning Implementation
 * Kelompok 02 5D
 * 
 * Main JavaScript file dengan fitur:
 * - Dataset interaktif (sort, filter, pagination)
 * - Upload/Download CSV
 * - Visualisasi scatter plot
 * - Demo algoritma ML (Naive Bayes & KNN)
 * - Task management dengan localStorage
 * - Theme toggler & keyboard shortcuts
 * - Progressive enhancement
 */

// ===========================
// Global Variables & State
// ===========================

let currentDataset = [];
let filteredDataset = [];
let currentPage = 1;
let rowsPerPage = 25;
let sortColumn = '';
let sortDirection = 'asc';
let currentTheme = localStorage.getItem('theme') || 
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

// Default dataset for fallback
const defaultDataset = [
  {glucose: 148, bloodpressure: 72, age: 50, diabetes: 1},
  {glucose: 85, bloodpressure: 66, age: 31, diabetes: 0},
  {glucose: 183, bloodpressure: 64, age: 32, diabetes: 1},
  {glucose: 89, bloodpressure: 66, age: 21, diabetes: 0},
  {glucose: 137, bloodpressure: 40, age: 33, diabetes: 1},
  {glucose: 116, bloodpressure: 74, age: 30, diabetes: 0},
  {glucose: 78, bloodpressure: 50, age: 26, diabetes: 1},
  {glucose: 115, bloodpressure: 76, age: 36, diabetes: 0},
  {glucose: 197, bloodpressure: 70, age: 45, diabetes: 1},
  {glucose: 125, bloodpressure: 96, age: 54, diabetes: 0},
  {glucose: 110, bloodpressure: 92, age: 37, diabetes: 0},
  {glucose: 168, bloodpressure: 74, age: 44, diabetes: 1},
  {glucose: 139, bloodpressure: 80, age: 31, diabetes: 0},
  {glucose: 189, bloodpressure: 60, age: 23, diabetes: 1},
  {glucose: 166, bloodpressure: 72, age: 19, diabetes: 1},
  {glucose: 100, bloodpressure: 70, age: 26, diabetes: 0},
  {glucose: 118, bloodpressure: 84, age: 47, diabetes: 0},
  {glucose: 107, bloodpressure: 74, age: 29, diabetes: 0},
  {glucose: 103, bloodpressure: 30, age: 33, diabetes: 0},
  {glucose: 115, bloodpressure: 70, age: 30, diabetes: 0}
];

// Task management data
let tasks = JSON.parse(localStorage.getItem('tasks')) || [
  {
    id: '1',
    title: 'Implementasi Naive Bayes',
    description: 'Buat algoritma Naive Bayes untuk klasifikasi diabetes',
    assignee: 'Ahmad',
    status: 'todo',
    dueDate: '2023-12-15'
  },
  {
    id: '2', 
    title: 'Implementasi KNN',
    description: 'Buat algoritma K-Nearest Neighbors dengan k=3,5,7',
    assignee: 'Budi',
    status: 'progress',
    dueDate: '2023-12-16'
  },
  {
    id: '3',
    title: 'Visualisasi Data',
    description: 'Scatter plot interaktif untuk eksplorasi dataset',
    assignee: 'Citra',
    status: 'todo',
    dueDate: '2023-12-17'
  },
  {
    id: '4',
    title: 'UI/UX Design',
    description: 'Desain antarmuka yang user-friendly dan responsive',
    assignee: 'Dinda',
    status: 'progress',
    dueDate: '2023-12-18'
  },
  {
    id: '5',
    title: 'Testing & Validation',
    description: 'Test akurasi algoritma dan validasi hasil',
    assignee: 'Eko',
    status: 'todo',
    dueDate: '2023-12-19'
  },
  {
    id: '6',
    title: 'Dokumentasi',
    description: 'Buat laporan lengkap dan dokumentasi kode',
    assignee: 'Fitri',
    status: 'todo',
    dueDate: '2023-12-20'
  }
];

// Timeline data
const timeline = [
  {
    date: '2023-12-10',
    title: 'Project Kickoff',
    description: 'Meeting awal, pembagian tugas, dan setup repository',
    completed: true
  },
  {
    date: '2023-12-12', 
    title: 'Dataset Analysis',
    description: 'Analisis dataset diabetes dan preprocessing data',
    completed: true
  },
  {
    date: '2023-12-15',
    title: 'Algorithm Development',
    description: 'Implementasi Naive Bayes dan KNN algorithm',
    completed: false
  },
  {
    date: '2023-12-17',
    title: 'UI Development',
    description: 'Pembuatan interface web dan visualisasi',
    completed: false
  },
  {
    date: '2023-12-19',
    title: 'Testing & Integration',
    description: 'Testing menyeluruh dan integrasi semua komponen',
    completed: false
  },
  {
    date: '2023-12-20',
    title: 'Final Submission',
    description: 'Finalisasi laporan dan demo presentation',
    completed: false
  }
];

// ===========================
// Utility Functions
// ===========================

/**
 * Utility untuk escaping HTML agar aman dari XSS
 * @param {string} unsafe - String yang tidak aman
 * @returns {string} String yang sudah di-escape
 */
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Tampilkan notifikasi untuk user feedback
 * @param {string} message - Pesan notifikasi
 * @param {string} type - Tipe: success, error, warning, info
 */
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type} show`;
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

/**
 * Format angka dengan pemisah ribuan
 * @param {number} num - Angka yang akan diformat
 * @returns {string} String angka yang diformat
 */
function formatNumber(num) {
  return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Parse CSV string menjadi array of objects
 * @param {string} csvText - Teks CSV
 * @returns {Array} Array of objects
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length === headers.length) {
      const obj = {};
      headers.forEach((header, index) => {
        const value = values[index].trim();
        obj[header] = isNaN(value) ? value : parseFloat(value);
      });
      data.push(obj);
    }
  }
  
  return data;
}

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Data array
 * @returns {string} CSV string
 */
function arrayToCSV(data) {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');
  
  return csvContent;
}

// ===========================
// Theme Management
// ===========================

/**
 * Inisialisasi tema saat halaman dimuat
 */
function initializeTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon();
}

/**
 * Toggle antara tema gelap dan terang
 */
function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem('theme', currentTheme);
  updateThemeIcon();
  showNotification(`Tema ${currentTheme === 'dark' ? 'gelap' : 'terang'} diaktifkan`, 'info');
}

/**
 * Update ikon tema sesuai tema aktif
 */
function updateThemeIcon() {
  const themeIcon = document.querySelector('#theme-toggle i');
  if (themeIcon) {
    themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// ===========================
// Dataset Management
// ===========================

/**
 * Inisialisasi dataset dengan data default
 */
function initializeDataset() {
  currentDataset = [...defaultDataset];
  filteredDataset = [...currentDataset];
  renderTable();
  updateProgress();
}

/**
 * Filter dataset berdasarkan kriteria
 */
function filterDataset() {
  const searchTerm = document.getElementById('dataset-search').value.toLowerCase();
  const filters = {};
  
  // Ambil nilai filter dari input
  document.querySelectorAll('.filter-input').forEach(input => {
    const column = input.dataset.column;
    const type = input.dataset.type;
    const value = input.value;
    
    if (value) {
      if (!filters[column]) filters[column] = {};
      filters[column][type] = type === 'min' || type === 'max' ? parseFloat(value) : value;
    }
  });
  
  filteredDataset = currentDataset.filter(row => {
    // Global search
    if (searchTerm) {
      const searchMatch = Object.values(row).some(val => 
        val.toString().toLowerCase().includes(searchTerm)
      );
      if (!searchMatch) return false;
    }
    
    // Column filters
    for (const [column, filter] of Object.entries(filters)) {
      const value = row[column];
      
      if (filter.min !== undefined && value < filter.min) return false;
      if (filter.max !== undefined && value > filter.max) return false;
      if (filter !== undefined && typeof filter === 'string' && value.toString() !== filter) return false;
    }
    
    return true;
  });
  
  // Sort if needed
  if (sortColumn) {
    sortDataset(sortColumn, sortDirection);
  }
  
  currentPage = 1;
  renderTable();
  renderPagination();
}

/**
 * Sort dataset berdasarkan kolom
 * @param {string} column - Nama kolom
 * @param {string} direction - asc atau desc
 */
function sortDataset(column, direction) {
  filteredDataset.sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    } else {
      const aStr = aVal.toString();
      const bStr = bVal.toString();
      return direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    }
  });
}

/**
 * Render tabel dataset
 */
function renderTable() {
  const tbody = document.getElementById('dataset-tbody');
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const pageData = filteredDataset.slice(startIndex, endIndex);
  
  tbody.innerHTML = '';
  
  if (pageData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="no-data">Tidak ada data yang sesuai</td></tr>';
    return;
  }
  
  pageData.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatNumber(row.glucose)}</td>
      <td>${formatNumber(row.bloodpressure)}</td>
      <td>${formatNumber(row.age)}</td>
      <td><span class="diabetes-badge ${row.diabetes ? 'positive' : 'negative'}">${row.diabetes ? 'Ya' : 'Tidak'}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Render kontrol pagination
 */
function renderPagination() {
  const paginationContainer = document.getElementById('pagination');
  const totalPages = Math.ceil(filteredDataset.length / rowsPerPage);
  
  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }
  
  let paginationHTML = '';
  
  // Previous button
  if (currentPage > 1) {
    paginationHTML += `<button class="btn-pagination" onclick="changePage(${currentPage - 1})" aria-label="Halaman sebelumnya">‹</button>`;
  }
  
  // Page numbers
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `<button class="btn-pagination ${i === currentPage ? 'active' : ''}" 
                       onclick="changePage(${i})" aria-label="Halaman ${i}" ${i === currentPage ? 'aria-current="page"' : ''}>${i}</button>`;
  }
  
  // Next button
  if (currentPage < totalPages) {
    paginationHTML += `<button class="btn-pagination" onclick="changePage(${currentPage + 1})" aria-label="Halaman selanjutnya">›</button>`;
  }
  
  // Page info
  paginationHTML += `<span class="pagination-info">Halaman ${currentPage} dari ${totalPages} (${filteredDataset.length} data)</span>`;
  
  paginationContainer.innerHTML = paginationHTML;
}

/**
 * Pindah ke halaman tertentu
 * @param {number} page - Nomor halaman
 */
function changePage(page) {
  const totalPages = Math.ceil(filteredDataset.length / rowsPerPage);
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    renderTable();
    renderPagination();
  }
}

/**
 * Handle perubahan rows per page
 */
function handleRowsPerPageChange() {
  const select = document.getElementById('rows-per-page');
  rowsPerPage = parseInt(select.value);
  currentPage = 1;
  renderTable();
  renderPagination();
}

/**
 * Handle sorting ketika header diklik
 * @param {Event} event - Click event
 */
function handleSort(event) {
  const column = event.currentTarget.dataset.column;
  
  if (sortColumn === column) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn = column;
    sortDirection = 'asc';
  }
  
  // Update sort icons
  document.querySelectorAll('th[data-column]').forEach(th => {
    th.setAttribute('aria-sort', 'none');
    th.querySelector('i').className = 'fas fa-sort';
  });
  
  const currentHeader = event.currentTarget;
  currentHeader.setAttribute('aria-sort', sortDirection === 'asc' ? 'ascending' : 'descending');
  currentHeader.querySelector('i').className = sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  
  sortDataset(sortColumn, sortDirection);
  currentPage = 1;
  renderTable();
  renderPagination();
}

/**
 * Handle upload CSV file
 * @param {Event} event - File input change event
 */
function handleCSVUpload(event) {
  const file = event.target.files[0];
  if (!file || !file.name.endsWith('.csv')) {
    showNotification('Harap pilih file CSV yang valid', 'error');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const csvData = parseCSV(e.target.result);
      
      // Validasi struktur data
      if (csvData.length === 0) {
        showNotification('File CSV kosong', 'error');
        return;
      }
      
      const requiredColumns = ['glucose', 'bloodpressure', 'age', 'diabetes'];
      const columns = Object.keys(csvData[0]);
      const hasRequiredColumns = requiredColumns.every(col => columns.includes(col));
      
      if (!hasRequiredColumns) {
        showNotification(`CSV harus memiliki kolom: ${requiredColumns.join(', ')}`, 'error');
        return;
      }
      
      currentDataset = csvData;
      filteredDataset = [...currentDataset];
      currentPage = 1;
      renderTable();
      renderPagination();
      updateVisualization();
      showNotification(`Berhasil memuat ${csvData.length} data dari CSV`, 'success');
      
    } catch (error) {
      showNotification('Error parsing CSV: ' + error.message, 'error');
    }
  };
  
  reader.readAsText(file);
}

/**
 * Download dataset sebagai CSV
 */
function downloadDataset() {
  const csvContent = arrayToCSV(filteredDataset);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'diabetes_dataset.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('Dataset berhasil diunduh', 'success');
}

/**
 * Tampilkan informasi dataset
 */
function showDatasetInfo() {
  const stats = calculateDatasetStats();
  const message = `
Dataset Info:
• Total data: ${formatNumber(currentDataset.length)}
• Data terfilter: ${formatNumber(filteredDataset.length)}
• Diabetes: ${stats.diabetesCount} (${stats.diabetesPercentage}%)
• Non-diabetes: ${stats.nonDiabetesCount} (${stats.nonDiabetesPercentage}%)
• Rata-rata Glucose: ${stats.avgGlucose.toFixed(1)}
• Rata-rata BP: ${stats.avgBloodPressure.toFixed(1)}
• Rata-rata Age: ${stats.avgAge.toFixed(1)}
  `.trim();
  
  alert(message);
}

/**
 * Hitung statistik dataset
 * @returns {Object} Objek berisi statistik
 */
function calculateDatasetStats() {
  const diabetesCount = filteredDataset.filter(row => row.diabetes === 1).length;
  const nonDiabetesCount = filteredDataset.length - diabetesCount;
  const total = filteredDataset.length;
  
  const avgGlucose = filteredDataset.reduce((sum, row) => sum + row.glucose, 0) / total;
  const avgBloodPressure = filteredDataset.reduce((sum, row) => sum + row.bloodpressure, 0) / total;
  const avgAge = filteredDataset.reduce((sum, row) => sum + row.age, 0) / total;
  
  return {
    total,
    diabetesCount,
    nonDiabetesCount,
    diabetesPercentage: ((diabetesCount / total) * 100).toFixed(1),
    nonDiabetesPercentage: ((nonDiabetesCount / total) * 100).toFixed(1),
    avgGlucose,
    avgBloodPressure,
    avgAge
  };
}

// ===========================
// Visualization
// ===========================

/**
 * Inisialisasi visualisasi scatter plot
 */
function initializeVisualization() {
  const canvas = document.getElementById('scatter-plot');
  if (!canvas) return;
  
  updateVisualization();
  
  // Event listeners untuk kontrol sumbu
  document.getElementById('x-axis').addEventListener('change', updateVisualization);
  document.getElementById('y-axis').addEventListener('change', updateVisualization);
  
  // Mouse events untuk tooltip
  canvas.addEventListener('mousemove', handleCanvasMouseMove);
  canvas.addEventListener('mouseleave', hideTooltip);
  canvas.addEventListener('click', handleCanvasClick);
}

/**
 * Update visualisasi scatter plot
 */
function updateVisualization() {
  const canvas = document.getElementById('scatter-plot');
  const ctx = canvas.getContext('2d');
  const xAxis = document.getElementById('x-axis').value;
  const yAxis = document.getElementById('y-axis').value;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (filteredDataset.length === 0) return;
  
  // Calculate ranges
  const xValues = filteredDataset.map(d => d[xAxis]);
  const yValues = filteredDataset.map(d => d[yAxis]);
  
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  
  const padding = 50;
  const plotWidth = canvas.width - 2 * padding;
  const plotHeight = canvas.height - 2 * padding;
  
  // Draw axes
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();
  
  // Draw axis labels
  ctx.fillStyle = '#666';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(xAxis, canvas.width / 2, canvas.height - 20);
  
  ctx.save();
  ctx.translate(20, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(yAxis, 0, 0);
  ctx.restore();
  
  // Draw data points
  filteredDataset.forEach((point, index) => {
    const x = padding + ((point[xAxis] - xMin) / (xMax - xMin)) * plotWidth;
    const y = canvas.height - padding - ((point[yAxis] - yMin) / (yMax - yMin)) * plotHeight;
    
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = point.diabetes ? '#e74c3c' : '#3498db';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Store point data for tooltip
    point._plotX = x;
    point._plotY = y;
  });
  
  // Draw legend
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.arc(canvas.width - 100, 30, 4, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = '#333';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Diabetes', canvas.width - 90, 35);
  
  ctx.fillStyle = '#3498db';
  ctx.beginPath();
  ctx.arc(canvas.width - 100, 50, 4, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = '#333';
  ctx.fillText('Non-diabetes', canvas.width - 90, 55);
}

/**
 * Handle mouse move pada canvas untuk tooltip
 * @param {Event} event - Mouse move event
 */
function handleCanvasMouseMove(event) {
  const canvas = document.getElementById('scatter-plot');
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  
  // Find nearest point
  let nearestPoint = null;
  let minDistance = Infinity;
  
  filteredDataset.forEach(point => {
    if (point._plotX !== undefined && point._plotY !== undefined) {
      const distance = Math.sqrt(
        Math.pow(mouseX - point._plotX, 2) + Math.pow(mouseY - point._plotY, 2)
      );
      
      if (distance < 10 && distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    }
  });
  
  if (nearestPoint) {
    showTooltip(event, nearestPoint);
  } else {
    hideTooltip();
  }
}

/**
 * Handle klik pada canvas
 * @param {Event} event - Click event
 */
function handleCanvasClick(event) {
  const canvas = document.getElementById('scatter-plot');
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  
  // Find clicked point
  let clickedPoint = null;
  
  filteredDataset.forEach(point => {
    if (point._plotX !== undefined && point._plotY !== undefined) {
      const distance = Math.sqrt(
        Math.pow(mouseX - point._plotX, 2) + Math.pow(mouseY - point._plotY, 2)
      );
      
      if (distance < 10) {
        clickedPoint = point;
      }
    }
  });
  
  if (clickedPoint) {
    // Set demo inputs to clicked point values
    document.getElementById('demo-glucose').value = clickedPoint.glucose;
    document.getElementById('demo-bp').value = clickedPoint.bloodpressure;
    document.getElementById('demo-age').value = clickedPoint.age;
    
    updateSliderValues();
    runAlgorithmDemo();
    
    showNotification('Data point dipilih untuk demo algoritma', 'info');
  }
}

/**
 * Tampilkan tooltip
 * @param {Event} event - Mouse event
 * @param {Object} point - Data point
 */
function showTooltip(event, point) {
  const tooltip = document.getElementById('tooltip');
  tooltip.innerHTML = `
    <strong>Glucose:</strong> ${point.glucose}<br>
    <strong>BloodPressure:</strong> ${point.bloodpressure}<br>
    <strong>Age:</strong> ${point.age}<br>
    <strong>Diabetes:</strong> ${point.diabetes ? 'Ya' : 'Tidak'}
  `;
  
  tooltip.style.display = 'block';
  tooltip.style.left = event.pageX + 10 + 'px';
  tooltip.style.top = event.pageY - 10 + 'px';
  tooltip.setAttribute('aria-hidden', 'false');
}

/**
 * Sembunyikan tooltip
 */
function hideTooltip() {
  const tooltip = document.getElementById('tooltip');
  tooltip.style.display = 'none';
  tooltip.setAttribute('aria-hidden', 'true');
}

// ===========================
// Algorithm Demo
// ===========================

/**
 * Update nilai slider yang ditampilkan
 */
function updateSliderValues() {
  document.getElementById('glucose-value').textContent = document.getElementById('demo-glucose').value;
  document.getElementById('bp-value').textContent = document.getElementById('demo-bp').value;
  document.getElementById('age-value').textContent = document.getElementById('demo-age').value;
}

/**
 * Jalankan demo algoritma
 */
function runAlgorithmDemo() {
  const glucose = parseInt(document.getElementById('demo-glucose').value);
  const bloodpressure = parseInt(document.getElementById('demo-bp').value);
  const age = parseInt(document.getElementById('demo-age').value);
  const algorithm = document.querySelector('input[name="algorithm"]:checked').value;
  
  const testData = { glucose, bloodpressure, age };
  
  let result;
  if (algorithm === 'nb') {
    result = runNaiveBayes(testData);
  } else {
    const k = parseInt(document.getElementById('k-value').value);
    result = runKNN(testData, k);
  }
  
  displayCalculationSteps(result);
}

/**
 * Implementasi algoritma Naive Bayes
 * @param {Object} testData - Data untuk diprediksi
 * @returns {Object} Hasil perhitungan
 */
function runNaiveBayes(testData) {
  const diabetesData = currentDataset.filter(d => d.diabetes === 1);
  const nonDiabetesData = currentDataset.filter(d => d.diabetes === 0);
  
  // Prior probabilities
  const priorDiabetes = diabetesData.length / currentDataset.length;
  const priorNonDiabetes = nonDiabetesData.length / currentDataset.length;
  
  // Calculate mean and variance for each class
  const features = ['glucose', 'bloodpressure', 'age'];
  const diabetesStats = {};
  const nonDiabetesStats = {};
  
  features.forEach(feature => {
    // Diabetes class statistics
    const diabetesValues = diabetesData.map(d => d[feature]);
    const diabetesMean = diabetesValues.reduce((sum, val) => sum + val, 0) / diabetesValues.length;
    const diabetesVariance = diabetesValues.reduce((sum, val) => sum + Math.pow(val - diabetesMean, 2), 0) / diabetesValues.length;
    
    diabetesStats[feature] = {
      mean: diabetesMean,
      variance: diabetesVariance,
      stddev: Math.sqrt(diabetesVariance)
    };
    
    // Non-diabetes class statistics
    const nonDiabetesValues = nonDiabetesData.map(d => d[feature]);
    const nonDiabetesMean = nonDiabetesValues.reduce((sum, val) => sum + val, 0) / nonDiabetesValues.length;
    const nonDiabetesVariance = nonDiabetesValues.reduce((sum, val) => sum + Math.pow(val - nonDiabetesMean, 2), 0) / nonDiabetesValues.length;
    
    nonDiabetesStats[feature] = {
      mean: nonDiabetesMean,
      variance: nonDiabetesVariance,
      stddev: Math.sqrt(nonDiabetesVariance)
    };
  });
  
  // Calculate likelihoods using Gaussian distribution
  let diabetesLikelihood = 1;
  let nonDiabetesLikelihood = 1;
  const likelihoodSteps = [];
  
  features.forEach(feature => {
    const value = testData[feature];
    
    // Gaussian probability density function
    const diabetesProb = gaussianPDF(value, diabetesStats[feature].mean, diabetesStats[feature].variance);
    const nonDiabetesProb = gaussianPDF(value, nonDiabetesStats[feature].mean, nonDiabetesStats[feature].variance);
    
    diabetesLikelihood *= diabetesProb;
    nonDiabetesLikelihood *= nonDiabetesProb;
    
    likelihoodSteps.push({
      feature,
      value,
      diabetesStats: diabetesStats[feature],
      nonDiabetesStats: nonDiabetesStats[feature],
      diabetesProb,
      nonDiabetesProb
    });
  });
  
  // Calculate posterior probabilities
  const diabetesPosterior = diabetesLikelihood * priorDiabetes;
  const nonDiabetesPosterior = nonDiabetesLikelihood * priorNonDiabetes;
  
  // Normalize
  const totalPosterior = diabetesPosterior + nonDiabetesPosterior;
  const finalDiabetesProb = diabetesPosterior / totalPosterior;
  const finalNonDiabetesProb = nonDiabetesPosterior / totalPosterior;
  
  const prediction = finalDiabetesProb > finalNonDiabetesProb ? 1 : 0;
  
  return {
    algorithm: 'Naive Bayes',
    testData,
    priorDiabetes,
    priorNonDiabetes,
    diabetesStats,
    nonDiabetesStats,
    likelihoodSteps,
    diabetesLikelihood,
    nonDiabetesLikelihood,
    diabetesPosterior,
    nonDiabetesPosterior,
    finalDiabetesProb,
    finalNonDiabetesProb,
    prediction,
    confidence: Math.max(finalDiabetesProb, finalNonDiabetesProb)
  };
}

/**
 * Gaussian Probability Density Function
 * @param {number} x - Nilai
 * @param {number} mean - Mean
 * @param {number} variance - Variance
 * @returns {number} Probability density
 */
function gaussianPDF(x, mean, variance) {
  const coefficient = 1 / Math.sqrt(2 * Math.PI * variance);
  const exponent = -Math.pow(x - mean, 2) / (2 * variance);
  return coefficient * Math.exp(exponent);
}

/**
 * Implementasi algoritma K-Nearest Neighbors
 * @param {Object} testData - Data untuk diprediksi
 * @param {number} k - Jumlah tetangga terdekat
 * @returns {Object} Hasil perhitungan
 */
function runKNN(testData, k) {
  // Calculate distances to all training data
  const distances = currentDataset.map(point => {
    const distance = euclideanDistance(testData, point);
    return {
      ...point,
      distance
    };
  });
  
  // Sort by distance and take k nearest
  distances.sort((a, b) => a.distance - b.distance);
  const kNearest = distances.slice(0, k);
  
  // Count votes
  const diabetesVotes = kNearest.filter(point => point.diabetes === 1).length;
  const nonDiabetesVotes = kNearest.filter(point => point.diabetes === 0).length;
  
  const prediction = diabetesVotes > nonDiabetesVotes ? 1 : 0;
  const confidence = Math.max(diabetesVotes, nonDiabetesVotes) / k;
  
  return {
    algorithm: `K-Nearest Neighbors (k=${k})`,
    testData,
    k,
    allDistances: distances,
    kNearest,
    diabetesVotes,
    nonDiabetesVotes,
    prediction,
    confidence
  };
}

/**
 * Hitung jarak Euclidean antara dua titik
 * @param {Object} point1 - Titik pertama
 * @param {Object} point2 - Titik kedua
 * @returns {number} Jarak Euclidean
 */
function euclideanDistance(point1, point2) {
  const glucose_diff = point1.glucose - point2.glucose;
  const bp_diff = point1.bloodpressure - point2.bloodpressure;
  const age_diff = point1.age - point2.age;
  
  return Math.sqrt(
    Math.pow(glucose_diff, 2) + 
    Math.pow(bp_diff, 2) + 
    Math.pow(age_diff, 2)
  );
}

/**
 * Tampilkan hasil perhitungan step-by-step
 * @param {Object} result - Hasil perhitungan algoritma
 */
function displayCalculationSteps(result) {
  const container = document.getElementById('calculation-steps');
  
  let html = `
    <div class="algorithm-result">
      <h3><i class="fas fa-calculator"></i> ${result.algorithm}</h3>
      <div class="prediction-result ${result.prediction ? 'diabetes' : 'no-diabetes'}">
        <strong>Prediksi:</strong> ${result.prediction ? 'Diabetes' : 'Tidak Diabetes'} 
        (Confidence: ${(result.confidence * 100).toFixed(1)}%)
      </div>
    </div>
    
    <div class="test-data">
      <h4>Data Input:</h4>
      <div class="data-display">
        <span>Glucose: ${result.testData.glucose}</span>
        <span>BloodPressure: ${result.testData.bloodpressure}</span>
        <span>Age: ${result.testData.age}</span>
      </div>
    </div>
  `;
  
  if (result.algorithm.includes('Naive Bayes')) {
    html += generateNaiveBayesSteps(result);
  } else {
    html += generateKNNSteps(result);
  }
  
  container.innerHTML = html;
}

/**
 * Generate HTML untuk langkah-langkah Naive Bayes
 * @param {Object} result - Hasil Naive Bayes
 * @returns {string} HTML string
 */
function generateNaiveBayesSteps(result) {
  let html = `
    <div class="calculation-section">
      <h4>1. Prior Probabilities</h4>
      <div class="calculation-step">
        <div class="formula">P(Diabetes) = ${result.priorDiabetes.toFixed(6)}</div>
        <div class="formula">P(Tidak Diabetes) = ${result.priorNonDiabetes.toFixed(6)}</div>
      </div>
    </div>
    
    <div class="calculation-section">
      <h4>2. Statistik Per Fitur</h4>
      <div class="stats-grid">
  `;
  
  const features = ['glucose', 'bloodpressure', 'age'];
  features.forEach(feature => {
    const diabetesStats = result.diabetesStats[feature];
    const nonDiabetesStats = result.nonDiabetesStats[feature];
    
    html += `
      <div class="feature-stats">
        <h5>${feature.charAt(0).toUpperCase() + feature.slice(1)}</h5>
        <div class="stat-row">
          <span class="diabetes">Diabetes:</span>
          <span>μ = ${diabetesStats.mean.toFixed(2)}, σ² = ${diabetesStats.variance.toFixed(2)}</span>
        </div>
        <div class="stat-row">
          <span class="no-diabetes">Tidak:</span>
          <span>μ = ${nonDiabetesStats.mean.toFixed(2)}, σ² = ${nonDiabetesStats.variance.toFixed(2)}</span>
        </div>
      </div>
    `;
  });
  
  html += `
      </div>
    </div>
    
    <div class="calculation-section">
      <h4>3. Likelihood Calculations</h4>
  `;
  
  result.likelihoodSteps.forEach(step => {
    html += `
      <div class="likelihood-step">
        <h5>${step.feature.charAt(0).toUpperCase() + step.feature.slice(1)} = ${step.value}</h5>
        <div class="likelihood-calc">
          <div class="formula">
            P(${step.value}|Diabetes) = ${step.diabetesProb.toExponential(4)}
          </div>
          <div class="formula">
            P(${step.value}|Tidak) = ${step.nonDiabetesProb.toExponential(4)}
          </div>
        </div>
      </div>
    `;
  });
  
  html += `
    </div>
    
    <div class="calculation-section">
      <h4>4. Combined Likelihoods</h4>
      <div class="calculation-step">
        <div class="formula">L(Diabetes) = ${result.diabetesLikelihood.toExponential(6)}</div>
        <div class="formula">L(Tidak Diabetes) = ${result.nonDiabetesLikelihood.toExponential(6)}</div>
      </div>
    </div>
    
    <div class="calculation-section">
      <h4>5. Posterior Probabilities</h4>
      <div class="calculation-step">
        <div class="formula">
          P(Diabetes|X) = ${result.diabetesPosterior.toExponential(6)} × Prior = ${result.finalDiabetesProb.toFixed(6)}
        </div>
        <div class="formula">
          P(Tidak|X) = ${result.nonDiabetesPosterior.toExponential(6)} × Prior = ${result.finalNonDiabetesProb.toFixed(6)}
        </div>
      </div>
    </div>
  `;
  
  return html;
}

/**
 * Generate HTML untuk langkah-langkah KNN
 * @param {Object} result - Hasil KNN
 * @returns {string} HTML string
 */
function generateKNNSteps(result) {
  let html = `
    <div class="calculation-section">
      <h4>1. Distance Calculations (Top 10)</h4>
      <div class="distance-table">
        <table>
          <thead>
            <tr>
              <th>Glucose</th>
              <th>BP</th>
              <th>Age</th>
              <th>Diabetes</th>
              <th>Distance</th>
            </tr>
          </thead>
          <tbody>
  `;
  
  result.allDistances.slice(0, 10).forEach(point => {
    html += `
      <tr class="${result.kNearest.includes(point) ? 'nearest' : ''}">
        <td>${point.glucose}</td>
        <td>${point.bloodpressure}</td>
        <td>${point.age}</td>
        <td>${point.diabetes ? 'Ya' : 'Tidak'}</td>
        <td>${point.distance.toFixed(3)}</td>
      </tr>
    `;
  });
  
  html += `
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="calculation-section">
      <h4>2. K=${result.k} Nearest Neighbors</h4>
      <div class="nearest-list">
  `;
  
  result.kNearest.forEach((neighbor, index) => {
    html += `
      <div class="neighbor-item ${neighbor.diabetes ? 'diabetes' : 'no-diabetes'}">
        <span class="neighbor-rank">${index + 1}.</span>
        <span class="neighbor-data">
          G:${neighbor.glucose}, BP:${neighbor.bloodpressure}, Age:${neighbor.age}
        </span>
        <span class="neighbor-class">${neighbor.diabetes ? 'Diabetes' : 'Tidak'}</span>
        <span class="neighbor-distance">${neighbor.distance.toFixed(3)}</span>
      </div>
    `;
  });
  
  html += `
      </div>
    </div>
    
    <div class="calculation-section">
      <h4>3. Voting Results</h4>
      <div class="voting-results">
        <div class="vote-count diabetes">
          <i class="fas fa-vote-yea"></i>
          Diabetes: ${result.diabetesVotes} suara
        </div>
        <div class="vote-count no-diabetes">
          <i class="fas fa-vote-yea"></i>
          Tidak Diabetes: ${result.nonDiabetesVotes} suara
        </div>
      </div>
    </div>
  `;
  
  return html;
}

/**
 * Tampilkan penjelasan algoritma
 */
function explainAlgorithm() {
  const algorithm = document.querySelector('input[name="algorithm"]:checked').value;
  
  let explanation = '';
  if (algorithm === 'nb') {
    explanation = `
NAIVE BAYES CLASSIFIER

Naive Bayes adalah algoritma klasifikasi probabilistik berdasarkan teorema Bayes dengan asumsi "naive" (naif) bahwa semua fitur independen satu sama lain.

Langkah-langkah:
1. Hitung Prior Probability untuk setiap kelas
2. Hitung Mean dan Variance untuk setiap fitur per kelas
3. Gunakan Gaussian PDF untuk menghitung likelihood
4. Kalikan semua likelihood per kelas
5. Hitung Posterior Probability menggunakan Bayes' Theorem
6. Pilih kelas dengan probabilitas tertinggi

Formula Bayes: P(Class|Features) = P(Features|Class) × P(Class) / P(Features)

Kelebihan:
• Cepat dan efisien
• Bekerja baik dengan dataset kecil
• Tidak memerlukan tuning parameter

Kekurangan:
• Asumsi independensi yang jarang terpenuhi di dunia nyata
• Sensitif terhadap fitur yang tidak relevan
    `;
  } else {
    explanation = `
K-NEAREST NEIGHBORS (KNN)

KNN adalah algoritma klasifikasi sederhana yang mengklasifikasikan data berdasarkan mayoritas kelas dari K tetangga terdekat.

Langkah-langkah:
1. Hitung jarak antara data test dengan semua data training
2. Urutkan berdasarkan jarak (ascending)
3. Pilih K data terdekat
4. Hitung voting dari K tetangga
5. Pilih kelas dengan suara terbanyak

Jarak yang digunakan: Euclidean Distance
d = √[(x₁-x₂)² + (y₁-y₂)² + (z₁-z₂)²]

Kelebihan:
• Sederhana dan mudah dipahami
• Tidak ada asumsi tentang distribusi data
• Efektif untuk dataset dengan pola kompleks

Kekurangan:
• Komputasi mahal untuk dataset besar
• Sensitif terhadap nilai K
• Performa menurun pada dimensi tinggi (curse of dimensionality)

Tips memilih K:
• K ganjil untuk menghindari tie
• K = √n (n = jumlah data) sebagai rule of thumb
• Cross-validation untuk K optimal
    `;
  }
  
  alert(explanation);
}

// ===========================
// Task Management
// ===========================

/**
 * Inisialisasi task board
 */
function initializeTaskBoard() {
  renderTaskBoard();
  updateProgress();
}

/**
 * Render task board
 */
function renderTaskBoard() {
  const container = document.getElementById('task-grid');
  
  const statusGroups = {
    todo: { title: 'To Do', tasks: [], class: 'todo' },
    progress: { title: 'In Progress', tasks: [], class: 'progress' },
    done: { title: 'Done', tasks: [], class: 'done' }
  };
  
  // Group tasks by status
  tasks.forEach(task => {
    if (statusGroups[task.status]) {
      statusGroups[task.status].tasks.push(task);
    }
  });
  
  let html = '';
  Object.entries(statusGroups).forEach(([status, group]) => {
    html += `
      <div class="task-column" data-status="${status}">
        <h3 class="task-column-header ${group.class}">
          ${group.title} (${group.tasks.length})
        </h3>
        <div class="task-list" ondrop="handleTaskDrop(event)" ondragover="handleTaskDragOver(event)">
    `;
    
    group.tasks.forEach(task => {
      html += `
        <div class="task-card ${group.class}" draggable="true" data-task-id="${task.id}" 
             ondragstart="handleTaskDragStart(event)">
          <div class="task-header">
            <h4>${escapeHtml(task.title)}</h4>
            <button class="task-delete" onclick="deleteTask('${task.id}')" aria-label="Hapus tugas">×</button>
          </div>
          <p class="task-description">${escapeHtml(task.description)}</p>
          <div class="task-meta">
            <span class="task-assignee">
              <i class="fas fa-user"></i> ${escapeHtml(task.assignee)}
            </span>
            <span class="task-due-date">
              <i class="fas fa-calendar"></i> ${formatDate(task.dueDate)}
            </span>
          </div>
          <div class="task-actions">
            <button class="btn-small" onclick="editTask('${task.id}')">
              <i class="fas fa-edit"></i> Edit
            </button>
            ${status !== 'done' ? `<button class="btn-small btn-success" onclick="markTaskComplete('${task.id}')">
              <i class="fas fa-check"></i> Selesai
            </button>` : ''}
          </div>
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

/**
 * Format tanggal untuk tampilan
 * @param {string} dateString - String tanggal
 * @returns {string} Tanggal yang diformat
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short'
  });
}

/**
 * Handle drag start untuk task
 * @param {Event} event - Drag event
 */
function handleTaskDragStart(event) {
  event.dataTransfer.setData('text/plain', event.target.dataset.taskId);
  event.target.style.opacity = '0.5';
}

/**
 * Handle drag over untuk drop zone
 * @param {Event} event - Drag event
 */
function handleTaskDragOver(event) {
  event.preventDefault();
}

/**
 * Handle drop task
 * @param {Event} event - Drop event
 */
function handleTaskDrop(event) {
  event.preventDefault();
  const taskId = event.dataTransfer.getData('text/plain');
  const newStatus = event.currentTarget.closest('.task-column').dataset.status;
  
  updateTaskStatus(taskId, newStatus);
  
  // Reset opacity
  document.querySelector(`[data-task-id="${taskId}"]`).style.opacity = '1';
}

/**
 * Update status tugas
 * @param {string} taskId - ID tugas
 * @param {string} newStatus - Status baru
 */
function updateTaskStatus(taskId, newStatus) {
  const task = tasks.find(t => t.id === taskId);
  if (task && task.status !== newStatus) {
    task.status = newStatus;
    saveTasks();
    renderTaskBoard();
    updateProgress();
    showNotification(`Tugas "${task.title}" dipindah ke ${newStatus}`, 'success');
  }
}

/**
 * Tandai tugas sebagai selesai
 * @param {string} taskId - ID tugas
 */
function markTaskComplete(taskId) {
  updateTaskStatus(taskId, 'done');
}

/**
 * Hapus tugas
 * @param {string} taskId - ID tugas
 */
function deleteTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task && confirm(`Hapus tugas "${task.title}"?`)) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTaskBoard();
    updateProgress();
    showNotification('Tugas berhasil dihapus', 'success');
  }
}

/**
 * Edit tugas
 * @param {string} taskId - ID tugas
 */
function editTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  
  const newTitle = prompt('Judul tugas:', task.title);
  if (newTitle && newTitle.trim()) {
    task.title = newTitle.trim();
    
    const newDescription = prompt('Deskripsi:', task.description);
    if (newDescription !== null) {
      task.description = newDescription.trim();
    }
    
    const newAssignee = prompt('Assignee:', task.assignee);
    if (newAssignee !== null && newAssignee.trim()) {
      task.assignee = newAssignee.trim();
    }
    
    const newDueDate = prompt('Due Date (YYYY-MM-DD):', task.dueDate);
    if (newDueDate !== null && newDueDate.trim()) {
      task.dueDate = newDueDate.trim();
    }
    
    saveTasks();
    renderTaskBoard();
    showNotification('Tugas berhasil diupdate', 'success');
  }
}

/**
 * Tambah tugas custom
 */
function addCustomTask() {
  const title = prompt('Judul tugas:');
  if (!title || !title.trim()) return;
  
  const description = prompt('Deskripsi:') || '';
  const assignee = prompt('Assignee:') || 'Unknown';
  const dueDate = prompt('Due Date (YYYY-MM-DD):') || new Date().toISOString().split('T')[0];
  
  const newTask = {
    id: Date.now().toString(),
    title: title.trim(),
    description: description.trim(),
    assignee: assignee.trim(),
    status: 'todo',
    dueDate
  };
  
  tasks.push(newTask);
  saveTasks();
  renderTaskBoard();
  updateProgress();
  showNotification('Tugas baru berhasil ditambahkan', 'success');
}

/**
 * Export tasks sebagai JSON
 */
function exportTasks() {
  const dataStr = JSON.stringify(tasks, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'tasks.json');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('Tasks berhasil diexport', 'success');
}

/**
 * Simpan tasks ke localStorage
 */
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Update progress bar berdasarkan completed tasks
 */
function updateProgress() {
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  
  if (progressFill && progressText) {
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${Math.round(progress)}%`;
    
    // Update aria-valuenow
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
      progressBar.setAttribute('aria-valuenow', Math.round(progress));
    }
  }
}

// ===========================
// Timeline
// ===========================

/**
 * Inisialisasi timeline
 */
function initializeTimeline() {
  renderTimeline();
}

/**
 * Render timeline
 */
function renderTimeline() {
  const container = document.getElementById('timeline');
  
  let html = '';
  timeline.forEach((item, index) => {
    html += `
      <div class="timeline-item ${item.completed ? 'completed' : 'pending'}">
        <div class="timeline-marker">
          ${item.completed ? '<i class="fas fa-check"></i>' : '<i class="far fa-circle"></i>'}
        </div>
        <div class="timeline-content">
          <div class="timeline-date">${formatDate(item.date)}</div>
          <h4 class="timeline-title">${escapeHtml(item.title)}</h4>
          <p class="timeline-description">${escapeHtml(item.description)}</p>
          <button class="btn-small ${item.completed ? 'btn-secondary' : 'btn-success'}" 
                  onclick="toggleTimelineItem(${index})">
            ${item.completed ? 'Mark Incomplete' : 'Mark Complete'}
          </button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

/**
 * Toggle status timeline item
 * @param {number} index - Index timeline item
 */
function toggleTimelineItem(index) {
  if (timeline[index]) {
    timeline[index].completed = !timeline[index].completed;
    renderTimeline();
    showNotification(
      `Timeline item "${timeline[index].title}" ${timeline[index].completed ? 'completed' : 'marked incomplete'}`,
      'success'
    );
  }
}

// ===========================
// Modal Management
// ===========================

/**
 * Tutup modal
 * @param {string} modalId - ID modal
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
  }
}

/**
 * Buka modal
 * @param {string} modalId - ID modal
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
    
    // Focus pada elemen pertama yang bisa difocus
    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) {
      focusable.focus();
    }
  }
}

// ===========================
// PDF Export
// ===========================

/**
 * Export halaman ke PDF menggunakan print dialog
 */
function exportToPDF() {
  // Hide controls for print
  document.body.classList.add('printing');
  
  // Trigger print dialog
  window.print();
  
  // Show controls back after print
  setTimeout(() => {
    document.body.classList.remove('printing');
  }, 1000);
  
  showNotification('Print dialog dibuka untuk export PDF', 'info');
}

// ===========================
// Keyboard Shortcuts
// ===========================

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyboardShortcuts(event) {
  // Skip if user is typing in input/textarea
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) {
    return;
  }
  
  const key = event.key.toLowerCase();
  
  switch (key) {
    case 'd':
      event.preventDefault();
      downloadDataset();
      break;
      
    case 'i':
      event.preventDefault();
      showDatasetInfo();
      break;
      
    case 't':
      event.preventDefault();
      toggleTheme();
      break;
      
    case 's':
      event.preventDefault();
      const searchInput = document.getElementById('dataset-search');
      if (searchInput) {
        searchInput.focus();
      }
      break;
      
    case '?':
      event.preventDefault();
      openModal('shortcuts-modal');
      break;
      
    case 'escape':
      // Close any open modals
      document.querySelectorAll('.modal').forEach(modal => {
        if (modal.style.display === 'flex') {
          closeModal(modal.id);
        }
      });
      break;
  }
}

// ===========================
// Event Listeners & Initialization
// ===========================

/**
 * Inisialisasi semua event listeners
 */
function initializeEventListeners() {
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Shortcuts modal
  const shortcutsBtn = document.getElementById('shortcuts-btn');
  if (shortcutsBtn) {
    shortcutsBtn.addEventListener('click', () => openModal('shortcuts-modal'));
  }
  
  // Dataset controls
  const searchInput = document.getElementById('dataset-search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(filterDataset, 300));
  }
  
  const clearSearch = document.getElementById('clear-search');
  if (clearSearch) {
    clearSearch.addEventListener('click', () => {
      searchInput.value = '';
      filterDataset();
    });
  }
  
  const rowsSelect = document.getElementById('rows-per-page');
  if (rowsSelect) {
    rowsSelect.addEventListener('change', handleRowsPerPageChange);
  }
  
  // Table sorting
  document.querySelectorAll('th[data-column]').forEach(th => {
    th.addEventListener('click', handleSort);
    th.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSort(e);
      }
    });
  });
  
  // Filter inputs
  document.querySelectorAll('.filter-input').forEach(input => {
    input.addEventListener('input', debounce(filterDataset, 300));
  });
  
  // CSV upload
  const csvUpload = document.getElementById('csv-upload');
  if (csvUpload) {
    csvUpload.addEventListener('change', handleCSVUpload);
  }
  
  // Demo algorithm sliders
  const sliders = ['demo-glucose', 'demo-bp', 'demo-age'];
  sliders.forEach(sliderId => {
    const slider = document.getElementById(sliderId);
    if (slider) {
      slider.addEventListener('input', updateSliderValues);
    }
  });
  
  // Algorithm radio buttons
  document.querySelectorAll('input[name="algorithm"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const kValueInput = document.getElementById('k-value');
      const isKNN = radio.value === 'knn';
      kValueInput.style.display = isKNN ? 'inline' : 'none';
    });
  });
  
  // Global keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
  
  // Modal close on outside click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      closeModal(e.target.id);
    }
  });
  
  // Close modal on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal[style*="flex"]').forEach(modal => {
        closeModal(modal.id);
      });
    }
  });
  
  // Prevent drag default behavior except for our drag&drop
  document.addEventListener('dragover', (e) => {
    if (!e.target.closest('.task-list')) {
      e.preventDefault();
    }
  });
  
  document.addEventListener('drop', (e) => {
    if (!e.target.closest('.task-list')) {
      e.preventDefault();
    }
  });
}

/**
 * Debounce function untuk mengurangi frequent calls
 * @param {Function} func - Function yang akan di-debounce
 * @param {number} wait - Waktu tunggu dalam ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 300);
  }
}

// ===========================
// Simple Unit Tests
// ===========================

/**
 * Run simple unit tests untuk core functions
 */
function runUnitTests() {
  console.log('🧪 Running Unit Tests...');
  
  const tests = [
    {
      name: 'parseCSV',
      test: () => {
        const csv = 'glucose,bloodpressure,age,diabetes\n148,72,50,1\n85,66,31,0';
        const result = parseCSV(csv);
        return result.length === 2 && result[0].glucose === 148 && result[1].diabetes === 0;
      }
    },
    {
      name: 'arrayToCSV',
      test: () => {
        const data = [{a: 1, b: 2}, {a: 3, b: 4}];
        const csv = arrayToCSV(data);
        return csv.includes('a,b') && csv.includes('1,2') && csv.includes('3,4');
      }
    },
    {
      name: 'euclideanDistance',
      test: () => {
        const p1 = {glucose: 0, bloodpressure: 0, age: 0};
        const p2 = {glucose: 3, bloodpressure: 4, age: 0};
        const distance = euclideanDistance(p1, p2);
        return Math.abs(distance - 5) < 0.001; // 3-4-5 triangle
      }
    },
    {
      name: 'gaussianPDF',
      test: () => {
        const result = gaussianPDF(0, 0, 1); // Standard normal at origin
        const expected = 1 / Math.sqrt(2 * Math.PI);
        return Math.abs(result - expected) < 0.001;
      }
    },
    {
      name: 'formatNumber',
      test: () => {
        const result = formatNumber(1234.56);
        return result.includes('1') && result.includes('234');
      }
    },
    {
      name: 'escapeHtml',
      test: () => {
        const result = escapeHtml('<script>alert("xss")</script>');
        return !result.includes('<script>') && result.includes('&lt;');
      }
    },
    {
      name: 'sortDataset functionality',
      test: () => {
        const testData = [
          {glucose: 200, bloodpressure: 80, age: 40, diabetes: 1},
          {glucose: 100, bloodpressure: 60, age: 20, diabetes: 0}
        ];
        filteredDataset = [...testData];
        sortDataset('glucose', 'asc');
        return filteredDataset[0].glucose === 100 && filteredDataset[1].glucose === 200;
      }
    },
    {
      name: 'calculateDatasetStats',
      test: () => {
        filteredDataset = [
          {glucose: 100, bloodpressure: 80, age: 30, diabetes: 1},
          {glucose: 200, bloodpressure: 70, age: 40, diabetes: 0}
        ];
        const stats = calculateDatasetStats();
        return stats.total === 2 && stats.avgGlucose === 150 && stats.diabetesCount === 1;
      }
    },
    {
      name: 'KNN algorithm',
      test: () => {
        currentDataset = [
          {glucose: 100, bloodpressure: 80, age: 30, diabetes: 0},
          {glucose: 200, bloodpressure: 90, age: 50, diabetes: 1},
          {glucose: 150, bloodpressure: 85, age: 40, diabetes: 1}
        ];
        const result = runKNN({glucose: 180, bloodpressure: 88, age: 45}, 2);
        return result.prediction !== undefined && result.k === 2;
      }
    },
    {
      name: 'Naive Bayes algorithm',
      test: () => {
        currentDataset = [
          {glucose: 100, bloodpressure: 80, age: 30, diabetes: 0},
          {glucose: 200, bloodpressure: 90, age: 50, diabetes: 1},
          {glucose: 150, bloodpressure: 85, age: 40, diabetes: 1},
          {glucose: 120, bloodpressure: 75, age: 35, diabetes: 0}
        ];
        const result = runNaiveBayes({glucose: 160, bloodpressure: 88, age: 42});
        return result.prediction !== undefined && result.confidence > 0 && result.confidence <= 1;
      }
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    try {
      const result = test.test();
      if (result) {
        console.log(`✅ ${test.name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED`);
        failed++;
      }
    } catch (error) {
      console.log(`💥 ${test.name}: ERROR -`, error.message);
      failed++;
    }
  });
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check implementation.');
  }
}

// ===========================
// Application Initialization
// ===========================

/**
 * Inisialisasi aplikasi saat DOM loaded
 */
function initializeApplication() {
  console.log('🚀 Initializing ML Demo Application...');
  
  // Initialize theme first
  initializeTheme();
  
  // Initialize all components
  initializeDataset();
  initializeVisualization();
  initializeTaskBoard();
  initializeTimeline();
  
  // Setup all event listeners
  initializeEventListeners();
  
  // Update slider values
  updateSliderValues();
  
  // Hide loading screen
  hideLoadingScreen();
  
  // Run unit tests in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(runUnitTests, 1000);
  }
  
  // Show welcome notification
  setTimeout(() => {
    showNotification('Aplikasi ML Demo berhasil dimuat! Tekan ? untuk melihat pintasan keyboard.', 'success');
  }, 500);
  
  console.log('✅ Application initialized successfully');
}

/**
 * Handle reduced motion preferences
 */
function handleReducedMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--animation-duration', '0s');
    document.documentElement.style.setProperty('--transition-duration', '0s');
  }
}

// ===========================
// Main Application Entry Point
// ===========================

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    handleReducedMotion();
    initializeApplication();
  });
} else {
  // DOM is already loaded
  handleReducedMotion();
  initializeApplication();
}

// Handle page visibility change for performance
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Refresh visualizations when page becomes visible
    updateVisualization();
  }
});

// Handle window resize for responsive canvas
window.addEventListener('resize', debounce(() => {
  updateVisualization();
}, 250));

// Expose some functions to global scope for HTML onclick handlers
window.downloadDataset = downloadDataset;
window.showDatasetInfo = showDatasetInfo;
window.exportToPDF = exportToPDF;
window.runAlgorithmDemo = runAlgorithmDemo;
window.explainAlgorithm = explainAlgorithm;
window.exportTasks = exportTasks;
window.addCustomTask = addCustomTask;
window.deleteTask = deleteTask;
window.editTask = editTask;
window.markTaskComplete = markTaskComplete;
window.updateTaskStatus = updateTaskStatus;
window.toggleTimelineItem = toggleTimelineItem;
window.changePage = changePage;
window.closeModal = closeModal;
window.openModal = openModal;
window.handleTaskDragStart = handleTaskDragStart;
window.handleTaskDragOver = handleTaskDragOver;
window.handleTaskDrop = handleTaskDrop;

// Export main functions for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseCSV,
    arrayToCSV,
    euclideanDistance,
    gaussianPDF,
    runNaiveBayes,
    runKNN,
    escapeHtml,
    formatNumber
  };
}
