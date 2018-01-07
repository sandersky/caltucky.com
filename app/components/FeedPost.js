/**
 * @flow
 */

import React from 'react'

import type {Post} from '../types'
import FadeAndRotate from './transitions/FadeAndRotate'

type Props = {
  margin: number,
  post: Post,
  width: number,
}

function getPostStyle(margin: number, width: number) {
  return {
    height: width,
    margin,
    width,
  }
}

export default (props: Props) => {
  const {post, margin, width} = props
  const imageSrc = `${post.featured_media_url}?h=${width}&w=${width}&crop=1`
  const [year, month, day] = post.date_gmt.toISOString().split(/[-T]/)
  const linkHref = `/${year}/${month}/${day}/${post.slug}`
  const title = {__html: post.title.rendered}

  const passthroughProps = {
    ...props,
    className: 'FeedPost',
    href: linkHref,
    style: getPostStyle(margin, width),
    tagName: 'a',
  }

  // Make sure we omit properties specific to this React component
  ;['margin', 'post', 'width'].forEach(key => {
    delete passthroughProps[key]
  })

  return (
    <FadeAndRotate {...passthroughProps}>
      <h3 dangerouslySetInnerHTML={title} />
      <img alt="" src={imageSrc} />
    </FadeAndRotate>
  )
}
