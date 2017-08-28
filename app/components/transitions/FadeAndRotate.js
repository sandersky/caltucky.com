/**
 * @flow
 */

import React from 'react'

import timer, {type SetTimeout} from '../../lib/timer'
import ssr from '../../lib/ssr'
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

class Fade extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {
      entered: false,
    }
  }

  _getTransitionClassName () {
    // Note: we don't want the animation for server-side rendered DOM in case
    // a search engine determines if the DOM is visible or not without
    // executing Javascript. This also makes SSR useful for browsers with
    // Javascript turned off.
    return this.props.ssr || this.state.entered
      ? 'fade entered'
      : 'fade entering'
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

    // Make sure we omit properties specific to this React component as well as
    // contextual properties that are invalid on an HTML tag
    ;['setTimeout', 'ssr', 'tagName'].forEach((key) => {
      delete props[key]
    })

    if (tagName === 'a') {
      return <a {...props}/>
    }

    return <div {...props}/>
  }
}

export default timer(ssr(Fade))
