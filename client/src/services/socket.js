const URL = window.location.hostname === "localhost" ? "localhost:4000" : "devchat.io"
const connection = new WebSocket(`ws://${URL}`) // Update for production variable

connection.onopen = () => {
  console.log('connected socket')

  const token = window.localStorage.getItem('devchat-auth')
  emit({ type: 'authenticate', payload: token })
}

connection.onerror = (error) => {  
  console.log(`WebSocket error: ${error.toString()}`)
}

const emit = ({ type, payload }) => {
  connection.send(JSON.stringify({ type, payload }))
}

const send = (message) => {
  connection.send(message)
}

const listen = (callback) => {
  connection.onmessage = callback
}

export default {
  emit,
  send,
  listen
}
