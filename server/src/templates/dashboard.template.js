import copilotWidgetTemplate from "./copilotWidget.template.js";

const dashboardTemplate = () => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard - ProductGen</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #eaf0f4; color: #1f1e24; min-height: 100vh; }

    header { background: #1f1e24; color: #ffffff; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
    .brand-logo { font-family: 'Noto Serif', serif; font-size: 20px; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 10px; }
    .user-pill { background: rgba(255, 255, 255, 0.1); padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.2); font-size: 13px; color: #b7bd7f; }

    .btn-link { color: #b7bd7f; text-decoration: none; font-size: 13px; font-weight: 600; }
    .btn-link:hover { color: #ffffff; text-decoration: underline; }

    .btn-logout { background: transparent; border: 1px solid rgba(255,255,255,0.3); color: #ffffff; padding: 6px 14px; border-radius: 8px; font-size: 13px; cursor: pointer; }
    .btn-logout:hover { background: #dc2626; border-color: #dc2626; }

    main { max-width: 1280px; margin: 0 auto; padding: 32px 20px; }

    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .metric-card { background: #ffffff; border: 1px solid #cbd5dd; border-radius: 14px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .metric-label { font-size: 12px; color: #595862; margin-bottom: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .metric-value { font-family: 'Noto Serif', serif; font-size: 28px; font-weight: 700; color: #1f1e24; }

    .control-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
    .filter-group { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 280px; }
    input[type="text"], select { background: #ffffff; border: 1px solid #cbd5dd; border-radius: 8px; padding: 10px 14px; color: #1f1e24; font-family: inherit; font-size: 14px; outline: none; }
    input[type="text"]:focus, select:focus { border-color: #5f9104; }

    .action-group { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .btn { padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 8px; transition: transform 0.15s, background 0.2s; }
    .btn:active { transform: scale(0.98); }
    .btn-primary { background: #5f9104; color: #ffffff; box-shadow: 0 4px 12px rgba(95, 145, 4, 0.3); }
    .btn-primary:hover { background: #4d7703; }
    .btn-secondary { background: #ffffff; color: #1f1e24; border: 1px solid #cbd5dd; }
    .btn-secondary:hover { border-color: #5f9104; }

    .bulk-toolbar { background: #1f1e24; color: #ffffff; padding: 12px 20px; border-radius: 10px; display: none; align-items: center; justify-content: space-between; margin-bottom: 16px; font-weight: 700; }
    .bulk-toolbar.active { display: flex !important; }
    .btn-bulk { background: rgba(255, 255, 255, 0.2); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.3); padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; }

    .table-card { background: #ffffff; border: 1px solid #cbd5dd; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background: #1f1e24; padding: 14px 16px; font-size: 12px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5dd; }
    td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid #eaf0f4; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(95, 145, 4, 0.05); }

    .prod-thumb { width: 44px; height: 44px; border-radius: 6px; object-fit: cover; background: #eaf0f4; border: 1px solid #cbd5dd; }
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; display: inline-block; }
    .badge-active { background: #d1fae5; color: #065f46; }
    .badge-inactive { background: #fee2e2; color: #991b1b; }
    .badge-low { background: #fef3c7; color: #92400e; }

    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); display: none; align-items: center; justify-content: center; z-index: 10000; padding: 20px; }
    .modal-overlay.active { display: flex !important; }
    .modal { background: #ffffff; border: 1px solid #cbd5dd; border-radius: 16px; width: 100%; max-width: 540px; padding: 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); position: relative; max-height: 90vh; overflow-y: auto; }
    .modal-title { font-family: 'Noto Serif', serif; font-size: 18px; font-weight: 700; margin-bottom: 20px; color: #1f1e24; }
    .close-btn { position: absolute; top: 20px; right: 20px; background: transparent; border: none; color: #595862; font-size: 24px; cursor: pointer; }
    .form-field { margin-bottom: 16px; }
    .form-field label { display: block; font-size: 12px; font-weight: 600; color: #595862; margin-bottom: 6px; }
    .form-field input, .form-field textarea, .form-field select { width: 100%; }
    textarea { background: #eaf0f4; border: 1px solid #cbd5dd; border-radius: 8px; padding: 10px 14px; font-family: inherit; font-size: 14px; outline: none; resize: vertical; }
    .no-image-placeholder { width: 44px; height: 44px; border-radius: 6px; background: #eaf0f4; border: 1px dashed #cbd5dd; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #595862; text-align: center; line-height: 1.1; font-weight: 600; }
    .report-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    .report-table th, .report-table td { border: 1px solid #cbd5dd; padding: 10px; text-align: left; }
    .report-table th { background: #f8fafc; font-weight: 700; color: #595862; }
  </style>
</head>
<body>

  <header>
    <div class="brand-logo">⚡ ProductGen Dashboard</div>
    <div style="display:flex; gap:16px; align-items:center;">
      <a href="/products" class="btn-link" target="_blank">View Storefront ↗</a>
      <span id="user-display" class="user-pill">Admin User</span>
      <button class="btn-logout" id="logout-btn" onclick="logout(event)">Logout</button>
    </div>
  </header>

  <main>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Total Products</div>
        <div class="metric-value" id="metric-total">0</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Active Items</div>
        <div class="metric-value" id="metric-active" style="color: #5f9104;">0</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Low Stock Warning</div>
        <div class="metric-value" id="metric-low" style="color: #d97706;">0</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Categories</div>
        <div class="metric-value" id="metric-categories" style="color: #5f9104;">0</div>
      </div>
    </div>

    <div class="control-bar">
      <div class="filter-group">
        <input type="text" id="search-input" placeholder="Search products..." style="flex: 1;">
        <select id="category-filter">
          <option value="">All Categories</option>
        </select>
      </div>

      <div class="action-group">
        <button type="button" class="btn btn-secondary" id="btn-images-open" onclick="openImagesModal(event)">🖼️ Upload Photos</button>
        <button type="button" class="btn btn-secondary" id="btn-excel-open" onclick="openExcelModal(event)">📥 Upload Excel</button>
        <button type="button" class="btn btn-secondary" id="btn-export-zip" onclick="exportZip(event)">⚡ Export Offline (ZIP)</button>
        <a href="/import" class="btn btn-primary" style="background:#5f9104; color:#fff;">Import Products</a>
      </div>
    </div>

    <div id="bulk-toolbar" class="bulk-toolbar">
      <span id="bulk-count">0 items selected</span>
      <div style="display:flex; gap:10px;">
        <button type="button" class="btn-bulk" onclick="bulkStatus('ACTIVE')">Activate</button>
        <button type="button" class="btn-bulk" onclick="bulkStatus('INACTIVE')">Deactivate</button>
        <button type="button" class="btn-bulk" onclick="openBulkSpecsModal(event)">Edit Specs</button>
        <button type="button" class="btn-bulk" style="background: rgba(220, 38, 38, 0.9);" onclick="bulkDelete()">Delete Selected</button>
      </div>
    </div>

    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th style="width: 40px;"><input type="checkbox" id="master-checkbox" onchange="toggleSelectAll(this)"></th>
            <th style="width: 60px;">Image</th>
            <th>Product Name</th>
            <th>Brand</th>
            <th>Category</th>
            <th>Price (INR)</th>
            <th>Stock</th>
            <th>Status</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody id="products-table-body">
          <tr>
            <td colspan="9" style="text-align: center; color: #595862; padding: 40px;">Loading catalog products...</td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>

  <!-- Upload Photos Modal -->
  <div id="images-modal" class="modal-overlay">
    <div class="modal">
      <button type="button" class="close-btn" onclick="closeImagesModal(event)">&times;</button>
      <div class="modal-title">Bulk Upload Product Photos</div>
      <form id="images-form">
        <p style="font-size: 13px; color: #595862; margin-bottom: 16px;">
          Select one or multiple product photo files (.jpg, .png, .webp). The system will automatically link them to matching products by name or brand!
        </p>
        <div class="form-field">
          <label>Product Photos (Multiple Files)</label>
          <input type="file" id="bulk-photos" accept="image/*" multiple required style="background: #eaf0f4; padding: 8px;">
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 10px;">Upload & Link Photos</button>
      </form>
    </div>
  </div>

  <!-- Add Product Modal -->
  <div id="add-modal" class="modal-overlay">
    <div class="modal">
      <button type="button" class="close-btn" onclick="closeAddModal(event)">&times;</button>
      <div class="modal-title">Create New Product</div>
      <form id="add-product-form">
        <div class="form-field">
          <label>Product Name</label>
          <input type="text" id="add-name" required placeholder="e.g. Industrial Sensor Node">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <div class="form-field">
            <label>Brand</label>
            <input type="text" id="add-brand" required placeholder="e.g. NexusCore">
          </div>
          <div class="form-field">
            <label>Category</label>
            <input type="text" id="add-category" required placeholder="e.g. Electronics">
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <div class="form-field">
            <label>Price (INR)</label>
            <input type="number" id="add-price" required placeholder="9999">
          </div>
          <div class="form-field">
            <label>Stock Units</label>
            <input type="number" id="add-stock" required placeholder="10">
          </div>
        </div>
        <div class="form-field">
          <label>Product Description</label>
          <textarea id="add-description" rows="3" required placeholder="Detailed item details..."></textarea>
        </div>
        <div class="form-field">
          <label>Product Image File</label>
          <input type="file" id="add-image" accept="image/*" required style="background: #eaf0f4; padding: 8px;">
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 10px;">Save & Publish Product</button>
      </form>
    </div>
  </div>

  <!-- Upload Excel Modal -->
  <div id="excel-modal" class="modal-overlay">
    <div class="modal">
      <button type="button" class="close-btn" onclick="closeExcelModal(event)">&times;</button>
      <div class="modal-title">Bulk Import via Excel</div>
      <form id="excel-form">
        <p style="font-size: 13px; color: #595862; margin-bottom: 16px;">
          Select an Excel file (.xlsx or .csv) containing product records. Optionally attach product photos at the same time!
        </p>
        <div class="form-field">
          <label>Excel File</label>
          <input type="file" id="excel-file" accept=".xlsx, .xls, .csv" required style="background: #eaf0f4; padding: 8px;">
        </div>
        <div class="form-field">
          <label>Product Photos (Optional Multiple Files)</label>
          <input type="file" id="excel-images" accept="image/*" multiple style="background: #eaf0f4; padding: 8px;">
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 10px;">Upload & Parse Products</button>
      </form>
    </div>
  </div>

  <!-- Bulk Specs Modal -->
  <div id="specs-modal" class="modal-overlay">
    <div class="modal">
      <button type="button" class="close-btn" onclick="closeBulkSpecsModal(event)">&times;</button>
      <div class="modal-title">Bulk Edit Specifications</div>
      <form id="specs-form">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <div class="form-field">
            <label>Spec Key</label>
            <input type="text" id="spec-key" required placeholder="Warranty">
          </div>
          <div class="form-field">
            <label>Spec Value</label>
            <input type="text" id="spec-val" required placeholder="2 Years">
          </div>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 10px;">Apply to Selected Items</button>
      </form>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div id="delete-modal" class="modal-overlay">
    <div class="modal" style="max-width: 440px;">
      <button type="button" class="close-btn" onclick="closeDeleteModal(event)">&times;</button>
      <div class="modal-title" style="color: #dc2626;">Delete Product</div>
      <p style="font-size: 14px; color: #595862; margin-top: 12px; margin-bottom: 20px; line-height: 1.5;">
        Are you sure you want to delete <strong id="delete-product-name" style="color: #1f1e24;">this product</strong>?<br>
        <span style="font-size: 13px; color: #dc2626; display: inline-block; margin-top: 6px;">This action cannot be undone.</span>
      </p>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button type="button" class="btn" onclick="closeDeleteModal(event)" style="background: #eaf0f4; color: #1f1e24;">Cancel</button>
        <button type="button" id="confirm-delete-btn" onclick="executeDeleteProduct()" class="btn" style="background: #dc2626; color: #fff;">Delete</button>
      </div>
    </div>
  </div>

  <!-- Import Report Modal -->
  <div id="import-report-modal" class="modal-overlay">
    <div class="modal" style="max-width: 650px;">
      <button type="button" class="close-btn" onclick="closeImportReportModal(event)">&times;</button>
      <div class="modal-title">Bulk Import Summary</div>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #cbd5dd;">
          <div style="font-size: 11px; font-weight: 700; color: #595862; text-transform: uppercase;">Products Imported</div>
          <div id="report-imported" style="font-size: 24px; font-weight: 700; color: #1f1e24; margin-top: 4px;">0</div>
        </div>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #cbd5dd;">
          <div style="font-size: 11px; font-weight: 700; color: #595862; text-transform: uppercase;">Images Matched</div>
          <div id="report-matched" style="font-size: 24px; font-weight: 700; color: #5f9104; margin-top: 4px;">0</div>
        </div>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #cbd5dd;">
          <div style="font-size: 11px; font-weight: 700; color: #595862; text-transform: uppercase;">Warnings / Missing</div>
          <div id="report-warnings" style="font-size: 24px; font-weight: 700; color: #d97706; margin-top: 4px;">0</div>
        </div>
      </div>
      
      <div style="font-size: 13px; font-weight: 700; margin-bottom: 8px;">Detailed Item Breakdown:</div>
      <div style="max-height: 250px; overflow-y: auto; border: 1px solid #cbd5dd; border-radius: 8px;">
        <table class="report-table" style="margin-top: 0; border: none;">
          <thead style="position: sticky; top: 0; z-index: 1;">
            <tr>
              <th style="border-top: none; border-left: none;">Product</th>
              <th style="border-top: none;">Expected</th>
              <th style="border-top: none;">Matched</th>
              <th style="border-top: none; border-right: none;">Status</th>
            </tr>
          </thead>
          <tbody id="report-details-body">
          </tbody>
        </table>
      </div>
      <div style="margin-top: 24px; text-align: right;">
        <button type="button" class="btn btn-primary" onclick="closeImportReportModal(event)">Done</button>
      </div>
    </div>
  </div>

  <div id="toast-container" style="position: fixed; bottom: 24px; right: 24px; z-index: 9999;"></div>

  <script>
    console.log('[DEBUG] Dashboard script STARTED');
    window.onerror = function(msg, url, line, col, err) {
      console.error('[DEBUG] UNCAUGHT ERROR:', msg, 'at line', line, 'col', col, err);
    };
    function showToast(message, type) {
      const container = document.getElementById('toast-container');
      if (!container) return;
      const toast = document.createElement('div');
      toast.style.padding = '12px 20px';
      toast.style.marginTop = '8px';
      toast.style.borderRadius = '8px';
      toast.style.color = '#fff';
      toast.style.fontWeight = '600';
      toast.style.fontSize = '14px';
      toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      toast.style.background = type === 'success' ? '#5f9104' : '#dc2626';
      toast.innerText = message;
      container.appendChild(toast);
      setTimeout(function() { toast.remove(); }, 4000);
    }

    // 1. Define global window modal & action handlers immediately at top of script
    window.openAddModal = function(e) {
      if (e) e.preventDefault();
      const modal = document.getElementById('add-modal');
      if (modal) { modal.style.display = 'flex'; modal.classList.add('active'); }
    };
    window.closeAddModal = function(e) {
      if (e) e.preventDefault();
      const modal = document.getElementById('add-modal');
      if (modal) { modal.style.display = 'none'; modal.classList.remove('active'); }
    };

    window.openExcelModal = function(e) {
      if (e) e.preventDefault();
      const modal = document.getElementById('excel-modal');
      if (modal) { modal.style.display = 'flex'; modal.classList.add('active'); }
    };
    window.closeExcelModal = function(e) {
      if (e) e.preventDefault();
      const modal = document.getElementById('excel-modal');
      if (modal) { modal.style.display = 'none'; modal.classList.remove('active'); }
    };
    
    window.openImportReportModal = function() {
      const modal = document.getElementById('import-report-modal');
      if (modal) { modal.style.display = 'flex'; modal.classList.add('active'); }
    };
    window.closeImportReportModal = function(e) {
      if (e) e.preventDefault();
      const modal = document.getElementById('import-report-modal');
      if (modal) { modal.style.display = 'none'; modal.classList.remove('active'); }
    };

    window.openImagesModal = function(e) {
      if (e) e.preventDefault();
      const modal = document.getElementById('images-modal');
      if (modal) { modal.style.display = 'flex'; modal.classList.add('active'); }
    };
    window.closeImagesModal = function(e) {
      if (e) e.preventDefault();
      const modal = document.getElementById('images-modal');
      if (modal) { modal.style.display = 'none'; modal.classList.remove('active'); }
    };

    window.openBulkSpecsModal = function(e) {
      if (e) e.preventDefault();
      const modal = document.getElementById('specs-modal');
      if (modal) { modal.style.display = 'flex'; modal.classList.add('active'); }
    };
    window.closeBulkSpecsModal = function(e) {
      if (e) e.preventDefault();
      const modal = document.getElementById('specs-modal');
      if (modal) { modal.style.display = 'none'; modal.classList.remove('active'); }
    };

    window.exportZip = function(e) {
      if (e) e.preventDefault();
      window.location.href = '/products/export/zip';
    };

    window.logout = function(e) {
      if (e) e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    };

    // 2. Global Delete Action Handlers
    let pendingDeleteTarget = null;

    window.closeDeleteModal = function(e) {
      if (e) e.preventDefault();
      const modal = document.getElementById('delete-modal');
      if (modal) { modal.style.display = 'none'; modal.classList.remove('active'); }
      pendingDeleteTarget = null;
    };

    window.deleteOne = async function(id) {
      console.log('[DEBUG] deleteOne called with id:', id);
      console.log('[DEBUG] allProducts length:', allProducts ? allProducts.length : 'UNDEFINED');
      const prod = (allProducts || []).find(p => (p._id === id || p.id === id));
      const prodName = prod ? prod.name : 'this product';
      
      const confirmed = window.confirm('Are you sure you want to delete "' + prodName + '"?\\n\\nThis action cannot be undone.');
      if (!confirmed) return;

      // Optimistic UI update - remove immediately from table
      allProducts = (allProducts || []).filter(p => p._id !== id && p.id !== id);
      if (selectedIds) selectedIds.delete(id);
      renderDashboard();

      const activeToken = localStorage.getItem('token') || token || '';
      const headers = activeToken ? { 'Authorization': 'Bearer ' + activeToken } : {};

      try {
        console.log('[DEBUG] Sending DELETE request to /api/v1/products/' + id);
        const res = await fetch('/api/v1/products/' + id, {
          method: 'DELETE',
          headers
        });

        if (res.ok) {
          showToast('Product deleted successfully.', 'success');
          loadProducts();
        } else {
          let msg = 'Unable to delete product. Please try again.';
          try { const err = await res.json(); if (err && err.message) msg = err.message; } catch(e){}
          showToast(msg, 'error');
          loadProducts();
        }
      } catch (err) {
        showToast('Unable to delete product. Network failure.', 'error');
        loadProducts();
      }
    };

    window.bulkDelete = async function() {
      if (!selectedIds || selectedIds.size === 0) return;
      const count = selectedIds.size;

      const confirmed = window.confirm('Are you sure you want to delete ' + count + ' selected item(s)?\\n\\nThis action cannot be undone.');
      if (!confirmed) return;

      const idsArray = Array.from(selectedIds);
      // Optimistic UI update
      allProducts = (allProducts || []).filter(p => !selectedIds.has(p._id) && !selectedIds.has(p.id));
      selectedIds.clear();
      const masterCb = document.getElementById('master-checkbox');
      if (masterCb) masterCb.checked = false;
      renderDashboard();

      const activeToken = localStorage.getItem('token') || token || '';
      const headers = activeToken
        ? { 'Authorization': 'Bearer ' + activeToken, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };

      try {
        const res = await fetch('/api/v1/products/bulk', {
          method: 'DELETE',
          headers,
          body: JSON.stringify({ productIds: idsArray })
        });

        if (res.ok) {
          showToast('Selected products deleted successfully.', 'success');
          loadProducts();
        } else {
          let msg = 'Unable to delete selected products.';
          try { const err = await res.json(); if (err && err.message) msg = err.message; } catch(e){}
          showToast(msg, 'error');
          loadProducts();
        }
      } catch (err) {
        showToast('Unable to delete products. Network failure.', 'error');
        loadProducts();
      }
    };

    window.toggleSelect = function(id, isChecked) {
      if (isChecked) selectedIds.add(id); else selectedIds.delete(id);
      updateBulkToolbar();
    };

    window.toggleSelectAll = function(master) {
      document.querySelectorAll('.row-checkbox').forEach(cb => {
        cb.checked = master.checked;
        if (master.checked) selectedIds.add(cb.value); else selectedIds.delete(cb.value);
      });
      updateBulkToolbar();
    };

    // 3. Attach direct eventListeners on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
      const btnAdd = document.getElementById('btn-add-open');
      if (btnAdd) btnAdd.addEventListener('click', window.openAddModal);

      const btnExcel = document.getElementById('btn-excel-open');
      if (btnExcel) btnExcel.addEventListener('click', window.openExcelModal);

      const btnImages = document.getElementById('btn-images-open');
      if (btnImages) btnImages.addEventListener('click', window.openImagesModal);

      const btnZip = document.getElementById('btn-export-zip');
      if (btnZip) btnZip.addEventListener('click', window.exportZip);
    });

    const token = localStorage.getItem('token') || '';
    let user = {};
    try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch(err) {}

    document.getElementById('user-display').innerText = user.fullName || user.name || user.email || 'Admin User';

    let allProducts = [];
    let selectedIds = new Set();

    async function loadProducts() {
      try {
        const activeToken = localStorage.getItem('token') || token || '';
        const headers = activeToken ? { 'Authorization': 'Bearer ' + activeToken } : {};
        const [prodRes, statsRes] = await Promise.all([
          fetch('/api/v1/products', { headers }),
          fetch('/api/v1/products/stats', { headers })
        ]);

        const prodData = await prodRes.json();
        allProducts = prodData.data || [];
        console.log('[DEBUG] loadProducts: fetched', allProducts.length, 'products');

        let stats = null;
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          stats = statsData.data;
        }

        renderDashboard(stats);
      } catch (err) {
        console.error('Failed to load products:', err);
        const tbody = document.getElementById('products-table-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #dc2626; padding: 40px;">Failed to load catalog products. Please refresh.</td></tr>';
      }
    }

    function renderDashboard(stats) {
      console.log('[DEBUG] renderDashboard called, allProducts:', allProducts ? allProducts.length : 'NULL', 'window.deleteOne:', typeof window.deleteOne);
      if (stats) {
        document.getElementById('metric-total').innerText = stats.totalProducts !== undefined ? stats.totalProducts : (allProducts ? allProducts.length : 0);
        document.getElementById('metric-active').innerText = stats.activeItems !== undefined ? stats.activeItems : (allProducts ? allProducts.filter(p => (p.status || 'ACTIVE') === 'ACTIVE').length : 0);
        document.getElementById('metric-low').innerText = stats.lowStock !== undefined ? stats.lowStock : (allProducts ? allProducts.filter(p => (p.stock || 0) < 5).length : 0);
        document.getElementById('metric-categories').innerText = stats.categoriesCount !== undefined ? stats.categoriesCount : (allProducts ? new Set(allProducts.map(p => p.category)).size : 0);
      } else {
        document.getElementById('metric-total').innerText = allProducts ? allProducts.length : 0;
        document.getElementById('metric-active').innerText = allProducts ? allProducts.filter(p => (p.status || 'ACTIVE') === 'ACTIVE').length : 0;
        document.getElementById('metric-low').innerText = allProducts ? allProducts.filter(p => (p.stock || 0) < 5).length : 0;
        document.getElementById('metric-categories').innerText = allProducts ? new Set(allProducts.map(p => p.category)).size : 0;
      }

      const catSelect = document.getElementById('category-filter');
      const activeCat = catSelect ? catSelect.value : '';
      if (catSelect) {
        catSelect.innerHTML = '<option value="">All Categories</option>';
        const availableCategories = stats && stats.categories ? stats.categories : Array.from(new Set((allProducts || []).map(p => p.category)));
        availableCategories.forEach(cat => {
          if (cat) {
            const opt = document.createElement('option'); opt.value = cat; opt.innerText = cat;
            if (cat === activeCat) opt.selected = true; catSelect.appendChild(opt);
          }
        });
      }

      const searchInput = document.getElementById('search-input');
      const search = searchInput ? searchInput.value.toLowerCase() : '';
      const filtered = (allProducts || []).filter(p => {
        if (!p) return false;
        const nameMatch = p.name ? p.name.toLowerCase().includes(search) : false;
        const brandMatch = p.brand ? p.brand.toLowerCase().includes(search) : false;
        const matchSearch = nameMatch || brandMatch;
        const matchCat = !activeCat || p.category === activeCat;
        return matchSearch && matchCat;
      });

      const tbody = document.getElementById('products-table-body');
      if (!tbody) return;

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #595862; padding: 40px;">No matching products found.</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map(p => {
        const id = p._id || p.id || '';
        const isChecked = selectedIds.has(id);
        const statusClass = (p.status || 'ACTIVE') === 'ACTIVE' ? 'badge-active' : 'badge-inactive';
        const rawPath = (p.image && p.image.path) ? p.image.path.replace(/\\\\/g, '/') : '/uploads/products/default.png';
        const imgUrl = rawPath.startsWith('/') ? rawPath : '/' + rawPath;
        const isMissing = imgUrl.includes('default.png');
        
        const priceFormatted = (p.price !== undefined && p.price !== null) ? Number(p.price).toLocaleString('en-IN') : '0';
        const stockDisplay = (p.stock === 0) ? '<span class="badge badge-inactive">Out of Stock</span>' : ((p.stock || 0) < 5 ? '<span class="badge badge-low">' + (p.stock || 0) + ' left</span>' : (p.stock || 0) + ' units');

        const imageHtml = isMissing 
          ? '<div class="no-image-placeholder">No Image<br>Available</div>' 
          : \`<img src="\${imgUrl}" class="prod-thumb" alt="\${p.name || 'Product'}">\`;

        return \`
          <tr>
            <td><input type="checkbox" class="row-checkbox" value="\${id}" \${isChecked ? 'checked' : ''} onchange="toggleSelect('\${id}', this.checked)"></td>
            <td>\${imageHtml}</td>
            <td>
              <div style="font-weight: 700; color: #1f1e24;">\${p.name || 'Untitled Product'}</div>
              <div style="font-size: 12px; color: #595862;">/\${p.slug || ''}</div>
            </td>
            <td>\${p.brand || 'Generic'}</td>
            <td>\${p.category || 'General'}</td>
            <td style="font-weight: 700; color: #5f9104;">₹\${priceFormatted}</td>
            <td>\${stockDisplay}</td>
            <td><span class="badge \${statusClass}">\${p.status || 'ACTIVE'}</span></td>
            <td style="text-align: right;">
              <a href="/product/\${p.slug || ''}" target="_blank" class="btn-link" style="color: #5f9104; margin-right: 12px;">View</a>
              <button type="button" onclick="deleteOne('\${id}')" class="btn-link" style="color: #dc2626; background: transparent; border: none; cursor: pointer;">Delete</button>
            </td>
          </tr>
        \`;
      }).join('');

      updateBulkToolbar();
    }

    function updateBulkToolbar() {
      const toolbar = document.getElementById('bulk-toolbar');
      if (selectedIds.size > 0) {
        toolbar.style.display = 'flex';
        toolbar.classList.add('active');
        document.getElementById('bulk-count').innerText = selectedIds.size + ' item(s) selected';
      } else {
        toolbar.style.display = 'none';
        toolbar.classList.remove('active');
      }
    }

    document.getElementById('search-input').addEventListener('input', () => renderDashboard());
    document.getElementById('category-filter').addEventListener('change', () => renderDashboard());

    // Submit Handler for Bulk Photos Upload Modal
    document.getElementById('images-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const filesInput = document.getElementById('bulk-photos');
      if (!filesInput.files || filesInput.files.length === 0) return;

      const formData = new FormData();
      Array.from(filesInput.files).forEach(f => formData.append('images', f));

      try {
        const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
        const res = await fetch('/api/v1/uploads/images', {
          method: 'POST', headers, body: formData
        });
        const data = await res.json();
        if (res.ok) {
          alert('Photos Uploaded & Linked Successfully! ' + (data.data ? data.data.length : 0) + ' photo(s) processed.');
          window.closeImagesModal(); document.getElementById('images-form').reset(); loadProducts();
        } else { alert(data.message || 'Image upload failed.'); }
      } catch (err) { alert('Network error uploading images.'); }
    });

    document.getElementById('add-product-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fileInput = document.getElementById('add-image');
      if (!fileInput.files[0]) return;
      const formData = new FormData(); formData.append('image', fileInput.files[0]);

      try {
        const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
        const uploadRes = await fetch('/api/v1/uploads/image', {
          method: 'POST', headers, body: formData
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || 'Image upload failed');

        const prodPayload = {
          name: document.getElementById('add-name').value,
          brand: document.getElementById('add-brand').value,
          category: document.getElementById('add-category').value,
          price: Number(document.getElementById('add-price').value),
          stock: Number(document.getElementById('add-stock').value),
          description: document.getElementById('add-description').value,
          image: uploadData.data
        };

        const prodRes = await fetch('/api/v1/products', {
          method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(prodPayload)
        });

        if (prodRes.ok) {
          window.closeAddModal(); document.getElementById('add-product-form').reset(); loadProducts();
        } else {
          const pErr = await prodRes.json(); alert(pErr.message || 'Failed to create product.');
        }
      } catch (err) { alert(err.message); }
    });

    document.getElementById('excel-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fileInput = document.getElementById('excel-file');
      if (!fileInput.files[0]) return;

      const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
      const imgInput = document.getElementById('excel-images');

      // Upload photos first if provided alongside Excel
      if (imgInput.files && imgInput.files.length > 0) {
        const imgFormData = new FormData();
        Array.from(imgInput.files).forEach(f => imgFormData.append('images', f));
        await fetch('/api/v1/uploads/images', {
          method: 'POST', headers, body: imgFormData
        });
      }

      const formData = new FormData();
      formData.append('file', fileInput.files[0]);

      try {
        const res = await fetch('/api/v1/excel/import', {
          method: 'POST', headers, body: formData
        });
        const data = await res.json();
        if (res.ok) {
          window.closeExcelModal(); 
          document.getElementById('excel-form').reset(); 
          loadProducts();
          
          if (data.report) {
            document.getElementById('report-imported').innerText = data.report.productsImported || 0;
            const totalMatched = (data.report.imagesMatched || 0) + (data.report.imagesAutoMatched || 0);
            document.getElementById('report-matched').innerText = totalMatched;
            const totalWarnings = (data.report.missingImages || 0) + (data.report.duplicateImageNames || 0);
            document.getElementById('report-warnings').innerText = totalWarnings;
            
            const tbody = document.getElementById('report-details-body');
            tbody.innerHTML = data.report.details.map(d => {
              let statusColor = '#595862';
              let badgeHtml = \`<span>\${d.status}</span>\`;
              if (d.status === 'MATCHED_EXACT' || d.status === 'MATCHED_AUTO') {
                statusColor = '#5f9104';
                badgeHtml = \`<span style="color:\${statusColor}; font-weight:700;">✓ \${d.reason}</span>\`;
              } else if (d.status === 'DUPLICATE' || d.status === 'MISSING') {
                statusColor = '#d97706';
                badgeHtml = \`<span style="color:\${statusColor}; font-weight:700;">⚠ \${d.reason}</span>\`;
              }
              
              let duplicateInfo = '';
              if (d.duplicates && d.duplicates.length > 0) {
                 duplicateInfo = \`<div style="font-size:11px; color:#595862; margin-top:4px;">Duplicates: \${d.duplicates.join(', ')}</div>\`;
              }
              
              return \`
                <tr>
                  <td style="font-weight:600;">\${d.product}</td>
                  <td>\${d.expected}</td>
                  <td>\${d.matched}</td>
                  <td>\${badgeHtml}\${duplicateInfo}</td>
                </tr>
              \`;
            }).join('');
            
            openImportReportModal();
          } else {
             alert('Excel Import Successful! ' + (data.insertedCount || (data.data && data.data.length) || 0) + ' item(s) created.');
          }
        } else { alert(data.message || 'Excel import failed.'); }
      } catch (err) { alert('Network error during Excel upload.'); }
    });

    window.bulkStatus = async function(status) {
      if (selectedIds.size === 0) return;
      try {
        const headers = token ? { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
        const res = await fetch('/api/v1/products/bulk/status', {
          method: 'PATCH', headers,
          body: JSON.stringify({ productIds: Array.from(selectedIds), status })
        });
        if (res.ok) { selectedIds.clear(); document.getElementById('master-checkbox').checked = false; loadProducts(); }
      } catch (err) { alert('Bulk status update failed.'); }
    };

    document.getElementById('specs-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (selectedIds.size === 0) return;
      const key = document.getElementById('spec-key').value.trim();
      const val = document.getElementById('spec-val').value.trim();
      try {
        const headers = token ? { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
        const res = await fetch('/api/v1/products/bulk/specifications', {
          method: 'PATCH', headers,
          body: JSON.stringify({ productIds: Array.from(selectedIds), specs: { [key]: val } })
        });
        if (res.ok) { window.closeBulkSpecsModal(); document.getElementById('specs-form').reset(); selectedIds.clear(); document.getElementById('master-checkbox').checked = false; loadProducts(); }
      } catch (err) { alert('Bulk specs update failed.'); }
    });

    loadProducts();
  </script>
  ${copilotWidgetTemplate()}
</body>
</html>`;
};

export default dashboardTemplate;
