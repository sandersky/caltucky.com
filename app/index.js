/**
 * @flow
 */

import createBrowserHistory from 'history/createBrowserHistory'
import React from 'react'
// $FlowFixMe - flow doesn't know about hydrate method
import {hydrate, render} from 'react-dom'

import App from './App'

if (window._ssr) {
  window.getApp = ({data, history}) => {
    window._data = data
    return {
      Component: App,
      props: {
        history,
        ssr: true,
      },
    }
  }
} else {
  const node: ?HTMLElement = document.getElementById('root')

  if (!node) {
    throw new Error('Root node not found')
  }

  const history = createBrowserHistory()
  const isServerSideRendered = node
    ? node.querySelectorAll('div').length !== 0
    : false
  const renderMethod = isServerSideRendered ? hydrate : render
  renderMethod(<App history={history} ssr={false} />, node)
}
