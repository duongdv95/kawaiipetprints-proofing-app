import React, { useEffect, useRef } from 'react'
import Header from '../components/header.js'
// import Slider from "react-slick"
import axios from 'axios'
import Modal from 'react-modal';
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext, DotGroup, WithStore, Dot, Image } from 'pure-react-carousel';
const flatten = require("lodash.flatten")

Modal.setAppElement("#__next")
var moment = require('moment');
const meta = { title: 'Order Dashboard', description: 'Order Dashboard' }

function OrderProof(props) {
  const {
    orderInfo, loading, openModal, 
    selectedBackgroundArray, updateCurrentSlide } = props
  const orderMap = (!loading && orderInfo.items.proof_created) ? orderInfo.items.line_items.map(function (element, index) {
    return (
      <div className="order-proof-item" key={index}>
        <div className="header">{element.product_name}</div>
        <a href={orderInfo.items.line_items[index].customerImages[0]} target="_blank">Original Image</a>
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

  const renderOrderProof = (!loading) ?
  (
    <div className="order-proof">
      <div className="header">
        <h1>Your Order Proof Is Ready!</h1>
      </div>
      <a href={orderInfo.items.order_status_url}>Order Status</a>
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

class ChangeCategory extends React.Component {
  render() {
    const { handleSubmit, updateCurrentSlide } = this.props
    return (
      <div id="change-category">
        <button onClick={(event) => {
          this.props.carouselStore.setStoreState({currentSlide: 0})
          updateCurrentSlide(0)
          handleSubmit(event)
        }} name="category-prev" type="submit">Previous Category</button>
        <button onClick={(event) => {
          this.props.carouselStore.setStoreState({currentSlide: 0})
          updateCurrentSlide(0)
          handleSubmit(event)
        }} name="category-next" type="submit">Next Category</button>
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
      backgroundCategories, 
      currentCategory,
      currentLineItem,
      handleSubmit,
      backgroundsArray,
      updateCurrentSlide
    } = this.props

    const backgroundsMap = backgroundsArray[currentCategory].map((element, index)=>{
      return (
        <Slide key={index} index={index}>
          <Image src={element} style={style}/>
        </Slide>
      )
    })

    const CarouselChangeCategory = WithStore(ChangeCategory, (state) => ({
      currentSlide: state.currentSlide, 
      handleSubmit,
      updateCurrentSlide 
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

    const dotMap = backgroundsArray[currentCategory].map((element, index) => {
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
        <div className="header">{backgroundCategories[currentCategory]}</div>
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
  const imagesArray = flatten(props.backgroundsArray)
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
    // this.handleChange = this.handleChange.bind(this)
    this.slider = React.createRef()
    this.state = {
      loading: true,
      backgroundCategories: ["Color Pattern", "Plants", "Food", "Animals", "Pop Culture", "Solid colors"],
      currentCategory: 0,
      backgroundsArray:
        [
          ["/static/pattern1.png", "/static/pattern2.png"],
          ["/static/floral1.png", "/static/floral2.png", "/static/floral3.png"],
          ["/static/food1.png", "/static/food2.png"],
          ["/static/animal1.png", "/static/animal2.png"],
          ["/static/popculture1.png", "/static/popculture2.png"],
          ["/static/color1.png", "/static/color2.png"]
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
    }
    this.handleSubmit = this.handleSubmit.bind(this)
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
        const selectedBackgroundArray = this.state.selectedBackgroundArray
        for (let i = 0; i < totalOrders; i++) {
          selectedBackgroundArray.push("/static/white.png")
        }
        this.setState({
          orderInfo: data,
          totalOrders,
          loading: false,
          selectedBackgroundArray
        })
      } else {
        this.setState({ message: `Couldn't fetch order ${this.props.order_id}` })
      }

    } catch (error) {
      this.setState({ message: `Couldn't fetch order ${this.props.order_id}` })
    }
  }

  handleSubmit(event) {
    event.preventDefault()
    const eventType = event.target.name
    switch (eventType) {
      case "category-prev":
        (this.state.currentCategory === 0) ?
        this.setState({ currentCategory: 5 })
          :
          this.setState({ currentCategory: this.state.currentCategory - 1 })
          break

      case "category-next":
        (this.state.currentCategory === 5) ?
          this.setState({ currentCategory: 0 })
          :
          this.setState({ currentCategory: this.state.currentCategory + 1 })
        break
      case "select-bg":
        const currentLineItem = event.target.dataset.currentlineitem
        const { selectedBackgroundArray, backgroundsArray, currentCategory, currentSlide } = this.state
        selectedBackgroundArray[currentLineItem] = backgroundsArray[currentCategory][currentSlide]
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
    { selectedBackgroundArray: this.state.selectedBackgroundArray}
    )
    console.log(data)
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
                backgroundCategories={this.state.backgroundCategories}
                currentSlide={this.state.currentSlide}
                backgroundsArray={this.state.backgroundsArray[this.state.currentCategory]}
                handleSubmit={this.handleSubmit}
                orderInfo={this.state.orderInfo}
                loading={this.state.loading}
                openModal={this.openModal}
                selectedBackgroundArray={this.state.selectedBackgroundArray}
                updateCurrentSlide={this.updateCurrentSlide.bind(this)}
                approveOrder={this.approveOrder.bind(this)}
              />
              <Modal
                isOpen={this.state.modalIsOpen}
                onRequestClose={this.closeModal}
              >
                <Carousel
                  backgroundsArray={this.state.backgroundsArray}
                  currentCategory={this.state.currentCategory}
                  backgroundCategories={this.state.backgroundCategories}
                  handleSubmit={this.handleSubmit}
                  currentLineItem={this.state.currentLineItem}
                  updateCurrentSlide={this.updateCurrentSlide.bind(this)}
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
