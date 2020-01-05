import React from 'react'
import axios from 'axios'
import Header from '../components/header.js'
const meta = { title: 'Order Dashboard', description: 'Order Dashboard' }

class Order extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      dogs: []
    }
    this.fetchData = this.fetchData.bind(this)
  }
  async componentDidMount () {
    await this.fetchData()
  }
  async fetchData () {
    this.setState({ loading: true })
    const { data } = await axios.get(
      'https://api.thedogapi.com/v1/images/search?size=thumb&limit=10'
    )
    this.setState({
      dogs: data,
      loading: false
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
  render () {
    return (
      <div>
        <Header meta={meta}>
        </Header>
        <div>
          <h1>Orders</h1>
        </div>
      </div>
    )
  }
}

export default Order
