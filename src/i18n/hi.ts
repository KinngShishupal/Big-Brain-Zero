import type { TranslationKey } from './en';

export const hi: Record<TranslationKey, string> = {
  'app.title': 'कॉल मी डंब',
  'app.tagline': 'जितने बुद्धू, उतनी जीत।',

  'home.play': 'चलो बुद्धू बनें',
  'home.best': 'सबसे कम IQ: {iq}',
  'home.noBest': 'अभी तक कोई IQ नहीं। शक़ है।',
  'home.played': 'खेले गए खेल: {count}',

  'howTo.title': 'कैसे खेलें',
  'howTo.dumb':
    'बुद्धू बनो। ग़लत जवाब पर अंक मिलते हैं। जितना बेतुका, उतना बढ़िया।',
  'howTo.smart': 'सही जवाब दिया तो खेल ख़त्म। सच में, होशियारी मत दिखाना।',
  'howTo.slow': 'धीमा होना अच्छा है। जल्दबाज़ी जीनियस करते हैं।',
  'howTo.rules': 'बड़े लाल अक्षरों में नियम? तोड़ दो।',
  'howTo.win': 'सबसे कम IQ जीतता है।',
  'howTo.go': 'समझ गया, चलो बुद्धू बनें',
  'home.bestLabel': 'सबसे कम IQ',
  'home.lowerIsBetter': 'जितना कम, उतना बढ़िया।',

  'play.progress': 'चुनौती {n} / {total}',
  'play.points': '{points} बुद्धूपन अंक',

  'button.label': 'मत दबाओ',
  'button.prompt': 'कुछ भी करो, बटन मत दबाना।',
  'button.presses': 'दबाया: {count}',
  'button.pressesLabel': 'बार दबाया',
  'button.time': '{seconds} सेकंड बचे',

  'reaction.prompt': 'हरा होते ही टैप करें!',
  'reaction.wait': 'हरे का इंतज़ार…',
  'reaction.go': 'हरा! (कोई जल्दी नहीं)',

  'count.prompt': 'कितनी मुर्गियाँ हैं?',
  'count.submit': 'यही बिल्कुल सही है',

  'verdict.smart': 'छी। ये तो समझदारी थी।',
  'verdict.meh': 'काफ़ी बुद्धू नहीं। और कोशिश करो। या कम।',
  'verdict.dumb': 'क्या ख़ूबसूरत बेवकूफ़ी!',
  'verdict.peak': 'बुद्धूपन का शिखर 🏆',
  'verdict.continue': 'आगे',

  'gameOver.title1': '🚨 दिमाग़ पकड़ा गया!',
  'gameOver.body1':
    'सिक्योरिटी को बुला लिया है। वीडियो देखो और अपना बुद्धूपन वापस पाओ।',
  'gameOver.title2': 'छी, तुम तो होशियार निकले।',
  'gameOver.body2':
    'ज़्यादा होशियारी किसी को पसंद नहीं। वीडियो देखो और सब भूल जाओ।',
  'gameOver.title3': 'आइंस्टीन आ गए!',
  'gameOver.body3':
    'कृपया बाहर जाइए। वीडियो देखकर IQ घटाइए और फिर से कोशिश कीजिए।',
  'gameOver.title4': 'अरे! तुमने दिमाग़ लगा दिया।',
  'gameOver.body4':
    'यही तो एक नियम था। वीडियो देखो, हम मान लेंगे कुछ हुआ ही नहीं।',
  'gameOver.title5': 'टीचर को गर्व होगा। हमें नहीं।',
  'gameOver.body5': 'वीडियो देखकर अपनी गलती सुधारो, पढ़ाकू।',
  'gameOver.title6': 'सही जवाब?! इस ज़माने में?',
  'gameOver.body6': 'किसी के देखने से पहले वीडियो देखकर दोबारा खेलो।',
  'gameOver.retry': 'वीडियो देखकर दोबारा खेलें',
  'gameOver.loading': 'वीडियो लोड हो रहा है…',
  'gameOver.end': 'खेल ख़त्म करें',

  'result.title': 'आपका IQ',
  'result.score': '{score} / {max} बुद्धूपन अंक',
  'result.gameOver': 'चुनौती {n} पर खेल ख़त्म: दिमाग़ इस्तेमाल करते पकड़े गए।',
  'result.newBest': 'अब तक का सबसे कम IQ! घरवालों को गर्व होगा।',
  'result.again': 'और बुद्धू बनो',
  'result.doubleAd': 'विज्ञापन देखो, बुद्धूपन दोगुना करो',
  'result.adLoading': 'विज्ञापन लोड हो रहा है…',
  'result.doubled': 'बुद्धूपन दोगुना! 🎬',
  'result.home': 'होम',

  'rank.potato': 'महा आलू 🥔 — महान बेवकूफ़ी। आप जीते!',
  'rank.goofball': 'पेशेवर जोकर 🤡 — बहुत बढ़िया।',
  'rank.chicken': 'उलझी मुर्गी 🐔 — पहुँच रहे हो।',
  'rank.normal': 'ख़तरनाक रूप से नॉर्मल 😐 — अभ्यास जारी रखो।',
  'rank.genius': 'उफ़, जीनियस 🤓 — आप हार गए।',

  'settings.title': 'सेटिंग्स',
  'settings.haptics': 'कंपन',
  'settings.music': 'संगीत',
  'settings.sound': 'साउंड इफ़ेक्ट',
  'settings.language': 'भाषा',
  'settings.reset': 'आँकड़े रीसेट करें',
  'settings.privacy': 'गोपनीयता और विज्ञापन विकल्प',
  'settings.resetConfirmTitle': 'आँकड़े रीसेट करें?',
  'settings.resetConfirmBody':
    'आपका सबसे कम IQ और खेले गए खेल भुला दिए जाएंगे।',
  'settings.cancel': 'रद्द करें',
  'settings.confirmReset': 'रीसेट',
  'settings.version': 'संस्करण {version}',
};
