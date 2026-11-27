(function (root) {
  const format = 'word-garden-progress';
  const version = 1;
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  function isValidDateKey(value) {
    if (!datePattern.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }

  function count(value, fallback = 0) {
    return Number.isSafeInteger(value) && value >= 0 ? value : fallback;
  }

  function sanitizeBackup(data, words) {
    if (!data || data.format !== format || data.version !== version) {
      throw new Error('備份格式或版本不支援。');
    }
    if (!Array.isArray(data.learned) || !Array.isArray(data.missed)
      || !data.history || typeof data.history !== 'object' || !data.history.days
      || typeof data.history.days !== 'object' || !data.reviewProgress
      || typeof data.reviewProgress !== 'object' || Array.isArray(data.reviewProgress)) {
      throw new Error('備份缺少必要的學習資料。');
    }

    const knownWords = new Set(words.map((word) => word.word));
    const keepKnownWords = (values) => [...new Set(values.filter((word) => typeof word === 'string' && knownWords.has(word)))];
    const days = {};
    for (const [key, value] of Object.entries(data.history.days)) {
      if (!isValidDateKey(key) || !value || typeof value !== 'object') continue;
      const answered = count(value.answered, -1);
      const correct = count(value.correct, -1);
      if (answered < 0 || correct < 0 || correct > answered) continue;
      days[key] = { answered, correct };
    }

    const reviewProgress = {};
    for (const [word, value] of Object.entries(data.reviewProgress)) {
      if (!knownWords.has(word) || !value || typeof value !== 'object') continue;
      if (!['correct', 'incorrect'].includes(value.lastResult)) continue;
      if (!Number.isSafeInteger(value.dueAt) || value.dueAt < 0
        || !Number.isSafeInteger(value.lastAnsweredAt) || value.lastAnsweredAt < 0) continue;
      const attempts = count(value.attempts, -1);
      const correct = count(value.correct, -1);
      const incorrect = count(value.incorrect, -1);
      const streak = count(value.streak, -1);
      if (attempts < 0 || correct < 0 || incorrect < 0 || streak < 0 || attempts !== correct + incorrect) continue;
      reviewProgress[word] = {
        attempts,
        correct,
        incorrect,
        streak,
        lastResult: value.lastResult,
        lastAnsweredAt: value.lastAnsweredAt,
        dueAt: value.dueAt,
      };
    }

    return {
      format,
      version,
      exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : '',
      learned: keepKnownWords(data.learned),
      missed: keepKnownWords(data.missed),
      history: { days },
      reviewProgress,
    };
  }

  function parseBackup(text, words) {
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('檔案不是有效的 JSON 備份。');
    }
    return sanitizeBackup(data, words);
  }

  function createBackup({ learned, missed, history, reviewProgress }, exportedAt = new Date().toISOString()) {
    return {
      format,
      version,
      exportedAt,
      learned: [...learned],
      missed: [...missed],
      history,
      reviewProgress,
    };
  }

  root.LearningBackup = { createBackup, parseBackup, sanitizeBackup };
})(window);
