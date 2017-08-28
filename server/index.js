const express = require('express')
const proxy = require('express-http-proxy')
const fs = require('fs')
const createMemoryHistory = require('history/createMemoryHistory').default
const path = require('path')
const React = require('react')
const {renderToString} = require('react-dom/cjs/react-dom-server.node.development')

const {addPosts} = require('./app/actions/blog')
const App = require('./app/App').default
const blog = require('./app/actions/wordpress').default

// Allow self-signed certificate for asset server
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const PORT = 3000
const TEMPLATE_PATH = path.join(__dirname, '..', 'public', 'index.html')
const TEMPLATE = fs.readFileSync(TEMPLATE_PATH, 'utf8')

function prerender (data) {
  const history = createMemoryHistory() // TODO: seed history with initial location
  const promises = []

  if (data.posts) {
    promises.push(global._store.dispatch(addPosts(data.posts)))
  }

  return Promise.all(promises)
    .then(() => {
      return TEMPLATE
        .replace(
          '<body>',
          `<body><script>window._data = ${stringify(data)}</script>`
        )
        .replace(
          '<!-- render here -->',
          renderToString(React.createElement(App, {history}))
        )
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
    .then((posts) => prerender({posts}))
    .then((data) => res.send(data))
})

app.get('/:year/:month/:day/:slug', (req, res) => {
  blog.posts({slug: req.params.post})
    .then((posts) => prerender({posts}))
    .then((data) => res.send(data))
})

app.get('/:slug', (req, res) => {
  res.send(TEMPLATE)
})

app.listen(PORT, () => {
  console.log(`Caltucky server running on port ${PORT}`)
})
