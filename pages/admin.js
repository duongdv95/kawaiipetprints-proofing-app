import React, { useState } from 'react'
import Header from '../components/header.js'
import axios from 'axios'

const meta = { title: 'Order Dashboard', description: 'Order Dashboard' }

class Admin extends React.Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.state = {
      loading: true,
      orderData: {}
    }
    
    // this.fetchData = this.fetchData.bind(this)
  }
  async componentDidMount () {
    await this.getOrders()
  }

  async getOrders() {
    const { data } = await axios.get(`/admin/api/getorders`)
    this.setState({orderData: data.orders})
  }

  handleChange(event) {
    event.preventDefault()
    const eventType = event.target.name
    switch (eventType) {
      case "category-prev":
        
        break

      default:
        console.log("error")
    }
  }

  handleSubmit(event) {
    event.preventDefault()
    const eventType = event.target.name
    switch (eventType) {
      case "category-prev":
        
        break

      default:
        console.log("error")
    }
  }

  render () {
    return (
      <div>
        <Header meta={meta}>
        </Header>
        <div style={{ padding: "0 1em"}}>
        <img src="/static/logo.png" alt='' width="200px" />
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr"}}>
            <div>
                Order Number
            </div>
            <div>
                Email
            </div>
            <div>
                Proof Status
            </div>
            <div>
                1001
            </div>
            <div>
                danielvanduong@gmail.com
            </div>
            <div>
                Awaiting Art Upload
            </div>
        </div>
        </div>
      </div>
    )
  }
}

export default Admin
