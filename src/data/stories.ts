export interface StoryScene {
  id: string;
  sceneNumber: number;
  englishText: string;
  vietnameseText: string;
  keywords: string[];
  backdropGradient: string;
  illustration: {
    mainEmoji: string;
    secondaryEmoji: string;
    sceneryEmojis: string[];
    bgElement: string;
  };
}

export interface StoryBook {
  id: string;
  level: number;
  title: string;
  vietnameseTitle: string;
  description: string;
  themeColor: string;
  coverEmoji: string;
  scenes: StoryScene[];
}

export const STORIES: StoryBook[] = [
  {
    id: 'story_lvl_1',
    level: 1,
    title: 'The Cat and The Friendly Dog',
    vietnameseTitle: 'Chú Mèo Nhỏ Và Bạn Cún Thân Thiện',
    description: 'Câu chuyện dễ thương về tình bạn giữa bạn Mèo và chú Cún con.',
    themeColor: 'from-amber-400 to-orange-500',
    coverEmoji: '🐱',
    scenes: [
      {
        id: 's1_1',
        sceneNumber: 1,
        englishText: 'Once upon a time, a little white cat lived in a green garden.',
        vietnameseText: 'Ngày xửa ngày xưa, có một bé mèo trắng sống trong một khu vườn xanh mát.',
        keywords: ['cat', 'green garden'],
        backdropGradient: 'from-emerald-200 via-teal-100 to-amber-100',
        illustration: {
          mainEmoji: '🐱',
          secondaryEmoji: '🌸',
          sceneryEmojis: ['🌳', '🌷', '🦋', '☀️'],
          bgElement: '🏡'
        }
      },
      {
        id: 's1_2',
        sceneNumber: 2,
        englishText: 'One sunny morning, the cat met a friendly brown dog.',
        vietnameseText: 'Vào một buổi sáng đầy nắng, bé mèo gặp một chú cún nâu thân thiện.',
        keywords: ['sunny', 'friendly dog'],
        backdropGradient: 'from-sky-200 via-amber-100 to-emerald-100',
        illustration: {
          mainEmoji: '🐶',
          secondaryEmoji: '🐱',
          sceneryEmojis: ['☀️', '🌼', '🎾', '🌾'],
          bgElement: '🌻'
        }
      },
      {
        id: 's1_3',
        sceneNumber: 3,
        englishText: 'A little bird sang sweetly on the high tree.',
        vietnameseText: 'Một chú chim nhỏ cất tiếng hót líu lo trên cành cây cao.',
        keywords: ['bird', 'tree'],
        backdropGradient: 'from-blue-200 via-sky-100 to-green-100',
        illustration: {
          mainEmoji: '🐦',
          secondaryEmoji: '🎶',
          sceneryEmojis: ['🌲', '🌿', '☁️', '🎈'],
          bgElement: '🌈'
        }
      },
      {
        id: 's1_4',
        sceneNumber: 4,
        englishText: 'They all became best friends and played happily together.',
        vietnameseText: 'Tất cả các bạn đã trở thành bạn thân và chơi đùa thật vui vẻ bên nhau.',
        keywords: ['friends', 'happily'],
        backdropGradient: 'from-pink-200 via-amber-100 to-yellow-100',
        illustration: {
          mainEmoji: '🐱',
          secondaryEmoji: '🐶',
          sceneryEmojis: ['🐦', '🐰', '💖', '✨'],
          bgElement: '🎉'
        }
      }
    ]
  },
  {
    id: 'story_lvl_2',
    level: 2,
    title: 'Colors of The Magic Rainbow',
    vietnameseTitle: 'Sắc Màu Của Chiếc Cầu Vồng Thần Tiên',
    description: 'Chuyến phiêu lưu khám phá những sắc màu rực rỡ trên bầu trời.',
    themeColor: 'from-rose-400 via-amber-400 to-cyan-500',
    coverEmoji: '🎨',
    scenes: [
      {
        id: 's2_1',
        sceneNumber: 1,
        englishText: 'Look at the bright blue sky above our magical town.',
        vietnameseText: 'Hãy nhìn lên bầu trời xanh biếc phía trên thị trấn thần tiên của chúng mình.',
        keywords: ['blue sky', 'magical'],
        backdropGradient: 'from-sky-300 via-blue-100 to-indigo-100',
        illustration: {
          mainEmoji: '☁️',
          secondaryEmoji: '☀️',
          sceneryEmojis: ['🏰', '🕊️', '✨', '🎈'],
          bgElement: '🌤️'
        }
      },
      {
        id: 's2_2',
        sceneNumber: 2,
        englishText: 'The warm yellow sun shines over red juicy apples.',
        vietnameseText: 'Mặt trời vàng ấm áp chiếu sáng những quả táo đỏ mọng nước.',
        keywords: ['yellow sun', 'red apples'],
        backdropGradient: 'from-amber-200 via-yellow-100 to-rose-100',
        illustration: {
          mainEmoji: '🍎',
          secondaryEmoji: '☀️',
          sceneryEmojis: ['🍏', '🍓', '🌿', '🐝'],
          bgElement: '🧺'
        }
      },
      {
        id: 's2_3',
        sceneNumber: 3,
        englishText: 'Two green butterflies dance across the blooming flowers.',
        vietnameseText: 'Hai chú bướm xanh lá cùng nhau múa lượn qua những bông hoa khoe sắc.',
        keywords: ['two', 'green butterflies'],
        backdropGradient: 'from-emerald-200 via-teal-100 to-purple-100',
        illustration: {
          mainEmoji: '🦋',
          secondaryEmoji: '🌸',
          sceneryEmojis: ['🌺', '🌼', '✨', '🍃'],
          bgElement: '🌈'
        }
      }
    ]
  },
  {
    id: 'story_lvl_3',
    level: 3,
    title: 'A Warm Day with Family',
    vietnameseTitle: 'Một Ngày Ấm Áp Cùng Gia Đình',
    description: 'Những nụ cười hạnh phúc và tình cảm yêu thương trong gia đình.',
    themeColor: 'from-pink-400 to-rose-500',
    coverEmoji: '👨‍👩‍👧',
    scenes: [
      {
        id: 's3_1',
        sceneNumber: 1,
        englishText: 'In the morning, Mother bakes delicious sweet cakes for us.',
        vietnameseText: 'Vào buổi sáng, Mẹ nướng những chiếc bánh ngọt thơm lừng cho cả nhà.',
        keywords: ['mother', 'morning'],
        backdropGradient: 'from-orange-200 via-amber-100 to-pink-100',
        illustration: {
          mainEmoji: '👩',
          secondaryEmoji: '🧁',
          sceneryEmojis: ['🥞', '☕', '🌷', '✨'],
          bgElement: '🏡'
        }
      },
      {
        id: 's3_2',
        sceneNumber: 2,
        englishText: 'Father plays fun games with the smiling cute baby.',
        vietnameseText: 'Bố chơi những trò chơi vui nhộn cùng em bé đáng yêu đang mỉm cười.',
        keywords: ['father', 'cute baby'],
        backdropGradient: 'from-sky-200 via-indigo-100 to-pink-100',
        illustration: {
          mainEmoji: '👨',
          secondaryEmoji: '👶',
          sceneryEmojis: ['🧸', '⚽', '😄', '🎈'],
          bgElement: '🛋️'
        }
      },
      {
        id: 's3_3',
        sceneNumber: 3,
        englishText: 'We love each other and our home is full of joy.',
        vietnameseText: 'Chúng mình yêu thương nhau và ngôi nhà luôn tràn ngập tiếng cười hạnh phúc.',
        keywords: ['love', 'joy'],
        backdropGradient: 'from-rose-200 via-pink-100 to-amber-100',
        illustration: {
          mainEmoji: '💖',
          secondaryEmoji: '👨‍👩‍👧',
          sceneryEmojis: ['✨', '🌟', '💐', '🎉'],
          bgElement: '🏠'
        }
      }
    ]
  },
  {
    id: 'story_lvl_4',
    level: 4,
    title: 'The Picnic in The Apple Orchard',
    vietnameseTitle: 'Bữa Tiệc Dã Ngoại Trong Vườn Táo',
    description: 'Cùng chuẩn bị đồ ăn ngon và tận hưởng chuyến dã ngoại tuyệt vời.',
    themeColor: 'from-amber-400 to-orange-500',
    coverEmoji: '🍎',
    scenes: [
      {
        id: 's4_1',
        sceneNumber: 1,
        englishText: 'We pack crispy bread, fresh milk, and sweet oranges in our basket.',
        vietnameseText: 'Chúng mình xếp bánh mì giòn tan, sữa tươi thơm mát và những quả cam ngọt vào giỏ.',
        keywords: ['bread', 'milk', 'oranges'],
        backdropGradient: 'from-amber-200 via-orange-100 to-yellow-100',
        illustration: {
          mainEmoji: '🧺',
          secondaryEmoji: '🥛',
          sceneryEmojis: ['🍞', '🍊', '🍎', '🥪'],
          bgElement: '🌳'
        }
      },
      {
        id: 's4_2',
        sceneNumber: 2,
        englishText: 'Under the green tree, yellow bananas look so tasty and delicious.',
        vietnameseText: 'Dưới bóng cây xanh mát, những quả chuối vàng ươm trông thật ngon lành.',
        keywords: ['tree', 'yellow bananas'],
        backdropGradient: 'from-emerald-200 via-yellow-100 to-teal-100',
        illustration: {
          mainEmoji: '🍌',
          secondaryEmoji: '🐒',
          sceneryEmojis: ['🌴', '🍉', '☀️', '🦋'],
          bgElement: '🍃'
        }
      }
    ]
  },
  {
    id: 'story_lvl_5',
    level: 5,
    title: 'The King of The Jungle',
    vietnameseTitle: 'Chúa Sơn Lâm Và Những Người Bạn Rừng Xanh',
    description: 'Khám phá thế giới muông thú kỳ vĩ trong khu rừng nhiệt đới.',
    themeColor: 'from-green-500 to-emerald-600',
    coverEmoji: '🦁',
    scenes: [
      {
        id: 's5_1',
        sceneNumber: 1,
        englishText: 'The brave lion roars softly across the peaceful green forest.',
        vietnameseText: 'Chú sư tử dũng mãnh gầm nhẹ vang vọng khắp khu rừng xanh thanh bình.',
        keywords: ['brave lion', 'forest'],
        backdropGradient: 'from-emerald-300 via-green-100 to-amber-100',
        illustration: {
          mainEmoji: '🦁',
          secondaryEmoji: '👑',
          sceneryEmojis: ['🌴', '🌿', '⛰️', '🦅'],
          bgElement: '🌲'
        }
      },
      {
        id: 's5_2',
        sceneNumber: 2,
        englishText: 'A giant elephant sprays fresh cool water with its long trunk.',
        vietnameseText: 'Bác voi khổng lồ phun những tia nước mát lạnh bằng chiếc vòi dài.',
        keywords: ['giant elephant', 'trunk'],
        backdropGradient: 'from-cyan-200 via-sky-100 to-emerald-100',
        illustration: {
          mainEmoji: '🐘',
          secondaryEmoji: '💦',
          sceneryEmojis: ['🌊', '🌴', '🐒', '🦜'],
          bgElement: '🏞️'
        }
      },
      {
        id: 's5_3',
        sceneNumber: 3,
        englishText: 'The tall giraffe reaches up to eat green leaves from the highest branches.',
        vietnameseText: 'Chú hươu cao cổ vươn mình ăn những chồi lá xanh non trên cành cây cao nhất.',
        keywords: ['tall giraffe', 'green leaves'],
        backdropGradient: 'from-yellow-200 via-amber-100 to-green-100',
        illustration: {
          mainEmoji: '🦒',
          secondaryEmoji: '🍃',
          sceneryEmojis: ['🌳', '🌤️', '🐅', '✨'],
          bgElement: '🌄'
        }
      }
    ]
  }
];

export const getStoryByLevel = (level: number): StoryBook => {
  const found = STORIES.find((s) => s.level === level);
  if (found) return found;
  // If higher levels 6-10, cycle or return adaptive story
  return STORIES[(level - 1) % STORIES.length];
};
