import type { 
  WreckFragment, WreckFaction, WreckEra, WreckPart,
  AnomalyTrait, AssembledRelic, RelicRuleModifierId,
  BattleRuleModifiers, WreckSaveData
} from '../types';
import { 
  WRECK_FACTIONS, WRECK_ERAS, WRECK_PARTS, ANOMALY_TRAITS,
  RELIC_RULE_MODIFIERS, DEFAULT_RULE_MODIFIERS, getModifierDisplay
} from '../data/wreckData';

const FRACTIONS: WreckFaction[] = ['Federation', 'Empire', 'Pirate', 'Ancient', 'Unknown'];
const ERAS: WreckEra[] = ['GoldenAge', 'Expansion', 'War', 'Collapse', 'Prehistoric'];
const PARTS: WreckPart[] = ['Hull', 'Engine', 'Weapon', 'Shield', 'Core', 'Scanner', 'Comm', 'LifeSupport'];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedRandomChoice<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function generateWreckFragment(difficulty: number): WreckFragment {
  const factionWeights = difficulty >= 4 
    ? [15, 15, 25, 30, 15]
    : difficulty >= 2
    ? [25, 25, 25, 15, 10]
    : [35, 30, 20, 5, 10];

  const eraWeights = difficulty >= 4
    ? [10, 15, 25, 30, 20]
    : difficulty >= 2
    ? [20, 25, 25, 20, 10]
    : [35, 30, 20, 10, 5];

  const faction = weightedRandomChoice(FRACTIONS, factionWeights);
  const era = weightedRandomChoice(ERAS, eraWeights);
  const part = randomChoice(PARTS);

  const baseCorrosion = 10 + Math.random() * 40;
  const difficultyBonus = (difficulty - 1) * 8;
  const corrosion = Math.min(95, Math.max(5, baseCorrosion - difficultyBonus + (Math.random() * 20 - 10)));

  const traits = generateTraits(difficulty, faction, era);

  return {
    id: `fragment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    faction,
    era,
    part,
    corrosion: Math.round(corrosion * 10) / 10,
    traits,
    discoveredAt: Date.now(),
    fromDifficulty: difficulty,
  };
}

function generateTraits(difficulty: number, faction: WreckFaction, era: WreckEra): AnomalyTrait[] {
  const traitCount = difficulty >= 4 ? 2 + Math.floor(Math.random() * 2) : difficulty >= 2 ? 1 + Math.floor(Math.random() * 2) : 1;
  
  const pool = [...ANOMALY_TRAITS];
  const factionBoosted = pool.filter(t => {
    if (faction === 'Ancient' && t.powerLevel >= 3) return true;
    if (faction === 'Pirate' && (t.id === 'repair_inhibit' || t.id === 'shield_breach')) return true;
    if (faction === 'Empire' && (t.id === 'armor_pierce' || t.id === 'crit_cascade')) return true;
    if (faction === 'Federation' && (t.id === 'shield_reflect' || t.id === 'overheat_control')) return true;
    if (era === 'Prehistoric' && t.powerLevel >= 4) return true;
    if (era === 'War' && t.category === 'buff') return true;
    return false;
  });

  const selected: AnomalyTrait[] = [];
  const availableBoosted = [...factionBoosted];
  const availableNormal = [...pool];

  for (let i = 0; i < traitCount; i++) {
    let trait: AnomalyTrait;
    if (availableBoosted.length > 0 && Math.random() < 0.6) {
      const idx = Math.floor(Math.random() * availableBoosted.length);
      trait = availableBoosted[idx];
      availableBoosted.splice(idx, 1);
    } else {
      trait = randomChoice(availableNormal);
    }

    const hasConflict = selected.some(s => 
      s.conflictTags.some(t => trait.conflictTags.includes(t)) ||
      trait.conflictTags.some(t => s.conflictTags.includes(t))
    );

    if (!hasConflict && !selected.some(s => s.id === trait.id)) {
      selected.push(trait);
    }
  }

  return selected;
}

export function generateVictoryFragments(difficulty: number, turns: number): WreckFragment[] {
  const fragments: WreckFragment[] = [];
  
  const baseCount = difficulty >= 4 ? 2 : 1;
  const turnBonus = turns <= 5 ? 1 : 0;
  const totalCount = baseCount + turnBonus;

  for (let i = 0; i < totalCount; i++) {
    fragments.push(generateWreckFragment(difficulty));
  }

  if (Math.random() < 0.15 * difficulty) {
    fragments.push(generateWreckFragment(Math.min(5, difficulty + 1)));
  }

  return fragments;
}

export interface AssemblyCheckResult {
  canAssemble: boolean;
  possibleModifierId: RelicRuleModifierId | null;
  conflicts: { fragment1Id: string; fragment2Id: string; reason: string }[];
  totalCorrosion: number;
  corrosionPenalty: number;
  power: number;
  missingRequirements: string[];
}

export function checkRelicAssembly(fragments: WreckFragment[]): AssemblyCheckResult {
  const result: AssemblyCheckResult = {
    canAssemble: false,
    possibleModifierId: null,
    conflicts: [],
    totalCorrosion: 0,
    corrosionPenalty: 0,
    power: 0,
    missingRequirements: [],
  };

  if (fragments.length < 2) {
    result.missingRequirements.push('至少需要 2 个碎片');
    return result;
  }

  if (fragments.length > 4) {
    result.missingRequirements.push('最多使用 4 个碎片');
    return result;
  }

  const allTraits: AnomalyTrait[] = [];
  const traitIds = new Set<string>();

  for (let i = 0; i < fragments.length; i++) {
    for (let j = i + 1; j < fragments.length; j++) {
      const f1 = fragments[i];
      const f2 = fragments[j];
      
      for (const t1 of f1.traits) {
        for (const t2 of f2.traits) {
          if (t1.conflictTags.some(tag => t2.conflictTags.includes(tag))) {
            result.conflicts.push({
              fragment1Id: f1.id,
              fragment2Id: f2.id,
              reason: `词条冲突：${t1.name} ↔ ${t2.name}`,
            });
          }
        }
      }
    }

    for (const trait of fragments[i].traits) {
      if (!traitIds.has(trait.id)) {
        traitIds.add(trait.id);
        allTraits.push(trait);
      }
    }
  }

  if (result.conflicts.length > 0) {
    return result;
  }

  result.totalCorrosion = fragments.reduce((sum, f) => sum + f.corrosion, 0);
  result.corrosionPenalty = Math.floor(result.totalCorrosion / fragments.length);
  result.power = allTraits.reduce((sum, t) => sum + t.powerLevel, 0);

  const allTags = new Set(allTraits.map(t => t.id));
  const allFactions = new Set(fragments.map(f => f.faction));
  const allEras = new Set(fragments.map(f => f.era));
  const allParts = new Set(fragments.map(f => f.part));

  for (const modifier of RELIC_RULE_MODIFIERS) {
    const hasAllTags = modifier.requiredTags.every(tag => allTags.has(tag));
    if (!hasAllTags) continue;

    if (modifier.requiredFaction && !allFactions.has(modifier.requiredFaction)) continue;
    if (modifier.requiredEra && !allEras.has(modifier.requiredEra)) continue;
    if (modifier.requiredParts && !modifier.requiredParts.every(p => allParts.has(p))) continue;

    result.possibleModifierId = modifier.id;
    result.canAssemble = true;
    break;
  }

  if (!result.possibleModifierId) {
    result.missingRequirements.push('碎片组合无法匹配任何遗物配方，请尝试不同的碎片');
  }

  return result;
}

export function assembleRelic(fragments: WreckFragment[], modifierId: RelicRuleModifierId): AssembledRelic {
  const checkResult = checkRelicAssembly(fragments);
  const modifierDisplay = getModifierDisplay(modifierId);
  
  const relicNames: Record<RelicRuleModifierId, string[]> = {
    first_overheat_safe: ['恒温者之心', '冷却核心残余', '温度调节器'],
    scan_shield_break: ['护盾杀手', '扫描穿透阵列', '反护盾模块'],
    enemy_repair_half: ['腐朽发射器', '修复干扰核心', '纳米抑制器'],
    turn_start_extra_energy: ['永恒反应堆', '暗能收集器', '虚空能量核'],
    crit_heal: ['生命谐振器', '吸血回路', '能量反馈器'],
    shield_damage_reflect: ['棱镜护盾', '反射外壳', '伤害回赠器'],
    engine_overcharge: ['极速引擎', '超推核心', '永恒推进器'],
    weapon_pierce: ['等离子穿刺者', '破甲弹头', '量子穿透炮'],
  };

  const names = relicNames[modifierId] || ['神秘遗物'];
  const name = names[Math.floor(Math.random() * names.length)];

  return {
    id: `relic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    fragments: [...fragments],
    ruleModifier: modifierId,
    totalCorrosion: checkResult.totalCorrosion,
    corrosionPenalty: checkResult.corrosionPenalty,
    power: checkResult.power,
    assembledAt: Date.now(),
  };
}

