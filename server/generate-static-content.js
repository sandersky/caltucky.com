#! /usr/bin/env node

const fs = require('fs')
const path = require('path')

const blog = require('./wordpress').default
const render = require('./renderer')

const needsRendered = []

function createFileStream (filePath) {
  const dirPath = path.dirname(filePath)
  ensureDirectory(dirPath)
  return fs.createWriteStream(filePath)
}

function ensureDirectory (dirPath) {
  const segments = dirPath.split(path.sep)

  // NOTE: we start at index 1 because the first segment is an empty string
  for (let i = 1; i < segments.length; i++) {
    const segmentPath = segments.slice(0, i + 1).join(path.sep)

    if (!fs.existsSync(segmentPath)) {
      fs.mkdirSync(segmentPath)
    }
  }
}

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

function generatePageContent (page) {
  const filePath = path.join(__dirname, '..', 'public', `${page.slug}.html`)

  const req = {
    headers: {
      host: 'caltucky.com:8080',
    },
    url: `/${page.slug}`,
  }

  const writeStream = createFileStream(filePath)

  return render(req, writeStream, {pages: [page]})
}

function generatePostContent (post) {
  const [year, month, day] = post.date_gmt.toISOString().split(/[-T]/)

  const filePath = path.join(
    __dirname, '..', 'public', year, month, day, `${post.slug}.html`
  )

  const req = {
    headers: {
      host: 'caltucky.com:8080',
    },
    url: `/${year}/${month}/${day}/${post.slug}`,
  }

  const writeStream = createFileStream(filePath)

  return render(req, writeStream, {posts: [post]})
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
