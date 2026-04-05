export const ELEMENT_ICONS = {
  fire: '🔥',
  water: '💧',
  wood: '🌿',
  thunder: '⚡',
  dark: '🌙',
  light: '☀️'
};

export const ELEMENT_NAMES = {
  fire: '화',
  water: '수',
  wood: '목',
  thunder: '뇌',
  dark: '암',
  light: '광'
};

// 속성 상성: key가 value에 강함
export const ELEMENT_ADVANTAGE = {
  fire: 'wood',
  wood: 'thunder',
  thunder: 'water',
  water: 'fire',
  dark: 'light',
  light: 'dark'
};

export const RARITY_ORDER = ['N', 'R', 'SR', 'SSR', 'UR'];

export const TYPE_NAMES = {
  character: '캐릭터',
  spell: '마법',
  trap: '함정'
};

// 일러스트 placeholder 이모지
export const CARD_ART = {
  char_001: '⚔️',
  char_002: '🏯',
  char_003: '🐱',
  char_004: '🌸',
  char_005: '🗡️',
  char_006: '👼',
  spell_001: '🌋',
  spell_002: '💎'
};
