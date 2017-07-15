/**
 * @flow
 */

import blog, {type PostOptions} from './wordpress'
import type {Category, Page, Post} from '../types'

export const ADD_CATEGORIES = 'ADD_CATEGORIES'
export const ADD_PAGES = 'ADD_PAGES'
export const ADD_POSTS = 'ADD_POSTS'

export type Action =
  | {categories: Array<Category>, type: 'ADD_CATEGORIES'}
  | {pages: Array<Page>, type: 'ADD_PAGES'}
  | {posts: Array<Post>, type: 'ADD_POSTS'}

type State = {
  categories?: Array<Category>,
  pages?: Array<Page>,
  posts?: Array<Post>,
}
type GetState = () => State

/* eslint-disable no-use-before-define */
type ThunkAction = (dispatch: Dispatch, getState: GetState) => any
/* eslint-enable no-use-before-define */

type PromiseAction = Promise<Action>
type Dispatch = (action: Action | ThunkAction | PromiseAction) => any

export function addCategories (categories: Array<Category>) {
  return {
    categories,
    type: ADD_CATEGORIES,
  }
}

export function addPages (pages: Array<Page>) {
  return {
    pages,
    type: ADD_PAGES,
  }
}

export function addPosts (posts: Array<Post>) {
  return {
    posts,
    type: ADD_POSTS,
  }
}

export function loadCategories () {
  return function (dispatch: Dispatch) {
    blog.categories()
      .then((categories) => {
        dispatch(addCategories(categories))
      })
      .catch((err) => {
        // TODO: actually do something with error?
        console.error(err)
      })
  }
}

export function loadPages () {
  return function (dispatch: Dispatch) {
    blog.pages()
      .then((pages) => {
        dispatch(addPages(pages))
      })
      .catch((err) => {
        // TODO: actually do something with error?
        console.error(err)
      })
  }
}

export function loadPost (slug: string) {
  return function (dispatch: Dispatch) {
    blog.post(slug)
      .then((posts) => {
        dispatch(addPosts(posts))
      })
      .catch((err) => {
        // TODO: actually do something with error?
        console.error(err)
      })
  }
}

export function loadPosts (options?: PostOptions) {
  return function (dispatch: Dispatch) {
    blog.posts(options)
      .then((posts) => {
        dispatch(addPosts(posts))
      })
      .catch((err) => {
        // TODO: actually do something with error?
        console.error(err)
      })
  }
}
