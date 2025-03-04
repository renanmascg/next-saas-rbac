import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

export async function requestPasswordRecover(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/password/recover',
    {
      schema: {
        tags: ['auth'],
        summary: 'Get authenticated user profile',
        body: z.object({
          email: z.string().email(),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body

      const userFromEmail = await prisma.user.findUnique({
        where: { email },
      })

      // não queremos que o usuário saiba se o email existe ou não
      if (!userFromEmail) {
        return reply.status(201).send()
      }

      await prisma.token.create({
        data: {
          type: 'PASSWORD_RECOVER',
          userid: userFromEmail.id,
        },
      })

      // send e-mail with password recover link

      return reply.status(201).send()
    },
  )
}
