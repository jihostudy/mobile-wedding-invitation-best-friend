update public.wedding_content
set
  content = jsonb_set(
    jsonb_set(
      jsonb_set(
        content,
        '{weddingData,venue,coordinates}',
        '{"lat":37.5182838663077,"lng":127.029222699331}'::jsonb,
        true
      ),
      '{weddingData,venue,transport,navigation,apps}',
      '[
        {
          "id": "naver",
          "label": "네이버지도",
          "enabled": true,
          "deepLink": "nmap://route/public?dlat=37.5182838663077&dlng=127.029222699331&dname=%EB%A3%A8%ED%81%B4%EB%9D%BC%EB%B9%84%EB%8D%94%ED%99%94%EC%9D%B4%ED%8A%B8&appname=com.wedding.invitation",
          "webUrl": "https://map.naver.com/v5/directions/-/127.029222699331,37.5182838663077,%EB%A3%A8%ED%81%B4%EB%9D%BC%EB%B9%84%EB%8D%94%ED%99%94%EC%9D%B4%ED%8A%B8/-/transit"
        },
        {
          "id": "tmap",
          "label": "티맵",
          "enabled": true,
          "deepLink": "tmap://route?goalx=127.029222699331&goaly=37.5182838663077&goalname=%EB%A3%A8%ED%81%B4%EB%9D%BC%EB%B9%84%EB%8D%94%ED%99%94%EC%9D%B4%ED%8A%B8",
          "webUrl": "https://m.tmap.co.kr/tmap2/mobile/route.jsp?goalx=127.029222699331&goaly=37.5182838663077&goalname=%EB%A3%A8%ED%81%B4%EB%9D%BC%EB%B9%84%EB%8D%94%ED%99%94%EC%9D%B4%ED%8A%B8"
        },
        {
          "id": "kakao",
          "label": "카카오내비",
          "enabled": true,
          "deepLink": "kakaonavi://navigate?name=%EB%A3%A8%ED%81%B4%EB%9D%BC%EB%B9%84%EB%8D%94%ED%99%94%EC%9D%B4%ED%8A%B8&x=127.029222699331&y=37.5182838663077",
          "webUrl": "https://map.kakao.com/link/to/%EB%A3%A8%ED%81%B4%EB%9D%BC%EB%B9%84%EB%8D%94%ED%99%94%EC%9D%B4%ED%8A%B8,37.5182838663077,127.029222699331"
        }
      ]'::jsonb,
      true
    ),
    '{weddingData,venue,transport,navigation,description}',
    '"원하시는 앱을 선택하시면 길안내가 시작됩니다."'::jsonb,
    true
  ),
  version = version + 1,
  updated_at = now()
where slug = 'main';
