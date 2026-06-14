import type { 
  WreckFaction, WreckEra, WreckPart, 
  AnomalyTrait, RelicRuleModifier, RelicRuleModifierId,
  BattleRuleModifiers
} from '../types';

export const WRECK_FACTIONS: { id: WreckFaction; name: string; color: string; icon: string }[] = [
  { id: 'Federation', name: '银河联邦', color: '#4da6ff', icon: '🛡️' },
  { id: 'Empire', name: '星辰帝国', color: '#ff5c5c', icon: '⚔️' },
  { id: 'Pirate', name: '虚空海盗', color: '#ffa64d', icon: '🏴‍☠️' },
  { id: 'Ancient', name: '远古遗族', color: '#a64dff', icon: '🏛️' },
  { id: 'Unknown', name: '未知来源', color: '#808080', icon: '❓' },
];

export const WRECK_ERAS: { id: WreckEra; name: string; year: string; description: string }[] = [
  { id: 'GoldenAge', name: '黄金纪元', year: '±0', description: '和平繁荣的黄金时代' },
  { id: 'Expansion', name: '大扩张时代', year: '-500', description: '文明快速扩张的时期' },
  { id: 'War', name: '千年战争', year: '-1200', description: '各大势力激战的黑暗时期' },
  { id: 'Collapse', name: '文明崩塌', year: '-2500', description: '古老文明崩塌的年代' },
  { id: 'Prehistoric', name: '史前期', year: '-5000+', description: '历史记载之前的神秘时代' },
];

export const WRECK_PARTS: { id: WreckPart; name: string; icon: string; description: string }[] = [
  { id: 'Hull', name: '主装甲板', icon: '🛡️', description: '舰船主体结构的装甲部分' },
  { id: 'Engine', name: '推进引擎', icon: '🚀', description: '亚光速或超光速推进装置' },
  { id: 'Weapon', name: '武器模块', icon: '💥', description: '各类主副武器系统' },
  { id: 'Shield', name: '护盾发生器', icon: '🔵', description: '能量护盾发生装置' },
  { id: 'Core', name: '动力核心', icon: '⚡', description: '舰船能源供应核心' },
  { id: 'Scanner', name: '传感阵列', icon: '📡', description: '远程扫描与侦测系统' },
  { id: 'Comm', name: '通讯模块', icon: '📻', description: '跨星系通讯设备' },
  { id: 'LifeSupport', name: '生命维持', icon: '💚', description: '船员生存环境维持系统' },
];

export const ANOMALY_TRAITS: AnomalyTrait[] = [
  { id: 'overheat_control', name: '温控残余', category: 'buff', description: '过热控制回路仍在运作', conflictTags: ['overheat_risk'], powerLevel: 2 },
  { id: 'overheat_risk', name: '冷却失效', category: 'debuff', description: '冷却系统严重老化', conflictTags: ['overheat_control'], powerLevel: -2 },
  { id: 'scan_amplify', name: '共振扫描', category: 'buff', description: '扫描波段产生共振放大', conflictTags: [], powerLevel: 2 },
  { id: 'shield_breach', name: '护盾穿透', category: 'buff', description: '对护盾有额外伤害效应', conflictTags: [], powerLevel: 3 },
  { id: 'repair_inhibit', name: '纳米干扰', category: 'buff', description: '释放抑制敌方修复的纳米粒子', conflictTags: ['repair_boost'], powerLevel: 2 },
  { id: 'repair_boost', name: '自愈纳米', category: 'buff', description: '残存的自愈纳米机器人', conflictTags: ['repair_inhibit'], powerLevel: 2 },
  { id: 'energy_leak', name: '能量泄漏', category: 'debuff', description: '能量管道存在微泄漏', conflictTags: ['energy_boost'], powerLevel: -1 },
  { id: 'energy_boost', name: '暗能残响', category: 'buff', description: '暗能量物质产生的残余回响', conflictTags: ['energy_leak'], powerLevel: 2 },
  { id: 'crit_cascade', name: '暴击谐振', category: 'buff', description: '暴击时产生能源回馈', conflictTags: [], powerLevel: 2 },
  { id: 'shield_reflect', name: '反射镀层', category: 'buff', description: '特殊镀层可反射部分伤害', conflictTags: [], powerLevel: 2 },
  { id: 'engine_overdrive', name: '引擎超频', category: 'buff', description: '引擎可安全超频运转', conflictTags: ['engine_damaged'], powerLevel: 3 },
  { id: 'engine_damaged', name: '引擎老化', category: 'debuff', description: '引擎部件严重磨损', conflictTags: ['engine_overdrive'], powerLevel: -2 },
  { id: 'armor_pierce', name: '等离子破甲', category: 'buff', description: '高温等离子可穿透装甲', conflictTags: [], powerLevel: 2 },
  { id: 'ancient_blessing', name: '远古祝福', category: 'unique', description: '远古文明的未知技术', conflictTags: [], powerLevel: 5 },
  { id: 'chaos_corruption', name: '混沌侵蚀', category: 'debuff', description: '时空裂缝造成的混沌污染', conflictTags: ['ancient_blessing'], powerLevel: -3 },
  { id: 'precognition', name: '预知回路', category: 'unique', description: '短暂预知敌方行动', conflictTags: [], powerLevel: 4 },
  { id: 'quantum_stabilize', name: '量子稳定', category: 'buff', description: '量子场稳定了武器输出', conflictTags: [], powerLevel: 2 },
  { id: 'void_residue', name: '虚空残留', category: 'neutral', description: '来自虚空的未知能量残留', conflictTags: [], powerLevel: 0 },
];

