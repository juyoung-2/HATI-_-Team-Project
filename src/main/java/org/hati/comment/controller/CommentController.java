package org.hati.comment.controller;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.hati.comment.service.CommentService;
import org.hati.comment.vo.CommentWriteRequest;
import org.hati.auth.vo.LoginSessionVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/comment")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // 세션에서 accountId 안전하게 뽑기(ACCOUNT_ID/LOGIN_USER 둘 다 방어)
    private Long getLoginAccountId(HttpSession session) {
        if (session == null) return null;

        Object v = session.getAttribute("ACCOUNT_ID");
        if (v instanceof Long) return (Long) v;
        if (v instanceof Integer) return Long.valueOf(((Integer) v).intValue());
        if (v instanceof String) {
            try { return Long.valueOf((String) v); } catch (Exception ignore) {}
        }

        Object u = session.getAttribute("LOGIN_USER");
        if (u instanceof LoginSessionVO) {
            return ((LoginSessionVO) u).getAccountId();
        }
        return null;
    }

    @GetMapping("/list")
    @ResponseBody
    public Map<String, Object> list(
        @RequestParam Long postId,
        @RequestParam(defaultValue="0") int offset,
        @RequestParam(defaultValue="5") int limit,
        HttpSession session) {
        Long accountId = getLoginAccountId(session);
        return commentService.list(postId, accountId, offset, limit);
    }

    @PostMapping("/write")
    @ResponseBody
    public Map<String, Object> write(@RequestBody CommentWriteRequest req, HttpSession session) {
        Long accountId = getLoginAccountId(session);
        return commentService.write(req.getPostId(), req.getContent(), accountId);
    }
    
    @PostMapping("/update")
    @ResponseBody
    public Map<String, Object> update(@RequestBody CommentWriteRequest req, HttpSession session) {
        Long accountId = getLoginAccountId(session);
        return commentService.update(req.getCommentId(), req.getContent(), accountId);
    }

    @PostMapping("/delete")
    @ResponseBody
    public Map<String, Object> delete(@RequestParam Long commentId, HttpSession session) {
        Long accountId = getLoginAccountId(session);
        return commentService.delete(commentId, accountId);
    }

    @PostMapping("/like/toggle")
    @ResponseBody
    public Map<String, Object> toggleWriterLike(@RequestParam Long commentId, HttpSession session) {
        Long accountId = getLoginAccountId(session);
        return commentService.toggleWriterLike(commentId, accountId);
    }
    
    @PostMapping("/pin")
    @ResponseBody
    public Map<String, Object> pin(
        @RequestParam Long commentId,
        @RequestParam int pin,
        HttpSession session) {
        Long accountId = getLoginAccountId(session);
        if (accountId == null) {
            Map<String, Object> res = new HashMap<>();
            res.put("status", "NOT_LOGIN");
            return res;
        }
        return commentService.pin(commentId, pin, accountId);
    }
}