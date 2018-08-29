import React, { Component, Fragment } from "react"
import "./App.css"
import socket from "./services/socket"

class App extends Component {
  constructor() {
    super()
    this.state = {
      chatboxText: "",
      messages: []
    }
    socket.listen(this.receiveMessage)
  }

  handleKeyDown = (event) => {
    if (event.which === 13 && !event.shiftKey) {
      this.sendMessage()
      event.preventDefault()
    }
  }

  handleInputChange = (event) => {
    const { name, value } = event.target
    this.setState({
      [name]: value
    })
  }

  receiveMessage = (message) => {
    this.setState({
      messages: [...this.state.messages, message.data]
    })
  }
  
  sendMessage = () => {
    if (this.state.chatboxText) {
      socket.send(this.state.chatboxText)
      this.setState({
        chatboxText: ""
      })
    }
  }

  render() {
    return (
      <Fragment>
        {
          this.state.messages.map(message => (
            <div className ="chatArea">
              { message }
            </div>
          ))
        }
        <div className ="container">
          <div className="chatbox">
            <textarea 
              placeholder="Enter text"
              name="chatboxText"
              cols="100" 
              rows="3"
              onChange={this.handleInputChange}
              value={this.state.chatboxText}
              onKeyDown={this.handleKeyDown}
            />
            <button onClick={this.sendMessage}>Send</button>
          </div>
        </div>
      </Fragment>
    )
  }
}

export default App