import React, { Component } from 'react'
import Modal from 'react-modal';
import Header from '../components/header.js'
import axios from 'axios'
import Router from 'next/router'
import { toast } from 'react-toastify';
const meta = { title: 'Dashboard Login', description: 'Login to dashboard to view order proof/status' }
const customStyles = {
  content : {
    top                   : '40%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    display               : 'flex',
    background            : 'none',
    border                : 'none',
    justifyContent        : 'center'
  }
};
Modal.setAppElement("#__next")
toast.configure({
  position: "bottom-right",
  autoClose: 2000,
  hideProgressBar: true,
})

class IndexPage extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.state = {
      loading: false,
      dog: {},
      order_id: "",
      loginOrderStatus: "",
      email: "",
      orderNumber: ""
    }
  }

  async componentDidMount() {

  }

  async loginCustomer() {
    const { data } = await axios.get(
      `/api/logincustomer?email=${this.state.email}&order_number=${this.state.orderNumber}`
    , { validateStatus: false})
    this.setState({
      loginOrderStatus: data,
      order_id: data.order_id
    })
    return data
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
    switch (eventType) {
      case "loginsubmit":
        this.setState({ loading: true })
        const { success } = await this.loginCustomer()
        this.setState({ loading: false })
        if(success) {
          this.successNotify()
          Router.push(`/customer?order_id=${this.state.order_id}`)
        } else {
          this.errorNotify()
        }
        break

      default: console.log("error")
    }
  }

  errorNotify = () => toast.error(
  <div className="error-message">
    <div>
      <i class="fas fa-exclamation-triangle"></i> Warning!
    </div>
    <div>
      Order does not exist.
    </div>
  </div>
  );

  successNotify = () => toast.success(
    <div className="success-message">
      <div>
        <i class="far fa-check-circle"></i> Success!
      </div>
      <div>
        Redirecting..
      </div>
    </div>
  );

  render() {
    return (
      <div id="index">
        <Header meta={meta} >
        </Header>
        <div className="background-left">
          <div className="login-container">
            <div className="logo-container">
              <img src="/static/logo.png" alt='' width="200px" />
            </div>
            <div className="login-form">
              <div>
                <h1>Dashboard Login</h1>
              </div>
              <form onSubmit={this.handleSubmit} name="loginsubmit">
                <div className="form-group">
                  <input onChange={this.handleChange} name="ordernumber" placeholder="Enter your Order Number" required type="text" />
                </div>
                <div className="form-group">
                  <input onChange={this.handleChange} name="email" placeholder="Enter your email" required type="email" />
                </div>
                <div>
                  <input className="submit" type="submit" value="Sign In" />
                </div>
              </form>
            </div>
            <div>
              Not a customer? <a href="#">Shop Now</a>
            </div>
          </div>
        </div>
        <div className="background-right">
          <div className="logo-container">
            <img src="/static/logo.png" alt='' width="200px" />
          </div>
        </div>
        <Modal
          isOpen={this.state.loading}
          style={customStyles}
        >
          <img src="static/loading.svg"/>
        </Modal>
      </div>
    )
  }
}

export default IndexPage
