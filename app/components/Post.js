/**
 * @flow
 */

import React from 'react'

import type {Match, Post as PostType} from '../types'
// $FlowFixMe
import './Post.scss'

type Props = {
  error?: Error,
  loadPost: (slug: string) => void,
  match: Match,
  post?: PostType,
}

class Post extends React.Component<void, Props, void> {
  props: Props

  componentWillMount () {
    if (!this.props.post) {
      this.props.loadPost(this.props.match.params.slug)
    }
  }

  _renderErrorState (error: Error) {
    return 'An error occurred'
  }

  _renderLoadedState (post: PostType) {
    const {content, title} = post
    const contentObject = {__html: content.rendered}

    return [
      <h2>{title.rendered}</h2>,
      <div dangerouslySetInnerHTML={contentObject}/>,
    ]
  }

  _renderLoadingState () {
    return 'Loading post'
  }

  render () {
    const {error, post} = this.props

    let child

    if (error) {
      child = this._renderErrorState(error)
    } else if (post) {
      child = this._renderLoadedState(post)
    } else {
      child = this._renderLoadingState()
    }

    return (
      <div className="Post">
        {child}
      </div>
    )
  }
}

export default Post
