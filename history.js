(function (root) {
  function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function currentStreak(days, today = new Date()) {
    const cursor = new Date(today);
    if (!days[dateKey(cursor)]?.answered) cursor.setDate(cursor.getDate() - 1);
    let count = 0;
    while (days[dateKey(cursor)]?.answered) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }

  function summarize(days) {
    const entries = Object.values(days).filter((day) => day && typeof day === 'object');
    return {
      answered: entries.reduce((sum, day) => sum + (Number(day.answered) || 0), 0),
      correct: entries.reduce((sum, day) => sum + (Number(day.correct) || 0), 0),
      studyDays: entries.filter((day) => Number(day.answered) > 0).length,
    };
  }

  function recentDays(days, today = new Date(), count = 14) {
    const cursor = new Date(today);
    const recent = [];
    for (let i = 0; i < count; i++) {
      const key = dateKey(cursor);
      const day = days[key];
      if (day && Number(day.answered) > 0) recent.push({ key, answered: Number(day.answered), correct: Number(day.correct) || 0 });
      cursor.setDate(cursor.getDate() - 1);
    }
    return recent;
  }

  root.StudyHistory = { dateKey, currentStreak, summarize, recentDays };
})(window);
