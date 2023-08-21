import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import request from 'supertest'
import { execSync } from 'node:child_process'

async function addMealsInDatabaseFromAUser() {
  const createUserResponse = await request(app.server).post('/users').send({
    name: 'Leonardo do Nascimento',
    email: 'leonardo3.nascimento@gmail.com',
    avatarUrl: 'https://avatars.githubusercontent.com/u/19802320?v=4',
  })
  const cookie = createUserResponse.get('Set-Cookie')

  await request(app.server).post('/meals').set('Cookie', cookie).send({
    name: 'Sorvete',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    dateTime: '2022-08-12T15:00:00.000Z',
    isInDiet: false,
  })
  await request(app.server).post('/meals').set('Cookie', cookie).send({
    name: 'Iogurte com granola',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    dateTime: '2022-08-13T22:00:00.000Z',
    isInDiet: true,
  })
  await request(app.server).post('/meals').set('Cookie', cookie).send({
    name: 'Sanduíche',
    description: 'Lorem Ipsum is simply dummy text of the printing.',
    dateTime: '2022-08-14T10:00:00.000Z',
    isInDiet: true,
  })
  await request(app.server).post('/meals').set('Cookie', cookie).send({
    name: 'Suco de melancia',
    description: 'Suco da fruta com água.',
    dateTime: '2022-08-14T10:00:00.000Z',
    isInDiet: true,
  })
  await request(app.server).post('/meals').set('Cookie', cookie).send({
    name: 'Bolo de aniversário',
    description: 'Lorem Ipsum is simply dummy text of the printing.',
    dateTime: '2022-08-15T15:00:00.000Z',
    isInDiet: false,
  })
  await request(app.server).post('/meals').set('Cookie', cookie).send({
    name: 'Whey protein com leite',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    dateTime: '2022-08-16T09:00:00.000Z',
    isInDiet: true,
  })

  return cookie
}

describe.only('Metrics routes', () => {
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

  it('should be able to list metrics', async () => {
    const userCookie = await addMealsInDatabaseFromAUser()

    const metricsResponse = await request(app.server)
      .get('/metrics')
      .set('Cookie', userCookie)
      .expect(200)

    expect(metricsResponse.body).toEqual(
      expect.objectContaining({
        totalOfMeals: 6,
        totalInDiet: 4,
        totalOutOfDiet: 2,
        bestSequenceInDiet: 3,
      }),
    )
  })

  it('should be able to show total of meals', async () => {
    const userCookie = await addMealsInDatabaseFromAUser()

    const metricsResponse = await request(app.server)
      .get('/metrics/total')
      .set('Cookie', userCookie)
      .expect(200)

    expect(metricsResponse.body).toEqual(
      expect.objectContaining({
        totalOfMeals: 6,
      }),
    )
  })

  it('should be able to show total of meals in diet', async () => {
    const userCookie = await addMealsInDatabaseFromAUser()

    const metricsResponse = await request(app.server)
      .get('/metrics/inDiet')
      .set('Cookie', userCookie)
      .expect(200)

    expect(metricsResponse.body).toEqual(
      expect.objectContaining({
        totalInDiet: 4,
      }),
    )
  })

  it('should be able to show total of meals out of diet', async () => {
    const userCookie = await addMealsInDatabaseFromAUser()

    const metricsResponse = await request(app.server)
      .get('/metrics/outOfDiet')
      .set('Cookie', userCookie)
      .expect(200)

    expect(metricsResponse.body).toEqual(
      expect.objectContaining({
        totalOutOfDiet: 2,
      }),
    )
  })

  it('should be able to show best sequence of meals in diet', async () => {
    const userCookie = await addMealsInDatabaseFromAUser()

    const metricsResponse = await request(app.server)
      .get('/metrics/bestStraightInDiet')
      .set('Cookie', userCookie)
      .expect(200)

    expect(metricsResponse.body).toEqual(
      expect.objectContaining({
        bestSequenceInDiet: 3,
      }),
    )
  })
})
