import {parse} from '../parser'

function esc (text) {
  return text
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
}

describe('parser', () => {
  describe('parses', () => {
    ;[
      // Text
      {
        inputs: [
          'Test',
        ],
        tree: {
          text: 'Test',
          type: 'text',
        },
      },
      {
        inputs: [
          'Foo bar',
        ],
        tree: {
          text: 'Foo bar',
          type: 'text',
        },
      },

      // Self closing tag without attributes
      {
        inputs: [
          '<input/>',
          '< input/>',
          '<\tinput/>',
          '<\ninput/>',
          '< \t\ninput/>',
          '<input />',
          '<input\t/>',
          '<input\n/>',
          '<input \t\n/>',
        ],
        tree: {
          name: 'input',
          type: 'element',
        },
      },

      // Self closing tag without attributes and text before element
      {
        inputs: [
          'Foo bar<input/>',
          'Foo bar< input/>',
          'Foo bar<\tinput/>',
          'Foo bar<\ninput/>',
          'Foo bar< \t\ninput/>',
          'Foo bar<input />',
          'Foo bar<input\t/>',
          'Foo bar<input\n/>',
          'Foo bar<input \t\n/>',
        ],
        tree: {
          children: [
            {
              text: 'Foo bar',
              type: 'text',
            },
            {
              name: 'input',
              type: 'element',
            },
          ],
        },
      },

      // Self closing tag without attributes and text after element
      {
        inputs: [
          '<input/>Foo bar',
          '< input/>Foo bar',
          '<\tinput/>Foo bar',
          '<\ninput/>Foo bar',
          '< \t\ninput/>Foo bar',
          '<input />Foo bar',
          '<input\t/>Foo bar',
          '<input\n/>Foo bar',
          '<input \t\n/>Foo bar',
        ],
        tree: {
          children: [
            {
              name: 'input',
              type: 'element',
            },
            {
              text: 'Foo bar',
              type: 'text',
            },
          ],
        },
      },

      // Self closing tag with boolean attribute
      {
        inputs: [
          '<input autofocus/>',
          '< input autofocus/>',
          '<\tinput autofocus/>',
          '<\ninput autofocus/>',
          '< \t\ninput autofocus/>',
          '<input  autofocus/>',
          '<input\t autofocus/>',
          '<input\n autofocus/>',
          '<input\t\n  autofocus/>',
          '<input \t\n autofocus/>',
          '<input \tautofocus/>',
          '<input \nautofocus/>',
          '<input  \t\nautofocus/>',
          '<input autofocus />',
          '<input autofocus\t/>',
          '<input autofocus\n/>',
          '<input autofocus \t\n/>',
        ],
        tree: {
          attributes: {
            autofocus: true,
          },
          name: 'input',
          type: 'element',
        },
      },

      // Self closing tag with attribute with value in single quotes
      {
        inputs: [
          "<input value='test'/>",
        ],
        tree: {
          attributes: {
            value: 'test',
          },
          name: 'input',
          type: 'element',
        },
      },

      // Self closing tag with attribute with value in double quoutes
      {
        inputs: [
          '<input value="test"/>',
        ],
        tree: {
          attributes: {
            value: 'test',
          },
          name: 'input',
          type: 'element',
        },
      },

      // Tag with closing tag but no attributes or children
      {
        inputs: [
          '<div></div>',
          '< div></div>',
          '<\tdiv></div>',
          '<\ndiv></div>',
          '< \t\ndiv></div>',
          '<div ></div>',
          '<div\t></div>',
          '<div\n></div>',
          '<div \t\n></div>',
          '<div>< /div>',
          '<div><\t/div>',
          '<div><\n/div>',
          '<div>< \t\n/div>',
          '<div></ div>',
          '<div></\tdiv>',
          '<div></\ndiv>',
          '<div></ \t\ndiv>',
          '<div></div >',
          '<div></div\t>',
          '<div></div\n>',
          '<div></div \t\n>',
          '< \t\ndiv \t\n></div>',
        ],
        tree: {
          name: 'div',
          type: 'element',
        },
      },

      // Tag with closing tag and self-closing child (no atttributes)
      {
        inputs: [
          '<div><input/></div>',
          '< div><input/></div>',
          '<\tdiv><input/></div>',
          '<\ndiv><input/></div>',
          '<div ><input/></div>',
          '<div\t><input/></div>',
          '<div\n><input/></div>',
          '<div \t\n><input/></div>',
          '<div>< input/></div>',
          '<div><\tinput/></div>',
          '<div><\ninput/></div>',
          '<div>< \t\ninput/></div>',
          '<div><input /></div>',
          '<div><input\t/></div>',
          '<div><input\n/></div>',
          '<div><input \t\n/></div>',
          '<div><input/>< /div>',
          '<div><input/><\t/div>',
          '<div><input/><\n/div>',
          '<div><input/>< \t\n/div>',
          '<div><input/></ div>',
          '<div><input/></\tdiv>',
          '<div><input/></\ndiv>',
          '<div><input/></ \t\ndiv>',
          '<div><input/></div >',
          '<div><input/></div\t>',
          '<div><input/></div\n>',
          '<div><input/></div \t\n>',
        ],
        tree: {
          children: [
            {
              name: 'input',
              type: 'element',
            },
          ],
          name: 'div',
          type: 'element',
        },
      },
    ]
      .forEach(({inputs, tree}) => {
        inputs.forEach((input) => {
          it(esc(input), () => {
            expect(parse(input)).toEqual(tree)
          })
        })
      })
  })
})
