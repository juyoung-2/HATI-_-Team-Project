package org.hati.wishlist.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Param;
import org.hati.wishlist.vo.WishlistVO;

public interface WishlistMapper {

    /**
     * 사용자의 찜 목록 조회
     * room_booking → rooms → centers → sports_type → centers_reviews JOIN
     */
    List<WishlistVO> getWishlistByAccount(int accountId);

    /**
     * 찜 삭제 (wishlist 페이지 전용 단방향 삭제)
     * CenterDetailController.toggleBookmark 와 별개로 항상 DELETE만 수행
     */
    int removeBookmark(@Param("accountId") int accountId,
                       @Param("roomId")    int roomId);

    /**
     * 찜 개수 조회 (헤더 카운트용)
     */
    int getWishlistCount(int accountId);
}
