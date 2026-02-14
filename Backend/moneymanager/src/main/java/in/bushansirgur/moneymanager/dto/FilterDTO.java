package in.bushansirgur.moneymanager.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FilterDTO {

    private String type;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String keyword;
    private String sortField; //date, amount, name
    private String sortOrder; //asc or desc
}
