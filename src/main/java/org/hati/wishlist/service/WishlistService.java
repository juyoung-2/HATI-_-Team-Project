package org.hati.wishlist.service;

import java.util.List;
import org.hati.wishlist.vo.WishlistVO;

public interface WishlistService {

    /** 찜 목록 조회 */
    List<WishlistVO> getWishlist(int accountId);

    /** 찜 삭제 */
    boolean removeBookmark(int accountId, int roomId);

    /** 찜 개수 */
    int getWishlistCount(int accountId);
}
