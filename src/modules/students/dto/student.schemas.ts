import { z } from 'zod';

const firstName = z
  .string()
  .trim()
  .min(1, 'First name is required')
  .max(100)
  .meta({ description: 'Student first name', example: 'Ilia' });

const lastName = z
  .string()
  .trim()
  .min(1, 'Last name is required')
  .max(100)
  .meta({ description: 'Student last name', example: 'Shushvaliuk' });

const email = z
  .email('A valid email is required')
  .max(255)
  .meta({ description: 'University email address', example: 'ilia.shushvaliuk@usarb.md' });

const groupName = z
  .string()
  .trim()
  .min(1)
  .max(20)
  .meta({ description: 'Study group, defaults to IS41R', example: 'IS41R' });

export const studentSchema = z
  .object({
    id: z.number().int().meta({ example: 1 }),
    firstName: z.string().meta({ example: 'Ilia' }),
    lastName: z.string().meta({ example: 'Shushvaliuk' }),
    email: z.string().meta({ example: 'ilia.shushvaliuk@usarb.md' }),
    groupName: z.string().meta({ example: 'IS41R' }),
    createdAt: z.date().meta({ example: '2026-02-01T10:00:00.000Z' }),
    updatedAt: z.date().meta({ example: '2026-02-01T10:00:00.000Z' }),
  })
  .meta({ id: 'Student' });

export const createStudentSchema = z
  .object({
    firstName,
    lastName,
    email,
    groupName: groupName.optional(),
  })
  .meta({ id: 'CreateStudent' });

export const updateStudentSchema = z
  .object({
    firstName: firstName.optional(),
    lastName: lastName.optional(),
    email: email.optional(),
    groupName: groupName.optional(),
  })
  .meta({ id: 'UpdateStudent' });

export const studentIdSchema = z.coerce
  .number()
  .int()
  .positive()
  .meta({ description: 'Student id', example: 1 });

export type CreateStudentDto = z.infer<typeof createStudentSchema>;
export type UpdateStudentDto = z.infer<typeof updateStudentSchema>;
