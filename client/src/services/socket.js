const connection = new WebSocket('ws://localhost:4000') // Update for production variable

connection.onopen = () => {
  // connection.send('Ping')
}

connection.onerror = (error) => { 
  console.log(`WebSocket error: ${error}`)
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