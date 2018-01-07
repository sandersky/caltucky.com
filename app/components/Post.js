/**
 * @flow
 */

import nullthrows from 'nullthrows'
import React from 'react'
import {type Match} from 'react-router-dom'

import {compile} from '../lib/compiler'
import {parse} from '../lib/parser'
import type {Post as PostType} from '../types'

type Props = {
  error?: Error,
  loadPost: (slug: string) => void,
  match: Match,
  post?: PostType,
}

function normalizedContent(content: string) {
  const ast = parse(content)
  // TODO: apply transforms here
  return compile(ast)
}

class Post extends React.Component<Props, void> {
  componentWillMount() {
    if (!this.props.post) {
      this.props.loadPost(nullthrows(this.props.match.params.slug))
    }
  }

  _renderErrorState(error: Error) {
    return 'An error occurred'
  }

  _renderLoadedState(post: PostType) {
    const {content, title} = post
    const contentObject = {__html: normalizedContent(content.rendered)}

    return [
      <h2 key="title">{title.rendered}</h2>,
      <div dangerouslySetInnerHTML={contentObject} key="content" />,
    ]
  }

  _renderLoadingState() {
    return 'Loading post'
  }

  render() {
    const {error, post} = this.props

    let child

    if (error) {
      child = this._renderErrorState(error)
    } else if (post) {
      child = this._renderLoadedState(post)
    } else {
      child = this._renderLoadingState()
    }

    return <div className="Post">{child}</div>
  }
}

export default Post
