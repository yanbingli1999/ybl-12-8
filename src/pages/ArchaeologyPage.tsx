import React, { useState, useMemo } from 'react';
import { 
  Package, Cog, FlaskConical, Sparkles, Trash2, 
  Wrench, AlertTriangle, CheckCircle, XCircle, 
  ChevronDown, ChevronUp, Zap, Shield, Target
} from 'lucide-react';
import { useWreckStore } from '../store/useWreckStore';
import type { WreckFragment, AssembledRelic, RelicRuleModifierId } from '../types';
import { getFactionInfo, getEraInfo, getPartInfo, checkRelicAssembly } from '../utils/wreckUtils';
import { RELIC_RULE_MODIFIERS, getModifierDisplay } from '../data/wreckData';
import { Modal } from '../components/UI/Modal';

type TabType = 'fragments' | 'assembly' | 'relics';

const FragmentCard: React.FC<{
  fragment: WreckFragment;
  selected?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}> = ({ fragment, selected, onClick, onDelete, compact }) => {
  const faction = getFactionInfo(fragment.faction);
  const era = getEraInfo(fragment.era);
  const part = getPartInfo(fragment.part);
  
  const corrosionColor = fragment.corrosion < 25 
    ? 'text-neon-green' 
    : fragment.corrosion < 50 
    ? 'text-neon-yellow' 
    : fragment.corrosion < 75 
    ? 'text-orange-400' 
    : 'text-neon-red';

  return (
    <div 
      onClick={onClick}
      className={`
        relative glass-panel rounded-xl p-4 cursor-pointer transition-all duration-200
        ${selected 
          ? 'neon-border bg-neon-blue/10 scale-[1.02]' 
          : 'border border-space-600 hover:border-space-500 hover:bg-space-800/50'}
        ${compact ? 'p-3' : ''}
      `}
    >
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 p-1 rounded-lg bg-space-800/80 text-gray-400 hover:text-neon-red hover:bg-neon-red/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div 
          className="text-3xl"
          style={{ filter: `drop-shadow(0 0 6px ${faction.color})` }}
        >
          {part.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="px-2 py-0.5 rounded text-xs font-bold"
              style={{ backgroundColor: `${faction.color}20`, color: faction.color }}
            >
              {faction.icon} {faction.name}
            </span>
          </div>
          <div className="font-display font-bold text-white truncate">
            {part.name}
          </div>
          <div className="text-xs text-gray-500">
            {era.name} · {era.year}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-400">腐蚀度</span>
          <span className={`font-bold ${corrosionColor}`}>
            {fragment.corrosion.toFixed(1)}%
          </span>
        </div>
        <div className="h-1.5 bg-space-700 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${fragment.corrosion}%`,
              backgroundColor: fragment.corrosion < 25 
                ? '#10b981' 
                : fragment.corrosion < 50 
                ? '#f59e0b' 
                : fragment.corrosion < 75 
                ? '#f97316' 
                : '#ef4444'
            }}
          />
        </div>
      </div>

      {fragment.traits.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-gray-500 mb-1">异常词条</div>
          {fragment.traits.map(trait => (
            <div 
              key={trait.id}
              className={`
                px-2 py-1 rounded text-xs
                ${trait.category === 'buff' ? 'bg-neon-green/10 text-neon-green border border-neon-green/30' : ''}
                ${trait.category === 'debuff' ? 'bg-neon-red/10 text-neon-red border border-neon-red/30' : ''}
                ${trait.category === 'neutral' ? 'bg-gray-500/10 text-gray-400 border border-gray-500/30' : ''}
                ${trait.category === 'unique' ? 'bg-neon-purple/10 text-neon-purple border border-neon-purple/30' : ''}
              `}
            >
              <span className="font-bold">{trait.name}</span>
              {!compact && (
                <span className="opacity-70 ml-1">· {trait.description}</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-space-700 flex items-center justify-between text-xs">
        <span className="text-gray-500">难度 {fragment.fromDifficulty}</span>
        <span className="text-gray-500">
          {new Date(fragment.discoveredAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

const RelicCard: React.FC<{
  relic: AssembledRelic;
  isActive: boolean;
  onToggle: () => void;
  onDisassemble: () => void;
}> = ({ relic, isActive, onToggle, onDisassemble }) => {
  const [expanded, setExpanded] = useState(false);
  const modifierDisplay = getModifierDisplay(relic.ruleModifier);
  
  const efficiency = Math.max(30, 100 - relic.corrosionPenalty);
  const efficiencyColor = efficiency >= 80 
    ? 'text-neon-green' 
    : efficiency >= 60 
    ? 'text-neon-yellow' 
    : efficiency >= 40 
    ? 'text-orange-400' 
    : 'text-neon-red';

  return (
    <div className={`
      glass-panel rounded-xl overflow-hidden transition-all duration-200
      ${isActive 
        ? 'neon-border bg-neon-purple/10' 
        : 'border border-space-600 bg-space-800/30'}
    `}>
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center text-2xl
              ${isActive ? 'bg-neon-purple/30' : 'bg-space-700'}
            `}>
              <Sparkles className={isActive ? 'text-neon-purple' : 'text-gray-400'} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white">
                  {relic.name}
                </h3>
                {isActive && (
                  <span className="px-2 py-0.5 rounded bg-neon-purple/20 text-neon-purple text-xs font-bold animate-pulse">
                    激活中
                  </span>
                )}
              </div>
              <div className="text-sm text-neon-blue font-medium">
                {modifierDisplay.name}
              </div>
              <p className="text-xs text-gray-400 mt-1 max-w-md">
                {modifierDisplay.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {expanded 
              ? <ChevronUp className="w-5 h-5 text-gray-400" />
              : <ChevronDown className="w-5 h-5 text-gray-400" />
            }
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="bg-space-900/50 rounded-lg p-2">
            <div className="text-xs text-gray-500">威力</div>
            <div className="text-xl font-display font-bold text-neon-yellow">
              {relic.power}
            </div>
          </div>
          <div className="bg-space-900/50 rounded-lg p-2">
            <div className="text-xs text-gray-500">腐蚀惩罚</div>
            <div className="text-xl font-display font-bold text-neon-red">
              {relic.corrosionPenalty}%
            </div>
          </div>
          <div className="bg-space-900/50 rounded-lg p-2">
            <div className="text-xs text-gray-500">效率</div>
            <div className={`text-xl font-display font-bold ${efficiencyColor}`}>
              {efficiency}%
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-space-700 pt-4">
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">组成碎片（{relic.fragments.length}个）</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {relic.fragments.map((frag, idx) => {
                const faction = getFactionInfo(frag.faction);
                const part = getPartInfo(frag.part);
                return (
                  <div 
                    key={idx}
                    className="bg-space-900/50 rounded-lg p-2 border border-space-700"
                  >
                    <div className="text-lg mb-1">{part.icon}</div>
                    <div 
                      className="text-xs font-bold truncate"
                      style={{ color: faction.color }}
                    >
                      {part.name}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      腐蚀 {frag.corrosion.toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className={`
                flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors
                ${isActive 
                  ? 'bg-space-700 text-gray-300 hover:bg-space-600' 
                  : 'bg-neon-purple/20 text-neon-purple hover:bg-neon-purple/30 border border-neon-purple/50'}
              `}
            >
              <Zap className="w-4 h-4" />
              {isActive ? '取消激活' : '激活遗物'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('确定要拆解这个遗物吗？碎片会被回收（腐蚀度+15%）')) {
                  onDisassemble();
                }
              }}
              className="px-4 py-2 rounded-lg bg-space-700 text-gray-300 hover:bg-neon-red/20 hover:text-neon-red border border-space-600 hover:border-neon-red/50 transition-colors"
            >
              <Wrench className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AssemblyResultPanel: React.FC<{
  selectedIds: string[];
  fragments: WreckFragment[];
  onAssemble: (modifierId: RelicRuleModifierId) => void;
}> = ({ selectedIds, fragments, onAssemble }) => {
  const selectedFragments = fragments.filter(f => selectedIds.includes(f.id));
  const result = useMemo(() => checkRelicAssembly(selectedFragments), [selectedFragments]);

  const modifierInfo = result.possibleModifierId 
    ? RELIC_RULE_MODIFIERS.find(m => m.id === result.possibleModifierId)
    : null;

  return (
    <div className="glass-panel neon-border rounded-xl p-5">
      <h3 className="font-display font-bold text-lg text-neon-blue mb-4 flex items-center gap-2">
        <FlaskConical className="w-5 h-5" />
        拼接工作台
      </h3>

      {selectedFragments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-30">🧩</div>
          <p className="text-gray-400">从左侧选择 2-4 个碎片进行拼接</p>
          <p className="text-gray-600 text-sm mt-2">
            相同阵营、年代、部位的碎片更容易拼出遗物
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">
              已选择 {selectedFragments.length} 个碎片
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {selectedFragments.map(frag => (
                <FragmentCard 
                  key={frag.id} 
                  fragment={frag} 
                  compact 
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {result.conflicts.length > 0 && (
              <div className="bg-neon-red/10 border border-neon-red/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-neon-red font-bold mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  词条冲突！无法拼接
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  {result.conflicts.map((conflict, idx) => (
                    <li key={idx}>⚠️ {conflict.reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.missingRequirements.length > 0 && result.conflicts.length === 0 && (
              <div className="bg-neon-yellow/10 border border-neon-yellow/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-neon-yellow font-bold mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  配方不匹配
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  {result.missingRequirements.map((req, idx) => (
                    <li key={idx}>• {req}</li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-neon-yellow/20">
                  <div className="text-xs text-gray-400 mb-2">所有配方参考：</div>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    {RELIC_RULE_MODIFIERS.map(mod => (
                      <div key={mod.id} className="text-gray-500">
                        <span className="text-neon-blue font-bold">{mod.name}</span>
                        <span className="mx-1">:</span>
                        需要标签 [{mod.requiredTags.join(', ')}]
                        {mod.requiredFaction && <span className="text-gray-600"> · 阵营:{mod.requiredFaction}</span>}
                        {mod.requiredEra && <span className="text-gray-600"> · 年代:{mod.requiredEra}</span>}
                        {mod.requiredParts && <span className="text-gray-600"> · 部位:[{mod.requiredParts.join(',')}]</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {result.canAssemble && modifierInfo && (
              <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-neon-green font-bold mb-3">
                  <CheckCircle className="w-5 h-5" />
                  可以拼接！发现遗物配方
                </div>
                
                <div className="bg-space-900/50 rounded-lg p-4 mb-4">
                  <div className="text-2xl mb-2">✨ {modifierInfo.name}</div>
                  <p className="text-gray-300 mb-4">{modifierInfo.description}</p>
                  
                  <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <div>
                      <div className="text-gray-500 text-xs">总腐蚀度</div>
                      <div className="font-display font-bold text-neon-red">
                        {result.totalCorrosion.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">腐蚀惩罚</div>
                      <div className="font-display font-bold text-orange-400">
                        {result.corrosionPenalty}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">预计效率</div>
                      <div className="font-display font-bold text-neon-green">
                        {Math.max(30, 100 - result.corrosionPenalty)}%
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onAssemble(modifierInfo.id)}
                  className="w-full btn-success flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  拼接遗物
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export const ArchaeologyPage: React.FC = () => {
  const { 
    wreckData, 
    loadWreckData, 
    deleteFragment, 
    assembleRelicFromFragments,
    disassembleRelic,
    toggleActiveRelic,
    clearLastFragments,
  } = useWreckStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('fragments');
  const [selectedFragmentIds, setSelectedFragmentIds] = useState<string[]>([]);
  const [showNewFragmentsModal, setShowNewFragmentsModal] = useState(false);
  const [factionFilter, setFactionFilter] = useState<string>('all');
  const [eraFilter, setEraFilter] = useState<string>('all');
  const [partFilter, setPartFilter] = useState<string>('all');
  const [assembleResultModal, setAssembleResultModal] = useState<{
    show: boolean;
    relic: AssembledRelic | null;
  }>({ show: false, relic: null });

  React.useEffect(() => {
    loadWreckData();
  }, []);

  React.useEffect(() => {
    if (wreckData.relics.length > 0 || wreckData.fragments.length > 0) {
      loadWreckData();
    }
  }, [wreckData.relics.length, wreckData.fragments.length]);

  React.useEffect(() => {
    if (useWreckStore.getState().lastFragments.length > 0) {
      setShowNewFragmentsModal(true);
    }
  }, [useWreckStore.getState().lastFragments.length]);

  const filteredFragments = useMemo(() => {
    return wreckData.fragments.filter(f => {
      if (factionFilter !== 'all' && f.faction !== factionFilter) return false;
      if (eraFilter !== 'all' && f.era !== eraFilter) return false;
      if (partFilter !== 'all' && f.part !== partFilter) return false;
      return true;
    });
  }, [wreckData.fragments, factionFilter, eraFilter, partFilter]);

  const toggleFragmentSelection = (id: string) => {
    setSelectedFragmentIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(fid => fid !== id);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const handleAssemble = (modifierId: RelicRuleModifierId) => {
    const relic = assembleRelicFromFragments(selectedFragmentIds, modifierId);
    if (relic) {
      setSelectedFragmentIds([]);
      setAssembleResultModal({ show: true, relic });
    }
  };

  const handleCloseNewFragmentsModal = () => {
    setShowNewFragmentsModal(false);
    clearLastFragments();
  };

  const newFragments = useWreckStore.getState().lastFragments;

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
    { id: 'fragments', label: '碎片库', icon: Package, count: wreckData.fragments.length },
    { id: 'assembly', label: '拼接台', icon: Cog, count: selectedFragmentIds.length },
    { id: 'relics', label: '遗物仓', icon: FlaskConical, count: wreckData.relics.length },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-panel neon-border rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-neon-purple" />
              星舰残骸考古实验室
            </h2>
            <p className="text-gray-400 mt-1 text-sm">
              从战场回收残骸，拼接神秘遗物，改变战斗规则
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="px-4 py-2 rounded-lg bg-space-900/50 border border-space-700">
              <span className="text-gray-500">激活槽位</span>
              <span className="ml-2 font-display font-bold text-neon-purple text-lg">
                {wreckData.activeRelicIds.length}/{wreckData.maxActiveRelics}
              </span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-space-900/50 border border-space-700">
              <span className="text-gray-500">碎片总数</span>
              <span className="ml-2 font-display font-bold text-neon-blue text-lg">
                {wreckData.fragments.length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-b border-space-700 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-neon-blue/20 text-neon-blue border-b-2 border-neon-blue' 
                  : 'text-gray-400 hover:text-white hover:bg-space-800'}
              `}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-bold
                  ${activeTab === tab.id 
                    ? 'bg-neon-blue text-space-900' 
                    : 'bg-space-700 text-gray-400'}
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'fragments' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-xl p-4 border border-space-600">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">阵营筛选</label>
                <select 
                  value={factionFilter}
                  onChange={e => setFactionFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-space-800 border border-space-600 text-white text-sm focus:outline-none focus:border-neon-blue"
                >
                  <option value="all">所有阵营</option>
                  {['Federation', 'Empire', 'Pirate', 'Ancient', 'Unknown'].map(f => (
                    <option key={f} value={f}>
                      {getFactionInfo(f as any).name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">年代筛选</label>
                <select 
                  value={eraFilter}
                  onChange={e => setEraFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-space-800 border border-space-600 text-white text-sm focus:outline-none focus:border-neon-blue"
                >
                  <option value="all">所有年代</option>
                  {['GoldenAge', 'Expansion', 'War', 'Collapse', 'Prehistoric'].map(e => (
                    <option key={e} value={e}>
                      {getEraInfo(e as any).name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">部位筛选</label>
                <select 
                  value={partFilter}
                  onChange={e => setPartFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-space-800 border border-space-600 text-white text-sm focus:outline-none focus:border-neon-blue"
                >
                  <option value="all">所有部位</option>
                  {['Hull', 'Engine', 'Weapon', 'Shield', 'Core', 'Scanner', 'Comm', 'LifeSupport'].map(p => (
                    <option key={p} value={p}>
                      {getPartInfo(p as any).name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {filteredFragments.length === 0 ? (
            <div className="glass-panel rounded-xl p-12 text-center border border-space-600">
              <div className="text-7xl mb-4 opacity-30">🚀</div>
              <h3 className="text-xl font-display font-bold text-gray-400 mb-2">
                还没有残骸碎片
              </h3>
              <p className="text-gray-500">
                在战斗中取得胜利即可获得残骸碎片奖励
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFragments.map(fragment => (
                <FragmentCard
                  key={fragment.id}
                  fragment={fragment}
                  selected={selectedFragmentIds.includes(fragment.id)}
                  onClick={() => {
                    if (activeTab === 'fragments') {
                      toggleFragmentSelection(fragment.id);
                      if (selectedFragmentIds.length >= 1) {
                        setActiveTab('assembly');
                      }
                    }
                  }}
                  onDelete={() => {
                    if (confirm('确定要销毁这个碎片吗？')) {
                      deleteFragment(fragment.id);
                    }
                  }}
                />
              ))}
            </div>
          )}

          {selectedFragmentIds.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
              <button
                onClick={() => setActiveTab('assembly')}
                className="btn-primary flex items-center gap-2 px-6 py-3 shadow-2xl shadow-neon-blue/30"
              >
                <Cog className="w-5 h-5" />
                前往拼接台（已选 {selectedFragmentIds.length} 个碎片）
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'assembly' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-neon-blue" />
                选择碎片
                <span className="text-sm font-normal text-gray-400">
                  （{selectedFragmentIds.length}/4）
                </span>
              </h3>
              {selectedFragmentIds.length > 0 && (
                <button
                  onClick={() => setSelectedFragmentIds([])}
                  className="text-sm text-gray-400 hover:text-neon-red transition-colors"
                >
                  清空选择
                </button>
              )}
            </div>
            
            {wreckData.fragments.length === 0 ? (
              <div className="glass-panel rounded-xl p-8 text-center border border-space-600">
                <p className="text-gray-400">还没有碎片，去战斗中获取吧！</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2">
                {wreckData.fragments.map(fragment => (
                  <FragmentCard
                    key={fragment.id}
                    fragment={fragment}
                    selected={selectedFragmentIds.includes(fragment.id)}
                    onClick={() => toggleFragmentSelection(fragment.id)}
                    compact
                  />
                ))}
              </div>
            )}
          </div>

          <AssemblyResultPanel
            selectedIds={selectedFragmentIds}
            fragments={wreckData.fragments}
            onAssemble={handleAssemble}
          />
        </div>
      )}

      {activeTab === 'relics' && (
        <div className="space-y-4">
          {wreckData.relics.length === 0 ? (
            <div className="glass-panel rounded-xl p-12 text-center border border-space-600">
              <div className="text-7xl mb-4 opacity-30">✨</div>
              <h3 className="text-xl font-display font-bold text-gray-400 mb-2">
                还没有拼接任何遗物
              </h3>
              <p className="text-gray-500 mb-4">
                前往拼接台，用碎片组合出强大的遗物
              </p>
              <button
                onClick={() => setActiveTab('assembly')}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Cog className="w-5 h-5" />
                去拼接
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wreckData.relics.map(relic => (
                  <RelicCard
                    key={relic.id}
                    relic={relic}
                    isActive={wreckData.activeRelicIds.includes(relic.id)}
                    onToggle={() => toggleActiveRelic(relic.id)}
                    onDisassemble={() => disassembleRelic(relic.id)}
                  />
                ))}
              </div>

              {wreckData.activeRelicIds.length > 0 && (
                <div className="glass-panel neon-border rounded-xl p-5">
                  <h3 className="font-display font-bold text-lg text-neon-purple mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    当前激活效果
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {wreckData.activeRelicIds.map(id => {
                      const relic = wreckData.relics.find(r => r.id === id);
                      if (!relic) return null;
                      const modDisplay = getModifierDisplay(relic.ruleModifier);
                      const efficiency = Math.max(30, 100 - relic.corrosionPenalty);
                      return (
                        <div 
                          key={id}
                          className="bg-space-900/50 rounded-lg p-3 border border-neon-purple/30"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-neon-purple" />
                            <span className="font-bold text-white text-sm">
                              {relic.name}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mb-2">
                            {modDisplay.description}
                          </div>
                          <div className="text-xs text-neon-green">
                            效率: {efficiency}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <Modal
        isOpen={showNewFragmentsModal}
        onClose={handleCloseNewFragmentsModal}
        title="🎉 残骸回收成功！"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            在这次战斗中，你的回收队成功采集到了 {newFragments.length} 个残骸碎片：
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {newFragments.map(fragment => (
              <FragmentCard key={fragment.id} fragment={fragment} />
            ))}
          </div>
          <div className="pt-4 border-t border-space-700">
            <button
              onClick={handleCloseNewFragmentsModal}
              className="w-full btn-primary"
            >
              太棒了！前往考古实验室
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={assembleResultModal.show && assembleResultModal.relic !== null}
        onClose={() => setAssembleResultModal({ show: false, relic: null })}
        title="✨ 遗物拼接成功！"
        maxWidth="max-w-lg"
      >
        {assembleResultModal.relic && (
          <div className="space-y-4 text-center">
            <div className="text-8xl mb-4 animate-float">
              ✨
            </div>
            <div>
              <h3 className="text-3xl font-display font-bold text-neon-purple mb-2">
                {assembleResultModal.relic.name}
              </h3>
              <p className="text-neon-blue text-lg">
                {getModifierDisplay(assembleResultModal.relic.ruleModifier).name}
              </p>
            </div>
            <p className="text-gray-300">
              {getModifierDisplay(assembleResultModal.relic.ruleModifier).description}
            </p>
            <div className="grid grid-cols-3 gap-3 py-4">
              <div className="bg-space-900/50 rounded-lg p-3">
                <div className="text-xs text-gray-500">威力</div>
                <div className="text-2xl font-display font-bold text-neon-yellow">
                  {assembleResultModal.relic.power}
                </div>
              </div>
              <div className="bg-space-900/50 rounded-lg p-3">
                <div className="text-xs text-gray-500">碎片</div>
                <div className="text-2xl font-display font-bold text-neon-blue">
                  {assembleResultModal.relic.fragments.length}
                </div>
              </div>
              <div className="bg-space-900/50 rounded-lg p-3">
                <div className="text-xs text-gray-500">效率</div>
                <div className="text-2xl font-display font-bold text-neon-green">
                  {Math.max(30, 100 - assembleResultModal.relic.corrosionPenalty)}%
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setAssembleResultModal({ show: false, relic: null })}
                className="flex-1 px-4 py-3 bg-space-700 border border-space-600 rounded-lg text-white hover:bg-space-600 transition-colors"
              >
                继续拼接
              </button>
              <button
                onClick={() => {
                  toggleActiveRelic(assembleResultModal.relic!.id);
                  setAssembleResultModal({ show: false, relic: null });
                  setActiveTab('relics');
                }}
                className="flex-1 btn-primary"
              >
                立即激活
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
