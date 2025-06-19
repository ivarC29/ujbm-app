package pe.edu.bausate.app.infraestructure.util.helper;

import java.util.Random;
import java.util.function.Function;

public class CommonUtils {
    public static String generateUniqueNumericCode(int length, Function<String, Boolean> existsFunction) {
        String numericCode;
        Random random = new Random();
        do {
            numericCode = String.format("%0" + length + "d", random.nextInt((int) Math.pow(10, length)));
        } while (existsFunction.apply(numericCode));
        return numericCode;
    }
}
