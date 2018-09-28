import {} from "dotenv/config"
import path from "path"
import express from "express"
import expressWs from "express-ws"
import mongoose from "mongoose"
import helmet from "helmet"
import basicAuth from "express-basic-auth"
import User from "./models/User"
import Message from "./models/Message"
import jwt from "jsonwebtoken"
import log from "loglevel"
import bodyParser from "body-parser"
import cors from "cors"
import bcrypt, { hash } from "bcrypt"
const saltRounds = 10

const PORT = process.env.PORT || 4000

function toEvent(message) {
  try {
    const event = JSON.parse(message)
    this.emit(event.type, event.payload)
  } catch (err) {
    console.log("not an event", err)
  }
}

mongoose
  .connect(
    process.env.MONGODB_URL,
    { useNewUrlParser: true }
  )
  .then(() => {
    log.warn("Connected to MongoDB")
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
app.ws("/", (client, req) => {
  let displayName = "anonymous"

  // need to try/catch because express-ws is catching our errors without logging them 😠
  try {
    client.send(JSON.stringify({ connection: "ok" })) // connection sucessful

    client
      .on("message", toEvent)
      .on("authenticate", async token => {
        const tokenData = jwt.verify(token, process.env.JWT_KEY)
        if (tokenData) {
          const user = await User.findOne({ email: tokenData.email }).exec()
          displayName = user.displayName
        }
      })
      .on("message", async content => {
        log.warn(`received: ${content}`)

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

  if (!user) {
    res.status(403).json({ error: { level: "danger", message: "This account does not exist!" } })
    return
  }

  const verifiesHash = await bcrypt.compare(password, user.password)

  if (verifiesHash) {
    const token = jwt.sign({ email: user.email }, process.env.JWT_KEY, { expiresIn: 14 * 8640000 })
    res.json(token)
    log.info("Sent JWT")
  } else {
    res.status(403).json({ error: { level: "danger", message: "Invalid information. Please check email and password." } })
  }
})

app.post("/register", async (req, res) => {
  const { displayName, email } = req.body
  let { password } = req.body

  password = await bcrypt.hash(password, saltRounds)

  // generate a unique tag
  let tag
  let currentTry = 0
  while (currentTry < 100) {
    tag = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, "0")
    const existingUser = await User.findOne({ displayName, tag }).exec()
    if (!existingUser) {
      break
    }
    currentTry++
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

app.use("/", express.static(path.join(__dirname, "../../client/build")))

app.listen(PORT, () => log.info(`Listening on port ${PORT} at ${new Date().toLocaleString()}`))