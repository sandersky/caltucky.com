/**
 * @flow
 */

import React from 'react'

import type {Match, Post as PostType} from '../types'

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
    return <div>An error occurred</div>
  }

  _renderLoadedState (post: PostType) {
    const {content, title} = post
    const contentObject = {__html: content.rendered}

    return (
      <div>
        <h2>${title.rendered}</h2>
        <div dangerouslySetInnerHTML={contentObject}/>
      </div>
    )
  }

  _renderLoadingState () {
    return <div>Loading post</div>
  }

  render () {
    const {error, post} = this.props
    if (error) return this._renderErrorState(error)
    if (post) return this._renderLoadedState(post)
    return this._renderLoadingState()
  }
}

export default Post
