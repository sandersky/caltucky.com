/**
 * @flow
 */

import React from 'react'
import {Link} from 'react-router-dom'

// $FlowFixMe
import './MenuItem.scss'

type Props = {
  path: string,
  text: string,
}

export default (props: Props) => {
  const text = {__html: props.text}
  return <Link
    className="MenuItem"
    dangerouslySetInnerHTML={text}
    to={props.path}
  />
}
