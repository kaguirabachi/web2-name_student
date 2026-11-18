import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  createStudentSchema,
  studentIdSchema,
  studentSchema,
  updateStudentSchema,
  type CreateStudentDto,
  type UpdateStudentDto,
} from './dto/student.schemas.js';
import { StudentsService } from './students.service.js';

@ApiTags('students')
@ApiBadRequestResponse({ description: 'Validation failed' })
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a student to the group' })
  @ApiCreatedResponse({ standardSchema: studentSchema })
  @ApiConflictResponse({ description: 'Email already registered' })
  create(@Body({ schema: createStudentSchema }) body: CreateStudentDto) {
    return this.studentsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'List every student of IS41R' })
  @ApiOkResponse({ standardSchema: studentSchema, isArray: true })
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one student by id' })
  @ApiOkResponse({ standardSchema: studentSchema })
  @ApiNotFoundResponse({ description: 'Student not found' })
  findOne(@Param('id', { schema: studentIdSchema }) id: number) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a student' })
  @ApiOkResponse({ standardSchema: studentSchema })
  @ApiNotFoundResponse({ description: 'Student not found' })
  @ApiConflictResponse({ description: 'Email already registered' })
  update(
    @Param('id', { schema: studentIdSchema }) id: number,
    @Body({ schema: updateStudentSchema }) body: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a student from the group' })
  @ApiNoContentResponse({ description: 'Student removed' })
  @ApiNotFoundResponse({ description: 'Student not found' })
  async remove(@Param('id', { schema: studentIdSchema }) id: number) {
    await this.studentsService.remove(id);
  }
}
