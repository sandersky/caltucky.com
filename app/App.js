/**
 * @flow
 */

import React from 'react'
import {Provider} from 'react-redux'
import {HashRouter, Route, Switch} from 'react-router-dom'
import {applyMiddleware, createStore} from 'redux'
import thunk from 'redux-thunk'

import ConnectedMenu from './ConnectedMenu'
import Feed from './FeedRoute'
import Post from './PostRoute'
import appReducer from './reducers'

const APP_CONTAINER_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
}

const store = createStore(
  appReducer,
  applyMiddleware(thunk)
)

export default () => {
  return (
    <Provider store={store}>
      <HashRouter>
        <div style={APP_CONTAINER_STYLE}>
          <ConnectedMenu/>
          <Switch>
            <Route component={Feed} exact path="/"/>
            <Route component={Post} path="/posts/:slug"/>
          </Switch>
        </div>
      </HashRouter>
    </Provider>
  )
}
