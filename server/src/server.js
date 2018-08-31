import http from "http"
import path from "path"
import express from "express"
import WebSocket from "ws" // use the right package!
import expressWs from "express-ws"
import mongoose from "mongoose"

const PORT = process.env.PORT || 4000

const app = express()
expressWs(app)

app.ws('/', (ws, req) => {
  ws.on("connection", client => {
    console.log('connected')
    client.send(`{ "connection": "ok" }`) // conn
    client.on("message", message => {
      console.log(`received: ${message}`)
      ws.clients.forEach(otherClient => {
        otherClient.send(message)
      })
    })
  })
})

app.use('/', express.static(path.join(__dirname, "../../client/build")))

app.listen(PORT, () => console.log(`Listening on port ${PORT} at ${new Date().toLocaleString()}`))
