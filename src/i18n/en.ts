export const en = {
  'app.title': 'Call Me Dumb',
  'app.tagline': 'The dumber you are, the more you win.',

  'home.play': 'Play dumb',
  'home.best': 'Lowest IQ: {iq}',
  'home.noBest': 'No IQ yet. Suspicious.',
  'home.played': 'Games played: {count}',
  'home.bestLabel': 'Lowest IQ',
  'home.lowerIsBetter': 'Lower is better. Obviously.',
  'home.rules':
    'Wrong answers score. Absurd answers score more. Slow is good. Pressing forbidden buttons is great. Lowest IQ wins.',

  'play.progress': 'Challenge {n} / {total}',
  'play.points': '{points} stupidity points',

  'quiz.prompt': 'Pick the DUMBEST answer',

  'button.label': 'DO NOT PRESS',
  'button.prompt': 'Whatever you do, do NOT press the button.',
  'button.presses': 'Presses: {count}',
  'button.pressesLabel': 'presses',
  'button.time': '{seconds}s left',

  'reaction.prompt': 'Tap when it turns green. Or don’t. Take your time.',
  'reaction.wait': 'Wait for green…',
  'reaction.go': 'GREEN! (no rush)',

  'count.prompt': 'How many chickens? Be as wrong as possible.',
  'count.submit': 'This is definitely right',

  'verdict.smart': 'Ugh. That was smart. Disgusting.',
  'verdict.meh': 'Not dumb enough. Try harder. Or less.',
  'verdict.dumb': 'Beautifully dumb!',
  'verdict.peak': 'PEAK STUPIDITY 🏆',
  'verdict.continue': 'Next',

  'gameOver.title1': '🚨 BRAIN DETECTED!',
  'gameOver.body1':
    'Security has been notified. Watch a video to get your dumbness back.',
  'gameOver.title2': "Ew. You're smart.",
  'gameOver.body2':
    'Nobody likes a know-it-all. Watch a video to unlearn that.',
  'gameOver.title3': 'Einstein has entered the chat',
  'gameOver.body3':
    'Please leave. Watch a video to lower your IQ and try again.',
  'gameOver.title4': 'Oops. You used your brain.',
  'gameOver.body4':
    "That was literally the only rule. Watch a video and we'll pretend it never happened.",
  'gameOver.title5': "Your teacher would be proud. We're not.",
  'gameOver.body5': 'Watch a video to redeem yourself, nerd.',
  'gameOver.title6': 'Correct?! In THIS economy?',
  'gameOver.body6': 'Quick, watch a video to retry before anyone sees.',
  'gameOver.retry': 'Watch a video to retry',
  'gameOver.loading': 'Loading video…',
  'gameOver.end': 'End game',

  'result.title': 'Your IQ',
  'result.score': '{score} / {max} stupidity points',
  'result.gameOver': 'Game over on challenge {n}: caught using your brain.',
  'result.newBest': 'NEW LOWEST IQ! Your family must be so proud.',
  'result.again': 'Be dumber',
  'result.doubleAd': 'Watch an ad to double my stupidity',
  'result.adLoading': 'Loading ad…',
  'result.doubled': 'Stupidity doubled! 🎬',
  'result.home': 'Home',

  'rank.potato': 'Supreme Potato 🥔 — legendary stupidity. You win!',
  'rank.goofball': 'Professional Goofball 🤡 — very impressive.',
  'rank.chicken': 'Confused Chicken 🐔 — getting there.',
  'rank.normal': 'Dangerously Normal 😐 — keep practising.',
  'rank.genius': 'Ugh, a Genius 🤓 — you lose.',

  'settings.title': 'Settings',
  'settings.haptics': 'Vibration',
  'settings.music': 'Music',
  'settings.sound': 'Sound effects',
  'settings.language': 'Language',
  'settings.reset': 'Reset stats',
  'settings.privacy': 'Privacy and ad choices',
  'settings.resetConfirmTitle': 'Reset your stats?',
  'settings.resetConfirmBody':
    'Your lowest IQ and games played will be forgotten.',
  'settings.cancel': 'Cancel',
  'settings.confirmReset': 'Reset',
  'settings.version': 'Version {version}',
} as const;

export type TranslationKey = keyof typeof en;
