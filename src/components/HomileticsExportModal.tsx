import React, { useState } from 'react';
import { Lesson, HomileticsRecord, LanguageMode } from '../types/bsf';
import { calculateBsfWordCount } from '../utils/wordCounter';
import { Copy, Check, Printer, X, Download, FileText, CheckCircle2 } from 'lucide-react';

interface HomileticsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson;
  record: HomileticsRecord;
  language: LanguageMode;
}

export const HomileticsExportModal: React.FC<HomileticsExportModalProps> = ({
  isOpen,
  onClose,
  lesson,
  record,
  language,
}) => {
  if (!isOpen) return null;

  const isZh = language === 'zh';
  const [copied, setCopied] = useState(false);

  const subjectSentence = isZh ? record.subjectSentenceZh : record.subjectSentenceEn;
  const aim = isZh ? record.aimZh : record.aimEn;
  const wordCount = calculateBsfWordCount(subjectSentence, language);

  // Generate clean plain text format for WeChat / BSF Group submission
  const generatePlainText = () => {
    let out = `【BSF 讲道法式研经分析大纲】\n`;
    out += `课次：第 ${lesson.lessonNum} 课 (${lesson.date})\n`;
    out += `主题：${isZh ? lesson.theme : lesson.themeEn}\n`;
    out += `教义：${isZh ? lesson.doctrine : lesson.doctrineEn}\n`;
    out += `经文：${isZh ? lesson.scriptureRange : lesson.scriptureRangeEn}\n\n`;

    if (record.contentList && record.contentList.length > 0) {
      out += `----------------------------------------\n`;
      out += `【步骤一：内容列项 · 经文浓缩】(共 ${record.contentList.length} 项):\n`;
      record.contentList.forEach((c, idx) => {
        out += `${idx + 1}. (${c.verseRef}) ${isZh ? c.summaryZh : c.summaryEn || c.summaryZh}\n`;
      });
      out += `\n`;
    }

    out += `----------------------------------------\n`;
    out += `【步骤二：命题句 / 主题句】(Subject Sentence) [${wordCount.bsfCount}/${wordCount.maxLimit} ${isZh ? '字' : 'words'}]:\n`;
    out += `${subjectSentence || '(未填写)'}\n\n`;

    out += `【步骤三：核心主旨 / 目的】(Aim):\n`;
    out += `${aim || '(未填写)'}\n\n`;

    out += `【步骤四与五：经文分段、属灵原则与生活应用】(Divisions, Principles & Applications):\n`;
    record.divisions.forEach((div, idx) => {
      const title = isZh ? div.titleZh : div.titleEn;
      const principle = isZh ? div.principleZh : div.principleEn;
      const app1 = isZh ? div.app1Zh : div.app1En;
      const app2 = isZh ? div.app2Zh : div.app2En;

      out += `\n【分段 ${idx + 1}】${div.rangeText}：${title || '未填写'}\n`;
      out += `  • 属灵原则：${principle || '未填写'}\n`;
      out += `  • 生活应用 1：${app1 || '未填写'}\n`;
      out += `  • 生活应用 2：${app2 || '未填写'}\n`;
    });

    out += `\n----------------------------------------\n`;
    out += `2026-2027 中文BSF DOLM #7461 罗马书研经\n`;
    return out;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generatePlainText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/80">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-base sm:text-lg">
                {isZh ? 'BSF 标准经文大纲预览与导出' : 'BSF Standard Homiletics Outline'}
              </h3>
              <p className="text-xs text-stone-500">
                {isZh ? lesson.theme : lesson.themeEn} · {isZh ? lesson.scriptureRange : lesson.scriptureRangeEn}
              </p>
            </div>
            {/* Close button on mobile right */}
            <button
              onClick={onClose}
              className="sm:hidden p-1.5 text-stone-400 hover:text-stone-700 rounded-lg shrink-0"
              title="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isZh ? '已复制文本' : 'Copied!') : (isZh ? '复制纯文本' : 'Copy Text')}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isZh ? '打印 / PDF' : 'Print / PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="hidden sm:inline-flex p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              title="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 font-serif print:p-0 print:m-0" id="bsf-print-content">
          {/* Document Header */}
          <div className="border-b-2 border-stone-900 pb-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
              <div>
                <span className="text-[10px] sm:text-xs font-sans tracking-widest uppercase text-stone-500 font-semibold">
                  BIBLE STUDY FELLOWSHIP · HOMILETICS WORKSHEET
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">
                  第 {lesson.lessonNum} 课：{isZh ? lesson.theme : lesson.themeEn}
                </h1>
              </div>
              <div className="sm:text-right text-xs font-sans text-stone-500">
                <p className="font-semibold text-stone-800">{isZh ? lesson.scriptureRange : lesson.scriptureRangeEn}</p>
                <p>教义：{isZh ? lesson.doctrine : lesson.doctrineEn}</p>
                <p>{lesson.date}</p>
              </div>
            </div>
          </div>

          {/* Step 1 Content List (if exists) */}
          {record.contentList && record.contentList.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-sans font-bold text-stone-700 uppercase tracking-wide">
                  步骤一：内容列项 · 经文浓缩 ({record.contentList.length} 项)
                </span>
                <span className="text-[11px] font-sans text-stone-400">
                  BSF 建议 10-20 项
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs font-sans text-stone-700">
                {record.contentList.map((c, i) => (
                  <div key={c.id} className="flex items-start gap-1.5">
                    <span className="font-mono font-bold text-stone-400 shrink-0">{i + 1}.</span>
                    <span className="font-mono text-stone-600 font-semibold shrink-0">({c.verseRef})</span>
                    <span>{isZh ? c.summaryZh : c.summaryEn || c.summaryZh}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subject Sentence & Aim */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-sans font-bold text-stone-700 uppercase tracking-wide">
                  命题句 (Subject Sentence)
                </span>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                    wordCount.isValid
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {wordCount.bsfCount} / {wordCount.maxLimit} {isZh ? '字' : 'words'}
                </span>
              </div>
              <p className="text-base text-stone-900 leading-relaxed font-medium">
                {subjectSentence || <span className="text-stone-400 italic font-sans text-sm">尚未填写命题句</span>}
              </p>
              {wordCount.recognizedNamesAndPlaces.length > 0 && (
                <p className="text-[11px] text-stone-500 font-sans mt-2">
                  * 包含专有名词折算：{[...new Set(wordCount.recognizedNamesAndPlaces)].join('、')} (各算 1 字)
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-xs font-sans font-bold text-stone-700 uppercase tracking-wide block mb-1.5">
                核心目的 (Aim)
              </span>
              <p className="text-base text-stone-900 leading-relaxed font-medium">
                {aim || <span className="text-stone-400 italic font-sans text-sm">尚未填写核心目的</span>}
              </p>
            </div>
          </div>

          {/* 3-Column Standard BSF Table (Horizontally Scrollable on Mobile) */}
          <div className="overflow-x-auto border border-stone-300 rounded-xl mb-6 shadow-2xs">
            <table className="w-full min-w-[540px] text-left border-collapse">
              <thead>
                <tr className="bg-stone-900 text-white font-sans text-xs">
                  <th className="py-3 px-4 w-1/4 border-r border-stone-700 font-semibold">
                    经文分段 (Divisions)
                  </th>
                  <th className="py-3 px-4 w-1/3 border-r border-stone-700 font-semibold">
                    属灵原则 (Principles)
                  </th>
                  <th className="py-3 px-4 w-5/12 font-semibold">
                    生活应用问题 (Applications)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-sm">
                {record.divisions.map((div, idx) => {
                  const title = isZh ? div.titleZh : div.titleEn;
                  const principle = isZh ? div.principleZh : div.principleEn;
                  const app1 = isZh ? div.app1Zh : div.app1En;
                  const app2 = isZh ? div.app2Zh : div.app2En;

                  return (
                    <tr key={div.id} className="align-top hover:bg-stone-50/50">
                      {/* Column 1: Divisions */}
                      <td className="p-4 border-r border-stone-200 bg-stone-50/40">
                        <div className="font-mono text-xs font-bold text-stone-500 mb-1">
                          {div.rangeText}
                        </div>
                        <div className="font-semibold text-stone-900 leading-snug">
                          {title || <span className="text-stone-400 italic text-xs">未填写标题</span>}
                        </div>
                      </td>

                      {/* Column 2: Principle */}
                      <td className="p-4 border-r border-stone-200 leading-relaxed text-stone-800">
                        {principle ? (
                          <p className="font-medium text-stone-900">{principle}</p>
                        ) : (
                          <span className="text-stone-400 italic text-xs">未填写属灵原则</span>
                        )}
                      </td>

                      {/* Column 3: Applications */}
                      <td className="p-4 space-y-2 text-stone-700 font-sans text-xs leading-relaxed">
                        {app1 && (
                          <div className="flex items-start gap-1.5">
                            <span className="font-bold text-stone-500 font-mono">1.</span>
                            <span>{app1}</span>
                          </div>
                        )}
                        {app2 && (
                          <div className="flex items-start gap-1.5">
                            <span className="font-bold text-stone-500 font-mono">2.</span>
                            <span>{app2}</span>
                          </div>
                        )}
                        {!app1 && !app2 && (
                          <span className="text-stone-400 italic font-serif">未填写生活应用问题</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <div className="text-[11px] text-stone-400 font-sans text-center border-t border-stone-200 pt-3">
            2026-2027 中文BSF DOLM #7461 · 罗马书《从罪孽到恩典》讲道法研经
          </div>
        </div>
      </div>
    </div>
  );
};
