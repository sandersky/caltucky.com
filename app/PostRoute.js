/**
 * @flow
 */

import {connect} from 'react-redux'

import {loadPost} from './actions/blog'
import Post from './components/Post'

const mapStateToProps = ({blog}, {match}) => {
  // Note: we perform the toUpperCase() because the URI encoded characers can
  // use uppercase or lowercase characters causing difficulties in comparison
  // below.
  const slug = encodeURIComponent(match.params.slug).toUpperCase()

  return {
    error: blog.postsError,
    post: blog.posts.find((post) => post.slug.toUpperCase() === slug),
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
