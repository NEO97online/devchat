import React, { Component } from "react"
import PropTypes from "prop-types"

const BASE_URL = window.location.hostname === "localhost" ? "http://localhost:4000/" : "http://devchat.io/"

class LoginForm extends Component {
  static propTypes = {
    isSignUp: PropTypes.bool.isRequired
  }

  constructor() {
    super()
  }

  handleSubmit = async event => {
    event.preventDefault()
    const { displayName, email, password, passwordConfirm } = event.target.elements
    const user = {
      displayName: displayName.value,
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value
    }

    const url = BASE_URL + (this.props.isSignUp ? "register" : "login")
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(user),
      headers:{
        "Content-Type": "application/json"
      }
    })

    console.log(res)
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Display Name" name="displayName" />
        <input type="email" placeholder="Email" name="email" />
        <input type="password" placeholder="Password" name="password" />
        <input type="password" placeholder="Confirm password" name="passwordConfirm" />
        <button>Submit</button>
      </form>
    )
  }
}

export default LoginForm
