/**
 * @flow
 */

import PropTypes from 'prop-types'
import React from 'react'
import {Provider} from 'react-redux'
import {Route, Router, type RouterHistory, Switch} from 'react-router-dom'
import {applyMiddleware, createStore} from 'redux'
import thunk from 'redux-thunk'

import ConnectedMenu from './ConnectedMenu'
import Feed from './FeedRoute'
import Page from './PageRoute'
import Post from './PostRoute'
import appReducer from './reducers'

window._store = createStore(appReducer, applyMiddleware(thunk))

type Props = {
  history: RouterHistory,
  ssr: boolean,
}

class App extends React.Component<Props, void> {
  static childContextTypes = {
    ssr: PropTypes.bool,
  }

  static defaultProps = {
    ssr: false,
  }

  getChildContext() {
    return {
      ssr: this.props.ssr,
    }
  }

  render() {
    return (
      <Provider store={window._store}>
        <Router history={this.props.history}>
          <div className="App">
            <ConnectedMenu />
            <div className="AppContentPane">
              <div />
              <Switch>
                <Route component={Feed} exact path="/" />
                <Route component={Post} path="/:year/:month/:day/:slug" />
                <Route component={Page} path="/:slug" />
              </Switch>
            </div>
          </div>
        </Router>
      </Provider>
    )
  }
}

export default App
