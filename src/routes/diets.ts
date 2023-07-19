import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function dietsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies
      const diets = await knex('diets')
        .innerJoin('users', 'users.id', 'diets.user_id')
        .where('session_id', sessionId)
        .select('diets.*')

      return {
        diets: diets.map((diet) => ({
          id: diet.id,
          name: diet.name,
          dateTime: new Date(diet.dateTime),
          isInDiet: diet.is_in_diet === 1,
        })),
      }
    },
  )

  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const createDietBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        dateTime: z.coerce.date(),
        isInDiet: z.coerce.boolean(),
      })

      const { name, description, dateTime, isInDiet } =
        createDietBodySchema.parse(request.body)

      const sessionId = request.cookies.sessionId

      console.log({ name, description, dateTime, isInDiet, sessionId })
      const user = await knex('users')
        .where('session_id', sessionId)
        .select('id')
        .first()

      await knex('diets').insert({
        id: randomUUID(),
        name,
        description,
        dateTime,
        is_in_diet: isInDiet,
        user_id: user?.id,
      })

      return reply.status(201).send()
    },
  )
}
