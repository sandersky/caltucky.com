/**
 * @flow
 */

import PropTypes from 'prop-types'
import React from 'react'

export default (Component: React$ComponentType<*>) => {
  class WrappedComponent extends React.Component<*, void> {
    static contextTypes = {
      ssr: PropTypes.bool,
    }

    render () {
      const props = this.props
      return <Component ssr={this.context.ssr} {...props}/>
    }
  }

  return WrappedComponent
}
