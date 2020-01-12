import React, { useState } from 'react'
import Modal from 'react-modal';
import Header from '../components/header.js'
import axios from 'axios'
var moment = require('moment');
moment().format();
Modal.setAppElement("#__next")

const meta = { title: 'Order Dashboard', description: 'Order Dashboard' }

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

class Admin extends React.Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.state = {
      loading: true,
      orderData: [],
      modalIsOpen: false
    }

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    // this.fetchData = this.fetchData.bind(this)
  }
  async componentDidMount () {
    await this.getOrders()
  }

  async getOrders() {
    const { data } = await axios.get(`/admin/api/getorders`)
    this.setState({orderData: data.orders})
  }
  openModal() {
    this.setState({modalIsOpen: true});
  }
 
  afterOpenModal() {
    // references are now sync'd and can be accessed.
    this.subtitle.style.color = '#f00';
  }
 
  closeModal() {
    this.setState({modalIsOpen: false});
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
    const orderData = [...this.state.orderData]
    orderData.sort(function(a, b) {
      return moment(b.created_at).format("X") - moment(a.created_at).format("X") 
    })
    const orderArrayMap = orderData.map((element) => {
      const proofStatus = (element.proof_created) ? "Art Uploaded!" : "Awaiting Art Upload"
      const created_at = moment(element.created_at).format("dddd, MMMM Do YYYY, h:mm a")
      return (
        <React.Fragment key={element.order_number}>
          <div className="item" style={{ backgroundColor: "red", color: "white" }}>
            {proofStatus}
          </div>
          <div className="item">
            <button onClick={this.openModal}>Upload</button>
          </div>
          <div className="item">
            {element.order_number}
          </div>
          <div className="item">
            {created_at}
          </div>
        </React.Fragment>
      )
    })

    return (
      <div>
        <Header meta={meta}>
        </Header>
        <div style={{ padding: "0 1em"}}>
        <img src="/static/logo.png" alt='' width="200px" />
        <div id="order-table" >
            <div className="item header">
              Proof Status
            </div>
            <div className="item header">
              Upload Art
            </div>
            <div className="item header">
              Order Number
            </div>
            <div className="item header">
              Date
            </div>
            {orderArrayMap}
        </div>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >

          <h2 ref={subtitle => this.subtitle = subtitle}>Hello</h2>
          <button onClick={this.closeModal}>close</button>
          <div>I am a modal</div>
          <form>
            <input />
            <button>tab navigation</button>
            <button>stays</button>
            <button>inside</button>
            <button>the modal</button>
          </form>
        </Modal>
        </div>
      </div>
    )
  }
}

export default Admin
