(function (root) {
  function filterWords(words, scope = 'all', learned = new Set(), missed = new Set()) {
    if (scope === 'new') return words.filter((word) => !learned.has(word.word));
    if (scope === 'correct') return words.filter((word) => learned.has(word.word) && !missed.has(word.word));
    if (scope === 'missed') return words.filter((word) => missed.has(word.word));
    return words;
  }

  function countStatuses(words, learned = new Set(), missed = new Set()) {
    return words.reduce((counts, word) => {
      if (missed.has(word.word)) counts.review++;
      else if (learned.has(word.word)) counts.correct++;
      else counts.new++;
      return counts;
    }, { new: 0, correct: 0, review: 0 });
  }

  root.Practice = { filterWords, countStatuses };
})(window);
