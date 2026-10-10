import React from 'react';
import { LanguageMode } from '../types/bsf';
import { BookOpen, CheckCircle, AlertTriangle, Layers, FileText, Target, Compass } from 'lucide-react';

interface BsfGuidelinesModalProps {
  language: LanguageMode;
}

export const BsfGuidelinesModal: React.FC<BsfGuidelinesModalProps> = ({ language }) => {
  const isZh = language === 'zh';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-xl border border-stone-200/90 shadow-2xs">
        <h2 className="font-serif font-bold text-stone-900 text-2xl mb-1">
          {isZh ? 'BSF 讲道法式研经（Homiletics）核心规范与指南' : 'BSF Homiletics Guidelines'}
        </h2>
        <p className="text-xs text-stone-500 font-sans">
          {isZh
            ? '讲道法式研经是 BSF 组长与学员深入剖析经文、提炼永恒真理并带出生活转变的经典研经四步法。'
            : 'BSF Homiletics is a 4-step Bible study method designed to extract timeless principles and personal life applications.'}
        </p>
      </div>

      {/* Special Word Count Rule Highlight Box */}
      <div className="p-5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-sm text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-700" />
          <span>{isZh ? 'BSF 特殊字数计算规则（本系统已内置自动算法）' : 'BSF Word Count Rules'}</span>
        </div>
        <div className="text-xs space-y-1.5 leading-relaxed text-amber-900/90 font-sans">
          <p>
            <strong>中文标准：</strong>命题句与分段标题建议在 <strong>20 个字符以内</strong>。
          </p>
          <p>
            <strong>英文标准：</strong>命题句与分段标题严格在 <strong>10 words 以内</strong>。
          </p>
          <p className="bg-white/80 p-2.5 rounded-lg border border-amber-200/60 mt-1">
            <span className="font-bold text-amber-950">★ 关键例外折算规则：</span>
            圣经中的<strong>人名</strong>（例如：耶稣基督、保罗、亚伯拉罕、摩西、大卫、亚当等）和<strong>地名</strong>（例如：罗马、耶路撒冷、哥林多、西班牙、锡安等），<strong>一律按 1 个字/词计算</strong>！
            <br />
            <span className="text-stone-500 text-[11px]">
              例如：“耶稣基督（1字）赐下（2字）恩典（2字）” 在 BSF 计算中算作 5 个字，而非 8 个字。
            </span>
          </p>
        </div>
      </div>

      {/* 5 Steps Breakdown matching PDF */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step 1 */}
        <div className="p-5 rounded-xl bg-white border border-stone-200 space-y-2 md:col-span-2">
          <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base">
            <div className="w-6 h-6 rounded bg-stone-900 text-white text-xs font-mono flex items-center justify-center">
              1
            </div>
            <span>{isZh ? '第一步：内容列项 · 经文思考与浓缩 (Content Listing)' : 'Step 1: Content Listing & Condensation'}</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            问自己：<strong>“这段经文在说什么？”</strong> 反复通读经文，留意重复字句、短语、名字、地点与对话。
            列出 <strong>10–20 项内容</strong>；每项包含序号与经节号码，用自己的方式（缩写、短语、句子）浓缩经文事实。<strong>仅限于经文中的内容事实，不是你自己的诠释</strong>。
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-5 rounded-xl bg-white border border-stone-200 space-y-2">
          <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base">
            <div className="w-6 h-6 rounded bg-stone-900 text-white text-xs font-mono flex items-center justify-center">
              2
            </div>
            <span>{isZh ? '第二步：分段/段落 (Divisions)' : 'Step 2: Divisions'}</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            在完成经文浓缩后，将经文划分为 <strong>2 至 4 个主要段落</strong>。每个分段标明经节范围（如 罗 1:1-7），并用一个简短完整的陈述句概括标题（字数：中文 $\le 20$ 字，英文 $\le 10$ 词）。
          </p>
        </div>

        {/* Step 3 */}
        <div className="p-5 rounded-xl bg-white border border-stone-200 space-y-2">
          <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base">
            <div className="w-6 h-6 rounded bg-stone-900 text-white text-xs font-mono flex items-center justify-center">
              3
            </div>
            <span>{isZh ? '第三步：主题句/命题句 (Subject Sentence)' : 'Step 3: Subject Sentence'}</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            用一句话概括全篇经文的核心主旨。回答“经文讲了什么以及说了关于它的什么”。中文 $\le 20$ 字，英文 $\le 10$ 词（圣经人名地名算 1 字）。
          </p>
        </div>

        {/* Step 4 */}
        <div className="p-5 rounded-xl bg-white border border-stone-200 space-y-2">
          <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base">
            <div className="w-6 h-6 rounded bg-stone-900 text-white text-xs font-mono flex items-center justify-center">
              4
            </div>
            <span>{isZh ? '第四步：主旨/核心目的 (Aim)' : 'Step 4: Aim'}</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            明确传达你希望读者或会众通过这段经文领受并明白什么真理。经典起始句为：“使会众/读者明白……”（Cause the audience to know that...）。
          </p>
        </div>

        {/* Step 5 */}
        <div className="p-5 rounded-xl bg-white border border-stone-200 space-y-2">
          <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base">
            <div className="w-6 h-6 rounded bg-stone-900 text-white text-xs font-mono flex items-center justify-center">
              5
            </div>
            <span>{isZh ? '第五步：生活应用 (Principles & Applications)' : 'Step 5: Applications'}</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            针对每一个经文分段：提炼 <strong>1 条永恒属灵原则</strong>（普世真理），并设计 <strong>2 个触及内心的个人生活应用问题</strong>（以促成真实的生命活出与改变）。
          </p>
        </div>
      </div>
    </div>
  );
};
