import dashboardTemplate from "../templates/dashboard.template.js";

import copilotWidgetTemplate from "./copilotWidget.template.js";

const importProductsTemplate = () => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Import Products – Dynamic Generator</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin:0; padding:0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background:#eaf0f4; color:#1f1e24; min-height:100vh; }
    header { background:#1f1e24; color:#fff; padding:16px 32px; display:flex; justify-content:space-between; align-items:center; }
    .brand { font-family:'Noto Serif',serif; font-size:20px; font-weight:700; }
    .container { max-width:960px; margin:32px auto; padding:0 20px; }
    h1 { font-size:28px; margin-bottom:24px; color:#5f9104; }
    .step { margin-bottom:24px; background:#fff; border:1px solid #cbd5dd; border-radius:12px; padding:20px; box-shadow:0 4px 12px rgba(0,0,0,0.03); }
    .step h2 { font-size:20px; margin-bottom:12px; color:#1f1e24; }
    .step p { margin-bottom:12px; color:#595862; }
    .file-input { margin-top:8px; }
    .btn-primary { background:#5f9104; color:#fff; border:none; padding:10px 18px; border-radius:8px; cursor:pointer; font-weight:700; }
    .btn-primary:hover { background:#4d7703; }
    .summary, .history { margin-top:32px; background:#fff; padding:20px; border:1px solid #cbd5dd; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.03); }
    table { width:100%; border-collapse:collapse; }
    th, td { padding:10px; text-align:left; border-bottom:1px solid #eaf0f4; }
    th { background:#1f1e24; color:#fff; }
    .alert { padding:12px; margin-top:12px; border-radius:6px; }
    .alert-error { background:#fee2e2; color:#991b1b; }
    .alert-success { background:#d1fae5; color:#065f46; }
  </style>
</head>
<body>
<header>
  <div class="brand">⚡ ProductGen</div>
  <a href="/dashboard" class="btn-primary" style="background:#1f1e24;">Back to Dashboard</a>
</header>
<div class="container">
  <h1>Import Products</h1>

  <div class="step" id="step1">
    <h2>Step 1 – Upload Excel</h2>
    <p>Select the product spreadsheet (XLSX) that contains product rows and an <code>Image Name</code> column.</p>
    <input type="file" id="excel-file" accept=".xlsx,.xls,.csv" class="file-input" />
  </div>

  <div class="step" id="step2">
    <h2>Step 2 – Upload Images</h2>
    <p>Choose all product image files that match the names listed in the Excel sheet.</p>
    <input type="file" id="image-files" accept="image/*" multiple class="file-input" />
  </div>

  <div class="step" id="step3">
    <h2>Step 3 – Import</h2>
    <p>Click the button below to start the import process. The system will upload the images, then process the Excel file, link images, and generate product pages.</p>
    <button id="import-btn" class="btn-primary">Import Products</button>
    <div id="message"></div>
  </div>

  <div class="summary" id="import-summary" style="display:none;">
    <h2>Import Completed Successfully</h2>
    <ul id="summary-list"></ul>
  </div>

  <div class="history" id="import-history">
    <h2>Import History</h2>
    <table>
      <thead>
        <tr>
          <th>#</th><th>Date</th><th>By</th><th>Products Imported</th><th>Images Matched</th><th>Missing Images</th><th>Status</th>
        </tr>
      </thead>
      <tbody id="history-body">
        <tr><td colspan="7" style="text-align:center; color:#595862;">Loading history...</td></tr>
      </tbody>
    </table>
  </div>
</div>
<script>
  const token = localStorage.getItem('token') || '';
  const user = JSON.parse(localStorage.getItem('user')||'{}');

  const showMessage = (msg, type='error') => {
    const el = document.getElementById('message');
    const className = type === 'error' ? 'alert alert-error' : 'alert alert-success';
    el.innerHTML = '<div class="' + className + '">' + msg + '</div>';
  };

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/v1/import/logs', { headers: token ? { 'Authorization': 'Bearer '+token } : {} });
      const data = await res.json();
      const tbody = document.getElementById('history-body');
      if (!res.ok) throw new Error(data.message||'Failed');
      if (!data.data || data.data.length===0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#595862;">No import history yet.</td></tr>';
        return;
      }
      tbody.innerHTML = data.data.map((log,i)=>
        '<tr>' +
          '<td>' + (i+1) + '</td>' +
          '<td>' + new Date(log.createdAt).toLocaleString() + '</td>' +
          '<td>' + (log.importedBy || '—') + '</td>' +
          '<td>' + (log.productsImported || 0) + '</td>' +
          '<td>' + (log.imagesMatched || 0) + '</td>' +
          '<td>' + (log.missingImages || 0) + '</td>' +
          '<td>' + (log.status || 'SUCCESS') + '</td>' +
        '</tr>'
      ).join('');
    } catch(e) {
      console.error(e);
    }
  };

  document.getElementById('import-btn').addEventListener('click', async () => {
    const excelInput = document.getElementById('excel-file');
    const imgInput = document.getElementById('image-files');
    if (!excelInput.files.length) return showMessage('Please upload an Excel file.');
    if (!imgInput.files.length) return showMessage('Please upload product images.');
    showMessage('Uploading images...', 'success');
    // Upload images first
    const imgForm = new FormData();
    Array.from(imgInput.files).forEach(f=> imgForm.append('images', f));
    try {
      const imgRes = await fetch('/api/v1/uploads/images', {
        method:'POST', headers: token?{'Authorization':'Bearer '+token}:{}, body: imgForm
      });
      if (!imgRes.ok) { const err = await imgRes.json(); throw new Error(err.message||'Image upload failed'); }
      // Upload Excel
      const excelForm = new FormData();
      excelForm.append('file', excelInput.files[0]);
      const excelRes = await fetch('/api/v1/excel/import', {
        method:'POST', headers: token?{'Authorization':'Bearer '+token}:{}, body: excelForm
      });
      const excelData = await excelRes.json();
      if (!excelRes.ok) { throw new Error(excelData.message||'Excel import failed'); }
      // Show summary
      const summary = document.getElementById('import-summary');
      const list = document.getElementById('summary-list');
      summary.style.display='block';
      const count = excelData.totalProducts || (excelData.data ? excelData.data.length : 0);
      list.innerHTML = 
        '<li>Products Imported: ' + count + '</li>' +
        '<li>Images Matched: ' + (excelData.imagesMatched || '—') + '</li>' +
        '<li>Missing Images: ' + (excelData.missingImages || '—') + '</li>' +
        '<li>Import Duration: ' + (excelData.duration || '—') + ' seconds</li>';
      showMessage('Import completed successfully.', 'success');
      loadHistory();
    } catch (err) {
      showMessage(err.message);
    }
  });

  // Initial load of history
  loadHistory();
</script>
${copilotWidgetTemplate()}
</body>
</html>`;
};

export default importProductsTemplate;
