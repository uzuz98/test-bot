
export let writer: WritableStreamDefaultWriter

export const runtime = 'nodejs';
// This is required to enable streaming
export const dynamic = 'force-dynamic';

export const GET = async (request: Request) => {
  try {
  const responseStream = new TransformStream();
  const encoder = new TextEncoder()
const writeGet: WritableStreamDefaultWriter = responseStream.writable.getWriter()

writeGet.write(encoder.encode('data: test ben route get\n\n')).catch(err=> {
    console.log("🩲 🩲 => writer.write => err:", err)
  })
  
  // return Response.json(responseStream.readable, {
  //   headers: {
  //     'Content-Type': 'text/event-stream',
  //     Connection: 'keep-alive',
  //     'Cache-Control': 'no-cache, no-transform'
  //   }
  // })
    
} catch (error) {
  console.log("🩲 🩲 => GET => error:", error)
  
}
}

export const POST = async (request: Request) => {
  const encoder = new TextEncoder();
  
  await writer.write(encoder.encode('data: test 123 456 789\n\n'))

  return Response.json({
    text: 'test okeee'
  }, {
    headers: {
      'Content-Type': 'text/event-stream'
    }
  })
}
