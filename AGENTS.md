# AGENTS.md

## What this project is

REST API for the students of group IS41R (USARB, Balti). One domain entity: `Student`. Follow the existing module layout instead of inventing a new one.

## Conventions

- NestJS 12, ESM. Relative imports end in `.js`; `__dirname` does not exist (use `import.meta.dirname`).
- Validation uses Zod schemas in `src/modules/<feature>/dto/*.schemas.ts`, wired through `StandardSchemaValidationPipe` and `@Body({ schema })` / `@Param('id', { schema })`. Do not add `class-validator`.
- Every endpoint is documented with `@nestjs/swagger` decorators, including `standardSchema` response types.
- Database access goes through the global `PrismaService`. Schema changes need a migration in `prisma/migrations` plus `npx prisma generate`.
- Tests run on Vitest, so mocks are `vi.fn()`. Unit tests live next to the code (`*.spec.ts`), HTTP tests in `test/` (`*.e2e-spec.ts`).

## Commands

```bash
npm run build      # nest build
npm run lint       # oxlint --type-aware
npm test           # vitest run (src)
npm run test:e2e   # vitest run (test/)
npx prisma generate
npx prisma migrate dev --name <change>
```

There is no local PostgreSQL in the default setup: e2e tests override `PrismaService` with an in-memory double, so they must keep passing without a database.
