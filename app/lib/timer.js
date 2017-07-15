/**
 * @flow
 */

import React from 'react'

export type SetTimeout = (callback: Function, internval: number) => number

export default (Component: ReactClass<*>) => {
  class WrappedComponent extends React.Component {
    _timeouts: Array<number>

    constructor () {
      super(...arguments)
      this._timeouts = []
    }

    _setTimeout () {
      const timeout = setTimeout(...arguments)
      this._timeouts.push(timeout)
      return timeout
    }

    componentWillUnmount () {
      this._timeouts.forEach((timeout) => {
        clearTimeout(timeout)
      })
    }

    render () {
      const props = {
        ...this.props,
        setTimeout: this._setTimeout.bind(this),
      }

      return <Component {...props}/>
    }
  }

  return WrappedComponent
}
