# NEITEC-TEST

Este es un proyecto construido con NestJS y PostgreSQL. A continuación, se detallan los pasos necesarios para ejecutar el proyecto en distintos entornos.

## Ejecución Local
### Requisitos previos
Asegúrate de tener instalados los siguientes programas:

- [Node.js](https://nodejs.org/)(Versión 18)
- [PostgreSQL](https://www.postgresql.org/)(Versión  14)
- [npm](https://www.npmjs.com/)(Versión 10)

### Pasos de ejecución
1. **Clona el repositorio**
  ```
  git clone https://github.com/arnel-sanchez/neitec-test
  cd neitec-test
  ```

1. **Instala las dependencias**

  ```
  npm install --legacy-peer-deps
  ```

1. **Ejecución del proyecto**

  ```
  npm run start:dev
  ```

### Acceso a la API
La API estará disponible en http://localhost:3000. Puedes usar http://localhost:3000/api para probar los endpoints desde el swagger de documentación.

## Ejecución con Docker
### Requisitos previos
Asegúrate de tener instalados los siguientes programas:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)

### Pasos de ejecución
1. **Clona el repositorio**

  ```
  git clone https://github.com/arnel-sanchez/neitec-test
  cd neitec-test
  ```

1. **Ejecución del proyecto**

  ```
  docker-compose build && docker-compose up
  ```