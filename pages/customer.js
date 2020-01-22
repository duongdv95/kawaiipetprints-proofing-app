import React from 'react'
import Header from '../components/header.js'
import Slider from "react-slick"
import axios from 'axios'
import Modal from 'react-modal';
Modal.setAppElement("#__next")
var moment = require('moment');
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

function SimpleSlider(props) {
  const { backgroundsArray } = props
  const settings = {
    dots: true,
    speed: 200 //milliseconds
  }
  const carousel = backgroundsArray.map(function(element, index) {
    return (
      <div key={index}>
        <img src={element} ></img>
      </div>
    )
  })

  return (
    <div className="container">
      <Slider {...settings}>
        {carousel}
      </Slider>
    </div>
  )
}

function History() {
  return (
    <div style={{ backgroundColor: "gray" }}>
      <div>
        History
      </div>
      <div>
        Daniel Jan 5 at 6:32 PM
        Description
      </div>
      <div>
        Kawaii Pet Prints Jan 5 at 6:32 PM
        Created Proof 1
      </div>
      <div>
        Daniel Jan 5 at 6:32 PM
        Approved Proof 1 (include options selected such as orientation, etc)
      </div>
    </div>
  )
}

function OrderProof(props) {
  const { backgroundCategories, currentBackground, backgroundsArray, orderInfo, loading, openModal } = props
  const orderMap = (!loading && orderInfo.items.proof_created) ? orderInfo.items.line_items.map(function(element, index){
    return (
      <div key={index}>
        <h3>{element.product_name}</h3>
        <button>Request Revision</button><button onClick={() => openModal({ index, order_id: orderInfo.items.order_id})}>Select Background</button>
        <div className="wrapper">
          <img src="/static/white.png" className="bg-image"></img>
          <div className="other-images">
            <img src={element.artworkURL} />
          </div>
        </div>
        <button>Back</button><button>Approve</button>
        <div>
          <label style={{ fontWeight: "bold" }}>Orientation</label>
          <input type="radio" checked /><label>Horizontal</label>
          <input type="radio" /><label>Vertical</label>
        </div>
      </div>
    )
  }) : (null)

  const orderStatus = (!loading) ? (<a href={orderInfo.items.line_items}>Order Status</a>) : (null)
  return(
    <div>
      <h1>Your Order Proof</h1>
      {orderStatus}
      <div>
        {orderMap}
      </div>
    </div>
  )
}

class Customer extends React.Component {
  static getInitialProps ({ query }) {
    let props = {order_id: query.order_id}
    return props
  }
  constructor (props) {
    super(props)
    // this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

    this.state = {
      loading: true,
      backgroundCategories: ["Color Pattern", "Plants", "Food", "Animals",  "Pop Culture", "Solid colors"],
      currentBackground: 0,
      backgroundsArray: 
      [
        ["/static/pattern1.png", "/static/pattern2.png"], 
        ["/static/floral1.png", "/static/floral2.png", "/static/floral3.png"],
        ["/static/food1.png", "/static/food2.png"],
        ["/static/food2.png"],
        ["/static/food2.png"],
        ["/static/food2.png"]
      ],
      orderInfo: {},
      totalOrders: 1,
      loading: true,
      message: "",
      modalIsOpen: false
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    // this.fetchData = this.fetchData.bind(this)
  }
  async componentDidMount () {
    await this.getOrderInfo()
  }

  async getOrderInfo() {
    try {
      const { data } = await axios.get(
        `/api/getorder?order_id=${this.props.order_id}`
      )
      if(data.success) {
        const totalOrders = data.items.line_items.reduce(function(accumulator, currentValue) {
          return accumulator + currentValue.quantity
        }, 0)
        this.setState({
          orderInfo: data,
          totalOrders,
          loading: false
        })
      } else {
        this.setState({message: `Couldn't fetch order ${this.props.order_id}`})
      }
      
    } catch (error) {
      this.setState({message: `Couldn't fetch order ${this.props.order_id}`})
    }
  }

  renderDogList () {
    return (
      <ul>
        {this.state.dogs.map((dog, key) =>
          <li key={key}>
            <img src={dog.url} alt='' />
          </li>
        )}
      </ul>
    )
  }

  handleSubmit(event) {
    event.preventDefault()
    const eventType = event.target.name
    switch (eventType) {
      case "category-prev":
        (this.state.currentBackground === 0) ? this.setState({ currentBackground: 5}) : this.setState({ currentBackground: this.state.currentBackground - 1})
        break

      case "category-next":
        (this.state.currentBackground === 5) ? this.setState({ currentBackground: 0}) : this.setState({ currentBackground: this.state.currentBackground + 1})
        break
      default:
        console.log("error")
    }
  }

  openModal({ index, order_id }) {
    console.log(index, order_id)
    this.setState({currentOrderID: order_id, modalIsOpen: true});
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }
  render () {
    return (
      <div>
        <Header meta={meta}>
        </Header>
        <div style={{ padding: "0 1em"}}>
          <a href="/">
            <img src="/static/logo.png" alt='' width="200px" />
          </a>
          <OrderProof 
            backgroundCategories={this.state.backgroundCategories} 
            currentBackground={this.state.currentBackground}
            backgroundsArray={this.state.backgroundsArray[this.state.currentBackground]}
            handleSubmit={this.handleSubmit}
            orderInfo={this.state.orderInfo}
            loading={this.state.loading}
            openModal={this.openModal}
          />
          <Modal
            isOpen={this.state.modalIsOpen}
            onRequestClose={this.closeModal}
            // style={customStyles}
          >
            <div style={{ fontWeight: "bold", display: "flex", justifyContent: "space-evenly" }}>
              <button onClick={this.handleSubmit} name="category-prev" type="submit">Prev</button>
              <span>{this.state.backgroundCategories[this.state.currentBackground]}</span>
              <button onClick={this.handleSubmit} name="category-next" type="submit">Next</button>
            </div>
            <SimpleSlider backgroundsArray={this.state.backgroundsArray[this.state.currentBackground]} />
          </Modal>
          {/* <form>
            <label>Your comments (optional)</label>
            <textarea style={{ display:"block" }}/>
            <input name="request-change" type="submit" value="Request Change"/>
            <input name="approve" type="submit" value="Approve"/>
          </form> */}
          <History/>
        </div>
      </div>
    )
  }
}

export default Customer
