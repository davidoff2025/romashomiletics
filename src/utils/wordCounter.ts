import { LanguageMode, WordCountResult } from '../types/bsf';

// 圣经人名地名专有词典（按长度倒序排列，确保长词优先匹配）
export const BIBLE_NAMES_AND_PLACES_ZH = [
  // 复合神圣名字与人名
  '耶稣基督',
  '基督耶稣',
  '耶路撒冷',
  '百基拉',
  '亚居拉',
  '亚伯拉罕',
  '以赛亚',
  '以利亚',
  '利百加',
  '提摩太',
  '撒母耳',
  '所罗门',
  '司提反',
  '坚革哩',
  '马其顿',
  '亚该亚',
  '撒玛利亚',
  '以色列',
  // 双字或常见专有名词
  '耶稣',
  '基督',
  '保罗',
  '摩西',
  '大卫',
  '亚当',
  '以撒',
  '雅各',
  '以扫',
  '法老',
  '撒拉',
  '非比',
  '鲁孚',
  '亚伦',
  '彼得',
  '矶法',
  '罗马',
  '锡安',
  '埃及',
  '以东',
  '西班牙',
  '哥林多',
  '加利利',
  '犹太',
  '约伯',
  '挪亚'
];

export const BIBLE_NAMES_AND_PLACES_EN = [
  'Jesus Christ',
  'Christ Jesus',
  'Holy Spirit',
  'Mount Zion',
  'Jesus',
  'Christ',
  'Paul',
  'Abraham',
  'Moses',
  'David',
  'Adam',
  'Isaac',
  'Jacob',
  'Esau',
  'Pharaoh',
  'Isaiah',
  'Elijah',
  'Sarah',
  'Rebekah',
  'Phoebe',
  'Priscilla',
  'Aquila',
  'Timothy',
  'Jerusalem',
  'Rome',
  'Corinth',
  'Spain',
  'Zion',
  'Macedonia',
  'Achaia',
  'Cenchreae',
  'Egypt',
  'Israel',
  'Judea',
  'Galilee',
  'Peter',
  'Cephas',
  'Solomon',
  'Samuel',
  'Stephen'
];

/**
 * 校验中文字数（上限20字符，人名地名算1字）
 */
export function countWordsZh(text: string): WordCountResult {
  if (!text || text.trim() === '') {
    return {
      rawCount: 0,
      bsfCount: 0,
      maxLimit: 20,
      recognizedNamesAndPlaces: [],
      isValid: true,
      language: 'zh',
      explanation: '尚未输入内容（中文上限20字，人名/地名折算为1字）'
    };
  }

  // 1. 过滤常见标点符号和空格
  const cleanText = text.replace(/[\s，。！？、；：“”‘’（）《》〈〉【】—…,.!?;:"'()\[\]]/g, '');
  const rawCount = cleanText.length;

  // 2. 匹配并提取专有名词
  let workingText = cleanText;
  const recognizedNames: string[] = [];

  for (const term of BIBLE_NAMES_AND_PLACES_ZH) {
    while (workingText.includes(term)) {
      recognizedNames.push(term);
      // 用特殊单占位字符替换，例如 §
      workingText = workingText.replace(term, '§');
    }
  }

  // 3. 计算 BSF 统计字数：剩余字符数 + 每个识别出的专有词计 1 字
  const bsfCount = workingText.length; // 因为每个专有名词被替换为了 1 个 '§' 字符！正好就是 1:1
  const isValid = bsfCount <= 20;

  const explanation = recognizedNames.length > 0
    ? `实际 ${rawCount} 字符，识别出 ${recognizedNames.length} 个专有名词（${[...new Set(recognizedNames)].join('、')}，各折算为1字），折算后为 ${bsfCount} 字`
    : `共 ${rawCount} 字符（未检测到专有名词折算）`;

  return {
    rawCount,
    bsfCount,
    maxLimit: 20,
    recognizedNamesAndPlaces: recognizedNames,
    isValid,
    language: 'zh',
    explanation
  };
}

/**
 * 校验英文字数（上限10 words，复合人名地名如 "Jesus Christ" 算1 word）
 */
export function countWordsEn(text: string): WordCountResult {
  if (!text || text.trim() === '') {
    return {
      rawCount: 0,
      bsfCount: 0,
      maxLimit: 10,
      recognizedNamesAndPlaces: [],
      isValid: true,
      language: 'en',
      explanation: 'No content entered (Limit: 10 words, proper names count as 1 word)'
    };
  }

  // 1. 移除标点并提取单词
  const normalized = text.trim();
  const rawWords = normalized
    .replace(/[.,!?;:"'()\[\]—\-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const rawCount = rawWords.length;

  // 2. 检查多词专有名词 (e.g. "Jesus Christ", "Holy Spirit", "Mount Zion")
  let workingSentence = normalized;
  const recognizedNames: string[] = [];

  // 只匹配包含空格的多词专有名词进行折算扣减
  const multiWordTerms = BIBLE_NAMES_AND_PLACES_EN.filter(t => t.includes(' '));
  for (const term of multiWordTerms) {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const matches = workingSentence.match(regex);
    if (matches) {
      matches.forEach(m => {
        recognizedNames.push(m);
      });
      // 替换为单个特殊占位词
      workingSentence = workingSentence.replace(regex, '___NAME_TOKEN___');
    }
  }

  // 3. 对占位后的句子计算单词数
  const finalWords = workingSentence
    .replace(/[.,!?;:"'()\[\]—\-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const bsfCount = finalWords.length;
  const isValid = bsfCount <= 10;

  const explanation = recognizedNames.length > 0
    ? `${rawCount} raw words, recognized ${recognizedNames.length} compound proper names (${[...new Set(recognizedNames)].join(', ')} counted as 1 word each), BSF total: ${bsfCount} words`
    : `${rawCount} words (Limit: 10 words)`;

  return {
    rawCount,
    bsfCount,
    maxLimit: 10,
    recognizedNamesAndPlaces: recognizedNames,
    isValid,
    language: 'en',
    explanation
  };
}

/**
 * 统一根据当前语言模式计算 BSF 字数
 */
export function calculateBsfWordCount(text: string, language: LanguageMode): WordCountResult {
  return language === 'zh' ? countWordsZh(text) : countWordsEn(text);
}
