import copilotWidgetTemplate from "./copilotWidget.template.js";

const landingTemplate = () => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>ProductGen | Turn Excel into Digital Excellence</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,600;0,700;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: #fcf8ff;
      color: #1c1b21;
      line-height: 1.5;
    }

    /* Top Navigation Bar */
    header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(252, 248, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid #c3c9b3;
      padding: 16px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .nav-left {
      display: flex;
      align-items: center;
      gap: 40px;
    }

    .brand-logo {
      font-family: 'Noto Serif', serif;
      font-size: 24px;
      font-weight: 700;
      color: #416600;
      text-decoration: none;
    }

    .nav-links {
      display: flex;
      gap: 24px;
      list-style: none;
    }

    .nav-link {
      font-size: 14px;
      font-weight: 600;
      color: #434938;
      text-decoration: none;
      padding-bottom: 4px;
      transition: color 0.2s;
    }

    .nav-link.active {
      color: #416600;
      border-bottom: 2px solid #416600;
      font-weight: 700;
    }

    .nav-link:hover {
      color: #416600;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .btn-login {
      font-size: 14px;
      font-weight: 600;
      color: #434938;
      text-decoration: none;
      padding: 8px 16px;
    }

    .btn-login:hover {
      color: #416600;
    }

    .btn-get-started {
      background: #416600;
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      padding: 10px 22px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(65, 102, 0, 0.25);
      transition: background 0.2s;
    }

    .btn-get-started:hover {
      background: #345200;
    }

    /* Main Container */
    main {
      max-width: 1240px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* Hero Section */
    .hero-section {
      padding: 60px 0 90px;
      display: grid;
      grid-template-columns: 1fr 1.15fr;
      gap: 40px;
      align-items: center;
    }

    .hero-headline {
      font-family: 'Noto Serif', serif;
      font-size: 44px;
      font-weight: 700;
      line-height: 1.18;
      color: #1c1b21;
      margin-bottom: 20px;
    }

    .hero-headline .italic-green {
      color: #416600;
      font-style: italic;
    }

    .hero-subtitle {
      font-size: 16px;
      color: #434938;
      line-height: 1.6;
      margin-bottom: 32px;
      max-width: 480px;
    }

    .hero-cta-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .btn-hero-primary {
      background: #416600;
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 6px 18px rgba(65, 102, 0, 0.3);
      transition: transform 0.2s;
    }

    .btn-hero-primary:hover {
      transform: translateY(-2px);
    }

    .btn-hero-outline {
      background: #ffffff;
      border: 1px solid #5d622e;
      color: #5d622e;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 12px;
      transition: background 0.2s;
    }

    .btn-hero-outline:hover {
      background: #f1ecf5;
    }

    /* Stitch Browser Showcase Mockup */
    .browser-window {
      background: #ffffff;
      border: 1px solid #c3c9b3;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
    }

    .browser-header {
      background: #e5e1e9;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #c3c9b3;
    }

    .browser-dots {
      display: flex;
      gap: 6px;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .dot-red { background: #ba1a1a; }
    .dot-yellow { background: #c5cb8c; }
    .dot-green { background: #baf469; }

    .browser-address-bar {
      background: #ffffff;
      padding: 4px 30px;
      border-radius: 6px;
      font-size: 12px;
      color: #434938;
      font-family: monospace;
      text-align: center;
      border: 1px solid #c3c9b3;
    }

    .browser-content {
      background: #fcf8ff;
      padding: 28px 24px;
    }

    /* Wizard Stepper Bar */
    .stepper-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      margin-bottom: 28px;
    }

    .stepper-line {
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      height: 2px;
      background: #c3c9b3;
      z-index: 1;
    }

    .step-node {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      background: #fcf8ff;
      padding: 0 10px;
    }

    .step-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #416600;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      box-shadow: 0 4px 10px rgba(65,102,0,0.3);
    }

    .step-circle.inactive {
      background: #f1ecf5;
      border: 2px solid #c3c9b3;
      color: #434938;
      box-shadow: none;
    }

    .step-label {
      font-size: 12px;
      font-weight: 700;
      color: #416600;
    }

    .step-label.inactive {
      color: #434938;
      font-weight: 600;
    }

    /* File Status Card */
    .file-status-card {
      background: #f6f2fa;
      border: 1px solid #c3c9b3;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .file-icon {
      font-size: 24px;
      color: #416600;
    }

    .file-title {
      font-size: 14px;
      font-weight: 700;
      color: #1c1b21;
    }

    .file-subtext {
      font-size: 12px;
      color: #434938;
    }

    .check-icon {
      font-size: 24px;
      color: #416600;
    }

    /* 3 Skeleton Cards Grid */
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }

    .skeleton-card {
      height: 110px;
      background: #ebe6ef;
      border-radius: 12px;
      border: 1px solid rgba(195, 201, 179, 0.4);
      animation: pulse 1.8s infinite ease-in-out;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }

    /* AI Processing Banner */
    .ai-banner {
      background: #e2e8a6;
      border: 1px solid #c5cb8c;
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
      color: #636833;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.5;
    }

    .sparkle-icon {
      font-size: 18px;
    }

    /* Bento Grid Section */
    .bento-section {
      background: #313036;
      color: #fcf8ff;
      padding: 80px 24px;
      margin-top: 40px;
      border-radius: 24px;
    }

    .bento-header {
      text-align: center;
      max-width: 600px;
      margin: 0 auto 50px;
    }

    .bento-title {
      font-family: 'Noto Serif', serif;
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .bento-subtitle {
      font-size: 15px;
      opacity: 0.8;
    }

    .bento-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .bento-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 32px 24px;
    }

    .bento-card-num {
      font-family: 'Noto Serif', serif;
      font-size: 20px;
      font-weight: 700;
      color: #baf469;
      margin-bottom: 12px;
    }

    .bento-card-title {
      font-family: 'Noto Serif', serif;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 10px;
      color: #baf469;
    }

    .bento-card-desc {
      font-size: 13px;
      opacity: 0.8;
      line-height: 1.6;
    }

    /* AI Assistant Chat Section */
    .ai-chat-section {
      padding: 90px 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 50px;
      align-items: center;
    }

    .chat-panel {
      background: #ffffff;
      border: 1px solid #c3c9b3;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.08);
    }

    .chat-bubble-user {
      background: #f1ecf5;
      color: #1c1b21;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 13px;
      margin-left: auto;
      max-width: 85%;
      margin-bottom: 12px;
      border: 1px solid #c3c9b3;
    }

    .chat-bubble-ai {
      background: #416600;
      color: #ffffff;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 13px;
      max-width: 85%;
      margin-bottom: 12px;
    }

    .chat-form {
      display: flex;
      gap: 10px;
      margin-top: 16px;
    }

    .chat-input {
      flex: 1;
      border: 1px solid #c3c9b3;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
      outline: none;
    }

    /* CTA Section & Footer */
    .cta-banner {
      background: #548100;
      color: #faffe9;
      border-radius: 20px;
      padding: 60px 40px;
      text-align: center;
      margin: 60px 0;
    }

    .cta-title {
      font-family: 'Noto Serif', serif;
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .cta-btn {
      background: #ffffff;
      color: #416600;
      padding: 14px 32px;
      border-radius: 12px;
      font-weight: 700;
      text-decoration: none;
      display: inline-block;
      margin-top: 20px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.15);
    }

    footer {
      border-top: 1px solid #c3c9b3;
      padding: 32px 0;
      text-align: center;
      font-size: 13px;
      color: #434938;
    }

    @media (max-width: 900px) {
      .hero-section, .ai-chat-section {
        grid-template-columns: 1fr;
      }
      .bento-grid, .skeleton-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>

  <!-- Top Navigation Bar -->
  <header>
    <div class="nav-left">
      <a href="/" class="brand-logo">ProductGen</a>
      <ul class="nav-links">
        <li><a class="nav-link active" href="#solutions">Solutions</a></li>
        <li><a class="nav-link" href="#pricing">Pricing</a></li>
        <li><a class="nav-link" href="#docs">Docs</a></li>
      </ul>
    </div>
    <div class="nav-actions">
      <a href="/login" class="btn-login">Log In</a>
      <a href="/register" class="btn-get-started">Get Started</a>
    </div>
  </header>

  <main>
    <!-- Hero Section -->
    <section class="hero-section">
      <!-- Left Column -->
      <div>
        <h1 class="hero-headline">
          Turn One Excel Sheet Into a <span class="italic-green">Beautiful</span> Product Website.
        </h1>
        <p class="hero-subtitle">
          Stop wrestling with complex PIMs. Upload your spreadsheet, and our AI constructs a high-performance storefront in seconds.
        </p>
        <div class="hero-cta-group">
          <a href="/register" class="btn-hero-primary">
            <span>🚀</span> Build My Store
          </a>
          <a href="/products" class="btn-hero-outline">
            Watch Demo
          </a>
        </div>
      </div>

      <!-- Right Column: Stitch Browser Showcase Mockup -->
      <div class="browser-window">
        <div class="browser-header">
          <div class="browser-dots">
            <span class="dot dot-red"></span>
            <span class="dot dot-yellow"></span>
            <span class="dot dot-green"></span>
          </div>
          <div class="browser-address-bar">
            app.productgen.io/wizard
          </div>
          <div style="width: 24px;"></div>
        </div>

        <div class="browser-content">
          <!-- Stepper Bar -->
          <div class="stepper-container">
            <div class="stepper-line"></div>
            
            <div class="step-node">
              <div class="step-circle">1</div>
              <span class="step-label">Upload</span>
            </div>

            <div class="step-node">
              <div class="step-circle">2</div>
              <span class="step-label">Validate</span>
            </div>

            <div class="step-node">
              <div class="step-circle">↻</div>
              <span class="step-label">Generate</span>
            </div>

            <div class="step-node">
              <div class="step-circle inactive">4</div>
              <span class="step-label inactive">Live</span>
            </div>
          </div>

          <!-- File Status Card -->
          <div class="file-status-card">
            <div class="file-info">
              <span class="file-icon">📄</span>
              <div>
                <div class="file-title">inventory_q4_final.xlsx</div>
                <div class="file-subtext">2,450 products detected</div>
              </div>
            </div>
            <span class="check-icon">✔</span>
          </div>

          <!-- 3 Skeleton Cards Grid -->
          <div class="skeleton-grid">
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
          </div>

          <!-- AI Processing Banner -->
          <div class="ai-banner">
            <span class="sparkle-icon">✨</span>
            <div>
              AI is currently enhancing descriptions and generating high-res product cards based on your sheet's metadata...
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Bento Grid Section -->
    <section id="solutions" class="bento-section">
      <div class="bento-header">
        <h2 class="bento-title">From Spreadsheet to Storefront</h2>
        <p class="bento-subtitle">Three steps to professional-grade digital commerce.</p>
      </div>

      <div class="bento-grid">
        <div class="bento-card">
          <div class="bento-card-num">01</div>
          <h3 class="bento-card-title">Direct Import</h3>
          <p class="bento-card-desc">Connect your Google Sheet or upload an Excel file. No manual mapping required—our engine understands your headers automatically.</p>
        </div>

        <div class="bento-card">
          <div class="bento-card-num">02</div>
          <h3 class="bento-card-title">Semantic Validation</h3>
          <p class="bento-card-desc">Our AI scans for missing data, suggests better categories, and optimizes SEO keywords while you wait.</p>
        </div>

        <div class="bento-card">
          <div class="bento-card-num">03</div>
          <h3 class="bento-card-title">High-Res Generation</h3>
          <p class="bento-card-desc">Instant deployment to a blazing-fast, mobile-responsive storefront. Integrated payments, PDF exports, and search ready to go.</p>
        </div>
      </div>
    </section>

    <!-- AI Assistant Chat Section -->
    <section class="ai-chat-section">
      <div>
        <h2 style="font-family: 'Noto Serif', serif; font-size: 32px; font-weight: 700; margin-bottom: 16px;">
          Storefronts that feel bespoke, not templated.
        </h2>
        <p style="color: #434938; font-size: 15px; line-height: 1.6;">
          Our design engine uses the Organic Professionalism framework. It ensures your product catalog is high-density for performance but editorial in its aesthetic.
        </p>
      </div>

      <div class="chat-panel">
        <div id="chat-messages">
          <div class="chat-bubble-user">
            Hello! I've analyzed your imported sheet. Should I apply the default 2-year warranty text to 12 missing items?
          </div>
          <div class="chat-bubble-ai">
            Yes, apply the default to all missing fields and update SEO tags.
          </div>
        </div>

        <form id="ai-chat-form" class="chat-form">
          <input type="text" id="ai-input" class="chat-input" placeholder="Ask AI assistant..." required>
          <button type="submit" style="background: #416600; color: white; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 700; cursor: pointer;">Send</button>
        </form>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-banner">
      <h2 class="cta-title">Ready to go live in 5 minutes?</h2>
      <p style="opacity: 0.9; font-size: 15px;">Join businesses turning raw spreadsheets into world-class product experiences.</p>
      <a href="/register" class="cta-btn">Start Free Trial</a>
    </section>
  </main>

  <footer>
    <p>&copy; 2026 ProductGen PIM Systems. All rights reserved.</p>
  </footer>

  <script>
    document.getElementById('ai-chat-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const input = document.getElementById('ai-input');
      const val = input.value.trim();
      if (!val) return;

      const container = document.getElementById('chat-messages');

      const userBubble = document.createElement('div');
      userBubble.className = 'chat-bubble-user';
      userBubble.innerText = val;
      container.appendChild(userBubble);

      input.value = '';

      setTimeout(() => {
        const aiBubble = document.createElement('div');
        aiBubble.className = 'chat-bubble-ai';
        aiBubble.innerText = 'AI Result: Applied optimization for "' + val + '". Attributes updated successfully!';
        container.appendChild(aiBubble);
      }, 400);
    });
  </script>
  ${copilotWidgetTemplate()}
</body>
</html>
`;
};

export default landingTemplate;
