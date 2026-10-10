export const en = {
  'app.title': 'Big Brain Zero',
  'app.tagline': 'The dumber you are, the more you win.',

  'home.play': 'Play dumb',
  'home.best': 'Lowest IQ: {iq}',
  'home.noBest': 'No IQ yet. Suspicious.',
  'home.played': 'Games played: {count}',
  'home.rules':
    'Wrong answers score. Absurd answers score more. Slow is good. Pressing forbidden buttons is great. Lowest IQ wins.',

  'play.progress': 'Challenge {n} / {total}',
  'play.points': '{points} stupidity points',

  'quiz.prompt': 'Pick the DUMBEST answer',

  'button.label': 'DO NOT PRESS',
  'button.prompt': 'Whatever you do, do NOT press the button.',
  'button.presses': 'Presses: {count}',
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

  'result.title': 'Your IQ',
  'result.score': '{score} / {max} stupidity points',
  'result.newBest': 'NEW LOWEST IQ! Your family must be so proud.',
  'result.again': 'Be dumber',
  'result.home': 'Home',

  'rank.potato': 'Supreme Potato 🥔 — legendary stupidity. You win!',
  'rank.goofball': 'Professional Goofball 🤡 — very impressive.',
  'rank.chicken': 'Confused Chicken 🐔 — getting there.',
  'rank.normal': 'Dangerously Normal 😐 — keep practising.',
  'rank.genius': 'Ugh, a Genius 🤓 — you lose.',

  'settings.title': 'Settings',
  'settings.haptics': 'Vibration',
  'settings.language': 'Language',
  'settings.reset': 'Reset stats',
  'settings.resetConfirmTitle': 'Reset your stats?',
  'settings.resetConfirmBody':
    'Your lowest IQ and games played will be forgotten.',
  'settings.cancel': 'Cancel',
  'settings.confirmReset': 'Reset',
  'settings.version': 'Version {version}',
} as const;

export type TranslationKey = keyof typeof en;
