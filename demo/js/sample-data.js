/*
 * 데모용 예시 데이터.
 * 기사·매체·기업은 모두 데모를 위해 직접 지어낸 가상의 내용입니다.
 */
window.SAMPLE_ARTICLE = {
  source: 'The Demo Times (가상 매체)',
  date: '2026-10-20',
  titleEn: "Startup's translation glasses can now read menus aloud",
  titleKo: '번역 안경, 이제 메뉴판까지 소리 내어 읽어준다',
  bodyEn: [
    'Lumet Labs, a small hardware startup, has rolled out a software update that lets its translation glasses read printed text aloud in more than 30 languages. Until now, the glasses could only translate spoken conversations. With the update, a user can look at a menu, a street sign or a train timetable and hear a translation within a second.',
    'Under the hood, the glasses run a compact language model on the device itself, so camera images never leave the frame. The company says this keeps the feature fast even without a network connection.',
    'Early testers called the update a game changer for travel. Lumet Labs plans to bring the feature to older models early next year.'
  ],
  bodyKo: [
    '소형 하드웨어 스타트업 루멧랩스(Lumet Labs)가 번역 안경으로 30개 이상 언어의 인쇄된 글을 소리 내어 읽어주는 소프트웨어 업데이트를 선보였다. 지금까지 이 안경은 대화만 통역할 수 있었다. 업데이트 후에는 메뉴판이나 길거리 표지판, 기차 시간표를 바라보기만 하면 1초 안에 번역을 들을 수 있다.',
    '안경 내부에서는 소형 언어 모델이 기기 자체에서 돌아가기 때문에 카메라 이미지가 안경 밖으로 나가지 않는다. 회사는 덕분에 인터넷 연결이 없어도 기능이 빠르게 작동한다고 설명했다.',
    '초기 테스터들은 이번 업데이트를 여행의 판도를 바꿀 기능이라고 평가했다. 루멧랩스는 내년 초 구형 모델에도 이 기능을 제공할 계획이다.'
  ]
};

window.SAMPLE_STATE = {
  settings: {
    titleFont: 'pretendard',
    bodyFont: 'pretendard',
    ratio: '4:5',
    accent: '#FACC15',
    brand: '@techcard_demo',
    pageNumbers: true
  },
  cards: [
    {
      type: 'text', variant: 'cover',
      kicker: '해외 테크 뉴스',
      title: '번역 안경이\n메뉴판까지 읽어준다',
      body: '가상 스타트업 루멧랩스의 새 업데이트',
      source: '출처: The Demo Times (가상 매체) · 데모용 예시 기사',
      align: 'left',
      bgKind: 'rings', color1: '#1E1B4B', color2: '#6366F1', textColor: '#FFFFFF',
      image: null, overlay: 45
    },
    {
      type: 'text', variant: 'body',
      kicker: 'WHAT\'S NEW',
      title: '무엇이 달라졌나',
      body: '지금까지는 대화만 통역했지만, 이제 메뉴판·표지판·기차 시간표 같은 인쇄된 글도 바라보기만 하면 1초 안에 번역해서 읽어줘요.\n\n지원 언어는 30개 이상이에요.',
      source: '',
      align: 'left',
      bgKind: 'solid', color1: '#0F172A', color2: '#334155', textColor: '#F8FAFC',
      image: null, overlay: 45
    },
    {
      type: 'text', variant: 'body',
      kicker: 'WHY IT MATTERS',
      title: '왜 주목받을까',
      body: '번역 모델이 안경 안에서 직접 돌아가요. 카메라 이미지가 밖으로 나가지 않아 사생활 걱정이 적고, 인터넷이 없어도 빠르게 작동해요.\n\n내년 초에는 구형 모델에도 이 기능이 들어갈 예정이에요.',
      source: '',
      align: 'left',
      bgKind: 'dots', color1: '#0F172A', color2: '#6366F1', textColor: '#F8FAFC',
      image: null, overlay: 45
    },
    {
      type: 'expression',
      label: '오늘의 영어 표현 1',
      expression: 'roll out',
      meaning: '(제품·기능을) 출시하다, 선보이다',
      example: 'Lumet Labs has rolled out a software update for its glasses.',
      exampleKo: '루멧랩스가 안경용 소프트웨어 업데이트를 선보였다.',
      note: 'launch보다 "차례로 내놓는다"는 느낌이에요. 업데이트나 새 기능 소식에 자주 나와요.',
      bgKind: 'solid', color1: '#FFFBEB', color2: '#FDE68A', textColor: '#1C1917'
    },
    {
      type: 'expression',
      label: '오늘의 영어 표현 2',
      expression: 'under the hood',
      meaning: '내부적으로, 속을 들여다보면',
      example: 'Under the hood, the glasses run a compact language model.',
      exampleKo: '안경 내부에서는 소형 언어 모델이 돌아간다.',
      note: '원래는 "자동차 보닛 아래"라는 뜻. 기술 기사에서 작동 원리를 설명할 때 단골이에요.',
      bgKind: 'solid', color1: '#ECFDF5', color2: '#A7F3D0', textColor: '#052E16'
    },
    {
      type: 'expression',
      label: '오늘의 영어 표현 3',
      expression: 'game changer',
      meaning: '판도를 바꾸는 것',
      example: 'Early testers called the update a game changer for travel.',
      exampleKo: '초기 테스터들은 이번 업데이트를 여행의 판도를 바꿀 기능이라고 평가했다.',
      note: '형용사로 쓸 땐 game-changing. "a game-changing feature"처럼요.',
      bgKind: 'solid', color1: '#EFF6FF', color2: '#BFDBFE', textColor: '#172554'
    },
    {
      type: 'subscribe',
      label: 'FOLLOW',
      title: '매주 해외 테크 뉴스를\n카드 한 장으로',
      body: '영어 표현까지 함께 정리해 드려요.\n팔로우하고 놓치지 마세요!',
      cta: '팔로우하기',
      bgKind: 'blobs', color1: '#1E1B4B', color2: '#A855F7', textColor: '#FFFFFF'
    }
  ]
};

window.CARD_DEFAULTS = {
  text: {
    type: 'text', variant: 'body', kicker: '', title: '제목을 입력하세요', body: '본문을 입력하세요.',
    source: '', align: 'left', bgKind: 'solid', color1: '#0F172A', color2: '#6366F1',
    textColor: '#F8FAFC', image: null, overlay: 45
  },
  expression: {
    type: 'expression', label: '오늘의 영어 표현', expression: 'expression', meaning: '뜻을 입력하세요',
    example: 'Example sentence goes here.', exampleKo: '예문 해석을 입력하세요.', note: '',
    bgKind: 'solid', color1: '#FFFBEB', color2: '#FDE68A', textColor: '#1C1917'
  },
  subscribe: {
    type: 'subscribe', label: 'FOLLOW', title: '구독 유도 문구를\n입력하세요', body: '부가 설명을 입력하세요.',
    cta: '팔로우하기', bgKind: 'blobs', color1: '#1E1B4B', color2: '#A855F7', textColor: '#FFFFFF'
  }
};
