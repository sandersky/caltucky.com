/**
 * @flow
 */

import {
  type Action,
  ADD_CATEGORIES,
  ADD_PAGES,
  ADD_POSTS,
  FILTER_POSTS,
  SET_SEARCH_QUERY,
  type State,
} from '../actions/blog'

const INITIAL_STATE = {
  categories: [],
  filteredPosts: [],
  pages: (window._data && window._data.pages) || [],
  posts: (window._data && window._data.posts) || [],
  query: '',
}

export default (state: State, action: Action) => {
  switch (action.type) {
    case ADD_CATEGORIES: {
      const categories = state.categories || []

      // Get ids of existing categories so we can quickly check whether or not a
      // category is already in our list
      const ids = categories.map((category) => category.id)
      const nextCategories = Array.from(categories)

      action.categories.forEach((category) => {
        // If category is not already in our list
        if (!ids.includes(category.id)) {
          // Figure out where to insert category in order to keep list sorted by
          // name alphabetically
          for (let i = 0; i < nextCategories.length; i++) {
            if (category.name < nextCategories[i].name) {
              nextCategories.splice(i, 0, category)
              return
            }
          }

          // Since category doesn't go before other categories alphabetically
          // inert it at the end
          nextCategories.push(category)
        }
      })

      // If our categories array didn't change length then no new categories
      // were added and we don't need to modify our state
      if (nextCategories.length === categories.length) return state

      // Since new categories were added we need to shallow copy our state with
      // the updated categoires
      return {...state, categories: nextCategories}
    }

    case ADD_PAGES: {
      const pages = state.pages || []

      // Get ids of existing pages so we can quickly check whether or not a page
      // is already in our list
      const ids = pages.map((page) => page.id)
      const nextPages = Array.from(pages)

      action.pages.forEach((page) => {
        // If page is not already in our list
        if (!ids.includes(page.id)) {
          nextPages.push(page)
        }
      })

      // If our pages array didn't change length then no new pages were added
      // and we don't need to modify our state
      if (nextPages.length === pages.length) return state

      // Since new pages were added we need to shallow copy our state with the
      // updated pages
      return {...state, pages: nextPages}
    }

    case ADD_POSTS: {
      const posts = state.posts || []

      // Get ids of existing posts so we can quickly check whether or not a post
      // is already in our list
      const ids = posts.map((post) => post.id)
      const nextPosts = Array.from(posts)

      action.posts.forEach((post) => {
        // If post is not already in our list
        if (!ids.includes(post.id)) {
          // Figure out where to insert post in order to keep list sorted by
          // newest to oldest
          for (let i = 0; i < nextPosts.length; i++) {
            if (post.date > nextPosts[i].date) {
              nextPosts.splice(i, 0, post)
              return
            }
          }

          // Since post isn't newer than any other posts insert it at the end
          nextPosts.push(post)
        }
      })

      // If our posts array didn't change length then no new posts were added
      // and we don't need to modify our state
      if (nextPosts.length === posts.length) return state

      // Since new posts were added we need to shallow copy our state with
      // the updated posts
      return {...state, posts: nextPosts}
    }

    case FILTER_POSTS: {
      // TODO: this is inefficient, we should re-use items from posts array
      // in order to prevent duplicate copies in memory
      return {...state, filteredPosts: action.posts}
    }

    case SET_SEARCH_QUERY: {
      return {...state, query: action.query}
    }

    default:
      return INITIAL_STATE
  }
}
