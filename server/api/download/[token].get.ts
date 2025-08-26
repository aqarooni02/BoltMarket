export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'token required' })
  }

  // Placeholder: validate token and stream file from disk
  // For now just respond with JSON
  return { token, valid: true }
})


