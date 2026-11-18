import { StandardSchemaValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

type Row = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  groupName: string;
  createdAt: Date;
  updatedAt: Date;
};

const rows: Row[] = [];
let nextId = 1;

const fakePrisma = {
  $connect: async () => undefined,
  $disconnect: async () => undefined,
  student: {
    create: async ({ data }: { data: Omit<Row, 'id' | 'createdAt' | 'updatedAt'> }) => {
      if (rows.some((row) => row.email === data.email)) {
        throw Object.assign(new Error('Unique constraint failed'), { code: 'P2002' });
      }
      const now = new Date();
      const created: Row = {
        id: nextId++,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        groupName: data.groupName ?? 'IS41R',
        createdAt: now,
        updatedAt: now,
      };
      rows.push(created);
      return created;
    },
    findMany: async () => [...rows],
    findUnique: async ({ where }: { where: { id: number } }) =>
      rows.find((row) => row.id === where.id) ?? null,
    update: async ({ where, data }: { where: { id: number }; data: Partial<Row> }) => {
      const row = rows.find((item) => item.id === where.id);
      if (!row) {
        throw Object.assign(new Error('Record not found'), { code: 'P2025' });
      }
      Object.assign(row, data, { updatedAt: new Date() });
      return row;
    },
    delete: async ({ where }: { where: { id: number } }) => {
      const index = rows.findIndex((row) => row.id === where.id);
      if (index === -1) {
        throw Object.assign(new Error('Record not found'), { code: 'P2025' });
      }
      return rows.splice(index, 1)[0];
    },
  },
};

describe('Students API (e2e)', () => {
  let app: Awaited<ReturnType<ReturnType<typeof Test.createTestingModule>['compile']>>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(fakePrisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new StandardSchemaValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    rows.length = 0;
    nextId = 1;
  });

  it('GET /health', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);
    expect(response.body).toEqual({ status: 'ok', service: 'students', group: 'IS41R' });
  });

  it('POST /students validates the payload', async () => {
    await request(app.getHttpServer())
      .post('/students')
      .send({ firstName: 'Ilia', lastName: 'Shushvaliuc', email: 'not-an-email' })
      .expect(400);
  });

  it('creates, reads, updates and deletes a student', async () => {
    const created = await request(app.getHttpServer())
      .post('/students')
      .send({
        firstName: 'Ilia',
        lastName: 'Shushvaliuc',
        email: 'ilia.shushvaliuc@usarb.md',
      })
      .expect(201);

    expect(created.body).toMatchObject({ groupName: 'IS41R', lastName: 'Shushvaliuc' });

    const list = await request(app.getHttpServer()).get('/students').expect(200);
    expect(list.body).toHaveLength(1);

    const one = await request(app.getHttpServer())
      .get(`/students/${created.body.id}`)
      .expect(200);
    expect(one.body.email).toBe('ilia.shushvaliuc@usarb.md');

    const updated = await request(app.getHttpServer())
      .patch(`/students/${created.body.id}`)
      .send({ groupName: 'IS42R' })
      .expect(200);
    expect(updated.body.groupName).toBe('IS42R');

    await request(app.getHttpServer()).delete(`/students/${created.body.id}`).expect(204);
    await request(app.getHttpServer()).get(`/students/${created.body.id}`).expect(404);
  });
});
