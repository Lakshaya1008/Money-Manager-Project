package in.bushansirgur.moneymanager.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import in.bushansirgur.moneymanager.config.FlexibleLocalDateTimeDeserializer;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FilterDTO {

    private String type;

    @JsonDeserialize(using = FlexibleLocalDateTimeDeserializer.class)
    private LocalDateTime startDate;

    @JsonDeserialize(using = FlexibleLocalDateTimeDeserializer.class)
    private LocalDateTime endDate;

    private String keyword;
    private String sortField; //date, amount, name
    private String sortOrder; //asc or desc
}
