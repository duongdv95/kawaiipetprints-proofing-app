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
    top                   : '25%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

function OrdersTable(props) {
  const { orderData, archiveOrder, openModal } = props
  const orderMap = orderData.map((element) => {
    const proofStatus = (element.proof_created) ? "Art Uploaded!" : "Awaiting Art Upload"
    const created_at = moment(element.created_at).format("dddd, MMMM Do YYYY, h:mm a")
    return (
      <React.Fragment key={element.order_number}>
        <div className="item" style={{ backgroundColor: "red", color: "white" }}>
          {proofStatus}
        </div>
        <div className="item">
          <button onClick={() => openModal(element.order_id)}>Upload</button>
        </div>
        <div className="item">
          {element.order_number}
        </div>
        <div className="item">
          {created_at}
        </div>
        <div className="item">
          <button onClick={() => archiveOrder(element.order_id)}>
            Archive
          </button>
        </div>
      </React.Fragment>
    )
  })

  return(
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
      <div className="item header">
        Action
      </div>
      {orderMap}
    </div>
  )
}

class Admin extends React.Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.state = {
      loading: true,
      orderData: [],
      archivedOrderData: [],
      modalIsOpen: false,
      currentOrderID: ""
    }

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.archiveOrder = this.archiveOrder.bind(this);
    // this.fetchData = this.fetchData.bind(this)
  }
  async componentDidMount () {
    await this.getLatestOrders()
  }

  async getLatestOrders() {
    const { data } = await axios.get('/admin/api/pushlatest')
    if(data.success) {
      this.getOrders()
    }
  }

  async getOrders() {
    const { data } = await axios.get(`/admin/api/getorders`)
    const allOrdersArray = [...data.orders.map((element) => {
      return {created_at: element.created_at, email: element.email, fulfilled: element.fulfilled, line_items: JSON.parse(element.line_items), order_id: element.order_id, order_number: element.order_number, order_status_url: element.order_status_url, proof_created: element.proof_created, updated_at: element.updated_at}
    })]
    allOrdersArray.sort(function(a, b) {
      return moment(b.created_at).format("X") - moment(a.created_at).format("X") 
    })
    const orderData = allOrdersArray.filter((element) => {
      return element.fulfilled === false
    })
    const archivedOrderData = allOrdersArray.filter((element) => {
      return element.fulfilled === true
    })
    this.setState({orderData, archivedOrderData})
  }

  openModal(order_id) {
    this.setState({currentOrderID: order_id, modalIsOpen: true});
  }
 
  afterOpenModal() {

  }
 
  closeModal() {
    this.setState({modalIsOpen: false});
  }

  async deleteOrder(order_number) {
    const { data } = await axios.delete(`/admin/api/deleteorder/${order_number}`)
    if(data.success){
      this.getOrders()
    }
  }

  async archiveOrder(order_number) {
    const { data } = await axios.put(`/admin/api/archiveorder/${order_number}`)
    if(data.success){
      this.getOrders()
    }
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
    const modalOrderData = (currentOrderID) => {
      if(!currentOrderID) return (null)
      const { orderData, archivedOrderData } = this.state
      const selectedOrder = [...orderData, ...archivedOrderData].filter((element) => element.order_id === currentOrderID)[0]
      const line_items = selectedOrder.line_items
      const artUpload = line_items.map(function(element, index) {
        return (
          <div key={index}>
            <label>{element.product_name}</label>
            <input type="file" accept="image/png, image/jpeg"/>
          </div>
        )
      })
      return (
        <div style={{display: "grid"}}>
          <h2>Order {selectedOrder.order_number}</h2>
          <div>
            <span style={{fontWeight: "bold"}}>Email</span> {selectedOrder.email}
          </div>
          <div>
            <span style={{fontWeight: "bold"}}>Order Status</span> <a href={selectedOrder.order_status_url}>View Order</a>
          </div>
          {artUpload}
          <div>
            <button onClick={this.closeModal}>close</button>
          </div>
        </div>
      )
    }

    return (
      <div>
        <Header meta={meta}>
        </Header>
        <div style={{ padding: "0 1em"}}>
        <img src="/static/logo.png" alt='' width="200px" />
        <h1>Orders</h1>
        <OrdersTable 
        orderData={this.state.orderData}
        openModal={this.openModal}
        archiveOrder={this.archiveOrder}
        />
        <h1>Archived Orders</h1>
        <OrdersTable 
        orderData={this.state.archivedOrderData}
        openModal={this.openModal}
        archiveOrder={this.archiveOrder}
        />
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          {modalOrderData(this.state.currentOrderID)}
        </Modal>
        </div>
      </div>
    )
  }
}

export default Admin
