package org.hati.trainer.controller;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.hati.trainer.service.TrainerFavService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/trainers/fav")
public class TrainerFavController {

    @Autowired
    private TrainerFavService trainerFavService;

    private Long getAccountId(HttpSession session) {
        Long id = toLong(session.getAttribute("ACCOUNT_ID"));
        if (id != null) return id;

        id = toLong(session.getAttribute("LOGIN_ACCOUNT_ID"));
        if (id != null) return id;

        Object u = session.getAttribute("LOGIN_USER");
        if (u != null) {
            try {
                // LoginSessionVO면 아래 캐스팅이 제일 깔끔
                // return ((LoginSessionVO) u).getAccountId();

                java.lang.reflect.Method m = u.getClass().getMethod("getAccountId");
                return toLong(m.invoke(u));
            } catch (Exception ignore) {}
        }
        return null;
    }

    private Long toLong(Object v) {
        if (v == null) return null;
        if (v instanceof Long) return (Long) v;
        if (v instanceof Integer) return ((Integer) v).longValue();
        if (v instanceof String) {
            try { return Long.valueOf((String) v); } catch (Exception e) { return null; }
        }
        return null;
    }

    @PostMapping("/toggle")
    public Map<String, Object> toggle(@RequestParam("trainerId") long trainerId,
                                      HttpSession session) {
        Map<String, Object> res = new HashMap<String, Object>();

        Long accountId = getAccountId(session);
        if (accountId == null) {
            res.put("status", "NOT_LOGIN");
            return res;
        }

        boolean fav = trainerFavService.toggleFav(accountId.longValue(), trainerId);
        res.put("status", "OK");
        res.put("fav", Boolean.valueOf(fav));
        return res;
    }

    @GetMapping("/memo")
    public Map<String, Object> getMemo(@RequestParam("trainerId") long trainerId,
                                       HttpSession session) {
        Map<String, Object> res = new HashMap<String, Object>();

        Long accountId = getAccountId(session);
        if (accountId == null) {
            res.put("status", "NOT_LOGIN");
            res.put("memo", "");
            return res;
        }

        String memo = trainerFavService.getMemo(accountId.longValue(), trainerId);

        res.put("status", "OK");
        res.put("memo", memo == null ? "" : memo);
        return res;
    }

    @PostMapping("/memo")
    public Map<String, Object> saveMemo(@RequestParam("trainerId") long trainerId,
                                        @RequestParam("memo") String memo,
                                        HttpSession session) {
        Map<String, Object> res = new HashMap<String, Object>();

        Long accountId = getAccountId(session);
        if (accountId == null) {
            res.put("status", "NOT_LOGIN");
            return res;
        }

        // 길이 방어: DB 컬럼 길이에 맞춰 조절 (예: 500이면 500으로)
        if (memo == null) memo = "";
        if (memo.length() > 1000) memo = memo.substring(0, 1000);

        boolean ok = trainerFavService.saveMemo(accountId.longValue(), trainerId, memo);

        res.put("status", ok ? "OK" : "FAIL");
        return res;
    }
}