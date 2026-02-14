package in.bushansirgur.moneymanager.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * Custom deserializer that accepts both LocalDate (yyyy-MM-dd) and LocalDateTime (yyyy-MM-ddTHH:mm:ss) formats.
 * If only date is provided, time defaults to 00:00:00.
 */
public class FlexibleLocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    @Override
    public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getValueAsString();

        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        value = value.trim();

        // Try parsing as LocalDateTime first (with time)
        try {
            return LocalDateTime.parse(value, DATE_TIME_FORMATTER);
        } catch (DateTimeParseException e) {
            // If that fails, try parsing as LocalDate and convert to LocalDateTime at start of day
            try {
                LocalDate date = LocalDate.parse(value, DATE_FORMATTER);
                return date.atStartOfDay();
            } catch (DateTimeParseException e2) {
                throw new IOException("Cannot parse date/datetime value: '" + value + "'. " +
                    "Expected format: 'yyyy-MM-dd' or 'yyyy-MM-ddTHH:mm:ss'", e2);
            }
        }
    }
}

