import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ExpensesModule } from './features/expenses/expenses.module.js';

@Module({
  imports: [ExpensesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
