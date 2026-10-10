/**
 * Quiz questions. Each answer has a `dumb` rating:
 *   0 = correct (worth nothing — how embarrassing)
 *   1 = wrong, 2 = very wrong, 3 = gloriously absurd (full points)
 * Every question needs exactly one answer of each rating (checked by tests).
 */
export interface Answer {
  en: string;
  hi: string;
  dumb: 0 | 1 | 2 | 3;
}

export interface Question {
  id: string;
  en: string;
  hi: string;
  answers: [Answer, Answer, Answer, Answer];
}

const a = (en: string, hi: string, dumb: Answer['dumb']): Answer => ({
  en,
  hi,
  dumb,
});

export const QUESTIONS: readonly Question[] = [
  {
    id: 'sky',
    en: 'What colour is the sky on a clear day?',
    hi: 'साफ़ दिन में आसमान किस रंग का होता है?',
    answers: [
      a('Blue', 'नीला', 0),
      a('Green', 'हरा', 1),
      a('Plaid', 'चेकदार', 2),
      a("It's not a colour, it's a vibe", 'रंग नहीं, बस एक फीलिंग है', 3),
    ],
  },
  {
    id: 'math',
    en: '2 + 2 = ?',
    hi: '2 + 2 = ?',
    answers: [
      a('4', '4', 0),
      a('5', '5', 1),
      a('22', '22', 2),
      a('Fish', 'मछली', 3),
    ],
  },
  {
    id: 'moo',
    en: 'Which animal says "moo"?',
    hi: 'कौन सा जानवर "मूँ" बोलता है?',
    answers: [
      a('Cow', 'गाय', 0),
      a('Dog', 'कुत्ता', 1),
      a('Your uncle', 'आपके चाचा', 2),
      a('A refrigerator', 'फ्रिज', 3),
    ],
  },
  {
    id: 'spider',
    en: 'How many legs does a spider have?',
    hi: 'मकड़ी के कितने पैर होते हैं?',
    answers: [
      a('8', '8', 0),
      a('6', '6', 1),
      a('100', '100', 2),
      a('Spiders are just angry raisins', 'मकड़ी तो बस गुस्सैल किशमिश है', 3),
    ],
  },
  {
    id: 'hydrate',
    en: 'What should you drink to stay hydrated?',
    hi: 'शरीर में पानी बनाए रखने के लिए क्या पीना चाहिए?',
    answers: [
      a('Water', 'पानी', 0),
      a('Juice', 'जूस', 1),
      a('Ketchup', 'केचप', 2),
      a('Pure Wi-Fi', 'शुद्ध वाई-फ़ाई', 3),
    ],
  },
  {
    id: 'sunrise',
    en: 'Where does the sun rise?',
    hi: 'सूरज कहाँ से उगता है?',
    answers: [
      a('East', 'पूर्व', 0),
      a('West', 'पश्चिम', 1),
      a('Inside the fridge', 'फ्रिज के अंदर', 2),
      a("It doesn't. It's a hologram.", 'उगता ही नहीं, वो होलोग्राम है', 3),
    ],
  },
  {
    id: 'ice',
    en: 'What is ice made of?',
    hi: 'बर्फ़ किससे बनती है?',
    answers: [
      a('Frozen water', 'जमा हुआ पानी', 0),
      a('Glass', 'काँच', 1),
      a('Cold air', 'ठंडी हवा', 2),
      a('Shy water', 'शर्मीला पानी', 3),
    ],
  },
  {
    id: 'week',
    en: 'How many days are in a week?',
    hi: 'एक हफ़्ते में कितने दिन होते हैं?',
    answers: [
      a('7', '7', 0),
      a('5', '5', 1),
      a('Tuesday', 'मंगलवार', 2),
      a('Banana', 'केला', 3),
    ],
  },
  {
    id: 'bees',
    en: 'What do bees make?',
    hi: 'मधुमक्खियाँ क्या बनाती हैं?',
    answers: [
      a('Honey', 'शहद', 0),
      a('Milk', 'दूध', 1),
      a('Tiny cars', 'छोटी गाड़ियाँ', 2),
      a('Podcasts', 'पॉडकास्ट', 3),
    ],
  },
  {
    id: 'heavier',
    en: 'Which is heavier: 1 kg of iron or 1 kg of feathers?',
    hi: 'क्या भारी है: 1 किलो लोहा या 1 किलो पंख?',
    answers: [
      a('They weigh the same', 'दोनों बराबर', 0),
      a('Iron', 'लोहा', 1),
      a('Feathers', 'पंख', 2),
      a('My homework', 'मेरा होमवर्क', 3),
    ],
  },
  {
    id: 'scissors',
    en: 'What do you use to cut paper?',
    hi: 'काग़ज़ काटने के लिए क्या इस्तेमाल करते हैं?',
    answers: [
      a('Scissors', 'कैंची', 0),
      a('A spoon', 'चम्मच', 1),
      a('Strong eye contact', 'घूरकर देखना', 2),
      a('My feelings', 'मेरी भावनाएँ', 3),
    ],
  },
  {
    id: 'capital',
    en: 'What is the capital of India?',
    hi: 'भारत की राजधानी क्या है?',
    answers: [
      a('New Delhi', 'नई दिल्ली', 0),
      a('Mumbai', 'मुंबई', 1),
      a('The letter "I"', 'अक्षर "I"', 2),
      a('Samosa', 'समोसा', 3),
    ],
  },
  {
    id: 'redlight',
    en: 'What do you do at a red traffic light?',
    hi: 'लाल बत्ती पर क्या करते हैं?',
    answers: [
      a('Stop', 'रुकते हैं', 0),
      a('Speed up', 'तेज़ चलाते हैं', 1),
      a('Dance', 'नाचते हैं', 2),
      a(
        'Wait for it to become a strawberry',
        'उसके स्ट्रॉबेरी बनने का इंतज़ार',
        3,
      ),
    ],
  },
  {
    id: 'kitten',
    en: 'What is a baby cat called?',
    hi: 'बिल्ली के बच्चे को क्या कहते हैं?',
    answers: [
      a('Kitten', 'बिलौटा', 0),
      a('Puppy', 'पिल्ला', 1),
      a('Mini lion', 'मिनी शेर', 2),
      a('Cat 2.0 Beta', 'बिल्ली 2.0 बीटा', 3),
    ],
  },
  {
    id: 'door',
    en: 'How do you open a door?',
    hi: 'दरवाज़ा कैसे खोलते हैं?',
    answers: [
      a('Turn the handle', 'हैंडल घुमाकर', 0),
      a('Push the wall', 'दीवार धकेलकर', 1),
      a('Ask it nicely', 'प्यार से पूछकर', 2),
      a('Lick it', 'चाटकर', 3),
    ],
  },
  {
    id: 'planet',
    en: 'Which planet do we live on?',
    hi: 'हम किस ग्रह पर रहते हैं?',
    answers: [
      a('Earth', 'पृथ्वी', 0),
      a('Mars', 'मंगल', 1),
      a('Planet Fitness', 'प्लैनेट फ़िटनेस', 2),
      a('A big flat pizza', 'एक बड़ा चपटा पिज़्ज़ा', 3),
    ],
  },
];
