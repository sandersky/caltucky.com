/**
 * @flow
 */

import React from 'react'
import {Provider} from 'react-redux'
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import {applyMiddleware, createStore} from 'redux'
import thunk from 'redux-thunk'

// $FlowFixMe
import './App.scss'
import ConnectedMenu from './ConnectedMenu'
import Feed from './FeedRoute'
import Post from './PostRoute'
import appReducer from './reducers'

const store = createStore(
  appReducer,
  applyMiddleware(thunk)
)

export default () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="App">
          <ConnectedMenu/>
          <Switch>
            <Route component={Feed} exact path="/"/>
            <Route component={Post} path="/:year/:month/:day/:slug"/>
          </Switch>
        </div>
      </BrowserRouter>
    </Provider>
  )
}
