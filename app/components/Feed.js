/**
 * @flow
 */

import React from 'react'

import {type PostOptions} from '../actions/wordpress'
// $FlowFixMe
import './Feed.scss'
import FeedPost from './FeedPost'
import {ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP} from '../lib/keycodes'
import type {Post as PostType} from '../types'

type Props = {
  error?: Error,
  loadPosts: (options: PostOptions) => void,
  posts: Array<PostType>,
}

const FEED_POST_MARGIN = 10
const FEED_POST_WIDTH = 200
const SCROLL_BUFFER = 100

class Feed extends React.Component<void, Props, void> {
  _element: HTMLElement
  _isLoadingPosts: boolean
  props: Props

  componentDidMount () {
    this._isLoadingPosts = true
    const per_page = this._getPerPageValue()
    this.props.loadPosts({per_page})
  }

  componentWillReceiveProps (nextProps: Props) {
    if (
      this._isLoadingPosts &&
      this.props.posts.length !== nextProps.posts.length
    ) {
      this._isLoadingPosts = false
    }
  }

  _findPostIndex (id: number) {
    return this.props.posts.findIndex((post) => post.id === id)
  }

  _focusPostAtIndex (index: number) {
    const {posts} = this.props

    if (index < 0) {
      index = 0
    } else if (index >= posts.length) {
      index = posts.length - 1
    }

    const element: ?HTMLElement = this._element
      .querySelector(`.FeedPost:nth-child(${index + 1})`)

    if (element) {
      element.focus()
    } else {
      console.info('Sad panda', this._element, `.FeedPost:nth-child(${index})`)
    }
  }

  _getPerPageValue () {
    const {clientHeight, clientWidth} = this._element
    const FEED_POST_OUTER_WIDTH = FEED_POST_WIDTH + FEED_POST_MARGIN * 2
    const cols = Math.floor(clientWidth / FEED_POST_OUTER_WIDTH)

    // Note: we want plus one on the rows so we never have extra whitespace at
    // the bottom of the feed. Instead we'd rather start with a little bit of
    // scrolling.
    const rows = Math.floor(clientHeight / FEED_POST_OUTER_WIDTH) + 1

    return cols * rows
  }

  _handlePostKeyUp (id: number, event: SyntheticKeyboardEvent) {
    switch (event.keyCode) {
      case ARROW_DOWN: {
        // TODO: focus on post below current post
        break
      }

      case ARROW_LEFT: {
        const postIndex = this._findPostIndex(id) - 1
        this._focusPostAtIndex(postIndex)
        break
      }

      case ARROW_RIGHT: {
        const postIndex = this._findPostIndex(id) + 1
        this._focusPostAtIndex(postIndex)
        break
      }

      case ARROW_UP: {
        // TODO: focus on post above current post
        break
      }
    }
  }

  _handleScroll (event: SyntheticUIEvent) {
    const element = event.currentTarget

    if (element instanceof HTMLElement) {
      const scrollHeight = element.scrollHeight
      const currentHeight = element.scrollTop + element.clientHeight

      if (
        !this._isLoadingPosts &&
        this.props.posts.length &&
        currentHeight > scrollHeight - SCROLL_BUFFER
      ) {
        this._isLoadingPosts = true
        this.props.loadPosts({
          before: this.props.posts[this.props.posts.length - 1].date.toISOString(),
          per_page: this._getPerPageValue(),
        })
      }
    }
  }

  _renderErrorState (error: Error) {
    return 'Failed to retrieve posts'
  }

  _renderLoadedState () {
    return this.props.posts.map((post) => {
      return <FeedPost
        key={post.id}
        onKeyUp={this._handlePostKeyUp.bind(this, post.id)}
        margin={FEED_POST_MARGIN}
        post={post}
        width={FEED_POST_WIDTH}
      />
    })
  }

  _renderLoadingState () {
    return 'Loading'
  }

  render () {
    const {error, posts} = this.props

    let child

    if (error) {
      child = this._renderErrorState(error)
    } else if (posts) {
      child = this._renderLoadedState()
    } else {
      child = this._renderLoadingState()
    }

    return (
      <div
        className="Feed"
        onScroll={this._handleScroll.bind(this)}
        ref={(el) => this._element = el}
      >
        {child}
      </div>
    )
  }
}

export default Feed
