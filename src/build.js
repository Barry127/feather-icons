const path = require('path');
const fs = require('fs');

const rimraf = require('rimraf');
const DOMParser = require('xmldom').DOMParser;
const camelCase = require('camelcase');
const prettier = require('prettier');

const feather = require('feather-icons');

const reservedNames = ['delete', 'package'];
let iconsFile = '';

rimraf.sync(path.join(__dirname, 'index.ts'));

append(readFile(path.join(__dirname, 'types.ts')));

Object.values(feather.icons).map(icon => {
  const name =
    camelCase(icon.name) + (reservedNames.includes(icon.name) ? '_' : '');
  const attrs = Object.entries(icon.attrs).reduce((attrs, [key, value]) => {
    if (key !== 'class') {
      attrs[camelCase(key)] = value;
    }
    return attrs;
  }, {});
  const children = parseHtml(icon.contents);

  const tsIcon = `export const ${name}:IIcon = {
    tag: 'svg',
    attrs: ${JSON.stringify(attrs)},
    children: ${JSON.stringify(children)}
  };`;
  append(tsIcon);
});

writeFile(path.join(__dirname, 'index.ts'), iconsFile);

function readFile(file) {
  const data = fs.readFileSync(file);
  return data;
}

function writeFile(file, data) {
  fs.writeFileSync(
    file,
    prettier.format(data, { singleQuote: true, parser: 'typescript' })
  );
  return data;
}

function append(data) {
  iconsFile = `${iconsFile}\n\n${data}`;
  return iconsFile;
}

function parseHtml(html) {
  const doc = new DOMParser().parseFromString(html);
  return parseNodes(doc.childNodes);
}

function parseNodes(nodes) {
  return Object.entries(nodes)
    .filter(([key]) => key !== 'length')
    .map(([key, value]) => parseNode(value))
    .map(node => {
      if (node.children && node.children.length === 0) {
        delete node.children;
      }
      return node;
    });
}

function parseNode(node) {
  if (node.nodeValue) {
    return node.nodeValue;
  }

  return {
    tag: node.nodeName,
    attrs: parseAttrs(node),
    children: parseNodes(node.childNodes)
  };
}

function parseAttrs(node) {
  const filters = ['length'];
  return Object.entries(node.attributes)
    .filter(([key]) => !(key.startsWith('_') || filters.includes(key)))
    .reduce((attrs, [key, value]) => {
      attrs[value.name] = value.value;
      return attrs;
    }, {});
}
