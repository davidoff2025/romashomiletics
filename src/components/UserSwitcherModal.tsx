import React, { useState } from 'react';
import { LanguageMode } from '../types/bsf';
import {
  getUserList,
  getUserStats,
  deleteUserProfile,
} from '../utils/storage';
import {
  User,
  Users,
  Check,
  X,
  Plus,
  Trash2,
  BookOpen,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface UserSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string;
  onSwitchUser: (userName: string) => void;
  language: LanguageMode;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
  language,
}) => {
  const isZh = language === 'zh';
  const [inputName, setInputName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const userList = getUserList();

  const handleSelectOrAdd = (nameToSelect: string) => {
    const trimmed = nameToSelect.trim();
    if (!trimmed) {
      setErrorMessage(isZh ? '请输入学员姓名' : 'Please enter a learner name');
      return;
    }
    setErrorMessage('');
    onSwitchUser(trimmed);
    setInputName('');
    onClose();
  };

  const handleDelete = (nameToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (userList.length <= 1) {
      alert(isZh ? '至少保留一个学员档案' : 'At least one profile must be retained');
      return;
    }
    const confirmText = isZh
      ? `确定要删除学员【${nameToDelete}】的所有研经作业记录吗？此操作无法恢复。`
      : `Delete all homiletics records for learner "${nameToDelete}"? This cannot be undone.`;

    if (window.confirm(confirmText)) {
      const newActive = deleteUserProfile(nameToDelete);
      if (currentUser.toLowerCase() === nameToDelete.toLowerCase()) {
        onSwitchUser(newActive);
      } else {
        // Trigger re-render by calling switch on current
        onSwitchUser(currentUser);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-100 flex items-center justify-center shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-base sm:text-lg">
                {isZh ? '切换与管理研经学员' : 'Switch Learner Profile'}
              </h3>
              <p className="text-xs text-stone-500 font-sans">
                {isZh
                  ? '各学员独立保存30周研经作业与完成进度'
                  : 'Independent 30-week progress tracked per learner'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Input section: Add or Quick Enter */}
          <div className="bg-stone-50 border border-stone-200/90 rounded-xl p-3.5 space-y-2.5">
            <label className="block text-xs font-semibold text-stone-700">
              {isZh ? '输入学员姓名（如 Devin Wang）' : 'Enter learner name (e.g. Devin Wang)'}
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSelectOrAdd(inputName);
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => {
                    setInputName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={isZh ? '输入姓名即可切换或新建...' : 'Type name to enter or create...'}
                  className="w-full text-sm px-3 py-2 pl-9 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 font-sans"
                  autoFocus
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>{isZh ? '进入/切换' : 'Switch'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
            {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
          </div>

          {/* Existing Learners List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-600 px-1">
              <span>{isZh ? '已记录的学员档案' : 'Saved Learner Profiles'}</span>
              <span className="text-stone-400 font-normal">
                {userList.length} {isZh ? '位学员' : 'profiles'}
              </span>
            </div>

            <div className="space-y-2">
              {userList.map((user) => {
                const isActive = user.toLowerCase() === currentUser.toLowerCase();
                const stats = getUserStats(user);
                const initial = user.slice(0, 2).toUpperCase();

                return (
                  <div
                    key={user}
                    onClick={() => handleSelectOrAdd(user)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-amber-50/50 border-stone-900 ring-1 ring-stone-900 shadow-2xs'
                        : 'bg-white border-stone-200 hover:border-stone-400 hover:bg-stone-50/80 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isActive
                            ? 'bg-stone-900 text-amber-100'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-stone-900 truncate">
                            {user}
                          </span>
                          {isActive && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-900 text-white font-medium">
                              {isZh ? '当前使用' : 'Active'}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5 font-sans">
                          <span>
                            {isZh ? '已完成' : 'Completed'} {stats.completedCount}/{stats.totalLessons}{' '}
                            {isZh ? '课' : 'lessons'}
                          </span>
                          {stats.startedCount > stats.completedCount && (
                            <span className="text-stone-400">
                              • {isZh ? '研习中' : 'In progress'}{' '}
                              {stats.startedCount - stats.completedCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isActive ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectOrAdd(user);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
                        >
                          {isZh ? '切换' : 'Select'}
                        </button>
                      )}

                      {userList.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(user, e)}
                          title={isZh ? '删除该学员作业记录' : 'Delete this profile'}
                          className="p-1.5 text-stone-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation Card */}
          <div className="bg-stone-50 border border-stone-200/70 rounded-xl p-3 text-xs text-stone-600 space-y-1.5 font-sans">
            <div className="flex items-center gap-1.5 font-semibold text-stone-800">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{isZh ? '多学员独立进度保障' : 'Independent Learner Isolation'}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-600">
              {isZh
                ? '系统完全按输入的姓名自动隔离作业数据。不同学员（如 Devin Wang 与其他同工）登录后，各自的 30 周分段大纲、主题句、主旨、生活应用以及完成打勾状态互不干扰，完全私密独立记录在本地设备中。'
                : 'Assignments and completion checklists are strictly isolated per learner name in this browser. Homework, divisions, and applications remain entirely private and distinct.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-100 bg-stone-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
          >
            {isZh ? '关闭' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
