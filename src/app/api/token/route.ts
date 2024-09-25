import get from 'lodash/get'
import * as jwt from "jsonwebtoken"
import axios from 'axios'

export const POST = async (req: Request) => {
  try {
    const payload = await req.json()

    // get user from payload
    const user = get(payload, 'user')

    if (!user) {
      return Response.json({
        error: 'User not found'
      }, {
        status: 400
      })
  }

    const id = get(JSON.parse(user), 'id')

    const verifyToken = jwt.sign(
      {
        id: id,
        iss: 'https://ramper.xyz',
        aud: 'telegram',
        sub: id
      },
      process.env.NEXT_PUBLIC_SECRET_KEY as string,
      {
        header: {
          alg: 'HS256',
          typ: undefined
        },
        expiresIn: '5m'
      }
    )
    const bodyTokenTelegram = { data: payload, verifyToken, appId: 'caydvlwpfm', partner: 'coin98' }

    // const response = await axios.post(`https://ramper-v2-api-test.coin98.dev/telegram/getTokenBot`, bodyTokenTelegram)

    return Response.json({ result: bodyTokenTelegram }, {
      status: 200
    })
  } catch (error: any) {
    console.debug('🚀 ~ handleSignIn ~ error:', error)
    Response.json({
      error: 'Error during authentication',
      message: error
    }, {
      status: 500
    })
  }
}