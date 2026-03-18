package org.hati.admin.center.service;

import java.util.List;

import org.hati.admin.center.domain.CenterDetailDTO;
import org.hati.admin.center.domain.CenterListItemDTO;
import org.hati.admin.center.domain.CenterReviewDTO;
import org.hati.admin.center.domain.CenterRoomDTO;
import org.hati.admin.center.domain.CenterSearchRequest;
import org.hati.admin.center.domain.RoomEnvStatDTO;
import org.hati.admin.center.domain.RoomRealTimeDTO;
import org.hati.admin.user.domain.PageResponse;

public interface AdminCenterService {
	PageResponse<CenterListItemDTO> getCenters(CenterSearchRequest req);
    CenterDetailDTO getCenterDetail(Long centerId);
    List<CenterReviewDTO> getCenterReviews(Long centerId);
    List<CenterRoomDTO> getCenterRooms(Long centerId);

    RoomRealTimeDTO getRoomRealtime(Long roomId);
    List<RoomEnvStatDTO> getRoomEnvStats(Long roomId, String targetDate);
    
    void hide(Long reviewId);
    
    CenterReviewDTO getCenterReview(long reviewId);
}
