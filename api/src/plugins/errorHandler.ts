import fp from 'fastify-plugin'

export default fp(async (app) => {
  // Handler de erro uniforme: erros de validação 400, demais 500.
  app.setErrorHandler((err, _req, reply) => {
    const status =
      (err as unknown as { validationStatus?: number; statusCode?: number }).validationStatus ??
      err.statusCode ??
      500

    if (status >= 500) {
      // eslint-disable-next-line no-console
      console.error('[api error]', err)
    }

    reply.code(status).send({
      message: err.message || 'Erro interno do servidor.',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    })
  })

  app.setNotFoundHandler((_req, reply) => {
    reply.code(404).send({ message: 'Rota não encontrada.' })
  })
})
