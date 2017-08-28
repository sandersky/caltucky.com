/**
 * @flow
 */

import createBrowserHistory from 'history/createBrowserHistory'
import PropTypes from 'prop-types'
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
  ssr?: boolean,
}

type State = {
  history: any, // TODO: add History type
}

class App extends React.Component<Props, State> {
  static childContextTypes = {
    ssr: PropTypes.bool,
  }

  static defaultProps = {
    ssr: false,
  }

  constructor (props: Props) {
    super(props)

    this.state = {
      // Note: this can't be in defaultProps or it'll break the Node enviromnent
      // for server-side rendering because it'll still execute.
      history: this.props.history || createBrowserHistory(),
    }
  }

  getChildContext () {
    return {
      ssr: this.props.ssr,
    }
  }

  render () {
    return (
      <Provider store={window._store}>
        <Router history={this.state.history}>
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
}

export default App
