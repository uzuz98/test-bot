import { writer } from "../route"

export const POST = async (request: Request) => {
  const encoder = new TextEncoder();
  
  await writer.write(encoder.encode('data: test 123 456 789\n\n'))

  return Response.json({
    text: 'test okeee'
  }, {
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
      'Access-Control-Allow-Origin': '*'
    }
  })
}
