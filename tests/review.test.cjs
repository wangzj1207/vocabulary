const test = require('node:test');
const assert = require('node:assert/strict');

global.window = global;
require('../review.js');

const day = 24 * 60 * 60 * 1000;

test('a correct answer schedules the first review one day later', () => {
  const progress = Review.recordAnswer({}, 'apple', true, 1000);
  assert.equal(progress.apple.dueAt, 1000 + day);
  assert.equal(Review.isDue('apple', progress, new Set(), 1000 + day - 1), false);
  assert.equal(Review.isDue('apple', progress, new Set(), 1000 + day), true);
});

test('correct streak increases intervals and caps at thirty days', () => {
  let progress = {};
  for (let i = 0; i < 5; i++) progress = Review.recordAnswer(progress, 'apple', true, i * day);
  assert.equal(progress.apple.streak, 5);
  assert.equal(progress.apple.dueAt, 4 * day + 30 * day);
});

test('an incorrect answer is immediately due and resets the correct streak', () => {
  let progress = Review.recordAnswer({}, 'apple', true, 0);
  progress = Review.recordAnswer(progress, 'apple', false, 500);
  assert.equal(progress.apple.streak, 0);
  assert.equal(progress.apple.lastResult, 'incorrect');
  assert.equal(progress.apple.dueAt, 500);
  assert.equal(Review.isDue('apple', progress, new Set(), 500), true);
  assert.equal(progress.apple.attempts, 2);
  assert.equal(progress.apple.incorrect, 1);
});

test('legacy missed words stay due without a schedule record', () => {
  assert.equal(Review.isDue('banana', {}, new Set(['banana']), 0), true);
  assert.equal(Review.statusFor('banana', new Set(), {}, new Set(['banana']), 0), 'incorrect');
});

test('study status distinguishes new, correct, incorrect, and scheduled due words', () => {
  const learned = new Set(['apple', 'banana', 'orange']);
  const missed = new Set(['banana']);
  const progress = {
    apple: { lastResult: 'correct', attempts: 1, dueAt: 200 },
    banana: { lastResult: 'incorrect', attempts: 1, dueAt: 100 },
    orange: { lastResult: 'correct', attempts: 1, dueAt: 50 },
  };
  assert.equal(Review.statusFor('pear', learned, progress, missed, 100), 'new');
  assert.equal(Review.statusFor('apple', learned, progress, missed, 100), 'correct');
  assert.equal(Review.statusFor('banana', learned, progress, missed, 100), 'incorrect');
  assert.equal(Review.statusFor('orange', learned, progress, missed, 100), 'due');
});
