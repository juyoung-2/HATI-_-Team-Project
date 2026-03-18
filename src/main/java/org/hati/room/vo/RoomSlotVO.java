package org.hati.room.vo;

import java.sql.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomSlotVO {
    private int slotId;
    private int roomId;
    private Date slotDate;      // 슬롯 날짜
    private Date startTime;     // 시작 시간
    private Date endTime;       // 종료 시간
    private String status;      // AVAILABLE, HOLD, RESERVED, DONE
    private Date holdUntil;     // HOLD 상태 유지 시간
    private Date updatedAt;
    
    // 추가 정보
    private int hour;           // 시간 (0-23)
    private boolean available;  // 예약 가능 여부
}
