(function (root) {
  function filterWords(words, scope = 'all', learned = new Set(), missed = new Set(), progress = {}, now = Date.now()) {
    if (scope === 'new') return words.filter((word) => !learned.has(word.word));
    if (scope === 'correct') return words.filter((word) => learned.has(word.word) && !Review.isDue(word, progress, missed, now));
    if (scope === 'missed') return Review.filterDue(words, progress, missed, now);
    return words;
  }

  function countStatuses(words, learned = new Set(), missed = new Set(), progress = {}, now = Date.now()) {
    return words.reduce((counts, word) => {
      if (Review.isDue(word, progress, missed, now)) counts.review++;
      else if (learned.has(word.word)) counts.correct++;
      else counts.new++;
      return counts;
    }, { new: 0, correct: 0, review: 0 });
  }

  root.Practice = { filterWords, countStatuses };
})(window);
