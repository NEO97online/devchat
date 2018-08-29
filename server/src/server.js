import http from "http"
import WebSocket from "ws" // use the right package!
import mongoose from "mongoose"

const port = process.env.PORT || 4000   

const wss = new WebSocket.Server({ port })

wss.on("connection", client => {
  client.send(`{ "connection": "ok" }`) // conn
  client.on("message", message => {
    console.log(`received: ${message}`)
  })    
})

console.log(`Listening on port ${port} at ${new Date().toLocaleString()}`)