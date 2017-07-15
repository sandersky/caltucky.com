/**
 * @flow
 */

import React from 'react'

import type {Match, Page as PageType} from '../types'

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
    return <div>An error occurred</div>
  }

  _renderLoadedState (page: PageType) {
    const {content, title} = page
    const contentObject = {__html: content.rendered}

    return (
      <div>
        <h2>{title.rendered}</h2>
        <div dangerouslySetInnerHTML={contentObject}/>
      </div>
    )
  }

  _renderLoadingState () {
    return <div>Loading page</div>
  }

  render () {
    const {error, page} = this.props
    if (error) return this._renderErrorState(error)
    if (page) return this._renderLoadedState(page)
    return this._renderLoadingState()
  }
}

export default Page
