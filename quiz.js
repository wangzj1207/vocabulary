(function (root) {
  function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function normalizeMeaning(meaning) {
    return meaning.normalize('NFKC').toLocaleLowerCase().replace(/[\s、，,。；;.!?！？/]+/g, '');
  }

  function primaryPos(pos) {
    return pos.split('/')[0].trim().replace(/\.$/, '').toLocaleLowerCase();
  }

  function createOptions(words, answer, random = Math.random) {
    const answerMeaning = normalizeMeaning(answer.meaning);
    const candidates = words.filter((word) => word.word !== answer.word && normalizeMeaning(word.meaning) !== answerMeaning);
    const samePos = candidates.filter((word) => primaryPos(word.pos) === primaryPos(answer.pos));
    const seen = new Set([answerMeaning]);
    const distractors = [];

    for (const word of [...shuffle(samePos, random), ...shuffle(candidates, random)]) {
      const key = normalizeMeaning(word.meaning);
      if (seen.has(key)) continue;
      seen.add(key);
      distractors.push(word.meaning);
      if (distractors.length === 3) break;
    }

    return shuffle([
      { text: answer.meaning, right: true },
      ...distractors.map((text) => ({ text, right: false })),
    ], random);
  }

  root.Quiz = { shuffle, normalizeMeaning, createOptions };
})(window);
