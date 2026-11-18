# Students API — group IS41R

A small REST API that keeps the list of students of group **IS41R** at Alecu Russo Balti State University (USARB). Course project for the Web Technologies 2 course; the structure follows the `warehouse` sample API.

| Stack | |
| --- | --- |
| Framework | NestJS 12 (ESM, TypeScript) |
| Database | PostgreSQL 18 |
| ORM | Prisma 7 with the `@prisma/adapter-pg` driver adapter |
| Validation | Zod via `StandardSchemaValidationPipe` |
| Docs | Swagger UI at `/docs` |
| Tests | Vitest + Supertest |
| Tooling | oxlint, Prettier, Docker Compose |

## Group roster

The seed migration inserts the five students of the group:

| Name | Email |
| --- | --- |
| Ilia Sushvaliuk | ilia.sushvaliuk@usarb.md |
| Dmitrii Moskalchuk | dmitrii.moskalchuk@usarb.md |
| Nikita Basiuk | nikita.basiuk@usarb.md |
| Egor Dmitriev | egor.dmitriev@usarb.md |
| Denis Floresco | denis.floresco@usarb.md |

Names are stored in Latin transliteration so that they stay readable in URLs, logs and JSON responses.

## API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Service greeting |
| `GET` | `/health` | Readiness probe |
| `GET` | `/students` | List students, ordered by last name |
| `GET` | `/students/:id` | One student, `404` when missing |
| `POST` | `/students` | Add a student |
| `PATCH` | `/students/:id` | Update a student |
| `DELETE` | `/students/:id` | Remove a student (`204`) |
| `GET` | `/docs` | Swagger UI |

A student is `{ id, firstName, lastName, email, groupName, createdAt, updatedAt }`. `email` is unique — creating a duplicate returns `409`. `groupName` defaults to `IS41R`.

```bash
curl -X POST http://localhost:3000/students \
  -H 'Content-Type: application/json' \
  -d '{"firstName":"Ilia","lastName":"Sushvaliuk","email":"ilia.sushvaliuk@usarb.md"}'
```

## Running with Docker

```bash
docker compose up --build
```

The API starts on <http://localhost:3000> once PostgreSQL reports healthy. The entrypoint applies pending migrations (`prisma migrate deploy`) before booting, so the roster is created on the first start. The database lives in the `students_pgdata` volume — `docker compose down` keeps it, `docker compose down -v` wipes it.

PostgreSQL is exposed on `localhost:5432` (`warehouse_user` / `warehouse_password`, database `students_db`).

## Running without Docker

```bash
npm ci
cp .env.example .env      # point DATABASE_URL at a running PostgreSQL
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

Open <http://localhost:3000/docs> for the generated API reference.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run start:dev` | Watch mode |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run the compiled build |
| `npm run lint` | oxlint with type-aware rules |
| `npm run format` | Prettier |
| `npm test` | Unit tests |
| `npm run test:e2e` | HTTP tests against an in-memory Prisma double |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Prisma Studio |

## Project layout

```
prisma/            schema, migrations (including the IS41R seed)
src/
  modules/students controller, service, Zod schemas
  prisma/          PrismaService and its global module
  main.ts          bootstrap, validation pipe, Swagger
test/              end-to-end specs
```

## Notes

- The Prisma client is generated into `src/generated/prisma` and is not committed; run `npx prisma generate` after a fresh clone.
- Unit and e2e tests do not need a database: the e2e suite overrides `PrismaService` with an in-memory double.
