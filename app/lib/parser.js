const WHITESPACE = /\s/

export function parse (content: string) {
  let attributeName, closingQuote, currentNode, escapeNextChar, isClosingTag,
    parsingAttributeValue, parsingComment, parsingElement, parsingElementName,
    tree

  let buffer = []
  let parents = []

  for (let i = 0, len = content.length; i < len; i++) {
    const c = content[i]

    if (escapeNextChar) {
      escapeNextChar = false
      buffer.push('\\', c)
      continue
    }

    switch (c) {
      case '<': {
        if (buffer.length) {
          const textNode = {
            text: buffer.join(''),
            type: 'text',
          }

          if (!currentNode) {
            tree = textNode
          } else if (['comment', 'text'].indexOf(currentNode.type) !== -1) {
            currentNode = {
              children: [
                currentNode,
                textNode,
              ],
            }
          } else {
            if (!Array.isArray(currentNode.children)) {
              currentNode.children = []
            }

            if (currentNode.type === 'element' && currentNode.name !== 'pre') {
              textNode.text = textNode.text.trim()
            }

            currentNode.children.push(textNode)
          }
        }

        buffer = []

        if (currentNode) {
          parents.unshift(currentNode)
        }

        currentNode = {
          type: 'element',
        }
        isClosingTag = false
        parsingElementName = true
        parsingElement = true
        break
      }

      case '>': {
        const len = buffer.length

        const isClosingComment = (
          parsingComment &&
          len >= 2 &&
          buffer[len - 2] === '-' &&
          buffer[len - 1] === '-'
        )

        if (!tree) {
          tree = currentNode
        } else if (!isClosingTag && tree) {
          if (['comment', 'text'].indexOf(tree.type) !== -1) {
            tree = {
              children: [
                tree,
                currentNode,
              ],
            }
          } else {
            if (!tree.children) {
              tree.children = []
            }

            tree.children.push(currentNode)
          }
        }

        if (isClosingComment) {
          buffer.splice(len - 2, 2)

          while (WHITESPACE.test(buffer[buffer.length - 1])) {
            buffer.pop()
          }

          currentNode.comment = buffer.join('')
          parsingComment = false
          buffer = []
          break
        }

        // If this is a tag without attributes
        if (parsingElementName) {
          currentNode.name = buffer.join('')
          buffer = []
          parsingElementName = false
        }

        if (isClosingTag && parents.length) {
          currentNode = parents.shift()
        }

        parsingElement = false
        break
      }

      case '/': {
        // If this is a self-closing tag without attributes or is a closing tag
        if (parsingElementName) {
          // If this is a self-closing tag
          if (buffer.length) {
            currentNode.name = buffer.join('')
            buffer = []
            parsingElementName = false

          // If this is a closing tag
          } else {
            parents.shift()
            isClosingTag = true
          }

          break
        }

        if (buffer.length) {
          // We must have been parsing a boolean attribute
          if (!currentNode.attributes) {
            currentNode.attributes = {}
          }

          currentNode.attributes[buffer.join('')] = true
          buffer = []
        }

        break
      }

      case '\\': {
        escapeNextChar = true
        break
      }

      case '=': {
        attributeName = buffer.join('')
        buffer = []
        parsingAttributeValue = true
        break
      }

      case '"': {
        if (parsingAttributeValue && buffer.length === 0) {
          closingQuote = '"'
        } else if (closingQuote === '"') {
          if (!currentNode.attributes) {
            currentNode.attributes = {}
          }

          currentNode.attributes[attributeName] = buffer.join('')
          buffer = []
          parsingAttributeValue = false
        }

        break
      }

      case "'": {
        if (parsingAttributeValue && buffer.length === 0) {
          closingQuote = "'"
        } else if (closingQuote === "'") {
          if (!currentNode.attributes) {
            currentNode.attributes = {}
          }

          currentNode.attributes[attributeName] = buffer.join('')
          buffer = []
          parsingAttributeValue = false
        }

        break
      }

      default: {
        if (
          parsingElementName &&
          buffer.length === 3 &&
          buffer[0] === '!' &&
          buffer[1] === '-' &&
          buffer[2] === '-'
        ) {
          currentNode.type = 'comment'
          parsingComment = true
          parsingElementName = false
          parsingElement = false
          buffer = []
        }

        if (WHITESPACE.test(c)) {
          if (buffer.length === 0) {
            if (
              currentNode &&
              currentNode.type === 'element' &&
              currentNode.name === 'pre'
            ) {
              buffer.push(c)
            }

            break
          }

          // If this is a tag with whitespace before/after the tag name
          if (parsingElementName) {
            currentNode.name = buffer.join('')
            parsingElementName = false
            buffer = []
            break
            // If we just finished parsing a boolean attribute name
          } else if (parsingElement) {
            if (!currentNode.attributes) {
              currentNode.attributes = {}
            }

            currentNode.attributes[buffer.join('')] = true
            buffer = []
            break
          }
        }

        // Since we are in the process of parsing a node name, attribute name,
        // etc we will just add this character to our buffer
        buffer.push(c)
        break
      }
    }
  }

  if (buffer.length) {
    currentNode = {
      text: buffer.join(''),
      type: 'text',
    }

    if (!tree) {
      return currentNode
    }

    return {
      children: [
        tree,
        currentNode,
      ],
    }
  }

  return tree
}
