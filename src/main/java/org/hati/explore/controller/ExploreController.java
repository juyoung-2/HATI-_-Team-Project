package org.hati.explore.controller;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.hati.explore.service.ExploreService;
import org.hati.explore.vo.UserCardDTO;
import org.hati.post.vo.PostFeedDTO;
import org.hati.explore.vo.GroupChatDTO;
import org.hati.chat.service.GroupChatService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/explore")
public class ExploreController {

    @Autowired
    private ExploreService exploreService;
    
    @Autowired
    private GroupChatService groupChatService;
    

    @GetMapping("")
    public String explore(
        @RequestParam(value="q",        required=false)          String q,
        @RequestParam(value="tag",      required=false)          String tag,
        @RequestParam(value="type",     defaultValue="all")      String type,
        @RequestParam(value="hati",     required=false)          String[] hati,
        @RequestParam(value="sort",     defaultValue="latest")   String sort,
        @RequestParam(value="limit",    defaultValue="10")       int limit,
        HttpSession session, Model model
    ) {
        Long accountId = extractAccountId(session);


        List<String> hatiList = (hati != null) ? Arrays.asList(hati) : Collections.emptyList();

        List<PostFeedDTO> posts = null;
        List<UserCardDTO> people = null;
        List<GroupChatDTO> openTalks = null;

        if ("people".equals(type)) {
            people = exploreService.getPeople(q, hatiList, 0, limit);
        } else if ("opentalk".equals(type)) {
            openTalks = exploreService.getOpenTalk(q, accountId, 0, limit);
        } else {
            posts = exploreService.getExploreFeed(accountId, q, tag, type, hatiList, sort, 0, limit);
        }

        int size;
        if ("people".equals(type))       size = people    == null ? 0 : people.size();
        else if ("opentalk".equals(type)) size = openTalks == null ? 0 : openTalks.size();
        else                              size = posts     == null ? 0 : posts.size();

        model.addAttribute("posts",      posts);
        model.addAttribute("openTalks", openTalks);
        model.addAttribute("people",     people);
        model.addAttribute("nextOffset", size);
        model.addAttribute("hasMore",    size == limit);
        model.addAttribute("hatiCodes",  exploreService.getAllHatiCodes());

        // 검색 조건 유지 (JSP에서 form 값 복원용)
        model.addAttribute("paramQ",    q);
        model.addAttribute("paramType", type);
        model.addAttribute("paramSort", sort);
        model.addAttribute("paramHati", hatiList);

        model.addAttribute("contentPage", "/WEB-INF/views/explore/list.jsp");
        model.addAttribute("leftSlot",    "/WEB-INF/views/common/side-nav.jsp");
        model.addAttribute("rightSlot",   "/WEB-INF/views/common/right-widgets.jsp");

        model.addAttribute("pageCss",  "home.css");
        model.addAttribute("pageCss2", "post-card.css");

        model.addAttribute("pageJs",  "post-actions.js");
        model.addAttribute("pageJs2", "comment.js");
        model.addAttribute("pageJs3", "explore-filter.js");
        model.addAttribute("pageJs4", "explore-infinite.js");
        model.addAttribute("pageJs5", "post-more.js");

        model.addAttribute("pageTitle",   "Explore");
        model.addAttribute("currentPage", "explore");

        return "common/layout";
    }

    @GetMapping("/more")
    public String more(
        @RequestParam(value="q",     required=false)        String q,
        @RequestParam(value="tag",   required=false)        String tag,
        @RequestParam(value="type",  defaultValue="all")    String type,
        @RequestParam(value="hati",  required=false)        String[] hati,
        @RequestParam(value="sort",  defaultValue="latest") String sort,
        @RequestParam(value="offset",defaultValue="0")      int offset,
        @RequestParam(value="limit", defaultValue="10")     int limit,
        HttpSession session, Model model
    ) {
        Long accountId = extractAccountId(session);

        List<String> hatiList = (hati != null) ? Arrays.asList(hati) : Collections.emptyList();

        if ("people".equals(type)) {
            model.addAttribute("people", exploreService.getPeople(q, hatiList, offset, limit));
            return "explore/people-fragment";
            
        } else if ("opentalk".equals(type)) {
            model.addAttribute("openTalks",
                exploreService.getOpenTalk(q, accountId, offset, limit));
            return "explore/opentalk-fragment";
            
        } else {
            model.addAttribute("posts", exploreService.getExploreFeed(accountId, q, tag, type, hatiList, sort, offset, limit));
            return "common/feed-fragment";
        }
    }

    private Long extractAccountId(HttpSession session) {
        if (session == null) return null;
        Object vo = session.getAttribute("LOGIN_USER");
        if (vo instanceof LoginSessionVO) {
            Long id = ((LoginSessionVO) vo).getAccountId();
            if (id != null) return id;
        }
        Object v = session.getAttribute("ACCOUNT_ID");
        return toLong(v);
    }

    private Long toLong(Object v) {
        if (v == null) return null;
        if (v instanceof Long)    return (Long) v;
        if (v instanceof Integer) return Long.valueOf(((Integer) v).longValue());
        if (v instanceof String)  { try { return Long.valueOf((String) v); } catch (Exception e) { return null; } }
        return null;
    }
    
    @PostMapping("/opentalk/join/{roomId}")
    @ResponseBody
    public Map<String, Object> joinOpenTalk(
        @PathVariable int roomId,
        HttpSession session
    ) {
        Map<String, Object> result = new java.util.HashMap<>();
        try {
            Long accountId = extractAccountId(session);
            if (accountId == null) {
                result.put("success", false);
                result.put("error", "로그인이 필요합니다.");
                return result;
            }
            groupChatService.joinByRoomId(roomId, accountId.intValue());
            result.put("success", true);
            result.put("roomId", roomId);
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }
}