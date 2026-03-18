package org.hati.post.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.hati.post.service.PostService;
import org.hati.post.vo.PostEditVO;
import org.hati.post.vo.PostWriteRequestVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

@Controller
@RequestMapping("/post")
public class PostWriteController {

    @Autowired
    private PostService postService;

    /* =========================
       GET /post/write
       - CREATE/EDIT 공용 write.jsp
       ========================= */
    @GetMapping("/write")
    public String writePage(@RequestParam(required = false) Long postId,
                            HttpSession session, Model model) {

        Long accountId = extractAccountId(session);
        if (accountId == null) return "redirect:/auth/login";

        // 기본값(새 작성)
        String mode = "CREATE";
        String pageTitle = "게시글 작성";
        String currentPage = "postWrite";

        String initialContent = "";
        String initialTagsRaw = "";
        Long initialPostId = null;
        boolean isPinned = false;

        // ✅ 수정모드
        if (postId != null) {
            try {
                PostEditVO post = postService.getEditTarget(postId, accountId);

                mode = "EDIT";
                pageTitle = "게시글 수정";
                currentPage = "postEdit";

                if (post != null) {
                    initialPostId = post.getPostId();
                    initialContent = safe(post.getContent());
                    initialTagsRaw = safe(post.getTagsRaw());
                }

                // ✅ 현재 수정 대상 글이 대표글인지
                Long pinnedPostId = postService.getPinnedPostId(accountId);
                isPinned = (pinnedPostId != null && pinnedPostId.equals(postId));

                // 기존 코드 호환용(필요하면 유지)
                model.addAttribute("post", post);

            } catch (IllegalArgumentException e) {
                return "redirect:/home";
            } catch (Exception e) {
                return "redirect:/home";
            }
        }

        // 공통 모델 세팅
        applyWritePageCommon(model, mode, pageTitle, currentPage);
        applyInitialValues(model, initialPostId, initialContent, initialTagsRaw, isPinned);

        return "common/layout";
    }

    /* =========================
       POST /post/write
       - req.postId 있으면 UPDATE
       - 없으면 CREATE
       ========================= */
    @PostMapping("/write")
    public String write(HttpSession session, Model model, PostWriteRequestVO req) {

        Long accountId = extractAccountId(session);
        if (accountId == null) return "redirect:/auth/login";

        String content = (req == null ? null : req.getContent());
        String tagsRaw = (req == null ? null : req.getTagsRaw());
        List<MultipartFile> images = (req == null ? null : req.getImages());

        boolean hasContent = hasText(content);
        boolean hasTags = hasText(tagsRaw);

        int imageCount = countRealFiles(images);
        boolean hasImages = imageCount > 0;

        if (imageCount > 6) {
            return backToWriteWithError(model, req, "이미지는 최대 6개까지 업로드할 수 있어요.");
        }
        if (!hasContent && !hasImages && !hasTags) {
            return backToWriteWithError(model, req, "내용 또는 이미지를 한 개 이상 입력해주세요.");
        }
        if (!hasContent && !hasImages && hasTags) {
            return backToWriteWithError(model, req, "태그만으로는 게시할 수 없어요. 내용 또는 이미지를 추가해주세요.");
        }

        try {
            if (req != null && req.getPostId() != null) {
                postService.updatePost(accountId, req);
            } else {
                postService.createPost(accountId, req);
            }
            return "redirect:/home";

        } catch (IllegalArgumentException e) {
            e.printStackTrace();
            return backToWriteWithError(model, req, e.getMessage());

        } catch (DataAccessException e) {
            e.printStackTrace();
            return backToWriteWithError(model, req, "DB 처리 중 오류가 발생했습니다. (시퀀스/컬럼/제약조건 확인)");

        } catch (Exception e) {
            e.printStackTrace();
            return backToWriteWithError(model, req, "게시글 저장 중 오류가 발생했습니다.");
        }
    }

