import {} from 'dotenv/config'
import path from 'path'
import express from 'express'
import expressWs from 'express-ws'
import mongoose from 'mongoose'
import helmet from 'helmet'
import basicAuth from 'express-basic-auth'
import User from './models/User'
import Message from './models/Message'


const PORT = process.env.PORT || 4000

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to MongoDB")
  })
  .catch(err => {
    console.error(err)
  })

const app = express()
app.use(helmet()) // Always wear a helment!
const wss = expressWs(app).getWss()

// app.ws is added by running expressWs(app) on line 14
app.ws('/', (client, req) => {

  let displayName = 'anonymous'

  // need to try/catch because express-ws is catching our errors without logging them 😠
  try {
    client.send(`{ "connection": "ok" }`) // connection sucessful
    client.on('message', async content => {
      console.log(`received: ${content}`)

      // handle commands
      if (content[0] === '/') {
        const args = content.split(' ')
        const command = args.shift()
        if (command === '/register') {
          displayName = args[0]
          // generate a unique tag
          let tag
          let currentTry = 0
          while (currentTry < 100) {
            tag = Math.floor(Math.random() * 9999).toString().padStart(4, "0")
            const existingUser = await User.findOne({ displayName, tag }).exec()
            if (!existingUser) {
              break
            }
          }
          const user = new User({
            tag,
            displayName,
            password: process.env.SITELOCK_PASSWORD,            
            email: "test@devchat.io"              
          })
          await user.save()
          client.send(`Created account: ${displayName}#${tag}`)
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

app.use(
  basicAuth({
    users: { dev: process.env.SITELOCK_PASSWORD },
    challenge: true
  })
)

app.use('/', express.static(path.join(__dirname, '../../client/build')))

app.listen(PORT, () => console.log(`Listening on port ${PORT} at ${new Date().toLocaleString()}`))