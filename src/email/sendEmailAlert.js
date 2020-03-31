require('dotenv').config()
import jwt from 'jsonwebtoken'
import { GraphQLClient } from 'graphql-request'


const { NODE_ENV, JWT_SECRET, URI_EMAIL } = process.env
const isDev = NODE_ENV === 'development'

export default (data) =>
  new Promise((resolve) => {
    const { appToUri, appFromUri, type } = data
    const variables = {
      appToUri,
      appFromUri,
      type,
    }

    const token = jwt.sign({
      origin: 'modo-server-ceacle',
      fromserver: true,
    }, JWT_SECRET, {
      expiresIn: '5m',
    })

    const client = new GraphQLClient(
      URI_EMAIL,
      { headers: {
        servertoken: token,
      } }
    )

    const mutation = `
      mutation email_alertAdmin(
        $type: String!
        $appToUri: String
        $appFromUri: String
      ) {
        email_alertAdmin(
          type: $type
          appToUri: $appToUri
          appFromUri: $appFromUri
        ) {
          errors
        }
      }
    `
    if (!isDev)
    {
      client.request(mutation, variables)
        .then(() => resolve())
        .catch((error) => resolve(new Error(error)))
    } else {
      resolve()
    }

  }).catch((error) => {
    throw error
  })
