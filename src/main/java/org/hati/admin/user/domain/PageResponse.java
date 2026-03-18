package org.hati.admin.user.domain;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class PageResponse<T> {
	private List<T> items;
    private int page;
    private int size;
    private int total;
}
