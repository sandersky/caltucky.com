const WHITESPACE = /\s/

export function parse (content: string) {
  let buffer, currentNode, isClosingTag, parsingElementName, tree

  for (let i = 0, len = content.length; i < len; i++) {
    const c = content[i]

    switch (c) {
      case '<': {
        buffer = []
        currentNode = {
          type: 'element',
        }
        isClosingTag = false
        parsingElementName = true
        break
      }

      case '>': {
        if (!tree) {
          tree = currentNode
        } else if (!isClosingTag && tree) {
          if (!tree.children) {
            tree.children = []
          }

          tree.children.push(currentNode)
        }

        // If this is a tag without attributes
        if (parsingElementName) {
          currentNode.name = buffer.join('')
          parsingElementName = false
        }

        break
      }

      case '/': {
        // If this is a self-closing tag without attributes or is a closing tag
        if (parsingElementName) {
          // If this is a self-closing tag
          if (buffer.length) {
            currentNode.name = buffer.join('')
            parsingElementName = false

          // If this is a closing tag
          } else {
            isClosingTag = true
          }

          continue
        }

        break
      }

      default: {
        // If this is a tag with whitespace before/after the tag name
        if (parsingElementName && WHITESPACE.test(c)) {
          // If the whitespace is after the tag name then we are done parsing
          // the tag name
          if (buffer.length) {
            currentNode.name = buffer.join('')
            parsingElementName = false
          } // else we don't care and can simply disregard the whitespace

          continue
        }

        // Since we are in the process of parsing a node name, attribute name,
        // etc we will just add this character to our buffer
        buffer.push(c)
        break
      }
    }
  }

  return tree
}
