const createMemoryHistory = require('history/createMemoryHistory').default
const fs = require('fs')
const {JSDOM} = require('jsdom')
const path = require('path')
const React = require('react')
const {renderToStream} = require('react-dom/server')

const BUNDLE_PATH = path.join(__dirname, '..', 'public', 'bundle.js')
const SCRIPT_TAG = '<script type="text/javascript" src="/bundle.js" charset="utf-8"></script>'
const TEMPLATE_PATH = path.join(__dirname, '..', 'public', 'index.html')
const TEMPLATE = fs.readFileSync(TEMPLATE_PATH, 'utf8')

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

function getTemplate () {
  return TEMPLATE
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

      const {window} = new JSDOM(template, {
        resources: 'usable',
        runScripts: 'dangerously',
        url: req.headers.host + req.url,
      })

      let state

      try {
        const location = getLocation(req)

        state = window.getApp({
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

      const stream = renderToStream(
        React.createElement(state.Component, state.props)
      )

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

module.exports = {
  generatePageContent,
  generatePostContent,
  getTemplate,
  render,
}
