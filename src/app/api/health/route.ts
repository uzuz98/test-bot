export const GET = (req: Request) => {
  return Response.json({
    data: 'ok'
  }, {
    status: 200
  })
}