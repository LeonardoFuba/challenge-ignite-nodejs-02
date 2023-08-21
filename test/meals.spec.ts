import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import request from 'supertest'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Leonardo do Nascimento',
      email: 'leonardo3.nascimento@gmail.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/19802320?v=4',
    })
    const cookie = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookie)
      .send({
        name: 'Sanduíche',
        description:
          'Sanduíche de pão integral com atum e salada de alface e tomate',
        dateTime: '2022-08-12T03:00:00.000Z',
        isInDiet: true,
      })
      .expect(201)
  })

  it('should be able to list all meals', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Leonardo do Nascimento',
      email: 'leonardo3.nascimento@gmail.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/19802320?v=4',
    })
    const cookie = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookie).send({
      name: 'Any Name',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      dateTime: '2022-08-12T03:00:00.000Z',
      isInDiet: true,
    })

    await request(app.server).post('/meals').set('Cookie', cookie).send({
      name: 'Sanduíche',
      description: 'Lorem Ipsum is simply dummy text of the printing.',
      dateTime: '2022-08-12T03:00:00.000Z',
      isInDiet: true,
    })

    await request(app.server).post('/meals').set('Cookie', cookie).send({
      name: 'Other Name',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      dateTime: '2022-08-12T03:00:00.000Z',
      isInDiet: false,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie)
      .expect(200)

    expect(listMealsResponse.body.meals).toHaveLength(3)

    expect(listMealsResponse.body.meals[1]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'Sanduíche',
        dateTime: expect.any(String),
        isInDiet: expect.any(Boolean),
      }),
    )
  })

  it('should be able to list all data for a single meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Leonardo do Nascimento',
      email: 'leonardo3.nascimento@gmail.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/19802320?v=4',
    })
    const cookie = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookie).send({
      name: 'Sanduíche',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      dateTime: '2022-08-12T03:00:00.000Z',
      isInDiet: true,
    })

    await request(app.server).post('/meals').set('Cookie', cookie).send({
      name: 'Other name',
      description: 'Lorem Ipsum is simply dummy text of the printing.',
      dateTime: '2022-08-12T03:00:00.000Z',
      isInDiet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookie)
      .expect(200)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'Sanduíche',
        description: expect.any(String),
        dateTime: expect.any(String),
        isInDiet: expect.any(Boolean),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        userId: expect.any(String),
      }),
    )
  })

  it('should be able to edit a meal by id', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Leonardo do Nascimento',
      email: 'leonardo3.nascimento@gmail.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/19802320?v=4',
    })
    const cookie = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookie).send({
      name: 'Sanduíche',
      description:
        'Sanduíche de pão integral com atum e salada de alface e tomate.',
      dateTime: '2022-08-12T03:00:00.000Z',
      isInDiet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    const updateMealResponse = await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookie)
      .send({
        name: 'Suco de melancia',
        description: 'Suco de fruta com água.',
        dateTime: '2023-05-20T16:34:51.954Z',
        isInDiet: true,
      })
      .expect(200)

    expect(updateMealResponse.body.meal).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'Suco de melancia',
        description: 'Suco de fruta com água.',
        dateTime: '2023-05-20T16:34:51.954Z',
        isInDiet: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        userId: expect.any(String),
      }),
    )
  })

  it('should be able to delete a meal by id', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Leonardo do Nascimento',
      email: 'leonardo3.nascimento@gmail.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/19802320?v=4',
    })
    const cookie = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookie).send({
      name: 'Sanduíche',
      description:
        'Sanduíche de pão integral com atum e salada de alface e tomate.',
      dateTime: '2022-08-12T03:00:00.000Z',
      isInDiet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookie)
      .expect(204)
  })

  it('should not be able to create a new meal without session id', async () => {
    const response = await request(app.server)
      .post('/meals')
      .send({
        name: 'Sanduíche',
        description:
          'Sanduíche de pão integral com atum e salada de alface e tomate',
        dateTime: '2022-08-12T03:00:00.000Z',
        isInDiet: true,
      })
      .expect(401)

    expect(response.body).toEqual(
      expect.objectContaining({
        error: 'Unauthorized.',
      }),
    )
  })

  it('should not be able to create a new meal with wrong session id', async () => {
    const unknownCookie = [
      `sessionId=${randomUUID()}; Max-Age=604800000; Path=/`,
    ]

    const response = await request(app.server)
      .post('/meals')
      .set('Cookie', unknownCookie)
      .send({
        name: 'Sanduíche',
        description:
          'Sanduíche de pão integral com atum e salada de alface e tomate',
        dateTime: '2022-08-12T03:00:00.000Z',
        isInDiet: true,
      })
      .expect(400)

    expect(response.body).toEqual(
      expect.objectContaining({
        error: 'User not found.',
      }),
    )
  })

  it('should not be able to list all meals without session id', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Leonardo do Nascimento',
      email: 'leonardo3.nascimento@gmail.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/19802320?v=4',
    })
    const cookie = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookie).send({
      name: 'Any Name',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      dateTime: '2022-08-12T03:00:00.000Z',
      isInDiet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .expect(401)

    expect(listMealsResponse.body).toEqual(
      expect.objectContaining({
        error: 'Unauthorized.',
      }),
    )
  })

  it('should not be able to list all data for a single meal without session id', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Leonardo do Nascimento',
      email: 'leonardo3.nascimento@gmail.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/19802320?v=4',
    })
    const cookie = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookie).send({
      name: 'Sanduíche',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      dateTime: '2022-08-12T03:00:00.000Z',
      isInDiet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .expect(401)

    expect(getMealResponse.body).toEqual(
      expect.objectContaining({
        error: 'Unauthorized.',
      }),
    )
  })

  it('should not be able to edit a meal without session id', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Leonardo do Nascimento',
      email: 'leonardo3.nascimento@gmail.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/19802320?v=4',
    })
    const cookie = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookie).send({
      name: 'Sanduíche',
      description:
        'Sanduíche de pão integral com atum e salada de alface e tomate.',
      dateTime: '2022-08-12T03:00:00.000Z',
      isInDiet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    const updateMealResponse = await request(app.server)
      .put(`/meals/${mealId}`)
      .send({
        name: 'Suco de melancia',
        description: 'Suco de fruta com água.',
        dateTime: '2023-05-20T16:34:51.954Z',
        isInDiet: true,
      })
      .expect(401)

    expect(updateMealResponse.body).toEqual(
      expect.objectContaining({
        error: 'Unauthorized.',
      }),
    )
  })

  it('should not be able to edit a unknown meal id', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Leonardo do Nascimento',
      email: 'leonardo3.nascimento@gmail.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/19802320?v=4',
    })
    const cookie = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookie).send({
      name: 'Sanduíche',
      description:
        'Sanduíche de pão integral com atum e salada de alface e tomate.',
      dateTime: '2022-08-12T03:00:00.000Z',
      isInDiet: true,
    })

    const mealId = randomUUID()

    const updateMealResponse = await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookie)
      .send({
        name: 'Suco de melancia',
        description: 'Suco de fruta com água.',
        dateTime: '2023-05-20T16:34:51.954Z',
        isInDiet: true,
      })
      .expect(400)

    expect(updateMealResponse.body).toEqual(
      expect.objectContaining({
        error: 'Diet not found.',
      }),
    )
  })

  it('should not be able to delete a meal without session id', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Leonardo do Nascimento',
      email: 'leonardo3.nascimento@gmail.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/19802320?v=4',
    })
    const cookie = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookie).send({
      name: 'Sanduíche',
      description:
        'Sanduíche de pão integral com atum e salada de alface e tomate.',
      dateTime: '2022-08-12T03:00:00.000Z',
      isInDiet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    const deleteMealResponse = await request(app.server)
      .delete(`/meals/${mealId}`)
      .expect(401)

    expect(deleteMealResponse.body).toEqual(
      expect.objectContaining({
        error: 'Unauthorized.',
      }),
    )
  })

  it('should not be able to delete a unknown meal id', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Leonardo do Nascimento',
      email: 'leonardo3.nascimento@gmail.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/19802320?v=4',
    })
    const cookie = createUserResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookie).send({
      name: 'Sanduíche',
      description:
        'Sanduíche de pão integral com atum e salada de alface e tomate.',
      dateTime: '2022-08-12T03:00:00.000Z',
      isInDiet: true,
    })

    const mealId = randomUUID()

    const deleteMealResponse = await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookie)
      .expect(400)

    expect(deleteMealResponse.body).toEqual(
      expect.objectContaining({
        error: 'Diet not found.',
      }),
    )
  })
})
