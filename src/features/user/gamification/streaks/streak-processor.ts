interface AllTimeWeeklyContribution {
  week: string;
  weekStart: string;
  totalQuantity: number;
  contributionCount: number;
  uniqueDays: number;
  fairteilerCount: number;
  categoryCount: number;
}

export const calculateUserAllTimeStreaks = (
  allWeeklyContributions: AllTimeWeeklyContribution[],
) => {
  if (allWeeklyContributions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalWeeksActive: 0,
      // ... other fields
    };
  }

  // Calculate current streak from the END of the data (most recent weeks)
  let currentStreak = 0;

  // Start from the most recent contribution and work backwards
  const reversedWeeks = [...allWeeklyContributions].reverse();

  // Get the current date to check if the most recent week is actually recent
  const now = new Date();
  const mostRecentWeekStart = new Date(reversedWeeks[0].weekStart);

  // Calculate how many weeks ago the most recent contribution was
  const weeksSinceLastContribution = Math.floor(
    (now.getTime() - mostRecentWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000),
  );

  // If the most recent contribution is more than 1 week old, streak is broken
  if (weeksSinceLastContribution > 1) {
    currentStreak = 0;
  } else {
    // Start counting the streak
    for (let i = 0; i < reversedWeeks.length; i++) {
      if (i === 0) {
        // First week (most recent) - counts since we passed the check above
        currentStreak = 1;
      } else {
        // Check if this week is consecutive with the previous week
        const currentWeekStart = new Date(reversedWeeks[i].weekStart);
        const previousWeekStart = new Date(reversedWeeks[i - 1].weekStart);

        // Calculate difference in weeks
        const weeksDiff = Math.round(
          (previousWeekStart.getTime() - currentWeekStart.getTime()) /
            (7 * 24 * 60 * 60 * 1000),
        );

        if (weeksDiff === 1) {
          // Consecutive weeks
          currentStreak++;
        } else {
          // Gap found, stop counting
          break;
        }
      }
    }
  }

  // Calculate longest streak (scan through all data)
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < allWeeklyContributions.length; i++) {
    const currentWeekStart = new Date(allWeeklyContributions[i].weekStart);
    const previousWeekStart = new Date(allWeeklyContributions[i - 1].weekStart);

    const weeksDiff = Math.round(
      (currentWeekStart.getTime() - previousWeekStart.getTime()) /
        (7 * 24 * 60 * 60 * 1000),
    );

    if (weeksDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    totalWeeksActive: allWeeklyContributions.length,
    // ... other stats
  };
};
