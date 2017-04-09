(function(global) {
global.swissFoodHelpers = global.swissFoodHelpers || {};
exports = global.swissFoodHelpers;

/**
 * Extracts and adds the producer's name to the food object. The producer's name is extracted from
 * the german name ('name D' column). For all foods that do not have a producer specified 
 * the producer's name is set to null.
 */
var addProducerName = function(d) {
    var producerName;
    beginIdx1 = d['name D'].indexOf('(');
    endIdx1 = d['name D'].indexOf(')');
    if (beginIdx1 === -1 && endIdx1 === -1) {
        producerName = null; // No producer name given
    } else {
        // Look for a second pair of braces starting from the index of the first closing brace.
        beginIdx2 = d['name D'].indexOf('(', endIdx1+1);
        endIdx2 = d['name D'].indexOf(')', endIdx1+1);
        if (beginIdx2 === -1 && endIdx2 === -1) {
            // If no second pair of braces was found the content of the first pair is used.
           producerName = reformatName(d['name D'].slice(beginIdx1+1, endIdx1));
        } else {
            // If two pairs of braces were found use the french name to find the producer's name.
            germanName1 = reformatName(d['name D'].slice(beginIdx1+1, endIdx1));
            germanName2 = reformatName(d['name D'].slice(beginIdx2+1, endIdx2));

            beginIdx3 = d['name F'].indexOf('(');
            endIdx3 = d['name F'].indexOf(')');
            frenchName1 = reformatName(d['name F'].slice(beginIdx3+1, endIdx3));

            // The producer's name will match in the german and french strings since it doesn't 
            // depend on the language.
            if (frenchName1 === germanName1) {
                producerName = germanName1;
            } else {
                producerName = germanName2;
            }
        }
    }
    // remove information about alcohol content
    if (producerName !== null && !producerName.includes('vol%')) {
        d.producerName = producerName;
    } else {
        d.producerName = null;
    }
    return d;

    function reformatName(name) {
        return name.trim().toLowerCase();
    }
};


/**
 * Calculates the number of foods per producer.
 * @param {[Object]} data An array of foods for which the producer name has already been added.
 * @returns {Object} An object which contains a member variable for every distinct producer name
 * holding the number of foods from that producer.
 */
var calcFoodsPerProducer = function(data) {
    var foodsPerProducer = {};
    data.forEach(function(item, idx, array) {
        if (item.producerName === undefined)
            throw new Error('the object property "producerName" was not yet set on the foods.');
        if (foodsPerProducer[item.producerName] === undefined)
            foodsPerProducer[item.producerName] = 0;
        foodsPerProducer[item.producerName] += 1;
    });
    return foodsPerProducer;
};

/**
 * Creates and returns a mapping from producer to all the foods belonging to that producer.
 * @param {[Object]} data Expects an array of food Objects which have the property {producerName} set.
 * @returns {[Object]} An array of Objects each representing a producer holding all the foods that 
 * belong to that producer.
 */
var getProducerToFoodsMapping = function(data) {
    var producers = {};
    data.forEach(function(item, idx, array) {
        if (item.producerName === undefined)
            throw new Error('the object property "producerName" was not yet set on the foods.');
        if (producers[item.producerName] === undefined)
            producers[item.producerName] = {
                producerName: item.producerName,
                foods: []
            };
        producers[item.producerName].foods.push(item);
    });
    return Object.values(producers);

};

var augmentWithCategories = function(food) {
    var categoryString = food['category E'];
    var categoryHierarchies = categoryString.split(';');
    categoryHierarchies.forEach(function(hierarchyString, idx1, hierarchies) {
        var propertyName = 'category ' + (idx1+1);
        hierarchyString.split('/').forEach(function(category, idx2, categories) {
            food[propertyName + '/' + (idx2+1)] = category;
        });
    });
    return food;
};

var augmentWithCategoriesList = function(food) {
    var categories = [];
    food['category E'].split(';').forEach(function(hierarchy) {
        hierarchy.split('/').forEach(function(category) {
            categories.push(category);
        });
    });
    food.categories = categories;
    return food;
};

var getAllCategoriesCounted = function(foods) {
    var categories = [new Map(), new Map(), new Map()];
    foods.forEach(function(food, idx) {
        var categoryHierarchies = food['category E'].split(';');
        categoryHierarchies.forEach(function(hierarchyString, idx1) {
            hierarchyString.split('/').forEach(function(category, idx2) {
                if (categories[idx2].has(category)) {
                    categories[idx2].set(category, categories[idx2].get(category) + 1);
                } else {
                    categories[idx2].set(category, 0);
                }
            });
        });
    });
    return categories;
};

var getAllCategoriesAsTree = function(foods) {
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
};

exports.addProducerName = addProducerName;
exports.calcFoodsPerProducer = calcFoodsPerProducer;
exports.getProducerToFoodsMapping = getProducerToFoodsMapping;
exports.augmentWithCategories = augmentWithCategories;
exports.augmentWithCategoriesList = augmentWithCategoriesList;
exports.getAllCategoriesCounted = getAllCategoriesCounted;
exports.getAllCategoriesAsTree = getAllCategoriesAsTree;
}(this));
