const test = require('node:test');
const assert = require('node:assert/strict');

global.window = global;
require('../quiz.js');

const answer = { word: 'apple', pos: 'n.', meaning: '蘋果；蘋果樹' };

test('options use unique meanings and exclude punctuation-only duplicates of the answer', () => {
  const words = [
    answer,
    { word: 'fruit', pos: 'n.', meaning: '蘋果，蘋果樹' },
    { word: 'banana', pos: 'n.', meaning: '香蕉' },
    { word: 'orange', pos: 'n.', meaning: '橘子' },
    { word: 'pear', pos: 'n.', meaning: '梨子' },
  ];
  const options = Quiz.createOptions(words, answer, () => 0);
  assert.equal(options.length, 4);
  assert.equal(options.filter((option) => option.right).length, 1);
  assert.equal(new Set(options.map((option) => Quiz.normalizeMeaning(option.text))).size, 4);
});

test('distractors prefer words with the same primary part of speech', () => {
  const words = [
    answer,
    { word: 'banana', pos: 'n./adj.', meaning: '香蕉' },
    { word: 'orange', pos: 'n.', meaning: '橘子' },
    { word: 'pear', pos: 'n.', meaning: '梨子' },
    { word: 'run', pos: 'v.', meaning: '跑步' },
  ];
  const options = Quiz.createOptions(words, answer, () => 0);
  assert.equal(options.length, 4);
  assert.equal(options.some((option) => option.text === '跑步'), false);
});

test('distractors fall back to other parts of speech when needed', () => {
  const words = [
    answer,
    { word: 'run', pos: 'v.', meaning: '跑步' },
    { word: 'beautiful', pos: 'adj.', meaning: '美麗的' },
    { word: 'quickly', pos: 'adv.', meaning: '迅速地' },
  ];
  assert.equal(Quiz.createOptions(words, answer, () => 0).length, 4);
});

test('shuffle returns a new array and keeps every item', () => {
  const items = [1, 2, 3, 4];
  const shuffled = Quiz.shuffle(items, () => 0.5);
  assert.notEqual(shuffled, items);
  assert.deepEqual([...shuffled].sort(), items);
});
