import React, { Component } from "react"
import { Redirect } from "react-router"
import PropTypes from "prop-types"
import { Form, FormGroup, Label, Input, Button, Alert } from "reactstrap"
import styled from "styled-components"

const BASE_URL = window.location.hostname === "localhost" ? "http://localhost:4000/" : "http://devchat.io/"

const Wrapper = styled.div`
  max-width: 400px;
  margin: 10px auto;
`

class LoginForm extends Component {
  static propTypes = {
    isSignUp: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      error: null,
      loggedIn: false
    }
  }

  handleSubmit = async event => {
    event.preventDefault()
    const { displayName, email, password, passwordConfirm } = event.target.elements
    const user = {
      displayName: this.props.isSignUp ? displayName.value : "",
      email: email.value,
      password: password.value,
      passwordConfirm: this.props.isSignUp ? passwordConfirm.value : ""
    }

    const url = BASE_URL + (this.props.isSignUp ? "register" : "login")

    try {
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
          "Content-Type": "application/json"
        }
      })
      const data = await res.json()
      if (data.error) {
        this.setState({ error: data.error })
      } else {
        window.localStorage.setItem('devchat-auth', data)
        this.setState({ loggedIn: true })
      }
    } catch (error) {
      this.setState({ 
        error: { level: "danger", message: error.message }
      })
      console.error(error)
    }

  }

  render() {
    return (
      <Wrapper>
        {this.state.loggedIn && <Redirect to="/" />}
        {this.state.error && <Alert color={this.state.error.level}>{this.state.error.message}</Alert>}
        <Form onSubmit={this.handleSubmit}>
          {this.props.isSignUp && (
            <FormGroup>
              <Label>Display Name</Label>
              <Input type="text" placeholder="Display Name" name="displayName" />
            </FormGroup>
          )}
          <FormGroup>
            <Label>Email</Label>
            <Input type="email" placeholder="Email" name="email" />
          </FormGroup>
          <FormGroup>
            <Label>Password</Label>
            <Input type="password" placeholder="Password" name="password" />
          </FormGroup>
          {this.props.isSignUp && (
            <FormGroup>
              <Label>Confirm Password</Label>
              <Input type="password" placeholder="Confirm password" name="passwordConfirm" />
            </FormGroup>
          )}
          <Button>Submit</Button>
        </Form>
      </Wrapper>
    )
  }
}

export default LoginForm
