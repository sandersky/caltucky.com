#! /usr/bin/env node

const express = require('express')
const fs = require('fs')
const proxy = require('express-http-proxy')
const path = require('path')

const blog = require('./wordpress').default
const render = require('./renderer')

// Allow self-signed certificate for asset server
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const PORT = 3000

function doesFileExist (filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        resolve(false)
      }

      resolve(stats.isFile())
    })
  })
}

const app = express()
const assetProxy = proxy('localhost:8080', {
  https: true,
  proxyReqPathResolver (req) {
    return req.baseUrl
  },
})

app.use('/assets/*', assetProxy)
app.use('/bundle.js*', assetProxy)
app.use('/favicon.ico', assetProxy)
app.use('/styles.css*', assetProxy)

app.get('/', (req, res) => {
  blog.posts()
    .then((posts) => render(req, res, {posts}))
    .then((data) => res.end())
})

app.get('/:year/:month/:day/:slug', (req, res) => {
  const filePath = path.join(
    __dirname, 'content', 'posts', `${req.params.slug}.html`
  )

  doesFileExist(filePath)
    .catch() // Create file
    .then() // Return file contents as res
})

app.get('/:slug', (req, res) => {
  const filePath = path.join(
    __dirname, 'content', 'pages', `${req.params.slug}.html`
  )

  doesFileExist(filePath)
    .catch() // Create file
    .then() // Return file contents as res
})

app.listen(PORT, () => {
  console.log(`Caltucky server running on port ${PORT}`)

  // TODO: preload all data from API into memory so requests can just serve
  // data from memory and not require a bunch of requests to the Wordpress
  // servers.
})
