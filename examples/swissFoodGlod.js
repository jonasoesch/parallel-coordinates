// Make underscore object available. Don't know why it isn't already available.
this._ = exports._;

var parcoords = d3.parcoords()("#example")
    .alpha(0.4)
    .mode("queue") // progressive rendering
    .height(document.body.clientHeight - 220)
    .margin({
      top: 36,
      left: 0,
      right: 0,
      bottom: 16
    });

function preprocess(d) {
  return swissFoodHelpers.augmentWithCategoriesList(
    swissFoodHelpers.augmentWithCategories(d)
  );
}

function filterByCategories(data, included, excluded) {
  return data.filter(function(d) {
    return _.intersection(d.categories, included).length > 0  &&
      _.intersection(d.categories, excluded).length === 0;
  });
}

function processData(data) {

  var includedCategories = ['Fruit'];
  var excludedCategories = [];
  data = filterByCategories(data, includedCategories, excludedCategories);

  // set up coloring configuration
  var colorCategories = [
    'Fresh fruit', 
    'Dried fruit', 
    'Fruit juices', 
    'Cooked fruit (incl. cans)'];
  var colorScale = d3.scale.category10()
    .domain(colorCategories);

  function byCategory(d) { 
    return colorScale(_.intersection(d.categories, colorCategories));
  }

  // slickgrid needs each data element to have an id
  data.forEach(function(d,i) { d.id = d.id || i;});

  // var dimensions = {
  //   "energy kJ": {type: "number"},
  //   "water": {type:"number", title:"water (g)"},
  //   "protein": {type:"number", title: "protein (g)"},
  //   "carbohydrates, available": {type: "number", title: "carbohydrates"}, 
  //   "fat, total": {type:"number", title: "fat (g)"},
  //   "dietary fibres": {type: "number"},
  //   "starch": {type: "number", title: "starch (g)"},
  //   "sugars": {type: "number", title: "sugars (g)"},
  //   "dietary fibres": {type: "number", title: "dietary fibres (g)"},
  //   "fat, total": {type: "number"},
  //   "cholesterol": {type: "number", title: "cholesterol (mg)"}, 
  //   "vitamin A activity": {type: "number", title: "A (ug RE)"},
  //   "all-trans retinol equivalents": {type: "number", title: "all-trans RE"},
  //   "beta-carotene": {type: "number", title: "BC (ug)"},
  //   "vitamin B1 (thiamine)": {type: "number", title: "B1 (mg)"},
  //   "vitamin B2 (riboflavin)": {type: "number", title: "B2 (mg)"},
  //   "vitamin B6 (pyridoxine)": {type: "number", title:"B6 (mg)"},
  //   "vitamin B12 (cobalamin)": {type: "number", title: "B12 (ug)"},  
  //   "niacin": {type: "number", title: "niacin (mg)"},
  //   "folate": {type: "number", title: "folate (ug)"},
  //   "pantothenic acid": {type: "number", title: "Pantothenic acid (mg)"},
  //   "vitamin C (ascorbic acid)": {type: "number", title: "C (mg)"},
  //   "vitamin D (calciferol)": {type: "number", title: "D (ug)"},
  //   "vitamin E activity": {type: "number"},
  //   "sodium (Na)": {type: "number", title: "Na (mg)"},
  //   "potassium (K)": {type: "number", title: "K (mg)"},
  //   "chloride (Cl)": {type: "number", title: "Cl (mg)"},
  //   "calcium (Ca)": {type: "number", title: "Ca (mg)"},
  //   "magnesium (Mg)": {type: "number", title: "Mg (mg)"},
  //   "phosphorus (P)": {type: "number", title: "P (mg)"},
  //   "iron (Fe)": {type: "number", title:"Fe (mg)"},
  //   "iodide (I)": {type: "number", title: "I (ug)"},
  //   "zinc (Zn)": {type: "number", title: "Zn (mg)"}
  // };

  parcoords
    .data(data)
    .dimensions({
      "energy kJ": {type: "number"},
      // "protein": {type:"number", title: "protein (g)"},
      // "carbohydrates, available": {type: "number", title: "carbohydrates"}, 
      "water": {type:"number", title:"water (g)"},
      // "fat, total": {type:"number", title: "fat (g)"},
      "dietary fibres": {type: "number", title: "dietary fibres (g)"},
      // "starch": {type: "number", title: "starch (g)"},
      "sugars": {type: "number", title: "sugars (g)"},
      // "cholesterol": {type: "number", title: "cholesterol (mg)"},
      "vitamin A activity": {type: "number", title: "A (ug RE)"},
      // "all-trans retinol equivalents": {type: "number", title: "all-trans RE"},
      "beta-carotene": {type: "number", title: "BC (ug)"},
      "vitamin B1 (thiamine)": {type: "number", title: "B1 (mg)"},
      "vitamin B2 (riboflavin)": {type: "number", title: "B2 (mg)"},
      "vitamin B6 (pyridoxine)": {type: "number", title:"B6 (mg)"},
      // "vitamin B12 (cobalamin)": {type: "number", title: "B12 (ug)"},  
      "niacin": {type: "number", title: "niacin (mg)"},
      "folate": {type: "number", title: "folate (ug)"},
      "pantothenic acid": {type: "number", title: "Pantothenic acid (mg)"},
      "vitamin C (ascorbic acid)": {type: "number", title: "C (mg)"},
      // "vitamin D (calciferol)": {type: "number", title: "D (ug)"},
      "vitamin E activity": {type: "number"}
    })
    .color(byCategory)
    .render()
    .reorderable()
    .brushMode("1D-axes");

  // For the swiss food data only the first two category hierarchies and in each 
  // of them only the first two categories are useful.
  var column_keys = ['name D', 'category 1/1', 'category 1/2', 'categories'];
  // var column_keys = ['name D', 'category 1/1', 'category 1/2', 'category 2/1', 'category 2/2', 'categories'];
  var columns = column_keys.map(function(key,i) {
    return {
      id: key,
      name: key,
      field: key,
      sortable: true
    };
  });

  var options = {
    enableCellNavigation: true,
    enableColumnReorder: false,
    multiColumnSort: false,
    forceFitColumns: true
  };

  var dataView = new Slick.Data.DataView();
  var grid = new Slick.Grid("#grid", dataView, columns, options);
  var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));

  // wire up model events to drive the grid
  dataView.onRowCountChanged.subscribe(function (e, args) {
    grid.updateRowCount();
    grid.render();
  });

  dataView.onRowsChanged.subscribe(function (e, args) {
    grid.invalidateRows(args.rows);
    grid.render();
  });

  // column sorting
  var sortcol = column_keys[0];
  var sortdir = 1;

  function comparer(a, b) {
    var x = a[sortcol], y = b[sortcol];
    return (x == y ? 0 : (x > y ? 1 : -1));
  }
  
  // click header to sort grid column
  grid.onSort.subscribe(function (e, args) {
    sortdir = args.sortAsc ? 1 : -1;
    sortcol = args.sortCol.field;

    if ($.browser.msie && $.browser.version <= 8) {
      dataView.fastSort(sortcol, args.sortAsc);
    } else {
      dataView.sort(comparer, args.sortAsc);
    }
  });

  // highlight row in chart
  grid.onMouseEnter.subscribe(function(e,args) {
    // Get row number from grid
    var grid_row = grid.getCellFromEvent(e).row;

    // Get the id of the item referenced in grid_row
    var item_id = grid.getDataItem(grid_row).id;
    var d = parcoords.brushed() || data;

    // Get the element position of the id in the data object
    elementPos = d.map(function(x) {return x.id; }).indexOf(item_id);

    // Highlight that element in the parallel coordinates graph
    parcoords.highlight([d[elementPos]]);
  });

  grid.onMouseLeave.subscribe(function(e,args) {
    parcoords.unhighlight();
  });

  // fill grid with data
  gridUpdate(data);

  // update grid on brush
  parcoords.on("brush", function(d) {
    gridUpdate(d);
  });

  function gridUpdate(data) {
    dataView.beginUpdate();
    dataView.setItems(data);
    dataView.endUpdate();
  }
}

// load csv file and create the chart
d3.tsv(
  'data/food-data.txt', 
  preprocess,
  processData);

  // var allOriginalColumns = "ID", "ID V 4.0", "ID SwissFIR", "name D", "synonyms D", "name F", "synonyms F", "name I", "synonyms I", "unit",
  //     "name E", "synonyms E", "category D", "category F", "category I", "category E", "specific gravity", "matrix unit", "value type", "source",
  //     "niacin", "folate", "pantothenic acid", "vitamin C (ascorbic acid)", "vitamin D (calciferol)", "vitamin E activity", "id", "record has changed",
  //     "phosphorus (P)", "iron (Fe)", "iodide (I)", "zinc (Zn)", "potassium (K)", "sodium (Na)","vitamin A activity", "energy kcal",
  //     "beta-carotene", "vitamin B1 (thiamine)", "vitamin B2 (riboflavin)", "vitamin B6 (pyridoxine)", "vitamin B12 (cobalamin)", NaN]);