export const RELIC_RULE_MODIFIERS: RelicRuleModifier[] = [
  {
    id: 'first_overheat_safe',
    name: '温控遗物',
    description: '每次战斗首次过热不会损坏舱室',
    requiredTags: ['overheat_control'],
    requiredParts: ['Engine', 'Core'],
  },
  {
    id: 'scan_shield_break',
    name: '破盾扫描仪',
    description: '扫描附带破盾效果，额外削减敌方护盾',
    requiredTags: ['scan_amplify', 'shield_breach'],
    requiredParts: ['Scanner', 'Weapon'],
  },
  {
    id: 'enemy_repair_half',
    name: '修复抑制矩阵',
    description: '敌方修复效果减半',
    requiredTags: ['repair_inhibit'],
    requiredFaction: 'Pirate',
  },
  {
    id: 'turn_start_extra_energy',
    name: '暗能核心',
    description: '回合开始额外生成 +2 能量',
    requiredTags: ['energy_boost'],
    requiredEra: 'Prehistoric',
  },
  {
    id: 'crit_heal',
    name: '谐振回授器',
    description: '暴击时恢复 15% 伤害量的 HP',
    requiredTags: ['crit_cascade', 'repair_boost'],
    requiredParts: ['Weapon', 'LifeSupport'],
  },
  {
    id: 'shield_damage_reflect',
    name: '反射护盾',
    description: '护盾吸收伤害时反弹 20% 给敌方',
    requiredTags: ['shield_reflect'],
    requiredParts: ['Shield', 'Hull'],
  },
  {
    id: 'engine_overcharge',
    name: '超频驱动器',
    description: '引擎舱效果额外增强 50%',
    requiredTags: ['engine_overdrive'],
    requiredParts: ['Engine'],
  },
  {
    id: 'weapon_pierce',
    name: '等离子穿透器',
    description: '武器伤害 25% 无视护甲',
    requiredTags: ['armor_pierce', 'quantum_stabilize'],
    requiredParts: ['Weapon'],
    requiredEra: 'War',
  },
];

export const DEFAULT_RULE_MODIFIERS: BattleRuleModifiers = {
  firstOverheatSafe: false,
  scanShieldBreak: false,
  enemyRepairHalf: false,
  turnStartExtraEnergy: 0,
  critHealPercent: 0,
  shieldReflectPercent: 0,
  engineOvercharge: false,
  weaponPiercePercent: 0,
};

export function getModifierDisplay(modifierId: RelicRuleModifierId): { name: string; description: string } {
  const mod = RELIC_RULE_MODIFIERS.find(m => m.id === modifierId);
  return mod 
    ? { name: mod.name, description: mod.description }
    : { name: '未知效果', description: '该遗物效果尚未解析' };
}
