# 📘 Git Workflow para el Proyecto

## 🧱 Ramas Principales

| Rama     | Uso                                           |
|----------|-----------------------------------------------|
| `prod`   | Código estable en producción                  |
| `dev`| Código en desarrollo (funcionalidades en curso)|

---

## 🌿 Ramas Temporales

| Tipo      | Nombre Ejemplo                   | Uso                                           |
|-----------|----------------------------------|-----------------------------------------------|
| Feature   | `feature/crear-endpoint-curso`   | Nueva funcionalidad                          |
| Bugfix    | `bugfix/fix-nombre-curso`        | Corrección de errores                         |
| Hotfix    | `hotfix/fix-error-produccion`    | Fix urgente en producción                     |
| Release   | `release/v1.0.0`                 | Preparar versión para producción              |

---

## 🔁 Flujo de Trabajo

### 1. Clonar repositorio
```bash
git clone https://github.com/usuario/nombre-repo.git
cd nombre-repo
```

### 2. Crear rama `develop` si no existe
```bash
git checkout -b develop
# o si ya existe en remoto
git checkout -b develop origin/develop
git push -u origin develop
```

### 3. Crear nueva rama para tarea
```bash
git checkout develop
git pull
git checkout -b feature/crear-endpoint-curso
```

### 4. Trabaja y haz commits claros
```bash
git add .
git commit -m "feat: agrega endpoint para registrar curso"
```

### Convención de commits

| Tipo     | Significado                      |
|----------|----------------------------------|
| feat     | Nueva funcionalidad              |
| fix      | Corrección de error              |
| refactor | Refactor sin cambiar funcionalidad|
| docs     | Cambios en documentación         |
| test     | Agregado o actualización de pruebas |
| chore    | Tareas menores (config, scripts) |

### 5. Sube rama al remoto
```bash
git push -u origin feature/crear-endpoint-curso
```

### 6. Crear Pull Request (PR)
- Base: `develop`
- Revisa tu propio código o solicita revisión
- Agrega descripción clara

### 7. Merge a develop y borrar rama
```bash
git checkout develop
git pull
git merge feature/crear-endpoint-curso
git push

git branch -d feature/crear-endpoint-curso
# y borrar remoto
git push origin --delete feature/crear-endpoint-curso
```

### 8. Merge a main para producción
```bash
git checkout main
git pull
git merge develop
git tag v1.0.0 -m "Primera versión estable"
git push origin main --tags
```

---

## 🧹 Limpieza periódica
```bash
git fetch --prune
git branch --merged develop
git branch -d feature/ramas-viejas
```

---

## 🔐 Protección de ramas
Configura en GitHub:
- Requerir PR para merge
- Revisión obligatoria
- Historial lineal (sin merge commits innecesarios)

---

## ✅ Ejemplo completo
```bash
git checkout develop
git pull
git checkout -b feature/registro-matricula
# trabajo
# commits

git push -u origin feature/registro-matricula
# PR → revisión → merge

git checkout develop
git pull
git merge feature/registro-matricula
git push

# limpieza
git branch -d feature/registro-matricula
git push origin --delete feature/registro-matricula
```

---

Este flujo permite mantener el orden, trazabilidad y colaboración efectiva en el equipo de desarrollo. ✅

