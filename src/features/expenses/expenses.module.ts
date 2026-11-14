import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpensesController } from './expenses.controller.js';
import { ExpensesService } from './expenses.service.js';
import { ExpenseRecord, ExpenseSchema } from './schemas/expense.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ExpenseRecord.name,
        schema: ExpenseSchema,
      },
    ]),
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
