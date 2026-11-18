import { ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service.js';
import { StudentsService } from './students.service.js';

type Student = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  groupName: string;
  createdAt: Date;
  updatedAt: Date;
};

function createPrismaMock(initial: Student[] = []) {
  const rows = [...initial];
  let nextId = rows.length + 1;

  return {
    rowCount: () => rows.length,
    student: {
      create: vi.fn(
        async ({
          data,
        }: {
          data: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'groupName'> & {
            groupName?: string;
          };
        }) => {
          if (rows.some((row) => row.email === data.email)) {
            throw Object.assign(new Error('Unique constraint failed'), { code: 'P2002' });
          }
          const now = new Date();
          const created: Student = {
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
      ),
      findMany: vi.fn(async () => [...rows]),
      findUnique: vi.fn(
        async ({ where: { id } }: { where: { id: number } }) =>
          rows.find((row) => row.id === id) ?? null,
      ),
      update: vi.fn(async ({ where: { id }, data }: { where: { id: number }; data: Partial<Student> }) => {
        const row = rows.find((item) => item.id === id);
        if (!row) {
          throw Object.assign(new Error('Record not found'), { code: 'P2025' });
        }
        Object.assign(row, data, { updatedAt: new Date() });
        return row;
      }),
      delete: vi.fn(async ({ where: { id } }: { where: { id: number } }) => {
        const index = rows.findIndex((row) => row.id === id);
        if (index === -1) {
          throw Object.assign(new Error('Record not found'), { code: 'P2025' });
        }
        return rows.splice(index, 1)[0];
      }),
    },
  };
}

describe('StudentsService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: StudentsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new StudentsService(prisma as unknown as PrismaService);
  });

  it('creates a student with the default group', async () => {
    const student = await service.create({
      firstName: 'Ilia',
      lastName: 'Shushvaliuc',
      email: 'ilia.shushvaliuc@usarb.md',
    });

    expect(student).toMatchObject({ id: 1, groupName: 'IS41R', firstName: 'Ilia' });
    expect(prisma.rowCount()).toBe(1);
  });

  it('rejects a duplicate email with 409', async () => {
    const payload = {
      firstName: 'Ilia',
      lastName: 'Shushvaliuc',
      email: 'ilia.shushvaliuc@usarb.md',
    };

    await service.create(payload);
    await expect(service.create(payload)).rejects.toBeInstanceOf(ConflictException);
  });

  it('lists students ordered by last name', async () => {
    await service.create({ firstName: 'Denis', lastName: 'Floresco', email: 'd@usarb.md' });
    await service.create({ firstName: 'Egor', lastName: 'Dmitriev', email: 'e@usarb.md' });

    const students = await service.findAll();

    expect(prisma.student.findMany).toHaveBeenCalledWith({
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
    expect(students).toHaveLength(2);
  });

  it('throws 404 for a missing student', async () => {
    await expect(service.findOne(42)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates an existing student', async () => {
    const created = await service.create({
      firstName: 'Nikita',
      lastName: 'Basiuc',
      email: 'nikita.basiuc@usarb.md',
    });

    const updated = await service.update(created.id, { groupName: 'IS42R' });
    expect(updated.groupName).toBe('IS42R');
  });

  it('removes a student', async () => {
    const created = await service.create({
      firstName: 'Dmitrii',
      lastName: 'Moscalciuc',
      email: 'dmitrii.moscalciuc@usarb.md',
    });

    await service.remove(created.id);
    expect(prisma.rowCount()).toBe(0);
    await expect(service.findOne(created.id)).rejects.toBeInstanceOf(NotFoundException);
  });
});
