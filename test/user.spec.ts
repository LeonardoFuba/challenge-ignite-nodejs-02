import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import request from 'supertest'
import { execSync } from 'node:child_process'

describe('Users routes', () => {
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

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'Leonardo do Nascimento',
        email: 'leonardo3.nascimento@gmail.com',
        avatarUrl: 'https://avatars.githubusercontent.com/u/19802320?v=4',
      })
      .expect(201)
  })

  it('should be able to list user data with session id', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Leonardo do Nascimento',
      email: 'leonardo3.nascimento@gmail.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/19802320?v=4',
    })

    const cookie = createUserResponse.get('Set-Cookie')

    const listUserResponse = await request(app.server)
      .get('/users')
      .set('Cookie', cookie)
      .expect(200)

    expect(listUserResponse.body.user).toEqual(
      expect.objectContaining({
        name: 'Leonardo do Nascimento',
        email: 'leonardo3.nascimento@gmail.com',
        avatarUrl: 'https://avatars.githubusercontent.com/u/19802320?v=4',
        id: expect.any(String),
        session_id: expect.any(String),
        created_at: expect.any(String),
      }),
    )
  })

  it('should not be able to list user data without session id', async () => {
    const response = await request(app.server).get('/users').expect(401)

    expect(response.body).toEqual(
      expect.objectContaining({
        error: 'Unauthorized.',
      }),
    )
  })
})
