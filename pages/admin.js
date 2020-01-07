import React, { useState } from 'react'
import Header from '../components/header.js'

const meta = { title: 'Order Dashboard', description: 'Order Dashboard' }

class Admin extends React.Component {
  constructor (props) {
    super(props)
    // this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

    this.state = {
      loading: true
    }
    
    // this.fetchData = this.fetchData.bind(this)
  }
  async componentDidMount () {
    // await this.fetchData()
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
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr"}}>
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
                Upload Proof
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
            <div>
                <input type="file" />
            </div>
        </div>
        </div>
      </div>
    )
  }
}

export default Admin
