/**
 * @flow
 */

import {connect} from 'react-redux'

import {loadPage} from './actions/blog'
import Page from './components/Page'

const mapStateToProps = ({blog}, {match}) => {
  const {slug} = match.params

  return {
    error: blog.pageError,
    page: blog.pages.find((page) => page.slug === slug),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    loadPage (slug: string) {
      dispatch(loadPage(slug))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Page)
