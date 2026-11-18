import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { CreateStudentDto, UpdateStudentDto } from './dto/student.schemas.js';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateStudentDto) {
    try {
      return await this.prisma.student.create({ data });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(`Student with email ${data.email} already exists`);
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.student.findMany({
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student ${id} not found`);
    }
    return student;
  }

  async update(id: number, data: UpdateStudentDto) {
    await this.findOne(id);
    try {
      return await this.prisma.student.update({ where: { id }, data });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(`Student with email ${data.email} already exists`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.student.delete({ where: { id } });
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 'P2002'
    );
  }
}
