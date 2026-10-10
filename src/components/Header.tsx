import React from 'react';
import { LanguageMode } from '../types/bsf';
import {
  BookOpen,
  Calendar,
  PieChart as ChartIcon,
  HelpCircle,
  Printer,
  Edit3,
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'workbench' | 'curriculum' | 'summary' | 'guide';
  onSelectTab: (tab: 'workbench' | 'curriculum' | 'summary' | 'guide') => void;
  language: LanguageMode;
  onToggleLanguage: () => void;
  onOpenExportModal: () => void;
  completedCount: number;
  totalLessons: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  language,
  onToggleLanguage,
  onOpenExportModal,
  completedCount,
  totalLessons,
}) => {
  const isZh = language === 'zh';

  const navItems = [
    {
      id: 'workbench' as const,
      labelZh: '研经工作台',
      labelEn: 'Workbench',
      icon: Edit3,
    },
    {
      id: 'curriculum' as const,
      labelZh: '30周课表',
      labelEn: 'Schedule',
      icon: Calendar,
      badge: `${completedCount}/${totalLessons}`,
    },
    {
      id: 'summary' as const,
      labelZh: '大纲概览',
      labelEn: 'Progress',
      icon: ChartIcon,
    },
    {
      id: 'guide' as const,
      labelZh: '研经指引',
      labelEn: 'Guide',
      icon: HelpCircle,
    },
  ];

  return (
    <>
      {/* Top Header Bar for Desktop & Mobile */}
      <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onSelectTab('workbench')}
              className="flex items-center gap-2 sm:gap-2.5 text-left focus:outline-none"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-stone-900 text-amber-50 flex items-center justify-center font-serif font-bold text-xs sm:text-sm shadow-sm shrink-0">
                罗
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-serif font-bold tracking-tight text-stone-900 text-sm sm:text-base md:text-lg whitespace-nowrap truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none">
                  {isZh ? 'BSF 罗马书研经' : 'BSF Romans'}
                </span>
                <span className="text-[9px] sm:text-[10px] text-stone-500 tracking-wider uppercase font-sans truncate">
                  {isZh ? '2026-2027 中文DOLM' : '2026-2027 Chinese DOLM'}
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium text-stone-600">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`whitespace-nowrap transition-colors pb-1 border-b-2 flex items-center gap-1 ${
                  currentTab === item.id
                    ? 'text-stone-900 border-stone-900 font-semibold'
                    : 'border-transparent hover:text-stone-900'
                }`}
              >
                <span>{isZh ? item.labelZh : item.labelEn}</span>
                {item.badge && (
                  <span className="text-xs text-stone-400 font-mono">
                    ({item.badge})
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Right Actions: Language Switch + Export Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Switch Button */}
            <button
              onClick={onToggleLanguage}
              title={isZh ? '切换为英文模式' : 'Switch to Chinese mode'}
              className="flex items-center text-xs font-medium border border-stone-300 rounded-lg bg-white overflow-hidden shadow-2xs hover:border-stone-400 transition-colors"
            >
              <span
                className={`px-2 sm:px-2.5 py-1 sm:py-1.5 transition-colors text-[11px] sm:text-xs ${
                  isZh ? 'bg-stone-900 text-white font-semibold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                中
              </span>
              <span
                className={`px-2 sm:px-2.5 py-1 sm:py-1.5 transition-colors text-[11px] sm:text-xs ${
                  !isZh ? 'bg-stone-900 text-white font-semibold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                EN
              </span>
            </button>

            {/* Primary Action Button (Print / Export) */}
            <button
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors shadow-xs whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{isZh ? '导出/打印' : 'Export'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (App-like native tab bar on phone screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 py-1.5 px-2 shadow-lg safe-area-pb">
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors text-center ${
                  isActive
                    ? 'text-stone-950 font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-stone-900 stroke-[2.2]' : 'text-stone-500'
                    }`}
                  />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 text-[9px] font-mono font-bold bg-stone-900 text-white rounded-full px-1 min-w-[14px] text-center leading-tight">
                      {completedCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-0.5 tracking-tight ${
                    isActive ? 'text-stone-950 font-bold' : 'text-stone-500'
                  }`}
                >
                  {isZh ? item.labelZh : item.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
