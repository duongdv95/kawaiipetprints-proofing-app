import React from 'react'
import Header from '../components/header.js'
import Slider from "react-slick"
import axios from 'axios'

const meta = { title: 'Order Dashboard', description: 'Order Dashboard' }

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
  const { backgroundCategories, currentBackground, backgroundsArray } = props
  return(
    <div>
      <h1>Your Order Proof</h1>
      <a href="/">
        Order Status
      </a>
      <div>
        <button>Request Revision</button><button>Select Background</button>
        {/* <div style={{fontWeight: "bold", display: "flex", justifyContent: "space-evenly"}}>
          <button onClick={props.handleSubmit} name="category-prev" type="submit">Prev</button>
          <span>{backgroundCategories[currentBackground]}</span>
          <button onClick={props.handleSubmit} name="category-next" type="submit">Next</button>
          </div>
        <SimpleSlider backgroundsArray={backgroundsArray}/> */}
        <div id="wrapper">
          <img src="/static/pattern1.png" id="bg-image"></img>
          <div id="other-images">
            <img src="/static/dog.png" />
          </div>
        </div>
        <button>Back</button><button>Approve</button>
        <div>
          <label style={{fontWeight: "bold"}}>Orientation</label>
          <input type="radio" checked/><label>Horizontal</label>
          <input type="radio"/><label>Vertical</label>
        </div>
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
      totalOrders: 1
    }
    
    // this.fetchData = this.fetchData.bind(this)
  }
  async componentDidMount () {
    await this.getOrderInfo()
  }

  async getOrderInfo() {
    const { data } = await axios.get(
      `/api/getorder?order_id=${this.props.order_id}`
    )
    const totalOrders = data.orderData.orderDataArray.reduce(function(accumulator, currentValue) {
      return accumulator + currentValue.quantity
    }, 0)

    this.setState({
      orderInfo: data,
      totalOrders
    })
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
          />
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
