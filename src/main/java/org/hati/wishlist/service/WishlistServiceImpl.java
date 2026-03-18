package org.hati.wishlist.service;

import java.util.List;
import org.hati.wishlist.mapper.WishlistMapper;
import org.hati.wishlist.vo.WishlistVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.log4j.Log4j;

@Service
@Log4j
public class WishlistServiceImpl implements WishlistService {

    @Autowired
    private WishlistMapper wishlistMapper;

    @Override
    public List<WishlistVO> getWishlist(int accountId) {
        log.info("찜 목록 조회 - accountId: " + accountId);
        return wishlistMapper.getWishlistByAccount(accountId);
    }

    @Override
    @Transactional
    public boolean removeBookmark(int accountId, int roomId) {
        log.info("찜 삭제 - accountId: " + accountId + ", roomId: " + roomId);
        int result = wishlistMapper.removeBookmark(accountId, roomId);
        return result > 0;
    }

    @Override
    public int getWishlistCount(int accountId) {
        return wishlistMapper.getWishlistCount(accountId);
    }
}
