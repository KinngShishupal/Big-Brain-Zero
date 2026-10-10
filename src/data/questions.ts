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
  {
    id: 'fingers',
    en: 'How many fingers are on one hand?',
    hi: 'एक हाथ में कितनी उंगलियाँ होती हैं?',
    answers: [
      a('5', '5', 0),
      a('4', '4', 1),
      a('11', '11', 2),
      a("Depends on the hand's mood", 'हाथ के मूड पर निर्भर है', 3),
    ],
  },
  {
    id: 'fish',
    en: 'Where do fish live?',
    hi: 'मछलियाँ कहाँ रहती हैं?',
    answers: [
      a('In water', 'पानी में', 0),
      a('In trees', 'पेड़ों पर', 1),
      a('In the fridge', 'फ्रिज में', 2),
      a('In my DMs', 'मेरे DMs में', 3),
    ],
  },
  {
    id: 'banana',
    en: 'What colour is a ripe banana?',
    hi: 'पका हुआ केला किस रंग का होता है?',
    answers: [
      a('Yellow', 'पीला', 0),
      a('Blue', 'नीला', 1),
      a('Transparent', 'पारदर्शी', 2),
      a('Loud', 'ज़ोरदार', 3),
    ],
  },
  {
    id: 'sunhot',
    en: 'Is the sun hot or cold?',
    hi: 'सूरज गर्म है या ठंडा?',
    answers: [
      a('Hot', 'गर्म', 0),
      a('Cold', 'ठंडा', 1),
      a('Room temperature', 'कमरे के तापमान जितना', 2),
      a("It's just shy", 'वो बस शर्मीला है', 3),
    ],
  },
  {
    id: 'brush',
    en: 'What do you brush every morning?',
    hi: 'आप हर सुबह क्या ब्रश करते हैं?',
    answers: [
      a('Your teeth', 'अपने दाँत', 0),
      a('Your shoes', 'अपने जूते', 1),
      a('The cat', 'बिल्ली को', 2),
      a('Your excuses', 'अपने बहाने', 3),
    ],
  },
  {
    id: 'rain',
    en: 'What falls from clouds when it rains?',
    hi: 'बारिश में बादलों से क्या गिरता है?',
    answers: [
      a('Water', 'पानी', 0),
      a('Sand', 'रेत', 1),
      a('Spaghetti', 'नूडल्स', 2),
      a('Cats and dogs, literally', 'सच में बिल्लियाँ और कुत्ते', 3),
    ],
  },
  {
    id: 'woof',
    en: 'What sound does a dog make?',
    hi: 'कुत्ता कैसी आवाज़ करता है?',
    answers: [
      a('Woof', 'भौं-भौं', 0),
      a('Meow', 'म्याऊँ', 1),
      a('Beep boop', 'बीप-बूप', 2),
      a('"Hello, how are you?"', '"नमस्ते, कैसे हो?"', 3),
    ],
  },
  {
    id: 'months',
    en: 'How many months are in a year?',
    hi: 'एक साल में कितने महीने होते हैं?',
    answers: [
      a('12', '12', 0),
      a('10', '10', 1),
      a('52', '52', 2),
      a('Purple', 'बैंगनी', 3),
    ],
  },
  {
    id: 'fruit',
    en: 'Which of these is a fruit?',
    hi: 'इनमें से फल कौन सा है?',
    answers: [
      a('Apple', 'सेब', 0),
      a('Potato', 'आलू', 1),
      a('Brick', 'ईंट', 2),
      a('The Wi-Fi password', 'वाई-फ़ाई का पासवर्ड', 3),
    ],
  },
  {
    id: 'sleep',
    en: 'Where do you usually sleep?',
    hi: 'आप आमतौर पर कहाँ सोते हैं?',
    answers: [
      a('In bed', 'बिस्तर पर', 0),
      a('In the bathtub', 'बाथटब में', 1),
      a('On the ceiling', 'छत पर उल्टा', 2),
      a('In meetings', 'मीटिंग में', 3),
    ],
  },
  {
    id: 'shoes',
    en: 'Where do shoes go?',
    hi: 'जूते कहाँ पहने जाते हैं?',
    answers: [
      a('On your feet', 'पैरों में', 0),
      a('On your hands', 'हाथों में', 1),
      a('In the soup', 'सूप में', 2),
      a('On the ceiling fan', 'छत के पंखे पर', 3),
    ],
  },
  {
    id: 'milk',
    en: 'Where does milk come from?',
    hi: 'दूध कहाँ से आता है?',
    answers: [
      a('Cows', 'गाय से', 0),
      a('Clouds', 'बादलों से', 1),
      a('The milk tree', 'दूध के पेड़ से', 2),
      a('Secret milk mines', 'गुप्त दूध की खदानों से', 3),
    ],
  },
  {
    id: 'triangle',
    en: 'How many sides does a triangle have?',
    hi: 'त्रिभुज की कितनी भुजाएँ होती हैं?',
    answers: [
      a('3', '3', 0),
      a('4', '4', 1),
      a('7', '7', 2),
      a('None. It has feelings.', 'कोई नहीं। उसकी भावनाएँ हैं।', 3),
    ],
  },
  {
    id: 'snow',
    en: 'What colour is snow?',
    hi: 'बर्फ़ किस रंग की होती है?',
    answers: [
      a('White', 'सफ़ेद', 0),
      a('Green', 'हरी', 1),
      a('Polka-dot', 'बिंदियों वाली', 2),
      a('Depends on your attitude', 'आपके रवैये पर निर्भर है', 3),
    ],
  },
  {
    id: 'hours',
    en: 'How many hours are in a day?',
    hi: 'एक दिन में कितने घंटे होते हैं?',
    answers: [
      a('24', '24', 0),
      a('12', '12', 1),
      a('100', '100', 2),
      a('Not enough for naps', 'झपकी के लिए कम', 3),
    ],
  },
  {
    id: 'moon',
    en: 'What shines in the sky at night?',
    hi: 'रात को आसमान में क्या चमकता है?',
    answers: [
      a('The moon', 'चाँद', 0),
      a("The sun's cousin", 'सूरज का चचेरा भाई', 1),
      a('A giant torch', 'एक बड़ी टॉर्च', 2),
      a("The neighbour's TV", 'पड़ोसी का टीवी', 3),
    ],
  },
  {
    id: 'eyes',
    en: 'What do you see with?',
    hi: 'आप किससे देखते हैं?',
    answers: [
      a('Your eyes', 'आँखों से', 0),
      a('Your ears', 'कानों से', 1),
      a('Your elbows', 'कोहनियों से', 2),
      a('Pure confidence', 'सिर्फ़ आत्मविश्वास से', 3),
    ],
  },
  {
    id: 'kettle',
    en: 'What do you use to boil water?',
    hi: 'पानी उबालने के लिए क्या इस्तेमाल करते हैं?',
    answers: [
      a('A kettle', 'केतली', 0),
      a('A sock', 'मोज़ा', 1),
      a('A balloon', 'गुब्बारा', 2),
      a('Positive thinking', 'पॉज़िटिव सोच', 3),
    ],
  },
  {
    id: 'wings',
    en: 'What do birds use to fly?',
    hi: 'पक्षी उड़ने के लिए क्या इस्तेमाल करते हैं?',
    answers: [
      a('Wings', 'पंख', 0),
      a('Legs', 'पैर', 1),
      a('Tiny jetpacks', 'छोटे जेटपैक', 2),
      a('Government funding', 'सरकारी फ़ंड', 3),
    ],
  },
  {
    id: 'opposite',
    en: 'What is the opposite of hot?',
    hi: 'गर्म का उल्टा क्या है?',
    answers: [
      a('Cold', 'ठंडा', 0),
      a('Warm', 'गुनगुना', 1),
      a('Spicy', 'तीखा', 2),
      a('Tuesday', 'मंगलवार', 3),
    ],
  },
  {
    id: 'alphabet',
    en: 'What is the first letter of the English alphabet?',
    hi: 'अंग्रेज़ी वर्णमाला का पहला अक्षर कौन सा है?',
    answers: [
      a('A', 'A', 0),
      a('Z', 'Z', 1),
      a('7', '7', 2),
      a('Ahem', 'अहम्', 3),
    ],
  },
  {
    id: 'grass',
    en: 'What colour is grass?',
    hi: 'घास किस रंग की होती है?',
    answers: [
      a('Green', 'हरी', 0),
      a('Orange', 'नारंगी', 1),
      a('Invisible', 'अदृश्य', 2),
      a('Touch it and find out', 'छूकर पता करो', 3),
    ],
  },
  {
    id: 'flag',
    en: "How many coloured stripes are on India's flag?",
    hi: 'भारत के झंडे में कितनी रंगीन पट्टियाँ हैं?',
    answers: [
      a('3', '3', 0),
      a('7', '7', 1),
      a('1', '1', 2),
      a('All of them', 'सारे रंग', 3),
    ],
  },
  {
    id: 'cricket',
    en: 'How many players does a cricket team have on the field?',
    hi: 'मैदान पर क्रिकेट टीम के कितने खिलाड़ी होते हैं?',
    answers: [
      a('11', '11', 0),
      a('5', '5', 1),
      a('100', '100', 2),
      a('Just one very fast guy', 'बस एक बहुत तेज़ लड़का', 3),
    ],
  },
  {
    id: 'letter',
    en: 'Where do you drop a letter to post it?',
    hi: 'चिट्ठी भेजने के लिए उसे कहाँ डालते हैं?',
    answers: [
      a('In a post box', 'लेटर बॉक्स में', 0),
      a('In the microwave', 'माइक्रोवेव में', 1),
      a('In a fish tank', 'मछली के टैंक में', 2),
      a('In your pocket, then hope', 'जेब में डालकर उम्मीद रखो', 3),
    ],
  },
  {
    id: 'chai',
    en: 'What is chai made with?',
    hi: 'चाय किससे बनती है?',
    answers: [
      a('Tea leaves', 'चाय पत्ती से', 0),
      a('Gravel', 'बजरी से', 1),
      a('Shampoo', 'शैम्पू से', 2),
      a('Vibes and gossip', 'गपशप और माहौल से', 3),
    ],
  },
  {
    id: 'chess',
    en: 'How many players are in a game of chess?',
    hi: 'शतरंज के खेल में कितने खिलाड़ी होते हैं?',
    answers: [
      a('2', '2', 0),
      a('1', '1', 1),
      a('22', '22', 2),
      a('The whole family, arguing', 'पूरा परिवार, बहस करते हुए', 3),
    ],
  },
  {
    id: 'tiger',
    en: "What is India's national animal?",
    hi: 'भारत का राष्ट्रीय पशु कौन सा है?',
    answers: [
      a('Tiger', 'बाघ', 0),
      a('Peacock', 'मोर', 1),
      a('Goldfish', 'सुनहरी मछली', 2),
      a('My cousin', 'मेरा चचेरा भाई', 3),
    ],
  },
  {
    id: 'boil',
    en: 'At what temperature does water boil at sea level?',
    hi: 'समुद्र तल पर पानी कितने तापमान पर उबलता है?',
    answers: [
      a('100°C', '100°C', 0),
      a('10°C', '10°C', 1),
      a('1,000°C', '1,000°C', 2),
      a("When it's angry", 'जब उसे ग़ुस्सा आए', 3),
    ],
  },
  {
    id: 'eat',
    en: 'What do you eat with?',
    hi: 'आप किससे खाते हैं?',
    answers: [
      a('Your mouth', 'मुँह से', 0),
      a('Your nose', 'नाक से', 1),
      a('Your elbow', 'कोहनी से', 2),
      a('Your phone', 'फ़ोन से', 3),
    ],
  },
  {
    id: 'freezer',
    en: 'What happens to water in the freezer?',
    hi: 'फ़्रीज़र में पानी का क्या होता है?',
    answers: [
      a('It freezes', 'जम जाता है', 0),
      a('It boils', 'उबल जाता है', 1),
      a('It turns into juice', 'जूस बन जाता है', 2),
      a('It files a complaint', 'शिकायत दर्ज करता है', 3),
    ],
  },
  {
    id: 'raincoat',
    en: 'What do you wear when it rains?',
    hi: 'बारिश में आप क्या पहनते हैं?',
    answers: [
      a('A raincoat', 'रेनकोट', 0),
      a('A swimsuit', 'स्विमसूट', 1),
      a('A cardboard box', 'गत्ते का डिब्बा', 2),
      a('Your best smile', 'अपनी सबसे अच्छी मुस्कान', 3),
    ],
  },
  {
    id: 'ten',
    en: 'Which number comes after 9?',
    hi: '9 के बाद कौन सी संख्या आती है?',
    answers: [
      a('10', '10', 0),
      a('8', '8', 1),
      a('99', '99', 2),
      a('Nein', 'नाइन… नहीं, नौ', 3),
    ],
  },
  {
    id: 'trees',
    en: 'What do trees give us?',
    hi: 'पेड़ हमें क्या देते हैं?',
    answers: [
      a('Oxygen', 'ऑक्सीजन', 0),
      a('Smoke', 'धुआँ', 1),
      a('Free Wi-Fi', 'मुफ़्त वाई-फ़ाई', 2),
      a('Bad advice', 'बुरी सलाह', 3),
    ],
  },
];
