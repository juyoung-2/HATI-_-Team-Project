package org.hati.widget.controller;


import org.hati.auth.vo.LoginSessionVO;
import org.hati.reservation.service.ReservationService;
import org.hati.reservation.vo.ReservationListVO;
import org.hati.widget.service.WeatherService;
import org.hati.widget.vo.WeatherVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
public class WidgetController {

    @Autowired
    private WeatherService weatherService;
    
    @Autowired
    private ReservationService reservationService;

    // 날씨 위젯 API
    @GetMapping(value = "/widget/weather", produces = "application/json")
    public Map<String, Object> getWeather(HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        try {
            LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");

            String hatiCode = (loginUser != null && loginUser.getHatiCode() != null)
                    ? loginUser.getHatiCode() : "ICFL"; // 기본 HATI

            String region = (loginUser != null && loginUser.getRegion() != null)
                    ? loginUser.getRegion() : null; // null이면 서울 기본값

            WeatherVO weather = weatherService.getWeather(hatiCode, region);

            result.put("weather", weather.getWeather());
            result.put("description", weather.getDescription());
            result.put("activity", weather.getActivity());
            result.put("region", weather.getRegion());
            result.put("temp", weather.getTemp());
            result.put("success", true);
        } catch (Exception e) {
            result.put("success", false);
        }
        return result;
    }

    // 예약 위젯 API
    @GetMapping(value = "/widget/schedule", produces = "application/json")
    public Map<String, Object> getSchedule(HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        try {
            LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
            if (loginUser == null) {
                result.put("hasReservation", false);
                return result;
            }

            ReservationListVO reservation = reservationService.getTodayReservation(loginUser.getAccountId().intValue());

            if (reservation == null) {
                result.put("hasReservation", false);
            } else {
                result.put("hasReservation", true);
                result.put("centerName", reservation.getCenterName());
                result.put("centerRegion", reservation.getCenterRegion());
                result.put("slotDate", reservation.getSlotDate());
                result.put("startTime", reservation.getReservationStartTime());
                result.put("endTime", reservation.getReservationEndTime());
            }
            result.put("success", true);
        } catch (Exception e) {
            result.put("hasReservation", false);
        }
        return result;
    }
}
