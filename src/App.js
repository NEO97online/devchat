import React, { Component, Fragment } from 'react'
import logo from './logo.svg'
import './App.css'

class App extends Component {

  constructor() {
    super()
    this.state = {}
    this.setState({})
  }

  render() {
    return (
      <Fragment>
        <div style={ {textAlign: "center"} } >
          <textarea placeholder="Enter text" id="msg" cols="100" rows="3"></textarea>
          <button>Send</button>
        </div>
      </Fragment>
    )
  }
}

export default App