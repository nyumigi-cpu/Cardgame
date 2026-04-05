import { ELEMENT_ICONS, TYPE_NAMES, CARD_ART } from './game/constants.js';

let allCards = [];
let activeFilter = 'all';

async function loadCards() {
  const res = await fetch('./src/data/cards.json');
  allCards = await res.json();
  renderFilters();
  renderCards(allCards);
}

function renderFilters() {
  const bar = document.getElementById('filterBar');
  const filters = [
    { key: 'all', label: '전체' },
    { key: 'fire', label: '🔥 화' },
    { key: 'water', label: '💧 수' },
    { key: 'wood', label: '🌿 목' },
    { key: 'thunder', label: '⚡ 뇌' },
    { key: 'dark', label: '🌙 암' },
    { key: 'light', label: '☀️ 광' },
    { key: 'character', label: '캐릭터' },
    { key: 'spell', label: '마법' },
  ];

  bar.innerHTML = filters.map(f =>
    `<button class="filter-btn ${f.key === activeFilter ? 'active' : ''}" data-filter="${f.key}">${f.label}</button>`
  ).join('');

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    activeFilter = btn.dataset.filter;
    bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    let filtered = allCards;
    if (activeFilter !== 'all') {
      filtered = allCards.filter(c =>
        c.element === activeFilter || c.type === activeFilter
      );
    }
    renderCards(filtered);
  });
}

function renderCards(cards) {
  const grid = document.getElementById('cardGrid');
  grid.innerHTML = cards.map(card => createCardHTML(card)).join('');
}

function createCardHTML(card) {
  const icon = ELEMENT_ICONS[card.element];
  const art = CARD_ART[card.id] || '🃏';
  const typeName = TYPE_NAMES[card.type] || card.type;
  const isCharacter = card.type === 'character';

  return `
    <div class="card" data-rarity="${card.rarity}" data-element="${card.element}">
      <div class="card-inner">
        <div class="card-header">
          <div class="card-cost">${card.cost}</div>
          <span class="card-type-badge">${typeName}</span>
          <span class="card-element">${icon}</span>
        </div>

        <div class="card-illustration">${art}</div>

        <div class="card-rarity" data-rarity="${card.rarity}">${card.rarity}</div>

        <div class="card-name">${card.name}</div>

        ${isCharacter ? `
          <div class="card-stats">
            <span class="stat stat-atk">⚔️ ${card.atk}</span>
            <span class="stat stat-hp">❤️ ${card.hp}</span>
          </div>
        ` : ''}

        <div class="card-skill">
          <div class="skill-name">${card.skill.name}</div>
          <div class="skill-desc">${card.skill.description}</div>
        </div>

        <div class="card-flavor">"${card.flavor_text}"</div>
      </div>
    </div>
  `;
}

loadCards();
