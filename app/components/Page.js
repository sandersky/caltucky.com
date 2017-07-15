/**
 * @flow
 */

import React from 'react'

import type {Match, Page as PageType} from '../types'
// $FlowFixMe
import './Page.scss'

type Props = {
  error?: Error,
  loadPage: (slug: string) => void,
  match: Match,
  page?: PageType,
}

class Page extends React.Component<void, Props, void> {
  props: Props

  componentWillMount () {
    if (!this.props.page) {
      this.props.loadPage(this.props.match.params.slug)
    }
  }

  _renderErrorState (error: Error) {
    return 'An error occurred'
  }

  _renderLoadedState (page: PageType) {
    const {content, title} = page
    const contentObject = {__html: content.rendered}

    return [
      <h2 key="title">{title.rendered}</h2>,
      <div dangerouslySetInnerHTML={contentObject} key="content"/>,
    ]
  }

  _renderLoadingState () {
    return 'Loading page'
  }

  render () {
    const {error, page} = this.props

    let child

    if (error) {
      child = this._renderErrorState(error)
    } else if (page) {
      child = this._renderLoadedState(page)
    } else {
      child = this._renderLoadingState()
    }

    return (
      <div className="Page">
        {child}
      </div>
    )
  }
}

export default Page
