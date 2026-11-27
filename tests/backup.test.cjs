const test = require('node:test');
const assert = require('node:assert/strict');

global.window = global;
require('../backup.js');

const words = [{ word: 'apple' }, { word: 'banana' }];
const sample = {
  format: 'word-garden-progress',
  version: 1,
  exportedAt: '2026-11-27T00:00:00.000Z',
  learned: ['apple', 'unknown', 'apple'],
  missed: ['banana'],
  history: { days: { '2026-11-26': { answered: 3, correct: 2 }, '2026-02-30': { answered: 1, correct: 0 } } },
  reviewProgress: {
    apple: { attempts: 2, correct: 2, incorrect: 0, streak: 2, lastResult: 'correct', lastAnsweredAt: 100, dueAt: 200 },
    unknown: { attempts: 1, correct: 1, incorrect: 0, streak: 1, lastResult: 'correct', lastAnsweredAt: 100, dueAt: 200 },
    banana: { attempts: 1, correct: 0, incorrect: 1, streak: 0, lastResult: 'incorrect', lastAnsweredAt: 100, dueAt: 100 },
  },
};

test('backup round-trip preserves valid known learning data and removes unknown words', () => {
  const backup = LearningBackup.parseBackup(JSON.stringify(sample), words);
  assert.deepEqual(backup.learned, ['apple']);
  assert.deepEqual(backup.missed, ['banana']);
  assert.deepEqual(backup.history.days, { '2026-11-26': { answered: 3, correct: 2 } });
  assert.deepEqual(Object.keys(backup.reviewProgress).sort(), ['apple', 'banana']);
});

test('backup export includes the schema version and local progress collections', () => {
  const backup = LearningBackup.createBackup({
    learned: new Set(['apple']),
    missed: new Set(),
    history: { days: {} },
    reviewProgress: {},
  }, '2026-11-27T00:00:00.000Z');
  assert.equal(backup.format, 'word-garden-progress');
  assert.equal(backup.version, 1);
  assert.equal(backup.exportedAt, '2026-11-27T00:00:00.000Z');
});

test('invalid JSON, versions, and incomplete data are rejected', () => {
  assert.throws(() => LearningBackup.parseBackup('{', words), /有效的 JSON/);
  assert.throws(() => LearningBackup.sanitizeBackup({ ...sample, version: 2 }, words), /格式或版本/);
  assert.throws(() => LearningBackup.sanitizeBackup({ format: sample.format, version: 1 }, words), /必要的學習資料/);
});

test('invalid review counters and impossible daily scores are omitted', () => {
  const bad = {
    ...sample,
    history: { days: { '2026-11-26': { answered: 1, correct: 2 } } },
    reviewProgress: { apple: { ...sample.reviewProgress.apple, attempts: 4 } },
  };
  const backup = LearningBackup.sanitizeBackup(bad, words);
  assert.deepEqual(backup.history.days, {});
  assert.deepEqual(backup.reviewProgress, {});
});
