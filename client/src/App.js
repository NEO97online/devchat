import React, { Component, Fragment } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import LoginForm from './components/LoginForm'
import Messages from './components/Messages'

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Messages}/>
          <Route path="/login" render={() => <LoginForm isSignUp={false}/>}/>
          <Route path="/register" render={() => <LoginForm isSignUp={true}/>}/>
        </Switch>
      </BrowserRouter>
    )
  }
}

export default App
