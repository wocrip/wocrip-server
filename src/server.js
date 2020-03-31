require('dotenv').config()
import express from 'express'
import jwt from 'jsonwebtoken'
import { ApolloServer } from 'apollo-server-express'
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway'
import bodyParser from 'body-parser'
import cors from 'cors'
import http from 'http'

import sendAlert from './email/sendEmailAlert'


const app = express()
const {
  URI_EMAIL,
  URI_AUTH,
  URI_EMAILLIST,
  URI_FILE,
  URI_MOCKUP,
  URI_URLSHORTENER,
  URI_PAYMENT,
  URI_SCRAPE,
  URI_USERACTIVITY,
  URI_SITEMAP,
  // URI_ACCOUNT,
  URI_BRIEF,
  URI_HELP,
  JWT_SECRET,
  PORT,
  WHITE_LIST,
} = process.env
const APP_PORT = (PORT || process.argv[2] || 3062)

const servertoken = jwt.sign({
  origin: 'modo-server-ceacle',
  fromserver: true,
}, JWT_SECRET, {
  expiresIn: '90d',
})

const corsOptions = {
  origin(origin, callback){
    const originIsWhitelisted = WHITE_LIST.indexOf(origin) !== -1
    callback(null, originIsWhitelisted)
  },
  credentials: true,
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

class DataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    request.http.headers.set('origin', context.origin)
    request.http.headers.set('authorization', context.authorization)
    request.http.headers.set('language', context.language)
    request.http.headers.set('xforwardedfor', context.xforwardedfor)
    request.http.headers.set('remoteaddress', context.remoteaddress)
    request.http.headers.set('ip', context.ip)
    request.http.headers.set('useragent', context.useragent)
    request.http.headers.set('servertoken', servertoken)
  }
}

const serviceList = [
  // { name: "account", url: URI_ACCOUNT },
  { name: "auth", url: URI_AUTH },
  { name: "brief", url: URI_BRIEF },
  { name: "email", url: URI_EMAIL },
  { name: "emailList", url: URI_EMAILLIST },
  { name: "file", url: URI_FILE },
  { name: "help", url: URI_HELP },
  { name: "mockup", url: URI_MOCKUP },
  { name: "urlShortener", url: URI_URLSHORTENER },
  { name: "payment", url: URI_PAYMENT },
  { name: "siteMap", url: URI_SITEMAP },
  { name: "scrape", url: URI_SCRAPE },
  { name: "userActivity", url: URI_USERACTIVITY },
]

const checkServers = () => {
  console.log(`${new Date}: Start servers checking.`)

  serviceList.forEach(({ name, url }) => {
    http.get(url, (response) => {
      console.log(`✅ Service: ${name} responded.`)
    }).on('error', (error) => {
      console.log(`😱 Service: ${name} did not respond.`)

      sendAlert({
        appFromUri: 'modo-server-ceacle',
        appToUri: url,
        type: 'failedAppConnection',
      })
    })
  })
}

setInterval(checkServers, 60 * 60 * 1000)

const gateway = new ApolloGateway({
  serviceList,
  buildService({ url }) {
    return new DataSource({ url })
  },
})

const startServer = async () => {
  const { schema, executor } = await gateway.load()
  const server = new ApolloServer({
    schema,
    executor,
    context: ({ req }) => ({
      origin: req.headers.origin,
      authorization: req.headers.authorization,
      language: req.headers.language,
      xforwardedfor: req.header('x-forwarded-for'),
      remoteaddress: req.connection.remoteAddress,
      ip: req.ip,
      useragent: req.headers['user-agent'],
    }),
  })
  const graphqlPath = '/graphql'

  server.applyMiddleware({ app, path: graphqlPath })

  app.listen(APP_PORT, () => console.log(`🚀 GraphQL started on port: ${APP_PORT}`)) // eslint-disable-line
}

startServer()
