// ===== 씹덕 카드게임 — 메인 앱 컨트롤러 =====

const engine = new BattleEngine();
let selectedCardUid = null;

// ===== PARTICLE SYSTEM =====
const particleCanvas = document.getElementById('particleCanvas');
const pCtx = particleCanvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  particleCanvas.width = window.innerWidth;
  particleCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * particleCanvas.width;
    this.y = Math.random() * particleCanvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedY = -(Math.random() * 0.5 + 0.1);
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.hue = Math.random() > 0.5 ? 340 : 200; // pink or cyan
    this.life = 1;
    this.decay = Math.random() * 0.003 + 0.001;
  }
  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.life -= this.decay;
    if (this.life <= 0 || this.y < -10) this.reset();
  }
  draw() {
    pCtx.beginPath();
    pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    pCtx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.opacity * this.life})`;
    pCtx.fill();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < 60; i++) particles.push(new Particle());
}

function animateParticles() {
  pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// ===== SCREENS =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ===== TITLE SCREEN =====
function initTitle() {
  const container = document.getElementById('titleCards');
  const previewCards = CARDS_DB.filter(c => ['SSR', 'UR'].includes(c.rarity)).slice(0, 5);
  container.innerHTML = previewCards.map(c => `
    <div class="title-card-preview" style="background:${getElementGradient(c.element)};">
      <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4px;">
        <div style="font-size:1.8rem;">${c.art}</div>
        <div style="font-size:0.45rem;font-weight:700;text-align:center;margin-top:4px;text-shadow:0 1px 3px rgba(0,0,0,0.8);">${c.name}</div>
      </div>
    </div>
  `).join('');
}

function getElementGradient(el) {
  const map = {
    fire:'linear-gradient(135deg,#ff6b35,#c0392b)',
    water:'linear-gradient(135deg,#3498db,#1a3a6c)',
    wood:'linear-gradient(135deg,#27ae60,#145a32)',
    thunder:'linear-gradient(135deg,#f1c40f,#b7950b)',
    dark:'linear-gradient(135deg,#6c3483,#1a0a2e)',
    light:'linear-gradient(135deg,#f9e547,#daa520)'
  };
  return map[el] || map.fire;
}

// ===== CARD HTML GENERATOR =====
function cardHTML(card, showFace = true) {
  if (!showFace) {
    return `<div class="card-back">🎴</div>`;
  }
  const isChar = card.type === 'character';
  return `
    <div class="card" data-element="${card.element}" data-rarity="${card.rarity}" data-uid="${card.uid}">
      <div class="card-face">
        <div class="card-top">
          <div class="card-cost">${card.cost}</div>
          <span class="card-rarity-badge" data-r="${card.rarity}">${card.rarity}</span>
          <span class="card-element-icon">${ELEMENT_ICONS[card.element]}</span>
        </div>
        <div class="card-art">${card.art}</div>
        <div class="card-name-text">${card.name}</div>
        ${isChar ? `<div class="card-stats-row"><span class="stat-atk">⚔${card.atk}</span><span class="stat-hp">♥${card.hp}</span></div>` : `<div class="card-stats-row"><span class="stat-atk">⚔${card.atk}</span></div>`}
        <div class="card-skill-text">${card.skill.name}: ${card.skill.desc}</div>
      </div>
    </div>
  `;
}

// ===== BATTLE INIT =====
function startBattle() {
  engine.reset();
  engine.initDecks();
  engine.initialDraw();
  engine.startTurn();
  selectedCardUid = null;

  showScreen('battleScreen');
  renderBattle();
}

// ===== RENDER =====
function renderBattle() {
  renderHP();
  renderWaveGauge();
  renderHand();
  renderPlayerSlots();
  renderEnemySlots();
  renderTurnIndicator();
  updateClashButton();
}

function renderHP() {
  const pH = engine.player, eH = engine.enemy;
  document.getElementById('playerHpBar').style.width = `${(pH.hp / pH.maxHp) * 100}%`;
  document.getElementById('enemyHpBar').style.width = `${(eH.hp / eH.maxHp) * 100}%`;
  document.getElementById('playerHpText').textContent = `${pH.hp}/${pH.maxHp}`;
  document.getElementById('enemyHpText').textContent = `${eH.hp}/${eH.maxHp}`;
}

function renderWaveGauge() {
  ['player', 'enemy'].forEach(who => {
    const container = document.getElementById(who + 'Wave');
    const wave = engine[who].wave;
    container.innerHTML = Array.from({length: 5}, (_, i) =>
      `<div class="wave-pip ${i < wave ? 'filled' : ''}"></div>`
    ).join('');
  });
}

function renderHand() {
  const container = document.getElementById('handCards');
  container.innerHTML = engine.player.hand.map(card => `
    <div class="hand-card-wrapper ${selectedCardUid === card.uid ? 'selected' : ''}"
         data-uid="${card.uid}" onclick="selectHandCard('${card.uid}')">
      ${cardHTML(card, true)}
    </div>
  `).join('');
}

function renderPlayerSlots() {
  const slots = document.querySelectorAll('.player-slot');
  slots.forEach((slot, i) => {
    const card = engine.player.slots[i];
    if (card) {
      slot.innerHTML = `<span class="slot-label">SLOT ${i+1}</span>${cardHTML(card, true)}`;
      slot.classList.add('has-card');
      slot.classList.remove('droppable');
    } else {
      slot.innerHTML = `<span class="slot-label">SLOT ${i+1}</span>`;
      slot.classList.remove('has-card');
      slot.classList.toggle('droppable', selectedCardUid !== null);
    }
  });
}

function renderEnemySlots() {
  const slots = document.querySelectorAll('.enemy-slot');
  slots.forEach((slot, i) => {
    slot.innerHTML = `<span class="slot-label">SLOT ${i+1}</span>`;
    slot.classList.remove('has-card');
  });
}

function renderTurnIndicator() {
  document.getElementById('turnIndicator').textContent = `TURN ${engine.turn}`;
}

function updateClashButton() {
  const btn = document.getElementById('btnClash');
  const hasAny = engine.player.slots.some(s => s !== null);
  btn.disabled = !hasAny;
  btn.classList.toggle('ready', hasAny);
}

// ===== INTERACTIONS =====
function selectHandCard(uid) {
  if (selectedCardUid === uid) {
    selectedCardUid = null;
  } else {
    selectedCardUid = uid;
  }
  renderHand();
  renderPlayerSlots();
}

// Slot click
document.querySelectorAll('.player-slot').forEach(slot => {
  slot.addEventListener('click', () => {
    const idx = parseInt(slot.dataset.slot);
    if (selectedCardUid) {
      // Place card
      engine.placeCard(idx, selectedCardUid);
      selectedCardUid = null;
      renderBattle();
    } else if (engine.player.slots[idx]) {
      // Remove card from slot
      engine.removeFromSlot(idx);
      renderBattle();
    }
  });
});

// Reset slots
document.getElementById('btnResetSlots').addEventListener('click', () => {
  for (let i = 0; i < 3; i++) engine.removeFromSlot(i);
  selectedCardUid = null;
  renderBattle();
});

// ===== CLASH! =====
document.getElementById('btnClash').addEventListener('click', async () => {
  if (engine.player.slots.every(s => s === null)) return;

  // AI places cards
  engine.aiPlaceCards();

  // Show enemy cards briefly in slots
  const eSlots = document.querySelectorAll('.enemy-slot');
  engine.enemy.slots.forEach((card, i) => {
    if (card) {
      eSlots[i].innerHTML = `<span class="slot-label">SLOT ${i+1}</span><div class="card-back">🎴</div>`;
      eSlots[i].classList.add('has-card');
    }
  });

  // Disable interactions
  document.getElementById('btnClash').disabled = true;

  // Short delay then resolve
  await sleep(600);

  // Resolve clash
  const results = engine.resolveClash();

  // Show clash overlay
  showClashResults(results);
});

function showClashResults(results) {
  const overlay = document.getElementById('clashOverlay');
  const container = document.getElementById('clashResults');
  const summary = document.getElementById('clashSummary');

  overlay.classList.add('active');

  let html = '';
  let totalPDmg = 0, totalEDmg = 0, totalPHeal = 0, totalEHeal = 0;

  results.forEach((r, idx) => {
    if (r.special === 'wave_strike') {
      html += `
        <div class="clash-slot-result" style="animation-delay:${idx * 0.3}s; border:1px solid var(--cyan);">
          <div style="font-size:1.5rem;">⚡</div>
          <div class="clash-result-text" style="color:var(--cyan);">
            WAVE STRIKE!<br>
            <span style="font-size:1.2rem;">${r.who === 'player' ? '적에게' : '나에게'} ${r.dmg} 데미지!</span>
          </div>
        </div>
      `;
      return;
    }

    totalPDmg += r.playerDmg;
    totalEDmg += r.enemyDmg;
    totalPHeal += r.playerHeal;
    totalEHeal += r.enemyHeal;

    const pCard = r.playerCard;
    const eCard = r.enemyCard;

    const winClass = r.winner === 'player' ? 'win' : r.winner === 'enemy' ? 'lose' : r.winner === 'draw' ? 'draw' : '';
    const winText = r.winner === 'player' ? '승리!' : r.winner === 'enemy' ? '패배!' : r.winner === 'draw' ? '무승부' : '—';

    html += `
      <div class="clash-slot-result" style="animation-delay:${idx * 0.3}s">
        <div class="clash-card-mini" style="background:${pCard ? getElementGradient(pCard.element) : '#222'}; border-radius:8px;">
          ${pCard ? `<div>${pCard.art}</div><div style="font-size:0.5rem;">${pCard.name}</div><div>⚔${engine.getEffectiveAtk ? pCard.atk : pCard.atk}</div>` : '<div style="color:#555;">비어있음</div>'}
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
          <div class="clash-vs">VS</div>
          <div class="clash-result-text ${winClass}">${winText}</div>
          ${r.enemyDmg > 0 ? `<div class="clash-dmg-text">적 -${r.enemyDmg} HP</div>` : ''}
          ${r.playerDmg > 0 ? `<div class="clash-dmg-text">나 -${r.playerDmg} HP</div>` : ''}
          ${r.playerHeal > 0 ? `<div class="clash-heal-text">나 +${r.playerHeal} HP</div>` : ''}
        </div>
        <div class="clash-card-mini" style="background:${eCard ? getElementGradient(eCard.element) : '#222'}; border-radius:8px;">
          ${eCard ? `<div>${eCard.art}</div><div style="font-size:0.5rem;">${eCard.name}</div><div>⚔${eCard.atk}</div>` : '<div style="color:#555;">비어있음</div>'}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Summary
  let summaryHTML = '<div style="margin-top:12px;">';
  if (totalEDmg > 0) summaryHTML += `<span style="color:#2ecc71;font-weight:700;">적에게 총 ${totalEDmg} 데미지!</span> `;
  if (totalPDmg > 0) summaryHTML += `<span style="color:#e74c3c;font-weight:700;">나에게 총 ${totalPDmg} 데미지!</span> `;
  if (totalPHeal > 0) summaryHTML += `<span style="color:#2ecc71;font-weight:700;">HP ${totalPHeal} 회복!</span>`;
  summaryHTML += '</div>';
  summary.innerHTML = summaryHTML;

  // Update HP display
  renderHP();
  renderWaveGauge();

  // Check game end
  const btnNext = document.getElementById('btnNextTurn');
  if (engine.phase === 'end') {
    btnNext.textContent = '결과 보기';
    btnNext.onclick = showEndScreen;
  } else {
    btnNext.textContent = '다음 턴 →';
    btnNext.onclick = nextTurn;
  }
}

