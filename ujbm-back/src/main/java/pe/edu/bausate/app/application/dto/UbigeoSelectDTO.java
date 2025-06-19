package pe.edu.bausate.app.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.Serializable;

@Getter
@Service
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UbigeoSelectDTO implements Serializable {
    private String code;
    private String name;
}
