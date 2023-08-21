import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import dayjs from 'dayjs'

export async function dietsRoutes(app: FastifyInstance) {
  /* list all user's meals */
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies
      const meals = await knex('diets')
        .innerJoin('users', 'users.id', 'diets.user_id')
        .where('session_id', sessionId)
        .select('diets.*')

      return {
        meals: meals.map((meal) => ({
          id: meal.id,
          name: meal.name,
          dateTime: new Date(meal.dateTime),
          isInDiet: meal.is_in_diet === 1,
        })),
      }
    },
  )

  /* list a meal */
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

      const meal = await knex('diets')
        .innerJoin('users', 'users.id', 'diets.user_id')
        .where('session_id', sessionId)
        .where('diets.id', id)
        .first('diets.*')

      return {
        meal: {
          id: meal.id,
          name: meal.name,
          description: meal.description,
          dateTime: z.coerce.date().parse(meal.dateTime),
          isInDiet: z.coerce.boolean().parse(meal.is_in_diet),
          createdAt: z.coerce.date().parse(meal.created_at),
          updatedAt: z.coerce.date().parse(meal.updated_at),
          userId: z.coerce.string().uuid().parse(meal.user_id),
        },
      }
    },
  )

  /* create a meal */
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
        return reply.status(400).send({ error: 'User not found.' })
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

  /* edit a meal */
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

      const meal = await knex('diets')
        .innerJoin('users', 'diets.user_id', 'users.id')
        .where('diets.id', id)
        .first('diets.*', 'session_id')

      if (!meal) {
        return reply.status(400).send({ error: 'Diet not found.' })
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

      return reply.status(200).send({
        meal: {
          id: updatedDiet.id,
          name: updatedDiet.name,
          description: updatedDiet.description,
          dateTime: z.coerce.date().parse(updatedDiet.dateTime),
          isInDiet: z.coerce.boolean().parse(updatedDiet.is_in_diet),
          createdAt: z.coerce.date().parse(updatedDiet.created_at),
          updatedAt: z.coerce.date().parse(updatedDiet.updated_at),
          userId: z.coerce.string().uuid().parse(updatedDiet.user_id),
        },
      })
    },
  )

  /* delete a meal */
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

      const meal = await knex('diets')
        .innerJoin('users', 'diets.user_id', 'users.id')
        .where('diets.id', id)
        .first('diets.*', 'session_id')

      if (!meal) {
        return reply.status(400).send({ error: 'Diet not found.' })
      }

      await knex('diets').delete().where({ id })

      return reply.status(204).send()
    },
  )
}
