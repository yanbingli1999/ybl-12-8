export type CabinType = 'engine' | 'shield' | 'weapon' | 'repair' | 'scanner';

export interface Die {
  id: string;
  value: number;
  locked: boolean;
  assignedTo: CabinType | null;
  isRolling: boolean;
}

export interface Cabin {
  id: string;
  type: CabinType;
  name: string;
  level: number;
  damaged: boolean;
  cooldown: number;
  bonus: number;
  description: string;
  icon: string;
}

export interface Ship {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  energy: number;
  maxEnergy: number;
  attack: number;
  defense: number;
  evasion: number;
  critRate: number;
  cabins: Cabin[];
}

export type EnemyIntentType = 'attack' | 'defend' | 'charge' | 'special' | 'repair';

export interface EnemyIntent {
  type: EnemyIntentType;
  value: number;
  description: string;
  icon: string;
}

export interface EnemyAbility {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  currentCooldown: number;
  damage?: number;
  effect?: string;
}

export interface Enemy {
  id: string;
  name: string;
  type: string;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  attack: number;
  defense: number;
  evasion: number;
  intent: EnemyIntent;
  abilities: EnemyAbility[];
  description: string;
  sprite: string;
}

export type BattleLogType = 'damage' | 'heal' | 'shield' | 'effect' | 'system' | 'crit' | 'miss';

export interface BattleLogEntry {
  id: string;
  turn: number;
  type: BattleLogType;
  source: 'player' | 'enemy' | 'system';
  message: string;
  value?: number;
  timestamp: number;
  isCrit?: boolean;
}

export type BattleResult = 'ongoing' | 'victory' | 'defeat' | 'fled';
export type BattlePhase = 'player' | 'enemy' | 'ended';

export interface BattleState {
  id: string;
  turn: number;
  phase: BattlePhase;
  player: Ship;
  enemy: Enemy;
  logs: BattleLogEntry[];
  result: BattleResult;
  startTime: number;
  endTime?: number;
  rewardPoints: number;
}

export interface GameConfig {
  overheatThreshold: number;
  shieldAbsorptionRate: number;
  critMultiplier: number;
  critBonusRate: number;
  repairCooldown: number;
  energyCostPerPoint: number;
  scanEvasionReduction: number;
  engineEvasionBonus: number;
  maxRerolls: number;
  diceCount: number;
  enemyDamageVariance: number;
}

export interface Upgrade {
  id: string;
  name: string;
  type: 'hp' | 'shield' | 'attack' | 'defense' | 'evasion' | 'crit' | 'energy' | 'cabin';
  cost: number;
  costMultiplier: number;
  effect: number;
  maxLevel: number;
  currentLevel: number;
  description: string;
  cabinType?: CabinType;
}

export interface ReplayAction {
  turn: number;
  phase: 'player' | 'enemy';
  action: string;
  payload: Record<string, unknown>;
  resultingState: BattleState;
}

export interface ReplayData {
  initialState: BattleState;
  actions: ReplayAction[];
}

export interface BattleRecord {
  id: string;
  startTime: number;
  endTime: number;
  result: BattleResult;
  turns: number;
  enemyType: string;
  enemyName: string;
  playerHpRemaining: number;
  enemyHpRemaining: number;
  replayData: ReplayData;
  rewardEarned: number;
}

export interface GameStats {
  totalBattles: number;
  victories: number;
  defeats: number;
  totalTurns: number;
  totalRewardPoints: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  currentStreak: number;
  longestStreak: number;
}

export interface GameSaveData {
  ship: Ship;
  upgrades: Upgrade[];
  config: GameConfig;
  battleHistory: BattleRecord[];
  stats: GameStats;
  rewardPoints: number;
  wreckData: WreckSaveData;
}

export interface DiceFace {
  value: number;
  type: 'normal' | 'critical' | 'energy' | 'wild';
  effect?: string;
  color: string;
}

export interface AllocationResult {
  cabinType: CabinType;
  totalPoints: number;
  diceIds: string[];
  isOverheated: boolean;
}

export interface DamageResult {
  damage: number;
  shieldAbsorbed: number;
  isCrit: boolean;
  isMiss: boolean;
}

// ============ 星舰残骸考古系统 ============

export type WreckFaction = 'Federation' | 'Empire' | 'Pirate' | 'Ancient' | 'Unknown';

export type WreckEra = 'GoldenAge' | 'Expansion' | 'War' | 'Collapse' | 'Prehistoric';

export type WreckPart = 'Hull' | 'Engine' | 'Weapon' | 'Shield' | 'Core' | 'Scanner' | 'Comm' | 'LifeSupport';

export type AnomalyTraitCategory = 'buff' | 'debuff' | 'neutral' | 'unique';

export interface AnomalyTrait {
  id: string;
  name: string;
  category: AnomalyTraitCategory;
  description: string;
  conflictTags: string[];
  powerLevel: number;
}

export interface WreckFragment {
  id: string;
  faction: WreckFaction;
  era: WreckEra;
  part: WreckPart;
  corrosion: number;
  traits: AnomalyTrait[];
  discoveredAt: number;
  fromDifficulty: number;
}

export type RelicRuleModifierId = 
  | 'first_overheat_safe'
  | 'scan_shield_break'
  | 'enemy_repair_half'
  | 'turn_start_extra_energy'
  | 'crit_heal'
  | 'shield_damage_reflect'
  | 'engine_overcharge'
  | 'weapon_pierce';

export interface RelicRuleModifier {
  id: RelicRuleModifierId;
  name: string;
  description: string;
  requiredTags: string[];
  requiredFaction?: WreckFaction;
  requiredEra?: WreckEra;
  requiredParts?: WreckPart[];
}

export interface AssembledRelic {
  id: string;
  name: string;
  fragments: WreckFragment[];
  ruleModifier: RelicRuleModifierId;
  totalCorrosion: number;
  corrosionPenalty: number;
  power: number;
  assembledAt: number;
}

export interface BattleRuleModifiers {
  firstOverheatSafe: boolean;
  scanShieldBreak: boolean;
  enemyRepairHalf: boolean;
  turnStartExtraEnergy: number;
  critHealPercent: number;
  shieldReflectPercent: number;
  engineOvercharge: boolean;
  weaponPiercePercent: number;
}

export interface WreckSaveData {
  fragments: WreckFragment[];
  relics: AssembledRelic[];
  activeRelicIds: string[];
  maxActiveRelics: number;
}
