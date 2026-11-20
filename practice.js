(function (root) {
  function filterWords(words, scope = 'all', learned = new Set(), missed = new Set()) {
    if (scope === 'new') return words.filter((word) => !learned.has(word.word));
    if (scope === 'missed') return words.filter((word) => missed.has(word.word));
    return words;
  }

  root.Practice = { filterWords };
})(window);
