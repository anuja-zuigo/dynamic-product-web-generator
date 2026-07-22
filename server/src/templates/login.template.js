const loginTemplate = () => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In - ProductGen</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #eaf0f4; color: #1f1e24; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }

    .auth-card { background: #ffffff; border: 1px solid #cbd5dd; border-radius: 18px; width: 100%; max-width: 420px; padding: 40px 32px; box-shadow: 0 20px 40px rgba(31, 30, 36, 0.08); }
    .brand-header { text-align: center; margin-bottom: 32px; }
    .brand-logo { font-family: 'Noto Serif', serif; font-size: 24px; font-weight: 700; color: #1f1e24; margin-bottom: 8px; }
    .brand-tagline { font-size: 14px; color: #595862; }

    .form-group { margin-bottom: 20px; }
    label { display: block; font-size: 13px; font-weight: 600; color: #595862; margin-bottom: 8px; }
    input { width: 100%; padding: 12px 14px; background: #eaf0f4; border: 1px solid #cbd5dd; border-radius: 8px; color: #1f1e24; font-family: inherit; font-size: 14px; outline: none; transition: border-color 0.2s; }
    input:focus { border-color: #5f9104; }

    .alert { padding: 12px 14px; background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; border-radius: 8px; font-size: 13px; margin-bottom: 20px; display: none; }
    .btn-submit { width: 100%; padding: 12px; background: #5f9104; color: #ffffff; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(95, 145, 4, 0.3); }
    .btn-submit:hover { background: #4d7703; }

    .auth-footer { text-align: center; margin-top: 24px; font-size: 13px; color: #595862; }
    .auth-footer a { color: #5f9104; text-decoration: underline; font-weight: 700; }
  </style>
</head>
<body>

  <div class="auth-card">
    <div class="brand-header">
      <div class="brand-logo">⚡ ProductGen</div>
      <p class="brand-tagline">Sign in to access your product management dashboard</p>
    </div>

    <div id="alert-box" class="alert"></div>

    <form id="login-form">
      <div class="form-group">
        <label for="email">Email Address</label>
        <input type="email" id="email" required placeholder="admin@example.com">
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" required placeholder="••••••••">
      </div>

      <button type="submit" class="btn-submit" id="btn-submit">Sign In</button>
    </form>

    <div class="auth-footer">
      Don't have an account? <a href="/register">Register here</a>
    </div>
  </div>

  <script>
    const loginForm = document.getElementById('login-form');
    const alertBox = document.getElementById('alert-box');
    const btnSubmit = document.getElementById('btn-submit');

    if (localStorage.getItem('token')) {
      window.location.href = '/dashboard';
    }

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertBox.style.display = 'none';
      btnSubmit.disabled = true;
      btnSubmit.innerText = 'Signing In...';

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      try {
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          window.location.href = '/dashboard';
        } else {
          alertBox.innerText = data.message || 'Login failed. Please check your credentials.';
          alertBox.style.display = 'block';
        }
      } catch (err) {
        alertBox.innerText = 'Network error. Please try again later.';
        alertBox.style.display = 'block';
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerText = 'Sign In';
      }
    });
  </script>
</body>
</html>
`;
};

export default loginTemplate;
