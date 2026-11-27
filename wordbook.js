(function (root) {
  function filterWords(words, query = "", status = "all", learned = new Set(), missed = new Set()) {
    const normalized = query.trim().toLocaleLowerCase();
    return words.filter((word) => {
      const matchesQuery = !normalized
        || word.word.toLocaleLowerCase().includes(normalized)
        || word.meaning.toLocaleLowerCase().includes(normalized);
      const hasPracticed = learned.has(word.word);
      const matchesStatus = status === "all"
        || (status === "learned" ? hasPracticed : status === "new" ? !hasPracticed
          : status === "correct" ? hasPracticed && !missed.has(word.word)
            : status === "review" ? missed.has(word.word) : true);
      return matchesQuery && matchesStatus;
    });
  }

  function paginate(items, page, pageSize = 50) {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const currentPage = Math.max(0, Math.min(page, totalPages - 1));
    const start = currentPage * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      page: currentPage,
      pageCount: totalPages,
      total: items.length,
    };
  }

  root.Wordbook = { filterWords, paginate };
})(window);
