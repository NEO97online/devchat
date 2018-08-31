const connection = new WebSocket('ws://localhost:4000') // Update for production variable

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