function nextTurn() {
  document.getElementById('clashOverlay').classList.remove('active');
  engine.startTurn();
  selectedCardUid = null;
  renderBattle();
}

function showEndScreen() {
  document.getElementById('clashOverlay').classList.remove('active');
  const overlay = document.getElementById('endOverlay');
  const title = document.getElementById('endTitle');
  const sub = document.getElementById('endSub');

  overlay.classList.add('active');

  if (engine.winner === 'player') {
    title.textContent = 'VICTORY!';
    title.className = 'end-title victory';
    sub.textContent = `${engine.turn}턴 만에 승리! 적 HP: ${engine.enemy.hp}`;
  } else if (engine.winner === 'enemy') {
    title.textContent = 'DEFEAT...';
    title.className = 'end-title defeat';
    sub.textContent = `${engine.turn}턴에 패배... 내 HP: ${engine.player.hp}`;
  } else {
    title.textContent = 'DRAW';
    title.className = 'end-title';
    title.style.color = '#f1c40f';
    sub.textContent = '무승부!';
  }

  // Burst particles for victory
  if (engine.winner === 'player') {
    for (let i = 0; i < 40; i++) {
      const p = new Particle();
      p.x = particleCanvas.width / 2;
      p.y = particleCanvas.height / 2;
      p.speedX = (Math.random() - 0.5) * 4;
      p.speedY = (Math.random() - 0.5) * 4;
      p.size = Math.random() * 4 + 1;
      p.hue = Math.random() * 60 + 30; // gold
      p.opacity = 1;
      particles.push(p);
    }
  }
}

// Restart
document.getElementById('btnRestart').addEventListener('click', () => {
  document.getElementById('endOverlay').classList.remove('active');
  startBattle();
});

// ===== START BUTTON =====
document.getElementById('btnStart').addEventListener('click', startBattle);

// ===== UTIL =====
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ===== INIT =====
initTitle();