    /* =========================
       POST /post/delete (AJAX)
       - 작성자만 하드삭제
       ========================= */
    @PostMapping(value = "/delete", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public Map<String, Object> delete(@RequestParam(value = "postId", required = false) Long postId,
                                      HttpSession session) {

        Long accountId = extractAccountId(session);
        if (accountId == null) return status("NOT_LOGIN");
        if (postId == null) return status("INVALID_REQUEST");

        boolean ok = postService.hardDeletePost(postId, accountId);
        return status(ok ? "OK" : "FORBIDDEN");
    }

    @GetMapping(value = "/edit-data", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public Map<String, Object> editData(@RequestParam("postId") Long postId,
                                       HttpSession session) {

        Long accountId = extractAccountId(session);
        if (accountId == null) return status("NOT_LOGIN");

        try {
            PostEditVO post = postService.getEditTarget(postId, accountId);

            Long pinnedPostId = postService.getPinnedPostId(accountId);
            boolean isPinned = (pinnedPostId != null && pinnedPostId.equals(postId));

            Map<String, Object> res = new HashMap<String, Object>();
            res.put("status", "OK");
            res.put("postId", post.getPostId());
            res.put("content", safe(post.getContent()));
            res.put("tagsRaw", safe(post.getTagsRaw()));
            res.put("images", post.getImages());
            res.put("isPinned", isPinned);

            return res;

        } catch (IllegalArgumentException e) {
            return status("FORBIDDEN"); // 수정 불가 글
        } catch (Exception e) {
            return status("ERROR");
        }
    }
    
    /* =========================
       View helpers
       ========================= */
    private Map<String, Object> status(String s) {
        Map<String, Object> m = new HashMap<String, Object>();
        m.put("status", s);
        return m;
    }

    private String backToWriteWithError(Model model, PostWriteRequestVO req, String msg) {
        boolean isEdit = (req != null && req.getPostId() != null);

        String mode = isEdit ? "EDIT" : "CREATE";
        String pageTitle = isEdit ? "게시글 수정" : "게시글 작성";
        String currentPage = isEdit ? "postEdit" : "postWrite";

        Long initialPostId = (req == null ? null : req.getPostId());
        String initialContent = (req == null ? "" : safe(req.getContent()));
        String initialTagsRaw = (req == null ? "" : safe(req.getTagsRaw()));
        boolean isPinned = (req != null && req.isPinRequested());

        // 기존 코드 호환용(필요하면 유지)
        model.addAttribute("form", req);

        applyWritePageCommon(model, mode, pageTitle, currentPage);
        applyInitialValues(model, initialPostId, initialContent, initialTagsRaw, isPinned);

        model.addAttribute("errorMessage", msg);

        return "common/layout";
    }

    private void applyWritePageCommon(Model model,
                                      String mode,
                                      String pageTitle,
                                      String currentPage) {

        model.addAttribute("mode", mode);
        model.addAttribute("pageTitle", pageTitle);
        model.addAttribute("currentPage", currentPage);

        model.addAttribute("contentPage", "/WEB-INF/views/post/write.jsp");
        model.addAttribute("leftSlot", "/WEB-INF/views/common/side-nav.jsp");
        model.addAttribute("rightSlot", "/WEB-INF/views/common/right-widgets.jsp");

        model.addAttribute("pageCss", "home.css");
        model.addAttribute("pageCss2", "post-card.css");
        model.addAttribute("pageCss3", "post-write.css");
        model.addAttribute("pageJs", "post-write.js");
    }

    private void applyInitialValues(Model model,
                                    Long initialPostId,
                                    String initialContent,
                                    String initialTagsRaw,
                                    boolean isPinned) {

        model.addAttribute("initialPostId", initialPostId);
        model.addAttribute("initialContent", safe(initialContent));
        model.addAttribute("initialTagsRaw", safe(initialTagsRaw));
        model.addAttribute("isPinned", isPinned);
    }

    /* =========================
       Input helpers
       ========================= */
    private boolean hasText(String s) {
        return s != null && s.trim().length() > 0;
    }

    private int countRealFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) return 0;
        int cnt = 0;
        for (MultipartFile f : files) {
            if (f != null && !f.isEmpty() && f.getSize() > 0) cnt++;
        }
        return cnt;
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }

    /* =========================
       Session helpers
       ========================= */
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
        if (v instanceof Long) return (Long) v;
        if (v instanceof Integer) return Long.valueOf(((Integer) v).longValue());
        if (v instanceof String) {
            try { return Long.valueOf((String) v); } catch (Exception e) { return null; }
        }
        return null;
    }
}