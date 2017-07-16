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
          buffer = []
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
            buffer = []
            parsingElementName = false

          // If this is a closing tag
          } else {
            isClosingTag = true
          }

          continue
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

      default: {
        if (WHITESPACE.test(c)) {
          if (buffer.length === 0) continue

          // If this is a tag with whitespace before/after the tag name
          if (parsingElementName) {
            currentNode.name = buffer.join('')
            parsingElementName = false

          // If we just finished parsing a boolean attribute name
          } else {
            if (!currentNode.attributes) {
              currentNode.attributes = {}
            }

            currentNode.attributes[buffer.join('')] = true
          }

          buffer = []
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
