const test = require('node:test');
const assert = require('node:assert/strict');

global.window = global;
require('../history.js');

function offsetDate(date, offset) {
  const value = new Date(date);
  value.setDate(value.getDate() + offset);
  return value;
}

test('streak counts consecutive days ending today', () => {
  const today = new Date(2026, 10, 20, 12);
  const days = {};
  days[StudyHistory.dateKey(today)] = { answered: 3, correct: 2 };
  days[StudyHistory.dateKey(offsetDate(today, -1))] = { answered: 4, correct: 4 };
  days[StudyHistory.dateKey(offsetDate(today, -2))] = { answered: 1, correct: 1 };
  days[StudyHistory.dateKey(offsetDate(today, -4))] = { answered: 5, correct: 5 };
  assert.equal(StudyHistory.currentStreak(days, today), 3);
});

test('streak remains active through yesterday before studying today', () => {
  const today = new Date(2026, 10, 20, 12);
  const yesterday = offsetDate(today, -1);
  const days = {
    [StudyHistory.dateKey(yesterday)]: { answered: 1, correct: 1 },
    [StudyHistory.dateKey(offsetDate(today, -2))]: { answered: 2, correct: 1 },
  };
  assert.equal(StudyHistory.currentStreak(days, today), 2);
});

test('summary totals answered questions, correct answers, and study days', () => {
  assert.deepEqual(StudyHistory.summarize({
    '2026-11-20': { answered: 3, correct: 2 },
    '2026-11-19': { answered: 2, correct: 2 },
    '2026-11-18': { answered: 0, correct: 0 },
  }), { answered: 5, correct: 4, studyDays: 2 });
});

test('recent days are newest first and limited to the requested window', () => {
  const today = new Date(2026, 10, 20, 12);
  const days = {
    [StudyHistory.dateKey(today)]: { answered: 2, correct: 1 },
    [StudyHistory.dateKey(offsetDate(today, -2))]: { answered: 4, correct: 3 },
    [StudyHistory.dateKey(offsetDate(today, -15))]: { answered: 8, correct: 8 },
  };
  assert.deepEqual(StudyHistory.recentDays(days, today, 14), [
    { key: '2026-11-20', answered: 2, correct: 1 },
    { key: '2026-11-18', answered: 4, correct: 3 },
  ]);
});
