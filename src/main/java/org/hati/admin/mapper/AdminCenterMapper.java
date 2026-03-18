package org.hati.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.hati.admin.center.domain.CenterDetailDTO;
import org.hati.admin.center.domain.CenterListItemDTO;
import org.hati.admin.center.domain.CenterReviewDTO;
import org.hati.admin.center.domain.CenterRoomDTO;
import org.hati.admin.center.domain.CenterSearchRequest;
import org.hati.admin.center.domain.RoomEnvStatDTO;

public interface AdminCenterMapper {
	List<CenterListItemDTO> findCenters(CenterSearchRequest req);
    int countCenters(CenterSearchRequest req);

    CenterDetailDTO findCenterDetail(@Param("centerId") Long centerId);
    List<CenterReviewDTO> findCenterReviews(@Param("centerId") Long centerId);
    List<CenterRoomDTO> findCenterRooms(@Param("centerId") Long centerId);

    List<RoomEnvStatDTO> findRoomEnvStats(@Param("roomId") Long roomId,
                                          @Param("targetDate") String targetDate);
    
    int hide(@Param("reviewId") long reviewId);
    
    CenterReviewDTO selectCenterReviewById(long reviewId);
}
