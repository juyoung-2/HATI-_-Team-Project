package org.hati.post.controller;

import java.util.List;

import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.hati.post.service.PostService;
import org.hati.post.vo.PostFeedDTO;
import org.hati.post.vo.PostMediaThumbDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/post")
public class PostTabController {

    @Autowired
    private PostService postService;

    @GetMapping("/profile-list")
    public String profilePostList(@RequestParam("accountId") Long writerAccountId,
                                  HttpSession session,
                                  Model model) {

        Long viewerAccountId = extractAccountId(session);
       
        boolean isProfileOwner = writerAccountId != null && writerAccountId.equals(viewerAccountId);
        
        List<PostFeedDTO> postList = postService.getPostsByWriter(viewerAccountId, writerAccountId);

        model.addAttribute("postList", postList);
        model.addAttribute("emptyTitle", "작성한 게시글이 없습니다.");
        model.addAttribute("emptyDesc", "");
        model.addAttribute("isProfilePage", true);
        model.addAttribute("profileOwnerAccountId", writerAccountId);
        model.addAttribute("isProfileOwner", isProfileOwner);
        

        return "post/list";
    }

    // [신버전] 프로필 미디어 탭: 이미지 썸네일 목록 전용 엔드포인트
    @GetMapping("/profile-media")
    public String profileMedia(@RequestParam("accountId") Long writerAccountId,
                               Model model) {

        List<PostMediaThumbDTO> mediaList = postService.getPostMediaThumbsByWriter(writerAccountId);

        model.addAttribute("mediaList", mediaList);
        model.addAttribute("emptyTitle", "아직 업로드한 미디어가 없습니다.");
        model.addAttribute("emptyDesc", "이미지가 포함된 게시글을 작성하면 여기에서 볼 수 있습니다.");

        return "post/profile-media";
    }

    private Long extractAccountId(HttpSession session) {
        if (session == null) return null;

        Object vo = session.getAttribute("LOGIN_USER");
        if (vo instanceof LoginSessionVO) {
            Long id = ((LoginSessionVO) vo).getAccountId();
            if (id != null) return id;
        }

        Object v = session.getAttribute("ACCOUNT_ID");
        if (v instanceof Long) return (Long) v;
        if (v instanceof Integer) return Long.valueOf(((Integer) v).longValue());
        if (v instanceof String) {
            try { return Long.valueOf((String) v); } catch (Exception e) { return null; }
        }
        return null;
    }
}