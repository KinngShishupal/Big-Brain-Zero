export const en = {
  'app.title': 'Call Me Dumb',
  'app.tagline': 'The dumber you are, the more you win.',

  'home.play': "Let's Get Dumb",
  'home.best': 'Lowest IQ: {iq}',
  'home.noBest': 'No IQ yet. Suspicious.',
  'home.played': 'Games played: {count}',

  'howTo.title': 'How to play',
  'howTo.dumb':
    'Be dumb. Wrong answers win points. The more ridiculous, the better.',
  'howTo.smart': 'A correct answer ends the game. Seriously, do not be smart.',
  'howTo.slow': 'Slow is good. Rushing is for geniuses.',
  'howTo.rules': 'Rules in big red letters? Break them.',
  'howTo.win': 'Lowest IQ wins.',
  'howTo.go': "Got it, let's be dumb",
  'home.bestLabel': 'Lowest IQ',
  'home.lowerIsBetter': 'Lower is better. Obviously.',

  'play.progress': 'Challenge {n} / {total}',
  'play.points': '{points} stupidity points',

  'button.label': 'DO NOT PRESS',
  'button.prompt': 'Whatever you do, do NOT press the button.',
  'button.presses': 'Presses: {count}',
  'button.pressesLabel': 'presses',
  'button.time': '{seconds}s left',

  'reaction.prompt': 'Tap when it turns green!',
  'reaction.wait': 'Wait for green…',
  'reaction.go': 'GREEN! (no rush)',

  'count.prompt': 'How many chickens?',
  'count.submit': 'This is definitely right',

  'verdict.smart': 'Ugh. Smart. Gross.',
  'verdict.meh1': 'Meh. Your brain is clearly still working.',
  'verdict.meh2': 'Only mildly stupid. We expected worse from you.',
  'verdict.meh3': 'A tiny bit dumb. Like, decaf dumb.',
  'verdict.meh4': 'Close, but we can still smell the intelligence.',
  'verdict.dumb1': 'Beautifully dumb! Your teachers are crying.',
  'verdict.dumb2': 'Wow. Not a single brain cell was harmed.',
  'verdict.dumb3': "Chef's kiss. Absolutely brainless.",
  'verdict.dumb4': 'Your brain just left the chat. Nice!',
  'verdict.peak1': 'PEAK STUPIDITY 🏆 Scientists want to study you.',
  'verdict.peak2': "LEGENDARY 🥔 A potato just called you 'bro'.",
  'verdict.peak3': '100% DUMB 🏆 Your brain is on airplane mode.',
  'verdict.peak4': 'FLAWLESS 🤡 Even the chickens are impressed.',
  'verdict.continue': 'Keep it dumb',

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