export function computeActiveModifiers(relics: AssembledRelic[], activeIds: string[]): BattleRuleModifiers {
  const modifiers: BattleRuleModifiers = { ...DEFAULT_RULE_MODIFIERS };
  const activeRelics = relics.filter(r => activeIds.includes(r.id));

  for (const relic of activeRelics) {
    const corrosionMultiplier = Math.max(0.3, 1 - (relic.corrosionPenalty / 100));
    
    switch (relic.ruleModifier) {
      case 'first_overheat_safe':
        modifiers.firstOverheatSafe = true;
        break;
      case 'scan_shield_break':
        modifiers.scanShieldBreak = true;
        break;
      case 'enemy_repair_half':
        modifiers.enemyRepairHalf = true;
        break;
      case 'turn_start_extra_energy':
        modifiers.turnStartExtraEnergy += Math.max(1, Math.round(2 * corrosionMultiplier));
        break;
      case 'crit_heal':
        modifiers.critHealPercent += Math.round(15 * corrosionMultiplier);
        break;
      case 'shield_damage_reflect':
        modifiers.shieldReflectPercent += Math.round(20 * corrosionMultiplier);
        break;
      case 'engine_overcharge':
        modifiers.engineOvercharge = true;
        break;
      case 'weapon_pierce':
        modifiers.weaponPiercePercent += Math.round(25 * corrosionMultiplier);
        break;
    }
  }

  return modifiers;
}

export function getFactionInfo(faction: WreckFaction) {
  return WRECK_FACTIONS.find(f => f.id === faction) || WRECK_FACTIONS[4];
}

export function getEraInfo(era: WreckEra) {
  return WRECK_ERAS.find(e => e.id === era) || WRECK_ERAS[0];
}

export function getPartInfo(part: WreckPart) {
  return WRECK_PARTS.find(p => p.id === part) || WRECK_PARTS[0];
}

export function createDefaultWreckSaveData(): WreckSaveData {
  return {
    fragments: [],
    relics: [],
    activeRelicIds: [],
    maxActiveRelics: 3,
  };
}
