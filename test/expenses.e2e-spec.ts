import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('ExpensesController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
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
  });

  it('GET /expenses returns 200', async () => {
    const response = await request(app.getHttpServer())
      .get('/expenses')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toMatchObject({
      description: expect.any(String),
      amount: expect.any(Number),
      currency: expect.any(String),
      categoryId: expect.any(String),
    });
  });

  it('POST /expenses creates an expense', async () => {
    const newExpense = {
      description: 'Dinner',
      amount: 25,
      currency: 'USD',
      categoryId: '507f1f77bcf86cd799439011',
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
      categoryId: '507f1f77bcf86cd799439011',
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
      categoryId: '507f1f77bcf86cd799439011',
      extra: 'not allowed',
    };

    await request(app.getHttpServer())
      .post('/expenses')
      .send(invalidExpense)
      .expect(400);
  });

  it('POSTed expense is present in the next GET request', async () => {
    const newExpense = {
      description: 'Hotel',
      amount: 120,
      currency: 'USD',
      categoryId: 'travel',
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
        categoryId: 'transport',
      })
      .expect(400);
  });

  it('GET /expenses/:id returns an existing expense', async () => {
    // Arrange: fetch existing expense by id
    const expense = {
      description: 'Test expense',
      amount: 50,
      currency: 'PLN',
      categoryId: '507f1f77bcf86cd799439011',
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
    // Act: use unexisting id
    const nonExistingId = 'non-existing-expense-id';

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
        categoryId: '507f1f77bcf86cd799439011',
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
      categoryId: '507f1f77bcf86cd799439011',
    });
  });

  it('DELETE /expenses/:id removes an expense', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/expenses')
      .send({
        description: 'Expense to delete',
        amount: 20,
        currency: 'EUR',
        categoryId: '507f1f77bcf86cd799439011',
      })
      .expect(201);

    const id = createResponse.body.id;

    await request(app.getHttpServer()).delete(`/expenses/${id}`).expect(204);

    await request(app.getHttpServer()).get(`/expenses/${id}`).expect(404);
  });

  afterEach(async () => {
    await app.close();
  });
});
