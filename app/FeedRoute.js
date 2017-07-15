/**
 * @flow
 */

import {connect} from 'react-redux'

import {loadPosts} from './actions/blog'
import {type PostOptions} from './actions/wordpress'
import Feed from './components/Feed'

const mapStateToProps = ({blog}) => {
  return {
    posts: blog.posts,
    postsError: blog.postsError,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    loadPosts (options?: PostOptions) {
      dispatch(loadPosts(options))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Feed)
