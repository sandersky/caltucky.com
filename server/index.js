const express = require('express')
const proxy = require('express-http-proxy')
const fs = require('fs')
const {JSDOM} = require('jsdom')
const path = require('path')

const blog = require('./wordpress').default

// Allow self-signed certificate for asset server
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const BUNDLE_PATH = path.join(__dirname, '..', 'public', 'bundle.js')
const PORT = 3000
const SCRIPT_TAG = '<script type="text/javascript" src="/bundle.js" charset="utf-8"></script>'
const TEMPLATE_PATH = path.join(__dirname, '..', 'public', 'index.html')
const TEMPLATE = fs.readFileSync(TEMPLATE_PATH, 'utf8')

function render (req, res, data) {
  console.info(`Server-side rendering ${req.url}`)

  const [beforeReactDOM, afterReactDOM] = TEMPLATE.split('<!-- render here -->')

  res.write(beforeReactDOM.replace(/\s*$/, ''))

  return new Promise((resolve, reject) => {
    fs.readFile(BUNDLE_PATH, 'utf8', (err, code) => {
      if (err) {
        reject(err)
      }

      const scriptTagStartIndex = TEMPLATE.indexOf(SCRIPT_TAG)
      const scriptTagEndIndex = scriptTagStartIndex + SCRIPT_TAG.length
      const htmlUpUntilScriptTag = TEMPLATE.substr(0, scriptTagStartIndex)

      const template = `
        ${htmlUpUntilScriptTag}
        <script>
          window._data = ${stringify(data)};
          window._ssr = true;
          ${code}
        </script>
        ${TEMPLATE.substr(scriptTagEndIndex)}
      `
        .replace(/<link([^>]*)>/g, '') // We don't care about CSS in SSR

      fs.writeFileSync(path.join(__dirname, '..', 'test.html'), template)

      const {window} = new JSDOM(template, {
        resources: 'usable',
        runScripts: 'dangerously',
        url: req.headers.host + req.url,
      })

      // TODO: wait until DOM is updated with posts
      res.write(window.document.querySelector('#root').innerHTML)

      res.write(afterReactDOM.replace(/^\s*/, ''))
      resolve()
    })
  })
}

function stringify (object) {
  if (object === undefined) {
    return 'undefined'
  }

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
