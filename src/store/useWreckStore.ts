import { create } from 'zustand';
import type { WreckFragment, AssembledRelic, WreckSaveData, RelicRuleModifierId, BattleRuleModifiers } from '../types';
import {
  loadWreckData, saveWreckData, addWreckFragments,
  removeWreckFragments, addRelic, removeRelic, setActiveRelics
} from '../utils/storage';
import { createDefaultWreckSaveData, checkRelicAssembly, assembleRelic, computeActiveModifiers, generateVictoryFragments } from '../utils/wreckUtils';

interface WreckState {
  wreckData: WreckSaveData;
  activeModifiers: BattleRuleModifiers;
  lastFragments: WreckFragment[];
  
  loadWreckData: () => void;
  addFragments: (fragments: WreckFragment[]) => void;
  addVictoryFragments: (difficulty: number, turns: number) => WreckFragment[];
  deleteFragment: (fragmentId: string) => void;
  assembleRelicFromFragments: (fragmentIds: string[], modifierId: RelicRuleModifierId) => AssembledRelic | null;
  disassembleRelic: (relicId: string) => void;
  toggleActiveRelic: (relicId: string) => void;
  setMaxActiveRelics: (max: number) => void;
  computeModifiers: () => void;
  clearLastFragments: () => void;
  resetWreckData: () => void;
}

export const useWreckStore = create<WreckState>((set, get) => ({
  wreckData: createDefaultWreckSaveData(),
  activeModifiers: {
    firstOverheatSafe: false,
    scanShieldBreak: false,
    enemyRepairHalf: false,
    turnStartExtraEnergy: 0,
    critHealPercent: 0,
    shieldReflectPercent: 0,
    engineOvercharge: false,
    weaponPiercePercent: 0,
  },
  lastFragments: [],

  loadWreckData: () => {
    const data = loadWreckData();
    set({ wreckData: data });
    get().computeModifiers();
  },

  addFragments: (fragments) => {
    addWreckFragments(fragments);
    set({ 
      wreckData: { 
        ...get().wreckData, 
        fragments: [...get().wreckData.fragments, ...fragments] 
      },
      lastFragments: fragments,
    });
  },

  addVictoryFragments: (difficulty, turns) => {
    const fragments = generateVictoryFragments(difficulty, turns);
    get().addFragments(fragments);
    return fragments;
  },

  deleteFragment: (fragmentId) => {
    removeWreckFragments([fragmentId]);
    set({
      wreckData: {
        ...get().wreckData,
        fragments: get().wreckData.fragments.filter(f => f.id !== fragmentId),
      },
    });
  },

  assembleRelicFromFragments: (fragmentIds, modifierId) => {
    const fragments = get().wreckData.fragments.filter(f => fragmentIds.includes(f.id));
    const checkResult = checkRelicAssembly(fragments);
    
    if (!checkResult.canAssemble || checkResult.possibleModifierId !== modifierId) {
      return null;
    }

    const relic = assembleRelic(fragments, modifierId);
    addRelic(relic);
    removeWreckFragments(fragmentIds);
    
    set({
      wreckData: {
        ...get().wreckData,
        fragments: get().wreckData.fragments.filter(f => !fragmentIds.includes(f.id)),
        relics: [...get().wreckData.relics, relic],
      },
    });
    
    get().computeModifiers();
    return relic;
  },

  disassembleRelic: (relicId) => {
    const relic = get().wreckData.relics.find(r => r.id === relicId);
    if (!relic) return;

    const returnedFragments = relic.fragments.map(f => ({
      ...f,
      corrosion: Math.min(95, f.corrosion + 15),
    }));

    removeRelic(relicId);
    addWreckFragments(returnedFragments);

    set({
      wreckData: {
        ...get().wreckData,
        fragments: [...get().wreckData.fragments, ...returnedFragments],
        relics: get().wreckData.relics.filter(r => r.id !== relicId),
        activeRelicIds: get().wreckData.activeRelicIds.filter(id => id !== relicId),
      },
    });
    
    get().computeModifiers();
  },

  toggleActiveRelic: (relicId) => {
    const { activeRelicIds, maxActiveRelics } = get().wreckData;
    let newActiveIds: string[];

    if (activeRelicIds.includes(relicId)) {
      newActiveIds = activeRelicIds.filter(id => id !== relicId);
    } else {
      if (activeRelicIds.length >= maxActiveRelics) {
        newActiveIds = [...activeRelicIds.slice(1), relicId];
      } else {
        newActiveIds = [...activeRelicIds, relicId];
      }
    }

    setActiveRelics(newActiveIds);
    set({
      wreckData: {
        ...get().wreckData,
        activeRelicIds: newActiveIds,
      },
    });
    
    get().computeModifiers();
  },

  setMaxActiveRelics: (max) => {
    const newMax = Math.min(6, Math.max(1, max));
    const data = {
      ...get().wreckData,
      maxActiveRelics: newMax,
      activeRelicIds: get().wreckData.activeRelicIds.slice(0, newMax),
    };
    saveWreckData(data);
    set({ wreckData: data });
    get().computeModifiers();
  },

  computeModifiers: () => {
    const { relics, activeRelicIds } = get().wreckData;
    const modifiers = computeActiveModifiers(relics, activeRelicIds);
    set({ activeModifiers: modifiers });
  },

  clearLastFragments: () => {
    set({ lastFragments: [] });
  },

  resetWreckData: () => {
    const defaults = createDefaultWreckSaveData();
    saveWreckData(defaults);
    set({ wreckData: defaults });
    get().computeModifiers();
  },
}));
