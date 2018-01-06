/**
 * @flow
 */

import React, {type ComponentType} from 'react'

// eslint-disable-next-line flowtype/no-weak-types
export type SetTimeout = (callback: Function, internval: number) => number

export default (Component: ComponentType<*>) => {
  class WrappedComponent extends React.Component<*, void> {
    _timeouts: Array<TimeoutID>

    constructor() {
      super(...arguments)
      this._timeouts = []
    }

    _setTimeout() {
      const timeout = setTimeout(...arguments)
      this._timeouts.push(timeout)
      return timeout
    }

    componentWillUnmount() {
      this._timeouts.forEach(timeout => {
        clearTimeout(timeout)
      })
    }

    render() {
      const props = {
        ...this.props,
        setTimeout: this._setTimeout.bind(this),
      }

      return <Component {...props} />
    }
  }

  return WrappedComponent
}
