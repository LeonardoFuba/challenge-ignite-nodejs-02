import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function metricsRoutes(app: FastifyInstance) {
  /* all metrics */
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
        .distinct('diets.id', 'is_in_diet')

      const sequence = await knex('diets')
        .innerJoin('users', 'users.id', 'diets.user_id')
        .where({ session_id: sessionId })
        .orderBy('diets.updated_at')
        .select('is_in_diet as isInDiet')

      let maxSequence = 0
      const bestSequenceInDiet = sequence.reduce((bestSequence, meal) => {
        if (meal.isInDiet) {
          maxSequence++
        } else {
          maxSequence = 0
        }
        return maxSequence > bestSequence ? maxSequence : bestSequence
      }, 0)

      return {
        totalOfMeals: meals.length,
        totalInDiet: meals.filter((meal) => !!meal.is_in_diet).length,
        totalOutOfDiet: meals.filter((meal) => !meal.is_in_diet).length,
        bestSequenceInDiet,
      }
    },
  )

  /* total meal count */
  app.get(
    '/total',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const meals = await knex('diets')
        .innerJoin('users', 'users.id', 'diets.user_id')
        .where('session_id', sessionId)
        .distinct('diets.id')

      return { totalOfMeals: meals.length }
    },
  )

  /* total in diet count */
  app.get(
    '/inDiet',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const meals = await knex('diets')
        .innerJoin('users', 'users.id', 'diets.user_id')
        .where({
          session_id: sessionId,
          is_in_diet: true,
        })
        .distinct('diets.id')

      return { totalInDiet: meals.length }
    },
  )

  /* total out of diet count */
  app.get(
    '/outOfDiet',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const meals = await knex('diets')
        .innerJoin('users', 'users.id', 'diets.user_id')
        .where({
          session_id: sessionId,
          is_in_diet: false,
        })
        .distinct('diets.id')

      return { totalOutOfDiet: meals.length }
    },
  )

  /* best straight in diet */
  app.get(
    '/bestStraightInDiet',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const meals = await knex('diets')
        .innerJoin('users', 'users.id', 'diets.user_id')
        .where({ session_id: sessionId })
        .orderBy('diets.updated_at')
        .select('is_in_diet as isInDiet')

      let maxStraight = 0
      const bestStraight = meals.reduce((bestStraight, meal) => {
        if (meal.isInDiet) {
          maxStraight++
        } else {
          maxStraight = 0
        }

        return maxStraight > bestStraight ? maxStraight : bestStraight
      }, 0)

      return { bestSequenceInDiet: bestStraight }
    },
  )
}
