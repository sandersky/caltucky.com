/**
 * @flow
 */

import React from 'react'

// $FlowFixMe
import './FadeAndRotate.scss'

type Props = {
  duration?: number,
  tagName?: 'a' | 'div',
}

type State = {
  entered: boolean,
}

class Fade extends React.Component {
  props: Props
  state: State

  static defaultProps: {
    duration: 300,
  }

  constructor (props: Props) {
    super(props)

    this.state = {
      entered: false,
    }
  }

  _getTransitionClassName () {
    return this.state.entered ? 'fade entered' : 'fade entering'
  }

  componentDidMount () {
    setTimeout(() => {
      this.setState({entered: true})
    }, this.props.duration)
  }

  render () {
    const props = {...this.props}
    const tagName = this.props.tagName
    const transitionClassName = this._getTransitionClassName()

    if (props.className) {
      props.className += ` ${transitionClassName}`
    } else {
      props.className = transitionClassName
    }

    // Make sure we omit properties specific to this React component
    delete props.tagName

    if (tagName === 'a') {
      return <a {...props}/>
    }

    return <div {...props}/>
  }
}

export default Fade
