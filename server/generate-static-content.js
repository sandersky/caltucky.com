#! /usr/bin/env node

const blog = require('./wordpress').default

const {
  generatePageContent,
  generatePostContent,
} = require('./utils')

const needsRendered = []

function fetchPages (options) {
  return blog.pages({...options, order: 'asc', orderby: 'date'})
    .then((pages) => {
      pages.forEach((page) => {
        needsRendered.push({page})
      })

      if (pages.length > 1) {
        return fetchPages({
          after: pages[pages.length - 1].date_gmt.toISOString(),
        })
      }
    })
}

function fetchPosts (options) {
  return blog.posts({...options, order: 'asc', orderby: 'date'})
    .then((posts) => {
      posts.forEach((post) => {
        needsRendered.push({post})
      })

      if (posts.length > 1) {
        return fetchPosts({
          after: posts[posts.length - 1].date_gmt.toISOString(),
        })
      }
    })
}

function renderItem () {
  if (needsRendered.length === 0) {
    return
  }

  const item = needsRendered[0]

  let promise

  if (item.page) {
    promise = generatePageContent(item.page)
  } else if (item.post) {
    promise = generatePostContent(item.post)
  } else {
    throw new Error('Unknown type to render', item)
  }

  promise
    .then(() => {
      needsRendered.shift()
      renderItem()
    })
    .catch(() => {
      needsRendered.shift()
      renderItem()
    })
}

fetchPages()
  .then(() => {
    return fetchPosts()
  })
  .then(() => {
    renderItem()
  })
