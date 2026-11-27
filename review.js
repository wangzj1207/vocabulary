(function (root) {
  const intervalsInDays = [1, 3, 7, 14, 30];
  const dayInMs = 24 * 60 * 60 * 1000;

  function isDue(word, progress = {}, missed = new Set(), now = Date.now()) {
    const key = typeof word === 'string' ? word : word.word;
    if (missed.has(key)) return true;
    const dueAt = progress[key]?.dueAt;
    return Number.isFinite(dueAt) && dueAt <= now;
  }

  function filterDue(words, progress = {}, missed = new Set(), now = Date.now()) {
    return words.filter((word) => isDue(word, progress, missed, now));
  }

  function statusFor(word, learned = new Set(), progress = {}, missed = new Set(), now = Date.now()) {
    const key = typeof word === 'string' ? word : word.word;
    const record = progress[key];
    if (!learned.has(key) && !record?.attempts && !missed.has(key)) return 'new';
    if (missed.has(key) || record?.lastResult === 'incorrect') return 'incorrect';
    if (isDue(key, progress, missed, now)) return 'due';
    return 'correct';
  }

  function recordAnswer(progress, word, correct, now = Date.now()) {
    const previous = progress[word] || {};
    const streak = correct
      ? (previous.lastResult === 'correct' ? (Number(previous.streak) || 0) + 1 : 1)
      : 0;
    const interval = correct ? intervalsInDays[Math.min(streak - 1, intervalsInDays.length - 1)] : 0;
    return {
      ...progress,
      [word]: {
        attempts: (Number(previous.attempts) || 0) + 1,
        correct: (Number(previous.correct) || 0) + Number(correct),
        incorrect: (Number(previous.incorrect) || 0) + Number(!correct),
        streak,
        lastResult: correct ? 'correct' : 'incorrect',
        lastAnsweredAt: now,
        dueAt: now + interval * dayInMs,
      },
    };
  }

  root.Review = { isDue, filterDue, statusFor, recordAnswer };
})(window);
