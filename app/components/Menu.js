/**
 * @flow
 */

import React from 'react'
import {Link} from 'react-router-dom'

// $FlowFixMe
import './Menu.scss'
import MenuItem from './MenuItem'
import type {Category, Page} from '../types'

type Item = {
  id: number,
  path: string,
  text: string,
}

type Props = {
  categories: Array<Category>,
  categoriesError?: Error,
  pages: Array<Page>,
  pagesError?: Error,
  loadCategories: () => void,
  loadPages: () => void,
}

class Menu extends React.Component<void, Props, void> {
  props: Props

  componentWillMount () {
    this.props.loadCategories()
    this.props.loadPages()
  }

  _getMenuItems () {
    const topLevelLinks: Array<Item> = []

    this.props.categories.forEach((category) => {
      if (category.parent === 0) {
        topLevelLinks.push({
          id: category.id,
          path: `/category/${category.slug}`,
          text: category.name,
        })
      }
    })

    this.props.pages.forEach((page) => {
      if (page.parent === 0) {
        topLevelLinks.push({
          id: page.id,
          path: `/page/${page.slug}`,
          text: page.title.rendered,
        })
      }
    })

    return topLevelLinks
      .sort((a, b) => Number(a.text > b.text))
      .map((link) => {
        return <MenuItem key={link.id} path={link.path} text={link.text}/>
      })
  }

  render () {
    const items = this._getMenuItems()
    return (
      <div className="Menu">
        <Link to="/">
          <img alt="Caltucky" src={`/${require('../assets/logo.png')}`}/>
        </Link>
        {items}
        <input placeholder="search"/>
      </div>
    )
  }
}

export default Menu
