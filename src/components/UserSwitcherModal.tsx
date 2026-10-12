import React, { useState, useEffect } from 'react';
import { LanguageMode } from '../types/bsf';
import { User, ArrowRight, X } from 'lucide-react';

interface UserSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string;
  onSwitchUser: (userName: string) => void;
  language: LanguageMode;
  isFirstVisit?: boolean;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
  language,
  isFirstVisit = false,
}) => {
  const isZh = language === 'zh';
  const [inputName, setInputName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Reset input field when modal opens
  useEffect(() => {
    if (isOpen) {
      setInputName('');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputName.trim();
    if (!trimmed) {
      setErrorMessage(isZh ? '请输入您的姓名' : 'Please enter your name');
      return;
    }
    setErrorMessage('');
    onSwitchUser(trimmed);
    setInputName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-xl border border-stone-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-lg sm:text-xl">
              {isZh ? '研经学员登录' : 'Learner Sign In'}
            </h3>
            <p className="text-xs text-stone-500 font-sans mt-1">
              {isZh
                ? '输入您的姓名，即可载入专属于您的作业与进度'
                : 'Enter your name to load your personal homework and progress'}
            </p>
          </div>
          {!isFirstVisit && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -mr-2 -mt-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              title={isZh ? '关闭' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 font-sans mb-1.5">
              {isZh ? '学员姓名' : 'Name'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputName}
                onChange={(e) => {
                  setInputName(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder={isZh ? '例如：Devin Wang 或 Larrylu' : 'e.g. Devin Wang, Larrylu...'}
                className="w-full text-base px-3.5 py-2.5 pl-10 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-stone-800 font-sans transition-all"
                autoFocus
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
            {errorMessage && (
              <p className="text-xs text-red-600 mt-1.5 font-medium">{errorMessage}</p>
            )}
          </div>

          {/* Current User Indicator (if already logged in) */}
          {currentUser && !isFirstVisit && (
            <div className="text-xs text-stone-500 font-sans flex items-center justify-between pt-1">
              <span>{isZh ? '当前登录：' : 'Current: '}</span>
              <span className="font-semibold text-stone-800 font-serif">{currentUser}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2.5">
            {!isFirstVisit && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 rounded-xl transition-colors font-sans"
              >
                {isZh ? '取消' : 'Cancel'}
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 font-sans"
            >
              <span>{isZh ? '确认登录' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
