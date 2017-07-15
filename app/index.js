/**
 * @flow
 */

import React from 'react'
import {render} from 'react-dom'

import App from './App'

const node: ?HTMLElement = document.getElementById('root')

render(<App/>, node)
