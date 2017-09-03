const express = require('express')
const proxy = require('express-http-proxy')
const fs = require('fs')
const createMemoryHistory = require('history/createMemoryHistory').default
const path = require('path')
const React = require('react')
const {renderToStream} = require('react-dom/server')
const {NodeVM} = require('vm2')

const blog = require('./wordpress').default

// Allow self-signed certificate for asset server
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const BUNDLE_PATH = path.join(__dirname, '..', 'public', 'bundle.js')
const PORT = 3000
const TEMPLATE_PATH = path.join(__dirname, '..', 'public', 'index.html')
const TEMPLATE = fs.readFileSync(TEMPLATE_PATH, 'utf8')

function getLocation (req) {
  const host = req.headers.host
  const [hostname, port] = host.split(':')

  return {
    hash: '',
    host,
    hostname,
    pathname: req.url,
    port,
    search: '',
  }
}

function getSandbox (location) {
  return {
    _ssr: true,
    addEventListener () {},
    document: {
      createElement () {
        return {
          style: {},
        }
      },
      documentElement: {},
      getElementById () {
        return null
      },
      location,
    },
    location,
    navigator: {
      userAgent: '',
    },
  }
}

function render (req, res, data) {
  console.info(`Server-side rendering ${req.url}`)

  const [beforeReactDOM, afterReactDOM] = TEMPLATE.split('<!-- render here -->')

  res.write(beforeReactDOM.replace(/\s*$/, ''))

  return new Promise((resolve, reject) => {
    fs.readFile(BUNDLE_PATH, 'utf8', (err, code) => {
      if (err) {
        reject(err)
      }

      const location = getLocation(req)
      const sandbox = getSandbox(location)

      sandbox.window = sandbox

      const vm = new NodeVM({
        sandbox,
      })

      let state

      try {
        vm.run(code)

        state = sandbox.getApp({
          data,
          history: createMemoryHistory({
            initialEntries: [location.pathname + location.search],
            initialIndex: 0,
          }),
        })
      } catch (err) {
        console.error(err)
        res.write(afterReactDOM.replace(/^\s*/, ''))
        resolve()
        return
      }

      const stream = renderToStream(React.createElement(state.Component, state.props))

      stream.on('data', (chunk) => {
        res.write(chunk)
      })

      stream.on('end', () => {
        res.write(afterReactDOM.replace(/^\s*/, ''))
        resolve()
      })

      stream.on('error', (err) => {
        console.error(err)
        res.write(afterReactDOM.replace(/^\s*/, ''))
        resolve()
      })
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
  blog.posts({slug: req.params.slug})
    .then((posts) => render(req, res, {posts}))
    .then((data) => res.end())
})

app.get('/:slug', (req, res) => {
  blog.pages({slug: req.params.slug})
    .then((pages) => render(req, res, {pages}))
    .then((data) => res.end())
})

app.listen(PORT, () => {
  console.log(`Caltucky server running on port ${PORT}`)

  // TODO: preload all data from API into memory so requests can just serve
  // data from memory and not require a bunch of requests to the Wordpress
  // servers.
})
