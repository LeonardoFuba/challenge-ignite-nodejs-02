import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { usersRoutes } from './routes/users'
import { dietsRoutes } from './routes/diets'
import { metricsRoutes } from './routes/metrics'

export const app = fastify()

app.register(cookie)

app.register(usersRoutes, { prefix: 'users' })
app.register(dietsRoutes, { prefix: 'diets' })
app.register(metricsRoutes, { prefix: 'metrics' })
