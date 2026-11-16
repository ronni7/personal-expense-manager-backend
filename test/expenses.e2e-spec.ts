import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { ExpenseRecord } from '../src/features/expenses/schemas/expense.schema.js';

describe('ExpensesController (e2e)', () => {
  let app: INestApplication<App>;
  let expenseModel: Model<ExpenseRecord>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    expenseModel = app.get<Model<ExpenseRecord>>(
      getModelToken(ExpenseRecord.name),
    );

    if (expenseModel.db.name !== 'pem_test') {
      await app.close();

      throw new Error(
        `E2E tests must use pem_test, but connected to "${expenseModel.db.name}"`,
      );
    }
  });

  beforeEach(async () => {
    await expenseModel.deleteMany({}).exec();
  });

  it('GET /expenses returns 200', async () => {
    const response = await request(app.getHttpServer())
      .get('/expenses')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toEqual(0);
  });

  it('POST /expenses creates an expense', async () => {
    const newExpense = {
      description: 'Dinner',
      amount: 25,
      currency: 'USD',
      categoryId: '6afb0d37a042d0237cdf4533',
    };

    const response = await request(app.getHttpServer())
      .post('/expenses')
      .send(newExpense)
      .expect(201);

    expect(response.body).toMatchObject({
      ...newExpense,
      id: expect.any(String),
    });
  });

  it('POST /expenses with corrupted DTO returns 400', async () => {
    const invalidExpense = {
      description: 'Dinner',
      amount: 'number instead of string',
      currency: 'USD',
      categoryId: '6afb0d37a042d0237cdf4533',
    };

    await request(app.getHttpServer())
      .post('/expenses')
      .send(invalidExpense)
      .expect(400);
  });

  it('POST /expenses with unsupported payload fields returns 400', async () => {
    const invalidExpense = {
      description: 'Dinner',
      amount: 25,
      currency: 'USD',
      categoryId: '6afb0d37a042d0237cdf4533',
      extra: 'not allowed',
    };

    await request(app.getHttpServer())
      .post('/expenses')
      .send(invalidExpense)
      .expect(400);
  });

  it('POST /expenses rejects negative amount', async () => {
    const response = await request(app.getHttpServer())
      .post('/expenses')
      .send({
        description: 'Taxi',
        amount: -10,
        currency: 'USD',
        categoryId: '6afb0d37a042d0237cdf4533',
      })
      .expect(400);

    expect(response.body.message).toContain('amount must be a positive number');
  });

  it('POSTed expense is present in the next GET request', async () => {
    const newExpense = {
      description: 'Hotel',
      amount: 120,
      currency: 'USD',
      categoryId: '6afb0d37a042d0237cdf4533',
    };

    const createdResponse = await request(app.getHttpServer())
      .post('/expenses')
      .send(newExpense)
      .expect(201);

    const listResponse = await request(app.getHttpServer())
      .get('/expenses')
      .expect(200);

    expect(listResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...newExpense,
          id: createdResponse.body.id,
        }),
      ]),
    );
  });
  it('POST /expenses/create rejects unsupported currency', async () => {
    await request(app.getHttpServer())
      .post('/expenses')
      .send({
        description: 'Taxi',
        amount: 20,
        currency: 'BTC',
        categoryId: '6afb0d37a042d0237cdf4533',
      })
      .expect(400);
  });

  it('GET /expenses/:id returns an existing expense', async () => {
    // Arrange: fetch existing expense by id
    const expense = {
      description: 'Test expense',
      amount: 50,
      currency: 'PLN',
      categoryId: '6afb0d37a042d0237cdf4533',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/expenses')
      .send(expense)
      .expect(201);

    const id = createResponse.body.id;

    // Act: request the expense by id
    const response = await request(app.getHttpServer())
      .get(`/expenses/${id}`)
      .expect(200);

    // Assert: 200 correct data
    expect(response.body).toMatchObject({
      id: id,
      description: expense.description,
      amount: expense.amount,
      currency: expense.currency,
      categoryId: expense.categoryId,
    });
  });

  it('GET /expenses/:id returns 404 when expense does not exist', async () => {
    const nonExistingId = '6afb0d37a042d0237cdf4533'; // Assuming this ID does not exist in the test database

    // Assert: 404 not found
    await request(app.getHttpServer())
      .get(`/expenses/${nonExistingId}`)
      .expect(404);
  });

  it('PATCH /expenses/:id updates only provided fields', async () => {
    // Arrange - create an expense
    const createResponse = await request(app.getHttpServer())
      .post('/expenses')
      .send({
        description: 'Original description',
        amount: 50,
        currency: 'PLN',
        categoryId: '6afb0d37a042d0237cdf4533',
      })
      .expect(201);

    const id = createResponse.body.id;

    // Act - update only description
    const updateResponse = await request(app.getHttpServer())
      .patch(`/expenses/${id}`)
      .send({
        description: 'Updated description',
      })
      .expect(200);

    // Assert
    expect(updateResponse.body).toMatchObject({
      id,
      description: 'Updated description',
      amount: 50,
      currency: 'PLN',
      categoryId: '6afb0d37a042d0237cdf4533',
    });
  });

  it('DELETE /expenses/:id removes an expense', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/expenses')
      .send({
        description: 'Expense to delete',
        amount: 20,
        currency: 'EUR',
        categoryId: '6afb0d37a042d0237cdf4533',
      })
      .expect(201);

    const id = createResponse.body.id;

    await request(app.getHttpServer()).delete(`/expenses/${id}`).expect(204);

    await request(app.getHttpServer()).get(`/expenses/${id}`).expect(404);
  });

  afterAll(async () => {
    await expenseModel.deleteMany({}).exec();
    await app.close();
  });
});
