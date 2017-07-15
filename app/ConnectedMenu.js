/**
 * @flow
 */

import {connect} from 'react-redux'

import {loadCategories, loadPages} from './actions/blog'
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
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu)
