import React, { useEffect, useRef } from 'react'
import Header from '../components/header.js'
// import Slider from "react-slick"
import axios from 'axios'
import Modal from 'react-modal';
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext, WithStore, Dot, Image } from 'pure-react-carousel';
const flatten = require("lodash.flatten")

Modal.setAppElement("#__next")
var moment = require('moment');
const meta = { title: 'Order Dashboard', description: 'Order Dashboard' }

function OrderProof(props) {
  const {
    orderInfo, loading, openModal, 
    selectedBackgroundArray, updateCurrentSlide, approved } = props
  const orderMap = (!loading && orderInfo.items.proof_created && !approved) ? orderInfo.items.line_items.map(function (element, index) {
    return (
      <div className="order-proof-item" key={index}>
        <div className="header">{element.product_name}</div>
        <div className="original-image">
          <a href={orderInfo.items.line_items[index].customerImages[0]} target="_blank">Original Image</a>
        </div>
        <div className="order-buttons">
          <button id="revise-button">Request Revision</button>
          <button id="select-bg-button" onClick={() => {
            updateCurrentSlide(0)
            openModal({ currentLineItem: index })
          }}>Select Background</button>
        </div>
        <div className="wrapper">
          <img src={selectedBackgroundArray[index]} className="bg-image"></img>
          <div className="other-images">
            <img src={element.artworkURL} />
          </div>
        </div>
      </div>
    )
  }) : (null)

  const renderOrderProof = (!loading && !approved) ?
  (
    <div className="order-proof">
      <div className="header">
        <h1>Your Order Proof Is Ready!</h1>
      </div>
      <div className="order-status">
        <a href={orderInfo.items.order_status_url} target="_blank">Order Status</a>
      </div>
      <div>
        {orderMap}
      </div>
      <div className="approve-art">
        <button onClick={props.approveOrder}>
          Approve
        </button>
      </div>
    </div>
  )
  :
  (null)

  return (
    renderOrderProof
  )
}

function OrderSummary (props) {
  const { approved, loading, orderInfo, selectedBackgroundArray } = props
  const orderMap = (!loading && orderInfo.items.proof_created && approved) ? orderInfo.items.line_items.map(function (element, index) {
    return (
      <div className="order-proof-item" key={index}>
        <div className="header">{element.product_name}</div>
        <div className="original-image">
          <a href={orderInfo.items.line_items[index].customerImages[0]} target="_blank">Original Image</a>
        </div>
        <div className="wrapper">
          <img src={selectedBackgroundArray[index]} className="bg-image"></img>
          <div className="other-images">
            <img src={element.artworkURL} />
          </div>
        </div>
      </div>
    )
  }) : (null)
  const renderOrderSummary = (approved) ? (
    <div className="order-summary">
      <div className="fulfillment-header">
        <div className="checkmark">
          <i className="far fa-check-circle"></i>
        </div>
        <div className="message">
          We are fulfilling your order!
        </div>
      </div>
      <div>
        {orderMap}
      </div>
    </div>
  ) :
  (null)
  return (
    renderOrderSummary
  )
}

class ChangeCategory extends React.Component {
  render() {
    const { updateCurrentSlide, backgroundsArray, handleChange, currentCategoryIndex } = this.props
    return (
      <div id="change-category">
        <select value={currentCategoryIndex} onChange={(event) => {
          this.props.carouselStore.setStoreState({currentSlide: 0})
          updateCurrentSlide(0)
          handleChange(event)
        }} name="change-category">
          { backgroundsArray.map((element, index) => {
            return (
              <option value={index} key={index}>
                { element.category }
              </option>
            )
          }) }
        </select>
      </div>
    )
  }
}

class BackButton extends React.Component {
  render() {
    const { currentSlide, totalSlides, updateCurrentSlide }  = this.props
    const updatedSlide = (currentSlide === 0) ? totalSlides - 1 : currentSlide - 1 
    return (
      <ButtonBack onClick={()=>updateCurrentSlide(updatedSlide)}><i className="fas fa-chevron-left"></i></ButtonBack>
    )
  }
}

