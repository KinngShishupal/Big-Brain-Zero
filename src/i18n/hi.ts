import type { TranslationKey } from './en';

export const hi: Record<TranslationKey, string> = {
  'app.title': 'कॉल मी डंब',
  'app.tagline': 'जितने बुद्धू, उतनी जीत।',

  'home.play': 'बुद्धू बनो',
  'home.best': 'सबसे कम IQ: {iq}',
  'home.noBest': 'अभी तक कोई IQ नहीं। शक़ है।',
  'home.played': 'खेले गए खेल: {count}',
  'home.bestLabel': 'सबसे कम IQ',
  'home.lowerIsBetter': 'जितना कम, उतना बढ़िया।',
  'home.rules':
    'ग़लत जवाब पर अंक। बेतुके जवाब पर और ज़्यादा। धीमा होना अच्छा है। मना किया बटन दबाना शानदार है। सबसे कम IQ जीतता है।',

  'play.progress': 'चुनौती {n} / {total}',
  'play.points': '{points} बुद्धूपन अंक',

  'quiz.prompt': 'सबसे बेवकूफ़ी भरा जवाब चुनें',

  'button.label': 'मत दबाओ',
  'button.prompt': 'कुछ भी करो, बटन मत दबाना।',
  'button.presses': 'दबाया: {count}',
  'button.pressesLabel': 'बार दबाया',
  'button.time': '{seconds} सेकंड बचे',

  'reaction.prompt': 'हरा होने पर टैप करें। या मत करें। आराम से।',
  'reaction.wait': 'हरे का इंतज़ार…',
  'reaction.go': 'हरा! (कोई जल्दी नहीं)',

  'count.prompt': 'कितनी मुर्गियाँ हैं? जितना ग़लत हो सके।',
  'count.submit': 'यही बिल्कुल सही है',

  'verdict.smart': 'छी। ये तो समझदारी थी।',
  'verdict.meh': 'काफ़ी बुद्धू नहीं। और कोशिश करो। या कम।',
  'verdict.dumb': 'क्या ख़ूबसूरत बेवकूफ़ी!',
  'verdict.peak': 'बुद्धूपन का शिखर 🏆',
  'verdict.continue': 'आगे',

  'result.title': 'आपका IQ',
  'result.score': '{score} / {max} बुद्धूपन अंक',
  'result.newBest': 'अब तक का सबसे कम IQ! घरवालों को गर्व होगा।',
  'result.again': 'और बुद्धू बनो',
  'result.home': 'होम',

  'rank.potato': 'महा आलू 🥔 — महान बेवकूफ़ी। आप जीते!',
  'rank.goofball': 'पेशेवर जोकर 🤡 — बहुत बढ़िया।',
  'rank.chicken': 'उलझी मुर्गी 🐔 — पहुँच रहे हो।',
  'rank.normal': 'ख़तरनाक रूप से नॉर्मल 😐 — अभ्यास जारी रखो।',
  'rank.genius': 'उफ़, जीनियस 🤓 — आप हार गए।',

  'settings.title': 'सेटिंग्स',
  'settings.haptics': 'कंपन',
  'settings.language': 'भाषा',
  'settings.reset': 'आँकड़े रीसेट करें',
  'settings.resetConfirmTitle': 'आँकड़े रीसेट करें?',
  'settings.resetConfirmBody':
    'आपका सबसे कम IQ और खेले गए खेल भुला दिए जाएंगे।',
  'settings.cancel': 'रद्द करें',
  'settings.confirmReset': 'रीसेट',
  'settings.version': 'संस्करण {version}',
};
