// ===== 클래시 웨이브 배틀 엔진 =====

class BattleEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.player = { hp: 30, maxHp: 30, wave: 0, deck: [], hand: [], slots: [null, null, null] };
    this.enemy = { hp: 30, maxHp: 30, wave: 0, deck: [], hand: [], slots: [null, null, null] };
    this.turn = 0;
    this.phase = 'title'; // title, prep, deploy, clash, resolve, end
    this.clashResults = [];
    this.log = [];
  }

  // 덱 초기화: 카드 DB에서 랜덤 12장
  initDecks() {
    const shuffled = [...CARDS_DB].sort(() => Math.random() - 0.5);
    // 양쪽 다 같은 풀에서 뽑되 복사본 사용
    this.player.deck = shuffled.slice(0, 12).map(c => ({...c, uid: 'p_' + c.id + '_' + Math.random().toString(36).substr(2,4)}));
    this.enemy.deck = shuffled.slice(0, 12).map(c => ({...c, uid: 'e_' + c.id + '_' + Math.random().toString(36).substr(2,4)}));

    // 셔플
    this.player.deck.sort(() => Math.random() - 0.5);
    this.enemy.deck.sort(() => Math.random() - 0.5);
  }

  // 초기 핸드 드로우
  initialDraw() {
    for (let i = 0; i < 4; i++) {
      this.drawCard(this.player);
      this.drawCard(this.enemy);
    }
  }

  drawCard(who) {
    if (who.deck.length === 0) return null;
    const card = who.deck.pop();
    who.hand.push(card);
    return card;
  }

  // 턴 시작
  startTurn() {
    this.turn++;
    this.phase = 'deploy';
    this.player.slots = [null, null, null];
    this.enemy.slots = [null, null, null];
    this.clashResults = [];

    // 턴 2부터 드로우
    if (this.turn > 1) {
      this.drawCard(this.player);
      this.drawCard(this.enemy);
    }

    // 덱 소진 시 리셔플 (무한 게임 방지는 나중에)
    this.log.push(`━━ 턴 ${this.turn} 시작 ━━`);
  }

  // 플레이어 카드 배치
  placeCard(slotIndex, cardUid) {
    const idx = this.player.hand.findIndex(c => c.uid === cardUid);
    if (idx === -1) return false;

    // 이미 슬롯에 있는 카드 되돌리기
    if (this.player.slots[slotIndex]) {
      this.player.hand.push(this.player.slots[slotIndex]);
    }

    this.player.slots[slotIndex] = this.player.hand.splice(idx, 1)[0];
    return true;
  }

  // 슬롯에서 카드 회수
  removeFromSlot(slotIndex) {
    if (this.player.slots[slotIndex]) {
      this.player.hand.push(this.player.slots[slotIndex]);
      this.player.slots[slotIndex] = null;
    }
  }

  // AI 카드 배치
  aiPlaceCards() {
    const hand = this.enemy.hand;
    if (hand.length === 0) return;

    // 전략: 2~3장 배치, 강한 카드 우선
    const sorted = [...hand].sort((a, b) => b.atk - a.atk);
    const numToPlace = Math.min(hand.length, Math.random() > 0.3 ? 3 : 2);

    // 슬롯 랜덤 배치
    const slotOrder = [0, 1, 2].sort(() => Math.random() - 0.5);

    for (let i = 0; i < numToPlace; i++) {
      const card = sorted[i];
      const hIdx = this.enemy.hand.findIndex(c => c.uid === card.uid);
      if (hIdx !== -1) {
        this.enemy.slots[slotOrder[i]] = this.enemy.hand.splice(hIdx, 1)[0];
      }
    }
  }

  // 속성 유불리 판정
  getElementMultiplier(attackerElement, defenderElement) {
    if (ELEMENT_ADVANTAGE[attackerElement] === defenderElement) return 1.5;
    if (ELEMENT_ADVANTAGE[defenderElement] === attackerElement) return 0.75;
    return 1.0;
  }

  // 유효 ATK 계산 (스킬 포함)
  getEffectiveAtk(card, opponentCard, who) {
    let atk = card.atk;
    const skill = card.skill.desc;

    // 스킬 효과 적용
    if (skill.includes('빈 슬롯') && !opponentCard) {
      const bonus = parseInt(skill.match(/\+(\d)/)?.[1] || 2);
      atk += bonus;
    }
    if (skill.includes('선공') && card.atk >= (opponentCard?.atk || 0)) {
      atk += 2;
    }
    if (skill.includes('상대 ATK를 0')) {
      // 이 카드가 있으면 상대 ATK 0 처리 (resolve에서 처리)
    }
    if (skill.includes('웨이브 게이지 MAX') && who.wave >= 5) {
      atk *= 2;
    }

    // 속성 배율
    if (opponentCard) {
      // 즉사 판정 (암→광, 광→암 특수)
      if (skill.includes('즉사') && ELEMENT_ADVANTAGE[card.element] === opponentCard.element) {
        atk *= 2;
      }
      if (skill.includes('데미지 2배') && ELEMENT_ADVANTAGE[card.element] === opponentCard.element) {
        atk *= 2;
      }

      const mult = this.getElementMultiplier(card.element, opponentCard.element);
      atk = Math.floor(atk * mult);

      // 상대 약화 스킬
      if (skill.includes('ATK -2')) {
        // 적용은 상대에게 (resolve에서)
      }
    }

    return atk;
  }

  // 클래시 해결!
  resolveClash() {
    this.phase = 'clash';
    this.clashResults = [];

    for (let i = 0; i < 3; i++) {
      const pCard = this.player.slots[i];
      const eCard = this.enemy.slots[i];

      const result = {
        slot: i,
        playerCard: pCard,
        enemyCard: eCard,
        winner: null,
        playerDmg: 0,  // 플레이어가 받는 데미지
        enemyDmg: 0,   // 적이 받는 데미지
        playerHeal: 0,
        enemyHeal: 0,
        effects: []
      };

      if (!pCard && !eCard) {
        result.winner = 'none';
        result.effects.push('빈 슬롯 — 아무 일도 없음');
      } else if (pCard && !eCard) {
        // 플레이어 카드 직격
        let dmg = this.getEffectiveAtk(pCard, null, this.player);
        result.enemyDmg = dmg;
        result.winner = 'player';
        result.effects.push(`${pCard.name} 직격! ${dmg} 데미지`);
        this.player.wave++;
      } else if (!pCard && eCard) {
        // 적 카드 직격
        let dmg = this.getEffectiveAtk(eCard, null, this.enemy);
        result.playerDmg = dmg;
        result.winner = 'enemy';
        result.effects.push(`${eCard.name} 직격! ${dmg} 데미지`);
        this.enemy.wave++;
      } else {
        // 양쪽 모두 카드 있음 — 클래시!
        let pAtk = this.getEffectiveAtk(pCard, eCard, this.player);
        let eAtk = this.getEffectiveAtk(eCard, pCard, this.enemy);

        // 약화 스킬 적용
        if (pCard.skill.desc.includes('ATK -2')) eAtk = Math.max(0, eAtk - 2);
        if (eCard.skill.desc.includes('ATK -2')) pAtk = Math.max(0, pAtk - 2);

        // 절대영도 (ATK 0) 스킬
        if (pCard.skill.desc.includes('ATK를 0')) eAtk = 0;
        if (eCard.skill.desc.includes('ATK를 0')) pAtk = 0;

        const diff = pAtk - eAtk;

        if (diff > 0) {
          result.winner = 'player';
          result.enemyDmg = diff;
          this.player.wave++;
          result.effects.push(`${pCard.name}(${pAtk}) vs ${eCard.name}(${eAtk}) → 승리! ${diff} 데미지`);

          // 반사 데미지
          if (eCard.skill.desc.includes('반사')) {
            const reflect = parseInt(eCard.skill.desc.match(/(\d)/)?.[1] || 2);
            result.playerDmg += reflect;
            result.effects.push(`반사 데미지 ${reflect}!`);
          }
        } else if (diff < 0) {
          result.winner = 'enemy';
          result.playerDmg = Math.abs(diff);
          this.enemy.wave++;
          result.effects.push(`${pCard.name}(${pAtk}) vs ${eCard.name}(${eAtk}) → 패배! ${Math.abs(diff)} 데미지`);

          if (pCard.skill.desc.includes('반사')) {
            const reflect = parseInt(pCard.skill.desc.match(/(\d)/)?.[1] || 2);
            result.enemyDmg += reflect;
            result.effects.push(`반사 데미지 ${reflect}!`);
          }
        } else {
          result.winner = 'draw';
          result.effects.push(`${pCard.name}(${pAtk}) vs ${eCard.name}(${eAtk}) → 무승부!`);

          // 무승부 회복 스킬
          if (pCard.skill.desc.includes('무승부')) {
            const heal = parseInt(pCard.skill.desc.match(/HP (\d)/)?.[1] || 3);
            result.playerHeal = heal;
            result.effects.push(`${pCard.name} 무승부 효과! HP ${heal} 회복`);
          }
          if (eCard.skill.desc.includes('무승부')) {
            const heal = parseInt(eCard.skill.desc.match(/HP (\d)/)?.[1] || 3);
            result.enemyHeal = heal;
          }
        }

        // 승리 시 회복 스킬
        if (result.winner === 'player' && pCard.skill.desc.includes('클래시 승리 시') && pCard.skill.desc.includes('회복')) {
          const heal = parseInt(pCard.skill.desc.match(/HP (\d)/)?.[1] || 2);
          result.playerHeal += heal;
          result.effects.push(`${pCard.name} 승리 보너스! HP ${heal} 회복`);
        }
        if (result.winner === 'enemy' && eCard.skill.desc.includes('클래시 승리 시') && eCard.skill.desc.includes('회복')) {
          const heal = parseInt(eCard.skill.desc.match(/HP (\d)/)?.[1] || 2);
          result.enemyHeal += heal;
        }

        // 스플래시 데미지 (인접 슬롯)
        if (result.winner === 'player' && pCard.skill.desc.includes('스플래시')) {
          const splash = parseInt(pCard.skill.desc.match(/(\d) 스플래시/)?.[1] || 3);
          result.effects.push(`스플래시! 인접 슬롯 ${splash} 데미지`);
          result.splashDmg = { who: 'enemy', amount: splash, fromSlot: i };
        }
        if (result.winner === 'enemy' && eCard.skill.desc.includes('스플래시')) {
          const splash = parseInt(eCard.skill.desc.match(/(\d) 스플래시/)?.[1] || 3);
          result.splashDmg = { who: 'player', amount: splash, fromSlot: i };
        }

        // 화염폭풍/범위 공격
        if (pCard.skill.desc.includes('범위 공격')) {
          result.effects.push(`${pCard.name} 범위 공격!`);
          result.aoeDmg = { who: 'enemy', amount: 3 };
        }
        if (eCard.skill.desc.includes('범위 공격')) {
          result.aoeDmg = { who: 'player', amount: 3 };
        }

        // 번개 가르기 (반격에 즉사)
        if (pCard.skill.desc.includes('반격에 즉사') && result.winner !== 'player') {
          result.effects.push(`${pCard.name} 반격에 즉사!`);
        }
        if (eCard.skill.desc.includes('반격에 즉사') && result.winner !== 'enemy') {
          result.effects.push(`${eCard.name} 반격에 즉사!`);
        }
      }

      // 생명의 나무 (무조건 회복)
      if (pCard && pCard.skill.desc.includes('무관하게')) {
        const heal = parseInt(pCard.skill.desc.match(/HP (\d)/)?.[1] || 4);
        result.playerHeal += heal;
        result.effects.push(`${pCard.name} 무조건 회복! HP +${heal}`);
      }
      if (eCard && eCard.skill.desc.includes('무관하게')) {
        const heal = parseInt(eCard.skill.desc.match(/HP (\d)/)?.[1] || 4);
        result.enemyHeal += heal;
      }

      this.clashResults.push(result);
    }

    // 스플래시/AOE 후처리
    for (const r of this.clashResults) {
      if (r.splashDmg) {
        const adj = [r.splashDmg.fromSlot - 1, r.splashDmg.fromSlot + 1].filter(s => s >= 0 && s < 3);
        for (const s of adj) {
          if (r.splashDmg.who === 'enemy') {
            this.clashResults[s].enemyDmg += r.splashDmg.amount;
          } else {
            this.clashResults[s].playerDmg += r.splashDmg.amount;
          }
        }
      }
      if (r.aoeDmg) {
        for (let j = 0; j < 3; j++) {
          if (j === r.slot) continue;
          if (r.aoeDmg.who === 'enemy') {
            this.clashResults[j].enemyDmg += r.aoeDmg.amount;
          } else {
            this.clashResults[j].playerDmg += r.aoeDmg.amount;
          }
        }
      }
    }

    // 데미지/회복 적용
    let totalPlayerDmg = 0, totalEnemyDmg = 0;
    let totalPlayerHeal = 0, totalEnemyHeal = 0;

    for (const r of this.clashResults) {
      totalPlayerDmg += r.playerDmg;
      totalEnemyDmg += r.enemyDmg;
      totalPlayerHeal += r.playerHeal;
      totalEnemyHeal += r.enemyHeal;
    }

    this.player.hp = Math.min(this.player.maxHp, Math.max(0, this.player.hp - totalPlayerDmg + totalPlayerHeal));
    this.enemy.hp = Math.min(this.enemy.maxHp, Math.max(0, this.enemy.hp - totalEnemyDmg + totalEnemyHeal));

    // 웨이브 게이지 캡
    this.player.wave = Math.min(5, this.player.wave);
    this.enemy.wave = Math.min(5, this.enemy.wave);

    // 웨이브 스트라이크 체크
    if (this.player.wave >= 5) {
      this.enemy.hp = Math.max(0, this.enemy.hp - 5);
      this.player.wave = 0;
      this.log.push('⚡ 플레이어 웨이브 스트라이크! 5 데미지!');
      this.clashResults.push({ special: 'wave_strike', who: 'player', dmg: 5 });
    }
    if (this.enemy.wave >= 5) {
      this.player.hp = Math.max(0, this.player.hp - 5);
      this.enemy.wave = 0;
      this.log.push('⚡ 적 웨이브 스트라이크! 5 데미지!');
      this.clashResults.push({ special: 'wave_strike', who: 'enemy', dmg: 5 });
    }

    // 승패 체크
    if (this.player.hp <= 0 && this.enemy.hp <= 0) {
      this.phase = 'end';
      this.winner = 'draw';
    } else if (this.player.hp <= 0) {
      this.phase = 'end';
      this.winner = 'enemy';
    } else if (this.enemy.hp <= 0) {
      this.phase = 'end';
      this.winner = 'player';
    } else {
      this.phase = 'resolve';
    }

    return this.clashResults;
  }
}