class NextButton extends React.Component {
  render() {
    const { currentSlide, totalSlides, updateCurrentSlide } = this.props
    const updatedSlide = (currentSlide ===  totalSlides - 1) ? 0 : currentSlide + 1 
    return (
      <ButtonNext onClick={()=>updateCurrentSlide(updatedSlide)}><i className="fas fa-chevron-right"></i></ButtonNext>
    )
  }
}

class Carousel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSlide: 0
    }
  }
  render() {
    const style = {width: "100%"}
    const { 
      currentCategoryIndex,
      currentLineItem,
      handleSubmit,
      handleChange,
      backgroundsArray,
      updateCurrentSlide,
    } = this.props

    const backgroundsMap = backgroundsArray[currentCategoryIndex].options.map((element, index)=>{
      return (
        <Slide key={index} index={index}>
          <Image src={element} style={style}/>
        </Slide>
      )
    })

    const CarouselChangeCategory = WithStore(ChangeCategory, (state) => ({
      currentSlide: state.currentSlide, 
      handleSubmit,
      updateCurrentSlide,
      backgroundsArray,
      handleChange,
      currentCategoryIndex
    }))

    const EnhancedBackButton = WithStore(BackButton, (state) => ({
      currentSlide: state.currentSlide,
      updateCurrentSlide,
      totalSlides: backgroundsMap.length
    }))
    const EnhancedNextButton = WithStore(NextButton, (state) => ({
      currentSlide: state.currentSlide,
      updateCurrentSlide,
      totalSlides: backgroundsMap.length
    }))

    const dotMap = backgroundsArray[currentCategoryIndex].options.map((element, index) => {
      return (
        <Dot 
        key={index}
        slide={index}
        onClick={()=>{updateCurrentSlide(index)}}
        />
      )
    })
    return (
      <div id="carousel">
        <CarouselProvider
          naturalSlideWidth={120}
          naturalSlideHeight={100}
          totalSlides={backgroundsMap.length}
          infinite={true}
          dragEnabled={false}
        >
          <CarouselChangeCategory/>
          <div className="slider">
            <Slider>
              {backgroundsMap}
            </Slider>
            <EnhancedBackButton></EnhancedBackButton>
            <EnhancedNextButton></EnhancedNextButton>
          </div>
          <div className="dot">
            {dotMap}
          </div>
        </CarouselProvider>
        <div className="choose-bg">
          <button
            data-currentlineitem={currentLineItem}
            onClick={handleSubmit}
            name="select-bg"
            type="submit"
          >
            Select Background
          </button>
        </div>
      </div> 
    )
  }
}

