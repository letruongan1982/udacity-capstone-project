import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWSXRay from 'aws-xray-sdk'

import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('Attach file storage')

// TODO: Implement the fileStogare logic
export class AttachmentUtils {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly imageTable = process.env.IMAGES_TABLE
  ) {
  }

  async updateAttachmentUrl(todoId: string, userId: string, newImage: any) {
    logger.info('Update attachment url of todo')

    // update todo table
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression: "set attachmentUrl = :url, imageId = :imageId",
      ExpressionAttributeValues: {
        ":url": newImage.imageUrl,
        ":imageId": newImage.imageId
      }
    }).promise()
    
    // update image table
    await this.docClient.put({
      TableName: this.imageTable,
      Item: newImage
    }).promise()
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')

    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}