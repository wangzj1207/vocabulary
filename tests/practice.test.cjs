const test = require('node:test');
const assert = require('node:assert/strict');

global.window = global;
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

test('empty practice scopes return an empty list', () => {
  assert.deepEqual(Practice.filterWords(words, 'missed', new Set(), new Set()), []);
});
