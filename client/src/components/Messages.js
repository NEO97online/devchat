import React, { Component, Fragment } from 'react'
import socket from '../services/socket'
import './Messages.css'

class Messages extends Component {
  constructor() {
    super()
    this.state = {
      chatboxText: '',
      messages: ['Test Message']
    }
    socket.listen(this.receiveMessage)
  }

  componentDidMount = () => {
    
  }

  handleKeyDown = event => {
    // enter key (13) without shift
    if (event.which === 13 && !event.shiftKey) {
      this.sendMessage()
      event.preventDefault() // prevents new line in <textarea>
    }
  }

  handleInputChange = event => {
    const { name, value } = event.target
    this.setState({
      [name]: value
    })
  }

  receiveMessage = message => {
    this.setState({
      messages: [...this.state.messages, message.data]
    })
  }

  sendMessage = () => {
    if (this.state.chatboxText) {
      socket.send(this.state.chatboxText)
      this.setState({
        chatboxText: ''
      })
    }
  }

  render() {
    return (
      <Fragment>
        {this.state.messages.map((message, i) => (
          <pre key={i}>
            <div className="chatArea">{message}</div>
          </pre>
        ))}
        <div className="container">
          <div className="chatbox">
            <textarea
              placeholder="Enter text"
              name="chatboxText"
              cols="100"
              rows="3"
              value={this.state.chatboxText}
              onChange={this.handleInputChange}
              onKeyDown={this.handleKeyDown}
            />
            <button onClick={this.sendMessage}>Send</button>
          </div>
        </div>
      </Fragment>
    )
  }
}

export default Messages