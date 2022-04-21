import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import 'source-map-support/register'

import { getTodoImage } from '../../helpers/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const imageId = event.pathParameters.imageId

  const result = await getTodoImage(imageId)

  if (result.Count !== 0) {
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items[0])
    }
  }

  return {
    statusCode: 404,
    body: ''
  }
});

handler
.use(httpErrorHandler())
.use(
  cors({
    credentials: true
  })
)

