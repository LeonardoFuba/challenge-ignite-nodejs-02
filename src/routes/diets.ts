import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import dayjs from 'dayjs'

export async function dietsRoutes(app: FastifyInstance) {
  /* list all user's diets */
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

  /* list a diet */
  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getTransactionParamsSchema.parse(request.params)
      const { sessionId } = request.cookies

      const diet = await knex('diets')
        .innerJoin('users', 'users.id', 'diets.user_id')
        .where('session_id', sessionId)
        .where('diets.id', id)
        .first('diets.*')

      return {
        diet: {
          ...diet,
          dateTime: new Date(diet.dateTime),
        },
      }
    },
  )

  /* create a diet */
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

      const user = await knex('users')
        .where('session_id', sessionId)
        .select('id')
        .first()

      if (!user) {
        return reply.status(400).send({ error: 'user not found.' })
      }

      await knex('diets').insert({
        id: randomUUID(),
        name,
        description,
        dateTime,
        is_in_diet: isInDiet,
        user_id: user.id,
      })

      return reply.status(201).send()
    },
  )

  /* edit a diet */
  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const updateDietBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        dateTime: z.coerce.date(),
        isInDiet: z.coerce.boolean(),
      })
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getTransactionParamsSchema.parse(request.params)
      const { name, description, dateTime, isInDiet } =
        updateDietBodySchema.parse(request.body)
      const sessionId = request.cookies.sessionId

      const diet = await knex('diets')
        .innerJoin('users', 'diets.user_id', 'users.id')
        .where('diets.id', id)
        .first('diets.*', 'session_id')

      if (!diet) {
        return reply.status(400).send({ error: 'Diet not found' })
      }

      if (diet.session_id !== sessionId) {
        return reply.status(401).send({
          error: 'Unauthorized.',
        })
      }

      const [updatedDiet] = await knex('diets')
        .update({
          name,
          description,
          dateTime,
          is_in_diet: isInDiet,
          updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        })
        .where({ id })
        .returning('*')

      return reply.status(200).send(updatedDiet)
    },
  )

  /* delete a diet */
  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getTransactionParamsSchema.parse(request.params)
      const sessionId = request.cookies.sessionId

      const diet = await knex('diets')
        .innerJoin('users', 'diets.user_id', 'users.id')
        .where('diets.id', id)
        .first('diets.*', 'session_id')

      if (!diet) {
        return reply.status(400).send({ error: 'Diet not found' })
      }

      if (diet.session_id !== sessionId) {
        return reply.status(401).send({
          error: 'Unauthorized.',
        })
      }

      await knex('diets').delete().where({ id })

      return reply.status(204).send()
    },
  )
}
