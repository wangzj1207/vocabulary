const test = require('node:test');
const assert = require('node:assert/strict');

global.window = global;
require('../review.js');
require('../wordbook.js');

const words = [
  { word: 'apple', meaning: '蘋果；蘋果樹' },
  { word: 'banana', meaning: '香蕉' },
  { word: 'apply', meaning: '申請；應用' },
];

test('search matches English headwords case-insensitively', () => {
  assert.deepEqual(
    Wordbook.filterWords(words, 'APP').map((word) => word.word),
    ['apple', 'apply'],
  );
});

test('search matches Traditional Chinese meanings', () => {
  assert.deepEqual(
    Wordbook.filterWords(words, '香蕉').map((word) => word.word),
    ['banana'],
  );
});

test('practice status filters against the learned word set', () => {
  const learned = new Set(['apple']);
  assert.deepEqual(
    Wordbook.filterWords(words, '', 'learned', learned).map((word) => word.word),
    ['apple'],
  );
  assert.deepEqual(
    Wordbook.filterWords(words, '', 'new', learned).map((word) => word.word),
    ['banana', 'apply'],
  );
});

test('wordbook can filter words that are correct or awaiting review', () => {
  const learned = new Set(['apple', 'banana']);
  const missed = new Set(['banana']);
  assert.deepEqual(Wordbook.filterWords(words, '', 'correct', learned, missed).map((word) => word.word), ['apple']);
  assert.deepEqual(Wordbook.filterWords(words, '', 'review', learned, missed).map((word) => word.word), ['banana']);
});

test('wordbook marks a correct word for review after its due time', () => {
  const learned = new Set(['apple']);
  const progress = { apple: { dueAt: 100 } };
  assert.deepEqual(Wordbook.filterWords(words, '', 'review', learned, new Set(), progress, 100).map((word) => word.word), ['apple']);
  assert.deepEqual(Wordbook.filterWords(words, '', 'correct', learned, new Set(), progress, 100), []);
});

test('pagination returns the requested slice and clamps invalid pages', () => {
  const items = Array.from({ length: 123 }, (_, index) => index);
  const last = Wordbook.paginate(items, 9, 50);
  assert.equal(last.page, 2);
  assert.equal(last.pageCount, 3);
  assert.deepEqual(last.items, items.slice(100));
  assert.equal(Wordbook.paginate(items, -4, 50).page, 0);
});

test('empty results still have a stable first page', () => {
  assert.deepEqual(Wordbook.paginate([], 0), {
    items: [],
    page: 0,
    pageCount: 1,
    total: 0,
  });
});
