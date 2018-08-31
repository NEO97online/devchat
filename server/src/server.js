import {} from 'dotenv/config'
import http from 'http'
import path from 'path'
import express from 'express'
import expressWs from 'express-ws'
import mongoose from 'mongoose'
import helmet from 'helmet'
import basicAuth from 'express-basic-auth'

const PORT = process.env.PORT || 4000

const app = express()
app.use(helmet()) // Always wear a helment!
const wss = expressWs(app).getWss()

// app.ws is added by running expressWs(app) on line 14
app.ws('/', (client, req) => {

  let username = 'anonymous'

  // need to try/catch because express-ws is catching our errors without logging them 😠
  try {
    client.send(`{ "connection": "ok" }`) // connection sucessful
    client.on('message', message => {
      console.log(`received: ${message}`)

      if (message[0] === '/') {
        const args = message.split(' ')
        const command = args.shift()
        if (command === '/login') {
          username = args[0]
          client.send(`Username set to ${username}`)
        }
        return
      }

      wss.clients.forEach(otherClient => {
        otherClient.send(`${username}: ${message}`)
      })
    })
  } catch (err) {
    console.error(err)
  }
})

app.use(
  basicAuth({
    users: { dev: process.env.SITELOCK_PASSWORD },
    challenge: true
  })
)

app.use('/', express.static(path.join(__dirname, '../../client/build')))

app.listen(PORT, () => console.log(`Listening on port ${PORT} at ${new Date().toLocaleString()}`))