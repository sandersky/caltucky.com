/**
 * @flow
 */

import {connect} from 'react-redux'

import {loadPost} from './actions/blog'
import Post from './components/Post'

const mapStateToProps = ({blog}, {match}) => {
  const {slug} = match.params

  return {
    error: blog.postsError,
    post: blog.posts.find((post) => post.slug === slug),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    loadPost (slug: string) {
      dispatch(loadPost(slug))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Post)
