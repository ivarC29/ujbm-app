package pe.edu.bausate.app.application.client;

public interface GovernmentClient {
    String get(String endpoint);
    String post(String endpoint, Object request);
}
