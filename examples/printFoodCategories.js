/**
 * Run this script to generate a file with the category structure of the swiss 
 * food data.
 */

var fs = require('fs');
var parse = require('csv-parse');
var _ = require('./lib/underscore.js');

outputFileName = 'categoryTree.txt';

function getCategoriesTree(foods) {
  var root = new Map();
  foods.forEach(function(food) {
    food['category E'].split(';').forEach(function(hierarchy) {
      var categories = hierarchy.split('/');
      categories.forEach(function(category, idx, categories) {
        let node = getTreeNode(root, categories, idx);
        if (!node.has(category)) {
          node.set(category, new Map());
        }
      });
    });
  });

  return root;

  function getTreeNode(root, keys, depth) {
    keys = keys.slice(0, depth);
    var node = root;
    for (let key of keys) {
      node = node.get(key);
    }
    return node;
  }
}

var fileContent = fs.readFileSync('./examples/data/generic_foods.csv', 'utf-8');

parse(fileContent, {columns: true}, function(err, foods) {
    var treeRoot = getCategoriesTree(foods);
    printTree(treeRoot);

    function printTree(treeRoot) {
      printTreeLvl(treeRoot, 0);
    }

    function printTreeLvl(node, depth) {
      for (let [key, value] of node.entries()) {
        let indentedName = padStart(key, depth, '\t');
        fs.appendFileSync(outputFileName, indentedName + '\n', 'utf-8');
        printTreeLvl(value, depth+1);
      }

      function padStart(str, len, padString) {
        while (len > 0) {
          str = padString + str;
          len--;
        }
        return str;
      }
    }
});
