const express = require('express')
const proxy = require('express-http-proxy')
const fs = require('fs')
const createMemoryHistory = require('history/createMemoryHistory').default
const path = require('path')
const React = require('react')
const {renderToStream} = require('react-dom/cjs/react-dom-server.node.development')

const {addPages, addPosts} = require('./app/actions/blog')
const App = require('./app/App').default
const blog = require('./app/actions/wordpress').default

// Allow self-signed certificate for asset server
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const PORT = 3000
const TEMPLATE_PATH = path.join(__dirname, '..', 'public', 'index.html')
const TEMPLATE = fs.readFileSync(TEMPLATE_PATH, 'utf8')

function prerender (req, res, data) {
  const history = createMemoryHistory({
    initialEntries: [req.baseUrl],
    initialIndex: 0,
  })

  const promises = []

  if (data.pages) {
    promises.push(global._store.dispatch(addPages(data.pages)))
  }

  if (data.posts) {
    promises.push(global._store.dispatch(addPosts(data.posts)))
  }

  return Promise.all(promises)
    .then(() => {
      const templateWithData = TEMPLATE
        .replace(
          '<body>',
          `<body><script>window._data = ${stringify(data)}</script>`
        )

      const [beforeReactDOM, afterReactDOM] = templateWithData.split('<!-- render here -->')

      res.write(beforeReactDOM)

      return new Promise((resolve, reject) => {
        const stream = renderToStream(React.createElement(App, {history, ssr: true}))

        stream.on('data', (chunk) => {
          res.write(chunk)
        })

        stream.on('end', () => {
          res.write(afterReactDOM)
          resolve()
        })

        stream.on('error', (err) => {
          res.write(afterReactDOM)
          reject(err)
        })
      })
    })
}

function stringify (object) {
  if (typeof object === 'string') {
    return `'${object.replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`
  }

  if (object instanceof Date) {
    return `new Date('${object}')`
  }

  if (Array.isArray(object)) {
    return '[' + object.map((item) => stringify(item)).join(',') + ']'
  }

  if (typeof object === 'object') {
    return '{' + Object.keys(object).map((key) => {
      return `'${key}':${stringify(object[key])}`
    }).join(',') + '}'
  }

  return object.toString()
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
app.use('/styles.css*', assetProxy)

app.get('/', (req, res) => {
  blog.posts()
    .then((posts) => prerender(req, res, {posts}))
    .then((data) => res.end())
})

app.get('/:year/:month/:day/:slug', (req, res) => {
  blog.posts({slug: req.params.slug})
    .then((posts) => prerender(req, res, {posts}))
    .then((data) => res.end())
})

app.get('/:slug', (req, res) => {
  blog.pages({slug: req.params.slug})
    .then((pages) => prerender(req, res, {pages}))
    .then((data) => res.end())
})

app.listen(PORT, () => {
  console.log(`Caltucky server running on port ${PORT}`)
})
