import { formatCurrency } from "../services/currency.service.js";
import copilotWidgetTemplate from "./copilotWidget.template.js";

const productsListingTemplate = (products, filterState = {}) => {
  const {
    search = "",
    category = "",
    brand = "",
    availability = "",
    minPrice = "",
    maxPrice = "",
    sort = "newest",
    page = 1,
    limit = 9,
    totalPages = 1,
    totalProducts = 0,
    allCategories = [],
    allBrands = [],
    currency = "INR"
  } = filterState;

  const productCards = products.map((product) => {
    const formattedPrice = formatCurrency(product.price, currency);

    let stockText = 'In Stock';
    let stockClass = 'stock-in';
    if (product.stock === 0) {
      stockText = 'Out of Stock';
      stockClass = 'stock-out';
    } else if (product.stock < 5) {
      stockText = 'Low Stock';
      stockClass = 'stock-low';
    }

    const rawPath = (product.image && product.image.path) ? product.image.path.replace(/\\\\/g, '/') : '/uploads/products/default.png';
    const imgUrl = rawPath.startsWith('/') ? rawPath : '/' + rawPath;

    return `
      <div class="product-card" onclick="window.location.href='/product/${product.slug}${currency && currency !== 'INR' ? '?currency=' + currency : ''}'">
        <div class="card-media">
          <img src="${imgUrl}" alt="${product.name}" loading="lazy" onerror="this.onerror=null; this.src='/uploads/products/default.png';">
          <span class="stock-badge ${stockClass}">${stockText}</span>
        </div>
        <div class="card-body">
          <div class="card-header-row">
            <span class="category-badge">${product.category}</span>
            <span class="price-tag">${formattedPrice}</span>
          </div>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-desc">${product.description || 'High-performance catalog item.'}</p>
          <div class="card-footer">
            <span class="brand-text">Brand: ${product.brand || 'Generic'}</span>
            <span class="details-link">View Details &rarr;</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const hasActiveFilters = category || brand || availability || minPrice || maxPrice || search || sort !== 'newest';

  const getPageUrl = (pageNum) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (brand) params.set('brand', brand);
    if (availability) params.set('availability', availability);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (sort) params.set('sort', sort);
    if (currency) params.set('currency', currency);
    params.set('page', pageNum);
    params.set('limit', limit);
    return `/products?${params.toString()}`;
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Product Catalog - ProductGen</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #eaf0f4; color: #1f1e24; line-height: 1.5; }

    .top-header { background: #1f1e24; color: #ffffff; padding: 12px 32px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
    .header-link { color: #b7bd7f; font-family: 'Noto Serif', serif; font-weight: 700; text-decoration: none; }

    .currency-selector { display: flex; align-items: center; gap: 8px; }
    .currency-btn { padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.3); color: #ffffff; text-decoration: none; font-weight: 600; }
    .currency-btn.active { background: #5f9104; border-color: #5f9104; font-weight: 700; }

    main { max-width: 1240px; margin: 0 auto; padding: 40px 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; gap: 20px; }
    .page-title { font-family: 'Noto Serif', serif; font-size: 36px; font-weight: 700; color: #1f1e24; margin-bottom: 4px; }
    .page-subtitle { font-size: 15px; color: #595862; }
    .btn-export { background: #5f9104; color: #ffffff; padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 13px; text-decoration: none; box-shadow: 0 4px 12px rgba(95, 145, 4, 0.25); }

    .filter-panel { background: #ffffff; border: 1px solid #cbd5dd; border-radius: 14px; padding: 20px; margin-bottom: 36px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .search-row { display: flex; gap: 12px; margin-bottom: 16px; }
    .search-input { flex: 1; background: #f4f8fa; border: 1px solid #cbd5dd; border-radius: 10px; padding: 12px 16px; font-size: 14px; color: #1f1e24; outline: none; }
    .search-input:focus { border-color: #5f9104; }
    .btn-search { background: #5f9104; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; }
    .btn-clear { background: #ffffff; border: 1px solid #cbd5dd; color: #1f1e24; padding: 12px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; text-decoration: none; }

    .filter-controls { display: flex; flex-wrap: wrap; gap: 16px; font-size: 12px; font-weight: 600; }
    .filter-control { display: flex; align-items: center; gap: 8px; }
    .select-box { background: #f4f8fa; border: 1px solid #cbd5dd; border-radius: 6px; padding: 6px 10px; font-size: 12px; color: #1f1e24; outline: none; }

    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }
    .product-card { background: #ffffff; border: 1px solid #cbd5dd; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .product-card:hover { border-color: #5f9104; transform: translateY(-4px); box-shadow: 0 12px 24px rgba(95, 145, 4, 0.15); }

    .card-media { background: #f4f8fa; aspect-ratio: 4/3; padding: 16px; display: flex; align-items: center; justify-content: center; position: relative; }
    .card-media img { max-height: 160px; max-width: 100%; object-fit: contain; }

    .stock-badge { position: absolute; top: 12px; right: 12px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .stock-in { background: #d1fae5; color: #065f46; }
    .stock-low { background: #fef3c7; color: #92400e; }
    .stock-out { background: #fee2e2; color: #991b1b; }

    .card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
    .card-header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .category-badge { font-size: 11px; font-weight: 700; color: #6e7345; text-transform: uppercase; letter-spacing: 0.5px; }
    .price-tag { font-family: 'Noto Serif', serif; font-size: 18px; font-weight: 700; color: #5f9104; }
    .product-title { font-family: 'Noto Serif', serif; font-size: 16px; font-weight: 700; color: #1f1e24; margin-bottom: 6px; line-height: 1.3; }
    .product-desc { font-size: 13px; color: #595862; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    .card-footer { margin-top: auto; padding-top: 12px; border-top: 1px solid #eaf0f4; display: flex; justify-content: space-between; font-size: 12px; }
    .brand-text { color: #595862; font-weight: 600; }
    .details-link { color: #5f9104; font-weight: 700; }

    .pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid #cbd5dd; font-size: 13px; }
    .page-numbers { display: flex; gap: 6px; }
    .page-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #cbd5dd; background: #ffffff; color: #1f1e24; display: flex; align-items: center; justify-content: center; font-weight: 700; text-decoration: none; }
    .page-btn.active { background: #5f9104; color: #ffffff; border-color: #5f9104; }

    .empty-state { text-align: center; padding: 60px; background: #ffffff; border: 1px solid #cbd5dd; border-radius: 16px; grid-column: 1 / -1; }

    @media (max-width: 768px) {
      .page-header { flex-direction: column; align-items: flex-start; }
      .search-row { flex-direction: column; }
    }
  </style>
</head>
<body>

  <div class="top-header">
    <a href="/" class="header-link">&larr; Return to ProductGen Home</a>
    <div class="currency-selector">
      <span style="opacity: 0.7; font-weight: 700;">CURRENCY:</span>
      <a href="/products?currency=INR${search ? '&search=' + search : ''}" class="currency-btn ${currency === 'INR' ? 'active' : ''}">INR (₹)</a>
      <a href="/products?currency=USD${search ? '&search=' + search : ''}" class="currency-btn ${currency === 'USD' ? 'active' : ''}">USD ($)</a>
      <a href="/products?currency=EUR${search ? '&search=' + search : ''}" class="currency-btn ${currency === 'EUR' ? 'active' : ''}">EUR (€)</a>
      <a href="/products?currency=GBP${search ? '&search=' + search : ''}" class="currency-btn ${currency === 'GBP' ? 'active' : ''}">GBP (£)</a>
      <a href="/products?currency=JPY${search ? '&search=' + search : ''}" class="currency-btn ${currency === 'JPY' ? 'active' : ''}">JPY (¥)</a>
    </div>
  </div>

  <main>
    <div class="page-header">
      <div>
        <h1 class="page-title">Product Storefront Catalog</h1>
        <p class="page-subtitle">Browse live catalog items generated from Excel sheets.</p>
      </div>
      <a href="/products/export/zip" class="btn-export">⚡ Export Offline Shop (ZIP)</a>
    </div>

    <form action="/products" method="GET" class="filter-panel">
      <input type="hidden" name="currency" value="${currency}">
      <div class="search-row">
        <input type="text" name="search" placeholder="Search catalog by title, brand, or category..." value="${search}" class="search-input">
        <button type="submit" class="btn-search">Search</button>
        ${hasActiveFilters ? `<a href="/products?currency=${currency}" class="btn-clear">Clear Filters</a>` : ''}
      </div>

      <div class="filter-controls">
        <div class="filter-control">
          <span style="color: #595862; text-transform: uppercase;">Category:</span>
          <select name="category" onchange="this.form.submit()" class="select-box">
            <option value="">All Categories</option>
            ${allCategories.map(cat => `<option value="${cat}" ${cat === category ? 'selected' : ''}>${cat}</option>`).join('')}
          </select>
        </div>

        <div class="filter-control">
          <span style="color: #595862; text-transform: uppercase;">Brand:</span>
          <select name="brand" onchange="this.form.submit()" class="select-box">
            <option value="">All Brands</option>
            ${allBrands.map(b => b ? `<option value="${b}" ${b === brand ? 'selected' : ''}>${b}</option>` : '').join('')}
          </select>
        </div>

        <div class="filter-control">
          <span style="color: #595862; text-transform: uppercase;">Sort:</span>
          <select name="sort" onchange="this.form.submit()" class="select-box">
            <option value="newest" ${sort === 'newest' ? 'selected' : ''}>Newest</option>
            <option value="oldest" ${sort === 'oldest' ? 'selected' : ''}>Oldest</option>
            <option value="price-asc" ${sort === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
            <option value="price-desc" ${sort === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
            <option value="name-asc" ${sort === 'name-asc' ? 'selected' : ''}>Name: A to Z</option>
          </select>
        </div>
      </div>
    </form>

    <div class="products-grid">
      ${products.length > 0 ? productCards : `
        <div class="empty-state">
          <h3 style="font-family: 'Noto Serif', serif; font-size: 20px; font-weight: 700; margin-bottom: 8px;">No Products Found</h3>
          <p style="font-size: 14px; color: #595862;">Clear active search or filters to view all products.</p>
        </div>
      `}
    </div>

    ${totalPages > 1 ? `
      <div class="pagination">
        <div style="color: #595862; font-weight: 600;">
          Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, totalProducts)} of ${totalProducts} items
        </div>
        <div class="page-numbers">
          ${page > 1 ? `<a href="${getPageUrl(page - 1)}" class="page-btn">&larr;</a>` : ''}
          ${Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => `
            <a href="${getPageUrl(pageNum)}" class="page-btn ${pageNum === page ? 'active' : ''}">${pageNum}</a>
          `).join('')}
          ${page < totalPages ? `<a href="${getPageUrl(page + 1)}" class="page-btn">&rarr;</a>` : ''}
        </div>
      </div>
    ` : ''}
  </main>
  ${copilotWidgetTemplate()}
</body>
</html>
`;
};

export default productsListingTemplate;
