/* eslint no-magic-numbers: ["error", { "ignore": [1] }] */

import iterator from 'markdown-it-for-inline';
import MarkdownIt from 'markdown-it';
import markdownItAttrs from 'markdown-it-attrs-es5';
import sanitizeHTML from 'sanitize-html';

const SANITIZE_HTML_OPTIONS = {
  allowedAttributes: {
    a: ['aria-label', 'href', 'name', 'target', 'title', 'role'],
    img: ['alt', 'src']
  },
  allowedSchemes: ['data', 'http', 'https', 'ftp', 'mailto', 'sip', 'tel'],
  allowedTags: [
    'a',
    'b',
    'blockquote',
    'br',
    'caption',
    'code',
    'div',
    'em',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'i',
    'img',
    'li',
    'nl',
    'ol',
    'p',
    'pre',
    'span',
    'strike',
    'strong',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
    'ul'
  ]
};

function addAttributeIfNotExist(token, attributeName, attributeValue) {
  const found = token.attrs.find(value => value[0] === attributeName);

  if (!found) {
    token.attrs.push([attributeName, attributeValue]);
  }
}

const customMarkdownIt = new MarkdownIt({
  breaks: false,
  html: false,
  linkify: true,
  typographer: true,
  xhtmlOut: true
})
  .use(markdownItAttrs)
  .use(iterator, 'url_new_win', 'link_open', (tokens, index) => {
    // TODO: [P4] This is copied from v3 and looks clunky
    //       We should refactor this code
    const targetAttrIndex = tokens[index].attrIndex('target');

    if (~targetAttrIndex) {
      tokens[index].attrs[targetAttrIndex][1] = '_blank';
    } else {
      tokens[index].attrPush(['target', '_blank']);
    }

    const relAttrIndex = tokens[index].attrIndex('rel');

    if (~relAttrIndex) {
      tokens[index].attrs[relAttrIndex][1] = 'noopener noreferrer';
    } else {
      tokens[index].attrPush(['rel', 'noopener noreferrer']);
    }
  })
  .use(iterator, 'accessibility-attributes', 'link_open', (tokens, index) => {
    const token = tokens[index];
    addAttributeIfNotExist(token, 'role', 'link');
  });

export default function render(markdown, { markdownRespectCRLF }) {
  if (markdownRespectCRLF) {
    markdown = markdown.replace(/\n\r|\r\n/gu, carriageReturn => (carriageReturn === '\n\r' ? '\r\n' : '\n\r'));
  }
  const html = customMarkdownIt.render(markdown);

  return sanitizeHTML(html, SANITIZE_HTML_OPTIONS);
}
