import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function usersRoutes(app: FastifyInstance) {
  /* list user by sessionId */
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies
      const user = await knex('users')
        .where('session_id', sessionId)
        .select('*')
        .first()
      return { user }
    },
  )

  /* create user */
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      avatarUrl: z.string().url(),
    })
    const { name, email, avatarUrl } = createUserBodySchema.parse(request.body)

    const sessionId = randomUUID()
    await knex('users').insert({
      id: randomUUID(),
      session_id: sessionId,
      name,
      email,
      avatarUrl,
    })

    reply.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    return reply.status(201).send()
  })
}
