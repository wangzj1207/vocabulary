const test = require('node:test');
const assert = require('node:assert/strict');

global.window = global;
require('../review.js');
require('../practice.js');

const words = [
  { word: 'apple' },
  { word: 'banana' },
  { word: 'orange' },
];

test('all scope includes the complete word bank', () => {
  assert.deepEqual(Practice.filterWords(words, 'all').map((word) => word.word), ['apple', 'banana', 'orange']);
});

test('new scope excludes words already practiced', () => {
  const learned = new Set(['apple']);
  assert.deepEqual(Practice.filterWords(words, 'new', learned).map((word) => word.word), ['banana', 'orange']);
});

test('missed scope includes only words with recorded mistakes', () => {
  const missed = new Set(['banana', 'orange']);
  assert.deepEqual(Practice.filterWords(words, 'missed', new Set(), missed).map((word) => word.word), ['banana', 'orange']);
});

test('correct scope excludes new words and words awaiting review', () => {
  const learned = new Set(['apple', 'banana']);
  const missed = new Set(['banana']);
  assert.deepEqual(Practice.filterWords(words, 'correct', learned, missed).map((word) => word.word), ['apple']);
});

test('status counts are mutually exclusive and include every word', () => {
  const learned = new Set(['apple', 'banana']);
  const missed = new Set(['banana']);
  assert.deepEqual(Practice.countStatuses(words, learned, missed), { new: 1, correct: 1, incorrect: 1, due: 0 });
});

test('correct scope excludes words whose review interval has expired', () => {
  const learned = new Set(['apple', 'banana']);
  const progress = { banana: { dueAt: 10 } };
  assert.deepEqual(Practice.filterWords(words, 'correct', learned, new Set(), progress, 10).map((word) => word.word), ['apple']);
});

test('empty practice scopes return an empty list', () => {
  assert.deepEqual(Practice.filterWords(words, 'missed', new Set(), new Set()), []);
});
