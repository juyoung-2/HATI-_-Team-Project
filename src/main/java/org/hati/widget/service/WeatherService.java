package org.hati.widget.service;

import org.hati.widget.mapper.WeatherMapper;
import org.hati.widget.vo.WeatherVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

@Service
public class WeatherService {

    @Autowired
    private WeatherMapper weatherMapper;

    // 기상청 API 인증키
    private static final String API_KEY = "25e377246ffeb1b4f9c5d949ebe2f3998097378a6c8de1413d7dd96e1f766133";
    private static final String BASE_URL = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst";

    // region → 격자 좌표 매핑
    private static final java.util.Map<String, int[]> REGION_MAP = new java.util.HashMap<>();
    static {
    	REGION_MAP.put("강남", new int[]{61, 125});
    	REGION_MAP.put("강동", new int[]{62, 126});
    	REGION_MAP.put("강북", new int[]{61, 129});
    	REGION_MAP.put("강서", new int[]{58, 126});
    	REGION_MAP.put("관악", new int[]{59, 125});
    	REGION_MAP.put("광진", new int[]{62, 126});
    	REGION_MAP.put("구로", new int[]{58, 125});
    	REGION_MAP.put("금천", new int[]{59, 124});
    	REGION_MAP.put("노원", new int[]{61, 130});
    	REGION_MAP.put("도봉", new int[]{61, 130});
    	REGION_MAP.put("동대문", new int[]{61, 127});
    	REGION_MAP.put("동작", new int[]{59, 125});
    	REGION_MAP.put("마포", new int[]{59, 127});
    	REGION_MAP.put("서대문", new int[]{59, 127});
    	REGION_MAP.put("서초", new int[]{61, 124});
    	REGION_MAP.put("성동", new int[]{61, 127});
    	REGION_MAP.put("성북", new int[]{61, 128});
    	REGION_MAP.put("송파", new int[]{62, 125});
    	REGION_MAP.put("양천", new int[]{58, 126});
    	REGION_MAP.put("영등포", new int[]{58, 126});
    	REGION_MAP.put("용산", new int[]{60, 126});
    	REGION_MAP.put("은평", new int[]{59, 128});
    	REGION_MAP.put("종로", new int[]{60, 127});
    	REGION_MAP.put("중구", new int[]{60, 127});
    	REGION_MAP.put("중랑", new int[]{62, 128});
    	REGION_MAP.put("default", new int[]{60, 127}); // 서울 중심 기본값
    }

    public WeatherVO getWeather(String hatiCode, String region) {
        try {
            // 1. 격자 좌표 결정
            int[] grid = REGION_MAP.getOrDefault(region, REGION_MAP.get("default"));
            int nx = grid[0];
            int ny = grid[1];

            // 2. 기상청 API 호출 시간 설정 (현재 시각 기준)
            LocalDateTime now = LocalDateTime.now().minusMinutes(30); // 30분 전 데이터
            String baseDate = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String baseTime = now.format(DateTimeFormatter.ofPattern("HHmm"));

            // 3. API 호출
            String apiUrl = BASE_URL
                    + "?serviceKey=" + API_KEY
                    + "&pageNo=1&numOfRows=10&dataType=JSON"
                    + "&base_date=" + baseDate
                    + "&base_time=" + baseTime
                    + "&nx=" + nx
                    + "&ny=" + ny;

            String response = callApi(apiUrl);
            if (response == null) return fallback(hatiCode, region);

            // 4. 응답 파싱
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);
            JsonNode items = root.path("response").path("body").path("items").path("item");

            String pty = "0";
            String t1h = "";
            String wsd = "";

            for (JsonNode item : items) {
                String category = item.path("category").asText();
                String value = item.path("obsrValue").asText();
                switch (category) {
                    case "PTY": pty = value; break;
                    case "T1H": t1h = value; break;
                    case "WSD": wsd = value; break;
                }
            }

            // 5. 날씨 텍스트 변환
            String weatherText = convertPty(pty, t1h, wsd);
            boolean isClear = weatherText.equals("맑음") || weatherText.equals("구름 조금");
            String column = isClear ? "ex_clear" : "ex_storm";

            // 6. HATI 운동 추천 (랜덤 1개)
            String activity = getRandomActivity(hatiCode, column);
            String desc = isClear ? "날씨가 좋아요! 야외 운동을 추천해요." : "실내 운동하기 좋은 날이에요.";

            return new WeatherVO(weatherText, desc, activity, region != null ? region : "서울", t1h);

        } catch (Exception e) {
            e.printStackTrace();
            return fallback(hatiCode, region);
        }
    }

    // 기상청 API 호출
    private String callApi(String apiUrl) {
        try {
            URL url = new URL(apiUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            BufferedReader br = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), "UTF-8"));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) sb.append(line);
            br.close();
            return sb.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // 강수형태 코드 → 날씨 텍스트
    // PTY: 0=없음, 1=비, 2=비/눈, 3=눈, 4=소나기
    // T1H: 기온, WSD: 풍속
    private String convertPty(String pty, String t1h, String wsd) {
        switch (pty) {
            case "1": case "4": return "비";
            case "2": return "비/눈";
            case "3": return "눈";
            default:
                // 강수 없을 때 풍속으로 구분
                try {
                    double wind = Double.parseDouble(wsd);
                    if (wind >= 9.0) return "강풍";
                } catch (Exception ignored) {}
                return "맑음";
        }
    }

    // HATI 코드 기반 랜덤 운동 추천
    private String getRandomActivity(String hatiCode, String column) {
        try {
            String activities = weatherMapper.selectActivity(hatiCode, column);
            if (activities == null || activities.isEmpty()) return "자유 운동";
            String[] list = activities.split(",");
            return list[new Random().nextInt(list.length)].trim();
        } catch (Exception e) {
            return "자유 운동";
        }
    }

    // API 실패 시 기본값 반환
    private WeatherVO fallback(String hatiCode, String region) {
        return new WeatherVO("맑음", "오늘도 활기차게 운동해요!", "자유 운동",
                region != null ? region : "서울", "-");
    }
}