function PreloadImages (props) {
  const imagesArray = flatten(props.backgroundsArray.map((element)=>{
    return element.options
  }))
  const imagesMap = imagesArray.map(function(element, index){
    return (
      <img key={index} src={element} style={{display: "none"}}/>
    )
  })
  return (
    <React.Fragment>
      {imagesMap}
    </React.Fragment>
  )
}
class Customer extends React.Component {
  static getInitialProps({ query }) {
    let props = { order_id: query.order_id }
    return props
  }
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      currentCategoryIndex: 0,
      backgroundsArray:
        [
          { category: "Color Pattern", options: ["/static/backgrounds/pattern1.png", "/static/backgrounds/pattern2.png", "/static/backgrounds/pattern3.png", "/static/backgrounds/pattern4.png", "/static/backgrounds/pattern5.png"] },
          { category: "Plants", options: ["/static/backgrounds/plant1.png", "/static/backgrounds/plant2.png", "/static/backgrounds/plant3.png", "/static/backgrounds/plant4.png", "/static/backgrounds/plant5.png"] },
          { category: "Food", options: ["/static/backgrounds/food1.png", "/static/backgrounds/food2.png", "/static/backgrounds/food3.png", "/static/backgrounds/food4.png"] },
          { category: "Animals", options: ["/static/backgrounds/animal1.png", "/static/backgrounds/animal2.png", "/static/backgrounds/animal3.png", "/static/backgrounds/animal4.png"] },
          { category: "Solid Colors", options: ["/static/backgrounds/color1.png", "/static/backgrounds/color2.png"] },
        ],
      currentSlide: 0,
      orderInfo: {},
      totalOrders: 1,
      loading: true,
      message: "",
      modalIsOpen: false,
      currentLineItem: 0,
      selectedBackgroundArray: [],
      slideIndex: 0,
      approved: false
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.updateCurrentSlide = this.updateCurrentSlide.bind(this)
    this.approveOrder = this.approveOrder.bind(this)
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }
  
  async componentDidMount() {
    await this.getOrderInfo()
  }

  async getOrderInfo() {
    try {
      const { data } = await axios.get(
        `/api/getorder?order_id=${this.props.order_id}`
      )
      if (data.success) {
        const totalOrders = data.items.line_items.reduce(function (accumulator, currentValue) {
          return accumulator + currentValue.quantity
        }, 0)
        const selectedBackgroundArray = (function() {
          let temp = data.items.selectedBackgroundArray || []
          if (temp.length === 0) {
            for (let i = 0; i < totalOrders; i++) {
              temp.push("/static/backgrounds/white.png")
            }
            return temp
          } else {
            return temp
          }
          })()
        this.setState({
          orderInfo: data,
          totalOrders,
          loading: false,
          selectedBackgroundArray,
          approved: data.items.approved
        })
      } else {
        this.setState({ message: `Couldn't fetch order ${this.props.order_id}` })
      }

    } catch (error) {
      this.setState({ message: `Couldn't fetch order ${this.props.order_id}` })
    }
  }

  handleChange(event) {
    event.preventDefault()
    const eventType = event.target.name
    switch (eventType) {
      case "change-category":
        this.setState({ currentCategoryIndex: event.target.value })
    }
  }

  handleSubmit(event) {
    event.preventDefault()
    const eventType = event.target.name
    switch (eventType) {
      case "select-bg":
        const currentLineItem = event.target.dataset.currentlineitem
        const { selectedBackgroundArray, backgroundsArray, currentCategoryIndex, currentSlide } = this.state
        selectedBackgroundArray[currentLineItem] = backgroundsArray[currentCategoryIndex].options[currentSlide]
        this.closeModal()
        this.setState({ selectedBackgroundArray })
        break
      default:
        console.log("error")
    }
  }

  openModal({ currentLineItem }) {
    this.setState({ currentLineItem, modalIsOpen: true });
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  updateCurrentSlide(currentSlide) {
    this.setState({ currentSlide })
  }

  async approveOrder() {
    const { data } = await axios.post(
      `/api/approveorder?order_id=${this.props.order_id}`,
    { selectedBackgroundArray: this.state.selectedBackgroundArray, order_number: this.state.orderInfo.items.order_number }
    )
    if(data.success) {
      this.getOrderInfo()
    }
  }
  
  render() {
    return (
      <div>
        <Header meta={meta}>
        </Header>
        <div id="customer" >
          <div className="nav">
            <a href="/">
              <img src="/static/logo.png" alt='' width="200px" />
            </a>
          </div>
          <div className="main">
            <div className="content-wrap">
              <OrderProof
                currentSlide={this.state.currentSlide}
                backgroundsArray={this.state.backgroundsArray[this.state.currentCategoryIndex]}
                handleSubmit={this.handleSubmit}
                orderInfo={this.state.orderInfo}
                loading={this.state.loading}
                openModal={this.openModal}
                selectedBackgroundArray={this.state.selectedBackgroundArray}
                updateCurrentSlide={this.updateCurrentSlide}
                approveOrder={this.approveOrder}
                approved={this.state.approved}
              />
              <OrderSummary
                approved={this.state.approved}
                loading={this.state.loading}
                orderInfo={this.state.orderInfo}
                selectedBackgroundArray={this.state.selectedBackgroundArray}
              />
              <Modal
                isOpen={this.state.modalIsOpen}
                onRequestClose={this.closeModal}
              >
                <Carousel
                  backgroundsArray={this.state.backgroundsArray}
                  currentCategoryIndex={this.state.currentCategoryIndex}
                  handleSubmit={this.handleSubmit}
                  handleChange={this.handleChange}
                  currentLineItem={this.state.currentLineItem}
                  updateCurrentSlide={this.updateCurrentSlide}
                />
              </Modal>
              <PreloadImages
                backgroundsArray={this.state.backgroundsArray}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Customer
