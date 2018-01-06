/**
 * @flow
 */

import {connect} from 'react-redux'

import {search} from './actions/blog'
import Menu from './components/Menu'

const mapStateToProps = ({blog}) => {
  return {
    query: blog.query,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    search(query: string) {
      dispatch(search(query))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu)
