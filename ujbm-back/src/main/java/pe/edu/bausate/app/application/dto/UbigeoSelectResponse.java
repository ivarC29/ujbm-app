package pe.edu.bausate.app.application.dto;

public record UbigeoSelectResponse(
        String code,
        String name
) {
    public static UbigeoSelectResponse of() {
        return new UbigeoSelectResponse(null, null);
    }
}
