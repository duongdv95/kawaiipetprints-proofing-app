import React from 'react'
import Header from '../components/header.js'
import axios from 'axios'
import Router from 'next/router'
const meta = { title: 'Dashboard Login', description: 'Login to dashboard to view order proof/status' }

class IndexPage extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.state = {
      loading: true,
      dog: {},
      orderNumber: "",
      email: "",
      loginOrderStatus: ""
    }
    this.fetchData = this.fetchData.bind(this)
  }

  async componentDidMount() {
    await this.fetchData()
  }

  async loginCustomer() {
    const { data } = await axios.get(
      `/api/logincustomer?email=${this.state.email}&order_number=${this.state.orderNumber}`
    )
    this.setState({
      loginOrderStatus: data
    })
    return data
  }

  async fetchData() {
    this.setState({ loading: true })
    const { data } = await axios.get(
      'https://api.thedogapi.com/v1/images/search?limit=1'
    )
    this.setState({
      dog: data[0],
      loading: false
    })
  }

  handleChange(event) {
    const eventType = event.target.name
    switch (eventType) {
      case "ordernumber":
        this.setState({ orderNumber: event.target.value })
        break
      case "email":
        this.setState({ email: event.target.value })
        break
      default:
        console.log("error")
    }
  }

  async handleSubmit(event) {
    event.preventDefault()
    const eventType = event.target.name
    let href
    switch (eventType) {
      case "loginsubmit":
        const { success, email, order_number } = await this.loginCustomer()
        console.log(success)
        if(success) {
          Router.push(`/customer?order_number=${order_number}&email=${email}`)
        }
        break

      default: console.log("error")
    }
  }

  render() {
    return (
      <div>
        <Header meta={meta} >
        </Header>
        <div>
          <div>
            <img src="/static/logo.png" alt='' width="200px" />
          </div>
          <div>
            <h1>Dashboard Login</h1>
          </div>
          <div>
            <form onSubmit={this.handleSubmit} name="loginsubmit">
              <input onChange={this.handleChange} name="ordernumber" placeholder="Enter your Order Number" required type="text" />
              <input onChange={this.handleChange} name="email" placeholder="Enter your email" required type="email" />
              <input type="submit" value="Sign In" />
            </form>
          </div>
          <div>
            Not a customer? <a href="#">Shop Now</a>
          </div>
        </div>
      </div>
    )
  }
}

export default IndexPage
