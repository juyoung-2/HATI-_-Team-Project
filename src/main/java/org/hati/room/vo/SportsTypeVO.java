package org.hati.room.vo;

import java.sql.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class SportsTypeVO {
    private int sportId;      
    private String category;  
    private int baseFee;      
}
