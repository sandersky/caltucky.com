/**
 * @flow
 */

import type {
  Category,
  Page,
  Post,
  RawPage,
  RawPost,
} from '../types'

export type PostOptions = {
  after?: string,
  page?: number,
  per_page?: number,
  search?: string,
}

const WORDPRESS_ENDPOINT =
  'https://public-api.wordpress.com/wp/v2/sites/caltucky.com'

function fetchData (path: string, params?: {[string]: any}) {
  let url = `${WORDPRESS_ENDPOINT}/${path}`

  if (params) {
    url = getURLWithQueryString(url, params)
  }

  return fetch(url)
    .then((resp) => {
      if (resp.status === 200) {
        return resp.json()
      }

      throw new Error()
    })
}

function getURLWithQueryString (url, params: {[string]: any}) {
  const queryString = Object.keys(params)
    .map((key) => params[key] ? `${key}=${params[key]}` : null)
    .filter((value) => value !== null)
    .join('&')

  return `${url}?${queryString}`
}

function normalizePages (pages: Array<RawPage>): Array<Page> {
  return pages.map((page) => {
    return {
      ...page,
      date: new Date(page.date),
      date_gmt: new Date(page.date_gmt),
      modified: new Date(page.modified),
      modified_gmt: new Date(page.modified_gmt),
    }
  })
}

function normalizePosts (posts: Array<RawPost>): Array<Post> {
  return posts.map((post) => {
    return {
      ...post,
      date: new Date(post.date),
      date_gmt: new Date(post.date_gmt),
      modified: new Date(post.modified),
      modified_gmt: new Date(post.modified_gmt),
    }
  })
}

export default {
  categories (): Promise<Array<Category>> {
    return fetchData('categories')
  },

  pages () {
    return fetchData('pages').then(normalizePages)
  },

  post (slug: string): Promise<Array<Post>> {
    return fetchData(`posts?slug=${slug}`).then(normalizePosts)
  },

  posts (options?: PostOptions): Promise<Array<Post>> {
    return fetchData('posts', options).then(normalizePosts)
  },
}
