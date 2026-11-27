(function (root) {
  function filterWords(words, scope = 'all', learned = new Set(), missed = new Set(), progress = {}, now = Date.now()) {
    if (scope === 'new') return words.filter((word) => !learned.has(word.word));
    if (scope === 'correct') return words.filter((word) => Review.statusFor(word, learned, progress, missed, now) === 'correct');
    if (scope === 'missed') return Review.filterDue(words, progress, missed, now);
    return words;
  }

  function countStatuses(words, learned = new Set(), missed = new Set(), progress = {}, now = Date.now()) {
    return words.reduce((counts, word) => {
      counts[Review.statusFor(word, learned, progress, missed, now)]++;
      return counts;
    }, { new: 0, correct: 0, incorrect: 0, due: 0 });
  }

  root.Practice = { filterWords, countStatuses };
})(window);
