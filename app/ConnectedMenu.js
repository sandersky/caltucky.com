/**
 * @flow
 */

import {connect} from 'react-redux'

import {loadCategories, loadPages, search} from './actions/blog'
import Menu from './components/Menu'

const mapStateToProps = ({blog}) => {
  return {
    categories: blog.categories,
    categoriesError: blog.categoriesError,
    pages: blog.pages,
    pagesError: blog.pagesError,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    loadCategories () {
      dispatch(loadCategories())
    },

    loadPages () {
      dispatch(loadPages())
    },

    search (query: string) {
      dispatch(search(query))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu)
