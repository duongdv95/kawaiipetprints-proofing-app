import React from 'react'
import axios from 'axios'
import Header from '../components/header.js'

class DogBreedPage extends React.Component {
  static getInitialProps ({ query }) {
    let props = {breed: query.id}
    return props
  }
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      meta: {},
      dogs: []
    }
    this.fetchData = this.fetchData.bind(this)
  }
  async componentDidMount () {
    await this.fetchData()
  }
  async fetchData () {
    this.setState({ loading: true })
    const reg = new RegExp(this.props.breed, 'g')

    const { data } = await axios.get(
      'https://api.thedogapi.com/v1/images/search?size=thumb&has_breeds=true&limit=50'
    )
    const filteredDogs = data.filter(dog =>
      dog.breeds[0]
        .name
        .toLowerCase()
        .match(reg)
    )
    this.setState({
      dogs: filteredDogs,
      breed: this.props.breed,
      meta: { title: `Only ${this.props.breed} here!`, description: 'Cute doggies. :D' },
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
        <Header meta={this.state.meta}>
        </Header>
          <div>
            <h1>Dog breed: {this.props.breed}</h1>
            {this.renderDogList()}
          </div>
      </div>
    )
  }
}

export default DogBreedPage
