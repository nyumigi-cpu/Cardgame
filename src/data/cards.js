// 카드 데이터베이스
const CARDS_DB = [
  // ===== 캐릭터 카드 =====
  {
    id: "char_001",
    name: "화염의 검사 아카네",
    rarity: "SSR",
    element: "fire",
    type: "character",
    cost: 5,
    atk: 8,
    hp: 5,
    skill: { name: "블레이즈 슬래시", desc: "화속성 상성 추가 데미지 +3" },
    flavor: "불꽃은 내 검에서 태어나 적의 잿더미 위에서 잠든다.",
    art: "⚔️"
  },
  {
    id: "char_002",
    name: "수호의 무녀 미즈키",
    rarity: "SR",
    element: "water",
    type: "character",
    cost: 4,
    atk: 4,
    hp: 8,
    skill: { name: "치유의 물결", desc: "클래시 승리 시 플레이어 HP 2 회복" },
    flavor: "이 물은 상처를 씻고, 마음을 채워줍니다.",
    art: "🏯"
  },
  {
    id: "char_003",
    name: "번개 고양이 라이냥",
    rarity: "R",
    element: "thunder",
    type: "character",
    cost: 2,
    atk: 5,
    hp: 3,
    skill: { name: "스파크 러시", desc: "빈 슬롯 공격 시 데미지 +2" },
    flavor: "냥냥! 찌릿찌릿하다냥~!",
    art: "🐱"
  },
  {
    id: "char_004",
    name: "숲의 정령 리아나",
    rarity: "SR",
    element: "wood",
    type: "character",
    cost: 3,
    atk: 5,
    hp: 6,
    skill: { name: "자연의 가시", desc: "클래시 패배 시 상대에 2 반사 데미지" },
    flavor: "숲이 살아 숨 쉬는 한, 나도 쓰러지지 않아.",
    art: "🌸"
  },
  {
    id: "char_005",
    name: "암흑기사 제로",
    rarity: "SSR",
    element: "dark",
    type: "character",
    cost: 6,
    atk: 9,
    hp: 6,
    skill: { name: "다크 이클립스", desc: "광 속성에 즉사 판정 (ATK 2배)" },
    flavor: "빛이 있는 곳에 반드시 그림자가 있다.",
    art: "🗡️"
  },
  {
    id: "char_006",
    name: "성녀 루미나",
    rarity: "SSR",
    element: "light",
    type: "character",
    cost: 6,
    atk: 6,
    hp: 9,
    skill: { name: "홀리 래디언스", desc: "암 속성에 데미지 2배 + 아군 HP 2 회복" },
    flavor: "어둠이 짙을수록, 빛은 더 눈부시게 빛나는 법이에요.",
    art: "👼"
  },
  {
    id: "char_007",
    name: "폭풍의 사무라이 진",
    rarity: "SR",
    element: "thunder",
    type: "character",
    cost: 4,
    atk: 7,
    hp: 4,
    skill: { name: "일섬", desc: "선공 시 ATK +2" },
    flavor: "바람보다 빠른 검은 번개를 가른다.",
    art: "⛩️"
  },
  {
    id: "char_008",
    name: "빙결의 마녀 유키",
    rarity: "SR",
    element: "water",
    type: "character",
    cost: 5,
    atk: 6,
    hp: 7,
    skill: { name: "프로스트 체인", desc: "상대 ATK -2 약화" },
    flavor: "모든 것은 얼어붙어야 아름다워지는 법.",
    art: "❄️"
  },
  {
    id: "char_009",
    name: "화산룡 이프리트",
    rarity: "SSR",
    element: "fire",
    type: "character",
    cost: 7,
    atk: 10,
    hp: 7,
    skill: { name: "헬파이어 브레스", desc: "클래시 승리 시 인접 슬롯에 3 스플래시 데미지" },
    flavor: "대지가 울부짖고, 하늘이 붉게 물든다.",
    art: "🐉"
  },
  {
    id: "char_010",
    name: "그림자 닌자 카게",
    rarity: "R",
    element: "dark",
    type: "character",
    cost: 3,
    atk: 6,
    hp: 3,
    skill: { name: "그림자 분신", desc: "빈 슬롯 공격 시 데미지 +3" },
    flavor: "보이지 않는 것이 가장 치명적이다.",
    art: "🥷"
  },
  {
    id: "char_011",
    name: "대지의 수호자 가이아",
    rarity: "SR",
    element: "wood",
    type: "character",
    cost: 5,
    atk: 4,
    hp: 10,
    skill: { name: "대지의 축복", desc: "클래시 무승부 시 플레이어 HP 3 회복" },
    flavor: "이 대지 위의 모든 생명은 내가 지킨다.",
    art: "🌳"
  },
  {
    id: "char_012",
    name: "천사장 미카엘",
    rarity: "UR",
    element: "light",
    type: "character",
    cost: 8,
    atk: 9,
    hp: 10,
    skill: { name: "디바인 저지먼트", desc: "웨이브 게이지 MAX 시 ATK 2배" },
    flavor: "심판의 시간이 왔다. 모든 어둠은 여기서 끝난다.",
    art: "✨"
  },
  // ===== 마법 카드 =====
  {
    id: "spell_001",
    name: "화염폭풍",
    rarity: "R",
    element: "fire",
    type: "spell",
    cost: 3,
    atk: 6,
    hp: 0,
    skill: { name: "화염폭풍", desc: "전 슬롯에 3 데미지 (범위 공격)" },
    flavor: "하늘에서 불이 비처럼 쏟아진다.",
    art: "🌋"
  },
  {
    id: "spell_002",
    name: "절대영도",
    rarity: "SR",
    element: "water",
    type: "spell",
    cost: 4,
    atk: 5,
    hp: 0,
    skill: { name: "절대영도", desc: "상대 ATK를 0으로 만듦 (1슬롯)" },
    flavor: "영하 273도. 모든 움직임이 멈추는 온도.",
    art: "🧊"
  },
  {
    id: "spell_003",
    name: "번개 가르기",
    rarity: "R",
    element: "thunder",
    type: "spell",
    cost: 2,
    atk: 7,
    hp: 0,
    skill: { name: "번개 가르기", desc: "ATK가 높지만 반격에 즉사" },
    flavor: "일격에 모든 것을 건다.",
    art: "⚡"
  },
  {
    id: "spell_004",
    name: "생명의 나무",
    rarity: "R",
    element: "wood",
    type: "spell",
    cost: 3,
    atk: 2,
    hp: 0,
    skill: { name: "생명의 나무", desc: "클래시 결과와 무관하게 HP 4 회복" },
    flavor: "뿌리 깊은 나무는 결코 쓰러지지 않는다.",
    art: "🌿"
  }
];

// 속성 상성 테이블
const ELEMENT_ADVANTAGE = {
  fire: 'wood',
  wood: 'thunder',
  thunder: 'water',
  water: 'fire',
  dark: 'light',
  light: 'dark'
};

const ELEMENT_ICONS = {
  fire: '🔥', water: '💧', wood: '🌿',
  thunder: '⚡', dark: '🌙', light: '☀️'
};

const ELEMENT_NAMES = {
  fire: '화', water: '수', wood: '목',
  thunder: '뇌', dark: '암', light: '광'
};

const RARITY_COLORS = {
  N: '#888888', R: '#4682E6', SR: '#B464FF', SSR: '#FFC832', UR: '#FF3232'
};
