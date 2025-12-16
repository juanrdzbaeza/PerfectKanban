# Perfect Kanban — Guía de uso y desarrollo

Este repositorio contiene una pequeña aplicación Kanban (MVP) creada con Create React App en el frontend y un backend Express que persiste en SQLite.

Resumen rápido
- Frontend: React (Create React App).
- Backend: Express + sqlite3 en `server/index.js`.
- Persistencia: exclusivamente SQLite (archivo: `server/data/kanban.db`).

Objetivo
- Tener una única fuente de verdad (SQLite) para que cualquier cliente que abra la app (otro navegador, ventana incógnita, etc.) vea el mismo tablero.

Contenido
- Arquitectura
- Cómo arrancar (desarrollo)
- Variables y proxy (dev)
- Endpoints de la API
- Comportamiento de persistencia y sincronización
- Migración desde localStorage (opcional)
- Tests
- Problemas comunes y solución
- Contribuir

---

Arquitectura

- `src/` — frontend React. Componentes, hooks y estado.
- `server/` — backend Express y base de datos SQLite.
- `server/data/kanban.db` — archivo SQLite donde se guarda el estado del tablero.

Cómo arrancar (desarrollo)

1) Instalar dependencias (desde la raíz del repo):

```powershell
npm install
```

2) Arrancar el backend (escucha por defecto en el puerto 4000):

```powershell
npm run server
```

3) En otra terminal, arrancar el frontend (dev server en 3000):

```powershell
npm start
```

- El dev server de CRA está configurado con `proxy` hacia `http://localhost:4000` (ver `package.json`) para que las llamadas a `/api/...` se redirijan al backend durante el desarrollo.
- El frontend hará GET `/api/board/:id` al montar y POST `/api/board/:id` cuando haya cambios (persistencia única en SQLite).

Variables de entorno

- Puedes controlar la sincronización con la variable `REACT_APP_USE_SERVER` — en este repo por defecto hemos creado `.env` con:

```
REACT_APP_USE_SERVER=true
```

Esto hace que, en desarrollo, el frontend use la API para hidratar y persistir. CRA lee `.env` al arrancar; reinicia `npm start` si cambias el archivo.

API / Endpoints

- GET /api/health
  - Respuesta: `{ ok: true }`

- GET /api/board/:id
  - Devuelve el board con id `:id`. Si no existe, el servidor crea automáticamente un board por defecto (estructura inicial) y lo devuelve. Esto garantiza que cualquier cliente siempre obtenga un tablero.
  - Respuesta: `{ id, data }`

- POST /api/board/:id
  - Guarda o actualiza el board en SQLite. Body: JSON con la estructura del estado (listas, cards, etc.). Respuesta: `{ ok: true, id, updatedAt }`.

- POST /api/upload
  - Mock de subida: devuelve una URL falsa (no implementa almacenamiento real).

Persistencia: reglas importantes

- Única fuente de verdad: SQLite (archivo `server/data/kanban.db`).
- Flujo en el frontend:
  1. Al montar, el hook personalizado hace GET `/api/board/:id` para hidratar el estado desde la BD.
  2. La primera sincronización (POST) está bloqueada hasta que la GET inicial haya finalizado. Esto evita sobrescribir la BD con el estado inicial del cliente.
  3. Después de la hidratación, cada cambio en el estado cliente produce un POST para persistir el nuevo estado.
- Estrategia de resolución de conflictos actual: "last write wins" (el último POST sobrescribe el estado almacenado). Si varios clientes editan simultáneamente, puede haber pérdida de cambios; recomendamos revisar las opciones en la sección de mejoras.

Migración desde localStorage (opcional)

- Si antes la app guardaba en `localStorage` (sesiones previas), esos datos no se migran automáticamente.
- Opciones para migrar:
  - Manual (desde consola de navegador): leer `localStorage.getItem('tu-key')` y hacer POST a `/api/board/:id` con el JSON resultante.
  - Implementar una ruta `/api/migrate` o añadir una UI de importación. Si quieres, puedo añadir una migración automática que pregunte al usuario en la primera carga.

Tests

- Ejecutar la suite de tests:

```powershell
npm test -- --watchAll=false
```

Notas:
- Al ejecutar tests en jest (jsdom) verás warnings en consola sobre peticiones de red si el backend no está disponible. Esto no indica fallo en los tests; para eliminar esos warnings mockea `fetch` en los tests que los hacen.

Construcción y despliegue

- Para producción compila el frontend:

```powershell
npm run build
```

- En producción puedes servir el build estático y el backend desde el mismo servidor (o usar un reverse proxy). Asegúrate de configurar la ruta al backend en las peticiones si no usas el proxy de CRA.

Mejoras recomendadas (próximos pasos)

- Indicador de sincronización en la UI (sincronizado / sincronizando / error).
- Polling o WebSockets (SSE) para notificar a clientes cuando el tablero cambia y así mantener varias ventanas en sincronía en tiempo real.
- Estrategia de resolución de conflictos (ETags, versión/updatedAt, o merges/CRDT) si esperas ediciones concurrentes reales.
- Migración automática desde `localStorage` con confirmación de usuario.

Problemas comunes y solución rápida

- "No veo los cambios en otro navegador": asegúrate de que el backend esté corriendo (`npm run server`) y que el frontend use el proxy o llame al backend en `http://localhost:4000`.
- "El tablero vuelve al estado inicial al recargar": si esto ocurre, revisa la consola del navegador; normalmente era causado por un POST que se ejecuta antes de la GET inicial. El hook ahora bloquea el POST inicial. Si aún ves el problema, reinicia el servidor/back-end y confirma el contenido en `/api/board/:id` con `curl` o `Invoke-RestMethod`.
- Advertencias en tests (jsdom): mocks de `fetch` recomendados.

Contribuir

1. Crea una rama con tu feature/bugfix.
2. Haz commits atómicos y claros.
3. Abre Pull Request con descripción y pasos para reproducir.

Licencia

- Proyecto de ejemplo / educativo. bajo licencia del MIT.

