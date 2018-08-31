const URL = window.location.hostname === "localhost" ? "localhost:4000" : "devchat.io"
const connection = new WebSocket(`ws://${URL}`) // Update for production variable

connection.onopen = () => {
  console.log('connected socket')
  connection.send('Ping')
}

connection.onerror = (error) => {  
  console.log(`WebSocket error: ${error.toString()}`)
}

const send = (message) => {
  connection.send(message)
}

const listen = (callback) => {
  connection.onmessage = callback
}

export default {
  send,
  listen
}