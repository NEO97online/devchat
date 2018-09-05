import {} from 'dotenv/config'
import path from 'path'
import express from 'express'
import expressWs from 'express-ws'
import mongoose from 'mongoose'
import helmet from 'helmet'
import basicAuth from 'express-basic-auth'
import User from './models/User'
import Message from './models/Message'
import jwt from 'jsonwebtoken'
import log from 'loglevel'
import bodyParser from 'body-parser'
import cors from 'cors'

const PORT = process.env.PORT || 4000

mongoose
  .connect(
    process.env.MONGODB_URL,
    { useNewUrlParser: true }
  )
  .then(() => {
    log.warn('Connected to MongoDB')
  })
  .catch(err => {
    console.error(err)
  })

const app = express()
app.use(helmet()) // Always wear a helment!
app.use(bodyParser.json())
app.use(cors({ origin: true })) // for development purposes only, edit later
const wss = expressWs(app).getWss()

// app.ws is added by running expressWs(app) on line 14
app.ws('/', (client, req) => {
  let displayName = 'anonymous'

  // need to try/catch because express-ws is catching our errors without logging them 😠
  try {
    client.send(`{ "connection": "ok" }`) // connection sucessful
    client.on('message', async content => {
      log.warn(`received: ${content}`)

      // handle commands
      if (content[0] === '/') {
        const args = content.split(' ')
        const command = args.shift()
        // Register <displayName> <email> <password>
        if (command === '/register') {
          const [displayName, email, password] = args
          
        }
        return
      }

      // normal message
      const message = new Message({
        content,
        displayName,
        time: +new Date()
      })
      await message.save()

      // broadcast to other clients
      wss.clients.forEach(otherClient => {
        otherClient.send(`${displayName}: ${content}`)
      })
    })
  } catch (err) {
    console.error(err)
  }
})

app.post("/login", async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email }).exec()
  if (user && (user.password === password)) {
    const token = jwt.sign({ email: user.email }, process.env.JWT_KEY, { expiresIn: 14 * 8640000 /* 2 weeks */ })
    res.send(token)
    log.info("Sent JWT")
  } else {
    res.send('Invalid information. Please check username and password.')
  }
})

app.post("/register", async (req, res) => {
  const { displayName, email, password } = req.body
  console.log(req.body)
  // generate a unique tag
  let tag
  let currentTry = 0
  while (currentTry < 100) {
    tag = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0')
    const existingUser = await User.findOne({ displayName, tag }).exec()
    if (!existingUser) {
      break
    }
  }
  const user = new User({
    tag,
    displayName,
    password,
    email
  })
  console.log(user)
  await user.save()
  res.send(`Created account: ${displayName}#${tag}`)
})

app.use(
  basicAuth({
    users: { dev: process.env.SITELOCK_PASSWORD },
    challenge: true
  })
)

app.use('/', express.static(path.join(__dirname, '../../client/build')))

app.listen(PORT, () => log.info(`Listening on port ${PORT} at ${new Date().toLocaleString()}`))