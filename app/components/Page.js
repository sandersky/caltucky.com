/**
 * @flow
 */

import nullthrows from 'nullthrows'
import React from 'react'
import {type Match} from 'react-router-dom'

import {compile} from '../lib/compiler'
import {parse} from '../lib/parser'
import type {Page as PageType} from '../types'

type Props = {
  error?: Error,
  loadPage: (slug: string) => void,
  match: Match,
  page?: PageType,
}

function normalizedContent(content: string) {
  const ast = parse(content)
  // TODO: apply transforms here
  return compile(ast)
}

class Page extends React.Component<Props, void> {
  componentWillMount() {
    if (!this.props.page) {
      this.props.loadPage(nullthrows(this.props.match.params.slug))
    }
  }

  _renderErrorState(error: Error) {
    return 'An error occurred'
  }

  _renderLoadedState(page: PageType) {
    const {content, title} = page
    const titleObject = {__html: normalizedContent(title.rendered)}
    const contentObject = {__html: normalizedContent(content.rendered)}

    return [
      <h2 dangerouslySetInnerHTML={titleObject} key="title" />,
      <div dangerouslySetInnerHTML={contentObject} key="content" />,
    ]
  }

  _renderLoadingState() {
    return 'Loading page'
  }

  render() {
    const {error, page} = this.props

    let child

    if (error) {
      child = this._renderErrorState(error)
    } else if (page) {
      child = this._renderLoadedState(page)
    } else {
      child = this._renderLoadingState()
    }

    return <div className="Page">{child}</div>
  }
}

export default Page
