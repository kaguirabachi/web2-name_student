import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { StudentsModule } from './modules/students/students.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [PrismaModule, StudentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
