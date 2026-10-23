# 카드뉴스 메이커 — 포트폴리오용 데모

해외 테크 뉴스를 인스타그램용 카드뉴스로 만드는 도구의 데모 버전입니다.
서버 없이 HTML/CSS/JS만으로 브라우저에서 돌아갑니다.

## 실행 방법

- `index.html`을 더블클릭해서 브라우저로 열면 됩니다.
- 웹에 올릴 때는 이 폴더를 통째로 GitHub Pages, Netlify 같은 정적 호스팅에 올리면 됩니다.

## 데모에 포함된 기능

- 카드 편집: 텍스트 카드(표지/본문), 영어 표현 카드, 구독 유도 카드
- 카드 추가·복제·삭제·순서 변경
- 배경: 단색, 그라데이션, 패턴·그래픽, 내 이미지 업로드(브라우저 안에서만 사용)
- 글씨체(프리텐다드, 고운바탕, 검은고딕), 카드 비율(4:5, 1:1), 포인트 색, 계정 이름 설정
- PNG 내보내기: 카드 한 장 또는 전체를 ZIP으로
- 편집 내용은 이 브라우저(localStorage)에만 임시 저장

## 실제 버전에만 있는 기능 (데모에서는 제외)

- 외신 자동 수집
- AI 번역과 카드 초안 작성
- 서버 저장과 로그인

## 예시 데이터

예시 기사, 매체(The Demo Times), 기업(루멧랩스)은 모두 데모용으로 지어낸 가상의 내용입니다.
실제 기사나 사진은 포함하지 않았고, 배경 그래픽은 코드로 직접 그립니다.

## 폴더 구성

```
demo/
├── index.html          시작 파일
├── css/fonts.css       글씨체 연결
├── css/style.css       화면 디자인
├── js/sample-data.js   예시 기사·카드
├── js/render.js        카드 그리기(canvas)
├── js/zip.js           ZIP 묶기
├── js/app.js           화면 동작
└── fonts/              글씨체 파일과 라이선스
```

## 글씨체 라이선스

모든 글씨체는 SIL Open Font License 1.1을 따르며, 라이선스 전문은 `fonts/` 폴더에 있습니다.
용량을 줄이려고 자주 쓰는 한글 2,350자와 영문·기호만 남겼습니다.

- Pretendard: Kil Hyung-jin
- Gowun Batang: The Gowun Batang Project Authors
- Black Han Sans: The Black Han Sans Project Authors
