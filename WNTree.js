function getSizes(el) {
  var sizes = {elWidth: el.width(), elHeight: el.height(), docWidth: $(document).width(), docHeight: $(document).height()};
  return sizes;
}


// fc to return element from array by label (property "name")
// takes array and what name to find
function getArrayElsByLabel(array, label) {
  return array[findArrayElIdByLabel(array, label)]
}

// fc to delete elelement from array by label
// takes array, what label to find and number of elements to delete
function delArrayElByLabel(array, label, num) {
  var id = findArrayElIdByLabel(array, label)
  if (id) {
    array.splice(id, num);
    return array;
  }
  return false;
}

// fc to actually find the element (see 2 fcs above)
// stupid, goes thru the whole array until it finds the element.name
// takes array and what name to find
function findArrayElIdByLabel(array, label) {
  for (i=0; i<array.length; i++) {
    if (array[i].name == label) {
      return i;
    };
  };
};

// fc to create a whole tooltip above the synset; truncates long synsets
// amount of info settable by modifying lines variable
function drawTooltip(entry, nodde) { // nodde is just the parent node, but to avoid confusion with node()
  var node = d3.select(nodde),
  group = node.append("g"),
  synsteLine = "", 
  i = 0;
  var text = group.append("text");

  // this throws an exception if entry.synset is undefined.. 
  // but that would matter only if a tooltip were to be on category nodes
  while (entry.synset[i]) {
    synsteLine += entry.synset[i].name
    i++;
    if (entry.synset[i] && synsteLine.length < 35) {
      synsteLine += ", "
    }
    else if (entry.synset[i]) {
      synsteLine += "…"
      break;
    }
    else {
      break;
    };
  };
  // return synsteLine;

  var lines = [synsteLine, entry.id, entry.pos, entry.def]

  for (i in lines) {
    text.append("tspan")
      .attr("x", "0")
      .attr("dy", "1.2em")
      .text(lines[i]);
  }
  // console.log(entry.synset[0].name);

  textBBox = text.node().getBBox();

  group.insert("rect", "text")
    .attr("width", textBBox.width)
    .attr("height", textBBox.height)
    .attr("fill", "#999");
  // console.log(text.node().getBBox());

  group
    .attr("transform", "translate(" + -textBBox.width/2 + "," + -(textBBox.height + 10) + ")")
    .attr("id", "tooltip");
  return group;
}

function destroyTooltip(node) {
  $("#tooltip").remove();
}

// attempt to generalize drawing of the tree
// not very generic tho
// direction is whether tree will be y-down or y-up (1 for down, -1 for up)
function drawTree(canvas, nodes, links, diagonal, direction) {

  // data binding, ha! (creates the lines between nodes)
  // select all el. with class .link (there are none yet), use data to create them 
  // and append some properties
  canvas.selectAll(".links")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke-width", "3")
    .attr("stroke", function(d) {
      if (d.target.name == "mero/part") {
        return "#b74343";;
      }
      if (d.target.name == "hyponyms") {
        return "#b79443";
      }
      if (d.target.name == "hyperonym") {
        return "#58b743";
      }
      if (d.target.name == "near_antonym") {
        return "#4370b7";
      }
      else {
        return "#aaa";
      }
    })
    .attr("d", diagonal); // computes the vectors of the lines

  // again, select all (none yet), fill it with data...
  var node = canvas.selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
      .attr("class", "node")
    // transform="translate(10,50)" - actual coordinates of the points
    .attr("transform", function(d) {return "translate(" + direction * d.y + "," + d.x + ")";});

  node.append("circle")
    .attr("r", 4)
    .attr("fill", "red");  

  var nodeText = node.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "1.3em") // shift it a bit
    .attr("x", "0")
    .attr("dy", "1.2em")
    .text(function(d) {
      if (d.synset) {
        return d.synset[0].name + ":" + d.synset[0].meaning;
      }
      return d.name;
    })

  node
    .on("mouseover", function(d, i) {
      drawTooltip(d, node[0][i]);
    })
    .on("mouseout", function(d, i) {
      destroyTooltip();
    })
}

function WNTree() 
{
  sizes = getSizes($("#WNTree"));

  var canvasSizes = {width: sizes.elWidth, height: sizes.docHeight};

  // let's try not allowing trees narrower than some width
  if (canvasSizes.width < 800) {
    canvasSizes.width = 800;
  }
  
  var treeSizes = {width: ((canvasSizes.width))-(canvasSizes.width/4), height: canvasSizes.height}

  // the svg where all the trees shall grow
  var canvas = d3.select("#WNTree").append("svg")
    .attr("width", canvasSizes.width)
    .attr("height", canvasSizes.height);

  // create canvas for the normal (y-down) tree
  var canvasChildren = canvas
    .append("g")
      .attr("transform", "translate("+ (canvasSizes.width/6)*1.15 + ", 0)");

  // canvas for the parents tree (y-up)
  var hyperCanvas = canvas
    .append("g")
      .attr("transform", "translate("+ (canvasSizes.width/6)*1.15 + ", 0)");

  // planting the trees, defining their sizes
  // note that width left-to-right trees, width is actually height and vice versa
  tree = d3.layout.tree().size([treeSizes.height, treeSizes.width-treeSizes.width*0.15]);
  hyperTree = d3.layout.tree().size([treeSizes.height, treeSizes.width/6])

  // load the json
  d3.json("kolo.json", function(data) {
    // get the hyperonyms node before deleting
    var hyperonyms = getArrayElsByLabel(data.children, "hyperCat");
    delArrayElByLabel(data.children, "hyperCat", 1);

    // console.log(hyperonyms);
    // remove the metalabel ("hyperCat") (as that's where root label is)
    hyperonyms.name = "";

    // create all nodes from data
    var nodes = tree.nodes(data);
    var hyperNodes = hyperTree.nodes(hyperonyms);

    // roots have to have same coordinates
    nodes[0].x = hyperNodes[0].x;
    nodes[0].y = hyperNodes[0].y;
    // hyperNodes[0].x = 800;
    
    // lines between the nodes
    var links = tree.links(nodes);
    var hyperLinks = hyperTree.links(hyperNodes);
    var diagonal = d3.svg.diagonal()
      .projection(function(d) {return [d.y, d.x]});
    var hyperDiagonal = d3.svg.diagonal()
      .projection(function(d) {return [-d.y, d.x]})

    // draw the actuall trees
    drawTree(canvasChildren, nodes, links, diagonal, 1);
    drawTree(hyperCanvas, hyperNodes, hyperLinks, hyperDiagonal, -1);

  });
};