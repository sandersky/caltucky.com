/**
 * @flow
 */

import React from 'react'
// $FlowFixMe - flow doesn't know about hydrate method
import {hydrate, render} from 'react-dom'

import App from './App'

const node: ?HTMLElement = document.getElementById('root')
const isServerSideRendered = node ? node.querySelectorAll('div').length !== 0 : false
const renderMethod = isServerSideRendered ? hydrate : render

renderMethod(<App/>, node)
