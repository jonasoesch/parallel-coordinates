(function(global) {
global.helpers = global.helpers || {};
exports = global.helpers;

/**
 * Extracts and adds the producer's name to the food object. The producer's name is extracted from
 * the german name ('name D' column). For all foods that do not have a producer specified in braces
 * the producer's name is set to null.
 * Use this function e.g. as the converions funciton in a call to d3's dsv functions.
 * E.g. d3.csv('branded_foods.csv', addProducerInfo, ...)
 * @param {Object} d The food object.
 * @returns {Object} The food object that was given as a parameter.
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
};

function reformatName(name) {
    return name.trim().toLowerCase();
}

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

/**
 * Adds multiple category properties to the foods object depending on the number of category 
 * hierarchies (separated by ';') and categories (separated by '/') provided for the food.
 */
var addCategories = function(food) {
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

var calcFoodsPerCategory = function(foods) {
    var foodsPerCategory = [];
    foods.forEach(function(food) {
        if (food.categoryHierarchies === undefined || food.categoryHierarchies === []) {
            throw new Error("The object property 'categoryHierarchies' is not set on this food or is empty.");
        }
        food.categoryHierarchies.forEach(function(hierarchy) {
            
            hierarchy.forEach(function(category, hierarchyLvl) {
                // If this category hierarchy level was not yet used, create a new one.
                if (foodsPerCategory[hierarchyLvl] === undefined) {
                    foodsPerCategory[hierarchyLvl] = {};
                }
                // If the category appears the first time add it to the categories object.
                if (foodsPerCategory[hierarchyLvl][category] === undefined) {
                    foodsPerCategory[hierarchyLvl][category] = 0;
                }
                foodsPerCategory[hierarchyLvl][category] += 1;
            });
        });
    });
    return foodsPerCategory;
};

exports.addProducerName = addProducerName;
exports.calcFoodsPerProducer = calcFoodsPerProducer;
exports.getProducerToFoodsMapping = getProducerToFoodsMapping;
exports.addCategories = addCategories;
exports.calcFoodsPerCategory = calcFoodsPerCategory;
}(this));
