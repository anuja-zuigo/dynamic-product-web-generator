import { formatCurrency } from "../services/currency.service.js";
import copilotWidgetTemplate from "./copilotWidget.template.js";

const productTemplate = (product, relatedProducts = [], currency = 'INR') => {
  let stockStatus = 'IN STOCK';
  let stockClass = 'stock-in';
  if (product.stock === 0) {
    stockStatus = 'OUT OF STOCK';
    stockClass = 'stock-out';
  } else if (product.stock < 5) {
    stockStatus = `ONLY ${product.stock} LEFT`;
    stockClass = 'stock-low';
  }

  const formattedPrice = formatCurrency(product.price, currency);

  const reviewsCount = product.reviews ? product.reviews.length : 0;
  let averageRating = 0;
  let starsHtml = "";
  if (reviewsCount > 0) {
    const sum = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    averageRating = (sum / reviewsCount).toFixed(1);
    const fullStars = Math.round(averageRating);
    starsHtml = `<span style="color: #f59e0b; font-weight: 700;">${'★'.repeat(fullStars)}${'☆'.repeat(5 - fullStars)}</span> ${averageRating} (${reviewsCount} review${reviewsCount > 1 ? 's' : ''})`;
  } else {
    starsHtml = `<span style="color: #595862;">No reviews yet</span>`;
  }

  const specsEntries = product.specifications instanceof Map
    ? Array.from(product.specifications.entries())
    : Object.entries(product.specifications || {});

  const specsRowsHtml = specsEntries.length > 0 ? specsEntries.map(([key, value]) => `
    <tr>
      <td class="spec-key">${key}</td>
      <td class="spec-val">${value}</td>
    </tr>
  `).join('') : `
    <tr><td colspan="2" style="text-align: center; color: #595862; padding: 16px;">No custom specs recorded.</td></tr>
  `;

  const relatedCardsHtml = relatedProducts.map(rel => {
    const relRawPath = (rel.image && rel.image.path) ? rel.image.path.replace(/\\\\/g, '/') : '/uploads/products/default.png';
    const relImgUrl = relRawPath.startsWith('/') ? relRawPath : '/' + relRawPath;
    return `
      <div class="related-card" onclick="window.location.href='/product/${rel.slug}${currency && currency !== 'INR' ? '?currency=' + currency : ''}'">
        <img src="${relImgUrl}" alt="${rel.name}" onerror="this.onerror=null; this.src='/uploads/products/default.png';">
        <div class="rel-category">${rel.category}</div>
        <div class="rel-title">${rel.name}</div>
        <div class="rel-price">${formatCurrency(rel.price, currency)}</div>
      </div>
    `;
  }).join('');

  const rawPath = (product.image && product.image.path) ? product.image.path.replace(/\\\\/g, '/') : '/uploads/products/default.png';
  const imgUrl = rawPath.startsWith('/') ? rawPath : '/' + rawPath;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${product.name} - Product Details | ProductGen</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #eaf0f4; color: #1f1e24; line-height: 1.5; }

    .top-header { background: #1f1e24; color: #ffffff; padding: 12px 32px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
    .header-link { color: #b7bd7f; font-family: 'Noto Serif', serif; font-weight: 700; text-decoration: none; }

    main { max-width: 1240px; margin: 0 auto; padding: 40px 24px; }
    .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 48px; }

    .media-card { background: #ffffff; border: 1px solid #cbd5dd; border-radius: 20px; padding: 32px; display: flex; align-items: center; justify-content: center; min-height: 360px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .media-card img { max-height: 320px; max-width: 100%; object-fit: contain; transition: transform 0.3s; }
    .media-card img:hover { transform: scale(1.04); }

    .info-column { display: flex; flex-direction: column; gap: 24px; }
    .stock-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-block; }
    .stock-in { background: #d1fae5; color: #065f46; }
    .stock-low { background: #fef3c7; color: #92400e; }
    .stock-out { background: #fee2e2; color: #991b1b; }

    .product-title { font-family: 'Noto Serif', serif; font-size: 36px; font-weight: 700; color: #1f1e24; margin-top: 8px; margin-bottom: 8px; }
    .price-box { background: #ffffff; border: 1px solid #cbd5dd; border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .price-val { font-family: 'Noto Serif', serif; font-size: 32px; font-weight: 700; color: #5f9104; margin-bottom: 12px; }

    .btn-pdf { background: #5f9104; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(95,145,4,0.3); }

    .specs-table { width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #cbd5dd; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .specs-table td { padding: 14px 20px; font-size: 14px; border-bottom: 1px solid #eaf0f4; }
    .spec-key { font-weight: 700; color: #1f1e24; text-transform: uppercase; font-size: 12px; width: 35%; }
    .spec-val { color: #595862; }
    .specs-table tr:nth-child(even) { background: #f4f8fa; }

    .reviews-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 24px; }
    .review-card { background: #ffffff; border: 1px solid #cbd5dd; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
    .review-form { background: #ffffff; border: 1px solid #cbd5dd; border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 12px; font-weight: 700; color: #595862; margin-bottom: 6px; }
    .form-input { width: 100%; background: #f4f8fa; border: 1px solid #cbd5dd; border-radius: 8px; padding: 10px 14px; font-size: 14px; outline: none; }

    .related-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .related-card { background: #ffffff; border: 1px solid #cbd5dd; border-radius: 14px; padding: 16px; cursor: pointer; transition: transform 0.2s; }
    .related-card:hover { transform: translateY(-3px); border-color: #5f9104; }
    .related-card img { width: 100%; height: 120px; object-fit: contain; margin-bottom: 10px; }
    .rel-category { font-size: 10px; font-weight: 700; color: #6e7345; text-transform: uppercase; }
    .rel-title { font-family: 'Noto Serif', serif; font-size: 14px; font-weight: 700; color: #1f1e24; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rel-price { font-weight: 700; color: #5f9104; font-size: 13px; margin-top: 4px; }

    @media (max-width: 768px) {
      .product-grid, .reviews-grid, .related-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

  <div class="top-header">
    <a href="/products?currency=${currency}" class="header-link">&larr; Back to Storefront Catalog</a>
    <div>
      <span style="font-weight: 700; margin-right: 8px;">CURRENCY:</span>
      <select onchange="window.location.href='/product/${product.slug}?currency=' + this.value" style="padding: 4px 8px; border-radius: 6px; font-weight: 700;">
        <option value="INR" ${currency === 'INR' ? 'selected' : ''}>INR (₹)</option>
        <option value="USD" ${currency === 'USD' ? 'selected' : ''}>USD ($)</option>
        <option value="EUR" ${currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
        <option value="GBP" ${currency === 'GBP' ? 'selected' : ''}>GBP (£)</option>
        <option value="JPY" ${currency === 'JPY' ? 'selected' : ''}>JPY (¥)</option>
      </select>
    </div>
  </div>

  <main>
    <div class="product-grid">
      <div class="media-card">
        <img src="${imgUrl}" alt="${product.name}" onerror="this.onerror=null; this.src='/uploads/products/default.png';">
      </div>

      <div class="info-column">
        <div>
          <span class="stock-badge ${stockClass}">${stockStatus}</span>
          <h1 class="product-title">${product.name}</h1>
          <div style="font-size: 14px;">
            ${starsHtml} | Brand: <strong>${product.brand || 'Generic'}</strong>
          </div>
        </div>

        <div class="price-box">
          <div class="price-val">${formattedPrice}</div>
          <p style="color: #595862; font-size: 14px; margin-bottom: 20px;">${product.description}</p>
          <a href="/product/${product.slug}/pdf" class="btn-pdf">📥 Download Spec Sheet (PDF)</a>
        </div>
      </div>
    </div>

    <section style="margin-bottom: 48px;">
      <h2 style="font-family: 'Noto Serif', serif; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Product Specifications</h2>
      <table class="specs-table">
        <tbody>
          ${specsRowsHtml}
        </tbody>
      </table>
    </section>

    <section style="margin-bottom: 48px;">
      <h2 style="font-family: 'Noto Serif', serif; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Customer Reviews (${reviewsCount})</h2>
      <div class="reviews-grid">
        <div style="max-height: 400px; overflow-y: auto;">
          ${reviewsCount > 0 ? product.reviews.map(r => `
            <div class="review-card">
              <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px;">
                <strong>${r.name}</strong>
                <span style="color: #f59e0b;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
              </div>
              <p style="font-size: 13px; color: #595862;">${r.text}</p>
            </div>
          `).join('') : `<p style="color: #595862; font-size: 14px;">No reviews written yet.</p>`}
        </div>

        <div class="review-form">
          <h3 style="font-family: 'Noto Serif', serif; font-size: 18px; font-weight: 700; margin-bottom: 16px;">Write a Review</h3>
          <form action="/product/${product.slug}/reviews${currency && currency !== 'INR' ? '?currency=' + currency : ''}" method="POST">
            <div class="form-group">
              <label>Your Name</label>
              <input type="text" name="name" required class="form-input">
            </div>
            <div class="form-group">
              <label>Rating</label>
              <select name="rating" required class="form-input" style="font-weight: 700;">
                <option value="5">★★★★★ (5 Stars)</option>
                <option value="4">★★★★☆ (4 Stars)</option>
                <option value="3">★★★☆☆ (3 Stars)</option>
                <option value="2">★★☆☆☆ (2 Stars)</option>
                <option value="1">★☆☆☆☆ (1 Star)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Review</label>
              <textarea name="text" rows="3" required class="form-input"></textarea>
            </div>
            <button type="submit" class="btn-pdf" style="width: 100%; border: none; cursor: pointer;">Submit Review</button>
          </form>
        </div>
      </div>
    </section>

    ${relatedProducts.length > 0 ? `
      <section>
        <h2 style="font-family: 'Noto Serif', serif; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Related Products</h2>
        <div class="related-grid">
          ${relatedCardsHtml}
        </div>
      </section>
    ` : ''}
  </main>
  ${copilotWidgetTemplate()}
</body>
</html>
`;
};

export default productTemplate;