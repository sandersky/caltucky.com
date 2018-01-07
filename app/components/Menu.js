/**
 * @flow
 */

/* global HTMLInputElement */

import React from 'react'
import {Link} from 'react-router-dom'

import {ENTER} from '../lib/keycodes'
import timer, {type SetTimeout} from '../lib/timer'
import MenuItem from './MenuItem'

type Props = {
  search: (query: string) => void,
  setTimeout: SetTimeout,
}

const SEARCH_DEBOUNCE = 250

class Menu extends React.Component<Props, void> {
  _handleSearchKeyUp(event: SyntheticKeyboardEvent<*>) {
    const element = event.currentTarget

    if (element instanceof HTMLInputElement) {
      // If user hits enter key immediately invoke search
      if (event.keyCode === ENTER) {
        this.props.search(element.value)
      } else {
        this.props.setTimeout(() => {
          this.props.search(element.value)
        }, SEARCH_DEBOUNCE)
      }
    }
  }

  render() {
    return (
      <div className="Menu">
        <Link to="/">
          <img alt="Caltucky" src={`/${require('../assets/logo.png')}`} />
        </Link>
        <MenuItem path="/about" text="About" />
        <input
          onKeyUp={this._handleSearchKeyUp.bind(this)}
          placeholder="search"
        />
      </div>
    )
  }
}

export default timer(Menu)
