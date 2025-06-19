# 📚 Buenas Prácticas de Escritura de Código

Este documento define los estándares para escribir código limpio, mantenible y coherente en los proyectos **Spring Boot** (backend) y **Angular** (frontend).

---

## 🧩 ESTRUCTURA GENERAL DEL PROYECTO

### Backend (Spring Boot)
```
backend/
├── src/main/java/com/erp/api
│   ├── controller
│   ├── dto
│   ├── entity
│   ├── exception
│   ├── mapper
│   ├── repository
│   ├── service
│   └── config
├── src/test/java/...
└── application.yml
```

### Frontend (Angular)
```
frontend/
├── src/app
│   ├── core
│   ├── shared
│   ├── modules
│   │   └── courses
│   │       ├── components
│   │       ├── pages
│   │       ├── services
│   │       └── models
│   ├── app-routing.module.ts
│   └── app.module.ts
└── environments
```

---

## 🔡 NOMENCLATURA Y CONVENCIONES

### 🌱 Spring Boot
- **Clases**: PascalCase (`CourseController`, `UserService`)
- **Paquetes**: minúscula (`com.erp.api.controller`)
- **Variables**: camelCase (`courseName`, `studentList`)
- **Constantes**: UPPER_SNAKE_CASE (`DEFAULT_LIMIT`)
- **Métodos**: camelCase (`getAllCourses()`)
- **Endpoints REST**: kebab-case (`/api/courses/by-professor`)

### ⚡ Angular
- **Componentes**: PascalCase (`CourseListComponent`)
- **Servicios**: PascalCase (`CourseService`)
- **Interfaces**: prefijo `I` opcional (`Course`, `ICourse`)
- **Archivos**: kebab-case (`course-list.component.ts`)
- **Variables/métodos**: camelCase

---

## 🧼 PRÁCTICAS GENERALES DE CÓDIGO

### 📌 Spring Boot
- ✅ Aplica principios SOLID
- ✅ Separa responsabilidades (Controller ↔ Service ↔ Repository)
- ✅ Usa DTOs para exponer datos al cliente
- ✅ Evita lógica en los controladores
- ✅ No expongas entidades directamente
- ✅ Usa `@Transactional` cuando sea necesario
- ✅ Loguea errores y flujos críticos
- ✅ Usa excepciones personalizadas

### 📌 Angular
- ✅ Mantén lógica en servicios, no en componentes
- ✅ Usa `rxjs` para suscripciones y async pipe para evitar fugas de memoria
- ✅ Organiza componentes por módulos
- ✅ Usa interfaces para tipado fuerte
- ✅ Evita lógica duplicada
- ✅ Separa lógica de presentación y lógica de negocio

---

## ✅ PRÁCTICAS ESPECÍFICAS

### 🔹 Validaciones en Spring
- Usa `@Valid` y anotaciones como `@NotNull`, `@Size`, etc.

```java
@PostMapping
public ResponseEntity<?> create(@Valid @RequestBody CourseRequest request) {
    ...
}
```

### 🔹 Manejo de errores
- Centralizado con `@ControllerAdvice`
- Excepciones personalizadas: `NotFoundException`, `BadRequestException`, etc.

### 🔹 Swagger (OpenAPI)
- Anota controllers con `@Operation` y `@ApiResponse`

```java
@Operation(summary = "Obtiene curso por ID")
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "Curso encontrado"),
    @ApiResponse(responseCode = "404", description = "Curso no encontrado")
})
```

### 🔹 Seguridad
- No expongas contraseñas ni tokens
- Usa `@PreAuthorize` o filtros de seguridad

### 🔹 Uso de servicios en Angular
```ts
constructor(private courseService: CourseService) {}

ngOnInit() {
  this.courseService.getCourses().subscribe(courses => this.courses = courses);
}
```

---

## 🧪 PRUEBAS

### Spring Boot
- Usa `@SpringBootTest` para pruebas de integración
- `@WebMvcTest` para controllers
- Mockea servicios con Mockito

### Angular
- Pruebas unitarias con Jasmine y Karma
- Pruebas de componentes y servicios separados

---

## 🧾 COMENTARIOS
- Usa comentarios solo cuando el código no se explica por sí solo
- No comentes código muerto (elimínalo)

---

## 📌 CONSIDERACIONES FINALES
- Mantén tu código limpio y coherente
- Haz commits pequeños, descriptivos y enfocados
- Sigue las reglas de linting y formateo del proyecto
- Revisa y valida PRs antes de mergear

Este documento puede evolucionar conforme el equipo crece o cambian las tecnologías.

