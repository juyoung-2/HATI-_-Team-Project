package org.hati.post.vo;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostWriteRequestVO {
    private String content;
    private String tagsRaw;
    private List<MultipartFile> images;
    private Long postId;

    private String pinPost;
    private String removeMediaIds; // "12,15,18" 형태

    public boolean isPinRequested() {
        return "Y".equalsIgnoreCase(pinPost);
    }

    // ✅ removeMediaIds -> List<Long> 변환 (중복 제거 + 방어)
    public List<Long> getRemoveMediaIdList() {
        if (removeMediaIds == null) return Collections.emptyList();

        String s = removeMediaIds.trim();
        if (s.isEmpty()) return Collections.emptyList();

        String[] parts = s.split(",");

        // 순서 유지 + 중복 제거
        Set<Long> set = new LinkedHashSet<Long>();

        for (int i = 0; i < parts.length; i++) {
            String p = parts[i];
            if (p == null) continue;

            String t = p.trim();
            if (t.isEmpty()) continue;

            try {
                Long id = Long.valueOf(t);
                if (id != null && id.longValue() > 0) {
                    set.add(id);
                }
            } catch (Exception ignore) {
                // 숫자 아닌 값은 무시
            }
        }

        if (set.isEmpty()) return Collections.emptyList();
        return new ArrayList<Long>(set);
    }
}