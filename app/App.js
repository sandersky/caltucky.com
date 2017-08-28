/**
 * @flow
 */

import createBrowserHistory from 'history/createBrowserHistory'
import React from 'react'
import {Provider} from 'react-redux'
import {Router, Route, Switch} from 'react-router-dom'
import {applyMiddleware, createStore} from 'redux'
import thunk from 'redux-thunk'

// $FlowFixMe
import './App.scss'
import ConnectedMenu from './ConnectedMenu'
import Feed from './FeedRoute'
import Page from './PageRoute'
import Post from './PostRoute'
import appReducer from './reducers'

window._store = createStore(
  appReducer,
  applyMiddleware(thunk)
)

type Props = {
  history?: any, // TODO: add History type
}

export default (props: Props) => {
  const history = props.history || createBrowserHistory()

  return (
    <Provider store={window._store}>
      <Router history={history}>
        <div className="App">
          <ConnectedMenu/>
          <div className="AppContentPane">
            <div/>
            <Switch>
              <Route component={Feed} exact path="/"/>
              <Route component={Post} path="/:year/:month/:day/:slug"/>
              <Route component={Page} path="/:slug"/>
            </Switch>
          </div>
        </div>
      </Router>
    </Provider>
  )
}
