#! /usr/bin/env node

const express = require('express')
const fs = require('fs')
const proxy = require('express-http-proxy')
const path = require('path')

const blog = require('./wordpress').default

const {
  generatePageContent,
  generatePostContent,
  getTemplate,
  render,
} = require('./utils')

// Allow self-signed certificate for asset server
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const PORT = 3000

function doesFileExist(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(new Error('file not found'))
        return
      }

      resolve(stats.isFile())
    })
  })
}

const app = express()
const assetProxy = proxy('localhost:8080', {
  https: true,
  proxyReqPathResolver(req) {
    return req.baseUrl
  },
})

app.use('/assets/*', assetProxy)
app.use('/bundle.js*', assetProxy)
app.use('/favicon.ico', assetProxy)
app.use('/styles.css*', assetProxy)

app.get('/', (req, res) => {
  blog
    .posts()
    .then(posts => render(req, res, {posts}))
    .then(data => res.end())
})

app.get('/:year/:month/:day/:slug', (req, res) => {
  const {day, month, slug, year} = req.params

  const filePath = path.join(
    __dirname,
    '..',
    'public',
    year,
    month,
    day,
    `${slug}.html`,
  )

  doesFileExist(filePath)
    .catch(() => {
      return blog.posts({slug: encodeURIComponent(slug)}).then(posts => {
        if (posts.length === 0) {
          console.error(`Post not found with slug: ${slug}`)
          res.write(getTemplate())
        } else {
          console.info('Generating post contents')
          return generatePostContent(posts[0])
        }
      })
    })
    .then(() => {
      return new Promise(resolve => {
        fs.readFile(filePath, (err, contents) => {
          if (err) {
            console.error(`Failed to read file contents for file: ${filePath}`)
            res.write(getTemplate())
          } else {
            console.info('Rendering post from cache')
            res.write(contents)
          }

          resolve()
        })
      })
    })
    .then(() => {
      res.end()
    })
})

app.get('/:slug', (req, res) => {
  const {slug} = req.params
  const filePath = path.join(__dirname, '..', 'public', `${slug}.html`)

  doesFileExist(filePath)
    .catch(() => {
      return blog.pages({slug: encodeURIComponent(slug)}).then(pages => {
        if (pages.length === 0) {
          console.error(`Page not found with slug: ${slug}`)
          res.write(getTemplate())
        } else {
          console.info('Generating page contents')
          return generatePageContent(pages[0])
        }
      })
    })
    .then(() => {
      return new Promise(resolve => {
        fs.readFile(filePath, (err, contents) => {
          if (err) {
            console.error(`Failed to read file contents for file: ${filePath}`)
            res.write(getTemplate())
          } else {
            console.info('Rendering page from cache')
            res.write(contents)
          }

          resolve()
        })
      })
    })
    .then(() => {
      res.end()
    })
})

app.listen(PORT, () => {
  console.log(`Caltucky server running on port ${PORT}`)

  // TODO: preload all data from API into memory so requests can just serve
  // data from memory and not require a bunch of requests to the Wordpress
  // servers.
})
