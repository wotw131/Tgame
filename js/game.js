/**
 * 鸦岭 (Crow Ridge) - Game Engine
 * Horror Mystery Web Game
 */

const Game = {
  // Clue tracking
  cluesFound: JSON.parse(localStorage.getItem('crowridge_clues') || '[]'),
  visitedPages: JSON.parse(localStorage.getItem('crowridge_visited') || '[]'),
  unlockedContent: JSON.parse(localStorage.getItem('crowridge_unlocked') || '[]'),
  playerName: localStorage.getItem('crowridge_player') || '',

  // Add a clue
  addClue(id, title, description) {
    if (!this.cluesFound.find(c => c.id === id)) {
      this.cluesFound.push({
        id,
        title,
        description,
        timestamp: new Date().toISOString(),
        isNew: true
      });
      this.save();
      this.showClueNotification(title);
      // Remove new flag after animation
      setTimeout(() => {
        const clue = this.cluesFound.find(c => c.id === id);
        if (clue) clue.isNew = false;
        this.save();
      }, 5000);
    }
  },

  // Check if clue is found
  hasClue(id) {
    return this.cluesFound.some(c => c.id === id);
  },

  // Unlock content
  unlock(id) {
    if (!this.unlockedContent.includes(id)) {
      this.unlockedContent.push(id);
      this.save();
    }
  },

  // Check if content is unlocked
  isUnlocked(id) {
    return this.unlockedContent.includes(id);
  },

  // Mark page visited
  visitPage(page) {
    if (!this.visitedPages.includes(page)) {
      this.visitedPages.push(page);
      this.save();
    }
  },

  // Save all state to localStorage
  save() {
    localStorage.setItem('crowridge_clues', JSON.stringify(this.cluesFound));
    localStorage.setItem('crowridge_visited', JSON.stringify(this.visitedPages));
    localStorage.setItem('crowridge_unlocked', JSON.stringify(this.unlockedContent));
    localStorage.setItem('crowridge_player', this.playerName);
  },

  // Show clue notification
  showClueNotification(title) {
    const notif = document.createElement('div');
    notif.className = 'clue-notification';
    notif.innerHTML = `
      <span style="font-size:1.2rem;">🔍</span>
      <span>发现线索: <strong>${title}</strong></span>
    `;
    notif.style.cssText = `
      position: fixed;
      bottom: 60px;
      right: 20px;
      background: var(--bg-panel);
      border: 1px solid var(--accent-gold);
      color: var(--accent-gold);
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 400;
      font-family: var(--font-body);
      font-size: 0.9rem;
      animation: clueSlideIn 0.5s ease, clueSlideOut 0.5s ease 3.5s forwards;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 4000);
  },

  // Validate access code
  checkCode(input, correctCode) {
    return input.trim().toUpperCase() === correctCode.trim().toUpperCase();
  },

  // Get total clues count
  getTotalClues() {
    return this.cluesFound.length;
  },

  // Reset game
  reset() {
    this.cluesFound = [];
    this.visitedPages = [];
    this.unlockedContent = [];
    this.playerName = '';
    localStorage.removeItem('crowridge_clues');
    localStorage.removeItem('crowridge_visited');
    localStorage.removeItem('crowridge_unlocked');
    localStorage.removeItem('crowridge_player');
  }
};

// ========== Clue Panel UI ==========
function initCluePanel() {
  const panel = document.getElementById('cluePanel');
  const overlay = document.getElementById('cluePanelOverlay');
  const btn = document.getElementById('clueTrackerBtn');
  const list = document.getElementById('clueList');
  const count = document.getElementById('clueCount');

  if (!panel || !btn) return;

  function updateList() {
    if (list) {
      if (Game.cluesFound.length === 0) {
        list.innerHTML = '<div class="text-muted" style="padding:20px;text-align:center;">尚未发现线索<br><small>探索各个页面寻找线索</small></div>';
      } else {
        list.innerHTML = Game.cluesFound.map(c => `
          <div class="clue-item ${c.isNew ? 'new-clue' : ''}">
            <strong>${c.title}</strong>
            <div style="color:var(--text-muted);font-size:0.8rem;margin-top:4px;">${c.description}</div>
          </div>
        `).join('');
      }
    }
    if (count) {
      count.textContent = Game.cluesFound.length;
    }
  }

  btn.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (overlay) overlay.classList.toggle('open');
    updateList();
  });

  if (overlay) {
    overlay.addEventListener('click', () => {
      panel.classList.remove('open');
      overlay.classList.remove('open');
    });
  }

  // Update on page load
  updateList();
}

// ========== Scroll Reveal ==========
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
}

// ========== Cursor Glow ==========
function initCursorGlow() {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let mouseX = -200, mouseY = -200;
  let currentX = -200, currentY = -200;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;
    glow.style.left = currentX + 'px';
    glow.style.top = currentY + 'px';
    requestAnimationFrame(animate);
  }
  animate();
}

// ========== Redacted Text ==========
function initRedacted() {
  document.querySelectorAll('.redacted').forEach(el => {
    el.addEventListener('click', () => {
      el.classList.toggle('revealed');
    });
  });
}

// ========== Typewriter effect ==========
function typewriter(el, text, speed = 50, callback) {
  let i = 0;
  el.textContent = '';
  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed + Math.random() * 30);
    } else if (callback) {
      callback();
    }
  }
  type();
}

// ========== Audio atmosphere (subtle) ==========
function initAtmosphere() {
  // Create extremely subtle ambient "drone" using Web Audio API
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    let isPlaying = false;

    document.addEventListener('click', function startAudio() {
      if (isPlaying) return;
      isPlaying = true;

      // Very low frequency ambient drone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(40, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(42, ctx.currentTime + 10);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      // LFO for subtle wobble
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
      lfoGain.gain.setValueAtTime(2, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
    }, { once: true });
  } catch(e) {
    // Silently fail - audio is optional
  }
}

// ========== Page Init ==========
document.addEventListener('DOMContentLoaded', () => {
  initCluePanel();
  initScrollReveal();
  initCursorGlow();
  initRedacted();
  initAtmosphere();

  // Mark current page as visited
  const pageName = document.body.dataset.page || window.location.pathname.split('/').pop() || 'unknown';
  Game.visitPage(pageName);

  // Add CSS for clue notification animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes clueSlideIn {
      from { transform: translateX(100px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes clueSlideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
});
