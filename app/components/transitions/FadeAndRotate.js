/**
 * @flow
 */

import React from 'react'

import timer, {type SetTimeout} from '../../lib/timer'
// $FlowFixMe
import './FadeAndRotate.scss'

type Props = {
  duration?: number,
  setTimeout: SetTimeout,
  tagName?: 'a' | 'div',
}

type State = {
  entered: boolean,
}

class Fade extends React.Component {
  props: Props
  state: State

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
    this.props.setTimeout(() => {
      this.setState({entered: true})
    }, this.props.duration || 300)
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
    ;['setTimeout', 'tagName'].forEach((key) => {
      delete props[key]
    })

    if (tagName === 'a') {
      return <a {...props}/>
    }

    return <div {...props}/>
  }
}

export default timer(Fade)
