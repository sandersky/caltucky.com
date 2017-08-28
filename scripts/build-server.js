#! /usr/bin/env node

const fs = require('fs')
const path = require('path')

// TODO: figure out how to handle images so that they actually work properly
function cleanupFile (filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        data = data
          // Strip out stylesheet imports since we don't care about them on
          // server-side rendering and their presence won't play nice with Node
          .replace(/require\(('|")([^'"]+)\.(css|sass|scss)('|")\);/g, '')
          // Replace window with global so it is compliant with Node environment
          .replace(/window/g, 'global')
          // Don't try to import image files
          .replace(/require\(('|")([^'"]+)\.(jpeg|jpg|png)('|")\)/g, "''")

        fs.writeFile(filePath, data, (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      }
    })
  })
}

function cleanupFiles (dirPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        reject(err)
      } else {
        Promise.all(
          files.map((fileName) => {
            const filePath = path.join(dirPath, fileName)
            const stats = fs.lstatSync(filePath)

            if (stats.isDirectory()) {
              return cleanupFiles(filePath)
            } else if (stats.isFile()) {
              return cleanupFile(filePath)
            }
          })
        )
          .then(() => {
            resolve()
          })
          .catch((err2) => {
            reject(err2)
          })
      }
    })
  })
}

cleanupFiles(
  path.join(__dirname, '..', 'server', 'app')
)
  .then(() => {
    console.info('COMPLETE!')
  })
  .catch(() => {
    console.info('Something broke :(')
  })
