import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const markedJs = fs.readFileSync(path.join(__dirname, '..', '..', 'node_modules', 'marked', 'lib', 'marked.umd.js'), 'utf8');

const copilotWidgetTemplate = () => {
  return `
    <style>
      .copilot-launcher {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #1f1e24;
        color: #b7bd7f;
        border: 2px solid #5f9104;
        border-radius: 50px;
        padding: 12px 20px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-weight: 700;
        font-size: 14px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: transform 0.2s;
      }
      .copilot-launcher:hover { transform: scale(1.05); }
      
      .copilot-panel {
        position: fixed;
        bottom: 80px;
        right: 24px;
        width: 380px;
        height: 600px;
        max-height: 80vh;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        border: 1px solid #cbd5dd;
        z-index: 9999;
        display: none;
        flex-direction: column;
        overflow: hidden;
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      .copilot-panel.open { display: flex; }
      
      .copilot-header {
        background: #1f1e24;
        color: #ffffff;
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 700;
        font-size: 15px;
      }
      .copilot-header-close {
        background: none;
        border: none;
        color: #cbd5dd;
        font-size: 20px;
        cursor: pointer;
      }
      .copilot-header-close:hover { color: #ffffff; }
      
      .copilot-chat {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        background: #f8fafc;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .msg { padding: 12px 16px; border-radius: 12px; font-size: 13px; max-width: 85%; line-height: 1.5; }
      .msg-user { background: #5f9104; color: #ffffff; align-self: flex-end; border-bottom-right-radius: 2px; }
      .msg-ai { background: #ffffff; border: 1px solid #cbd5dd; color: #1f1e24; align-self: flex-start; border-bottom-left-radius: 2px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
      
      .copilot-input-area {
        padding: 16px;
        background: #ffffff;
        border-top: 1px solid #cbd5dd;
        display: flex;
        gap: 8px;
      }
      .copilot-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #cbd5dd;
        border-radius: 20px;
        font-family: inherit;
        font-size: 13px;
        outline: none;
      }
      .copilot-input:focus { border-color: #5f9104; }
      .copilot-send {
        background: #1f1e24;
        color: #b7bd7f;
        border: none;
        border-radius: 20px;
        padding: 0 16px;
        font-weight: 700;
        cursor: pointer;
      }
      .copilot-send:hover { background: #000000; }
    </style>
    
    <button id="copilot-launcher" class="copilot-launcher">
      ⚡ AI Copilot
    </button>
    
    <div id="copilot-panel" class="copilot-panel">
      <div class="copilot-header">
        <span>⚡ ProductGen AI</span>
        <button id="copilot-close" class="copilot-header-close">&times;</button>
      </div>
      <div id="copilot-chat" class="copilot-chat">
        <div class="msg msg-ai">Hi! I'm your AI Copilot. How can I assist you with your catalog today?</div>
      </div>
      <form id="copilot-form" class="copilot-input-area">
        <input type="text" id="copilot-input" class="copilot-input" placeholder="Ask about products or analytics..." required />
        <button type="submit" class="copilot-send">Send</button>
      </form>
    </div>
    
    <script>
      \${markedJs}
    </script>
    <script>
      (function() {
        let history = [];
        const launcher = document.getElementById('copilot-launcher');
        const panel = document.getElementById('copilot-panel');
        const closeBtn = document.getElementById('copilot-close');
        const chatBox = document.getElementById('copilot-chat');
        const form = document.getElementById('copilot-form');
        const input = document.getElementById('copilot-input');
        
        launcher.addEventListener('click', () => {
          panel.classList.toggle('open');
        });
        closeBtn.addEventListener('click', () => {
          panel.classList.remove('open');
        });
        
        const appendMessage = (role, text) => {
          const div = document.createElement('div');
          div.className = 'msg ' + (role === 'user' ? 'msg-user' : 'msg-ai');
          
          if (role === 'ai') {
            try {
              div.innerHTML = marked.parse(text);
            } catch (err) {
              console.error('[Copilot Render Error]', err);
              div.textContent = text;
            }
          } else {
            div.innerText = text;
          }
          
          chatBox.appendChild(div);
          chatBox.scrollTop = chatBox.scrollHeight;
        };
        
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const message = input.value.trim();
          if (!message) return;
          
          appendMessage('user', message);
          input.value = '';
          
          const loadingDiv = document.createElement('div');
          loadingDiv.className = 'msg msg-ai';
          loadingDiv.innerText = 'Thinking...';
          chatBox.appendChild(loadingDiv);
          chatBox.scrollTop = chatBox.scrollHeight;
          
          try {
            const res = await fetch('/api/v1/copilot/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message, history, currentPage: window.location.pathname })
            });
            const data = await res.json();
            
            chatBox.removeChild(loadingDiv);
            
            if (res.ok) {
              history.push({ role: 'user', content: message });
              history.push({ role: 'ai', content: data.response });
              appendMessage('ai', data.response);
            } else {
              appendMessage('ai', 'Sorry, an error occurred.');
            }
          } catch (err) {
            chatBox.removeChild(loadingDiv);
            appendMessage('ai', 'Network error. Please try again later.');
          }
        });
      })();
    </script>
  `;
};
export default copilotWidgetTemplate;
