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

// function drawTooltip(lines, x, y) {
//   return True;
// }

// function tooltipTextArr() {
//   return True;
// }

// attempt to generalize drawing of the tree
// not very generic tho
// direction is whether tree will be y-down or y-up (1 for down, -1 for up)
function drawTree(canvas, nodes, links, diagonal, direction) {
  // var tipSynset = d3.tip()
  //   .attr("class", "d3-tip")
  //   .html(function(d) {
  //     return d.name;
  //   })

  // canvas.call(tipSynset);

  // Define the div for the tooltip
  // var div = d3.select("body").append("div") 
  //   .attr("class", "tooltip")       
  //   .style("opacity", 0);
  var nfoTipG = canvas.append("g")
    .attr("visibility", "hidden");

  var nfoTipBg = nfoTipG.append("rect")
    .attr("height", "0")
    .attr("width", "0")
    .style("fill", "#888")
    .attr("x", 0)
    .attr("y", 0);

  var nfoTipTxt = nfoTipG.append("text")
    .attr("class", "tooltipText")
    .attr("id", "ttltip1");

  // var nfoTipDiv = d3.select("WNTree").append("div")
  //   .text("shit")
  //   .style("opacity", 0)
  //   .attr("id", "treeTooltip");

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
    .attr("dy", "1.3em"); // shift it a bit

  nodeText.append("tspan")
    .attr("x", "0")
    .attr("dy", "1.2em")
    .text(function(d) {
      if (d.synset) {
        // console.log(d.synset);
        return d.synset[0].name + ":" + d.synset[0].meaning;
      }
      return d.name;
    });

    nodeText
      .on("mouseover", function(d) {
        if (d.synset) {
          // drawTooltip(d.synset)
          var i = 0;

          // array tooltipTexts holds all the lines in the tooltip
          var tooltipTexts = [];
          tooltipTexts[0] = "";
          while (d.synset[i]) {
            tooltipTexts[0] += d.synset[i].name + ", "
            i++;
          }
          // remove the last comma and trim
          tooltipTexts[0] = tooltipTexts[0].substring(0, tooltipTexts[0].length-2)
          if (tooltipTexts[0].length > 35 ) {
            tooltipTexts[0] = tooltipTexts[0].substring(0,36) + "…";
          }

          if (d.def.length > 35) {
            tooltipTexts[1] = d.def.substring(0,36) + "…"
          }
          else {
            tooltipTexts[1] = d.def;
          }

          tooltipTexts[2] = d.id

          var longestTtpText = tooltipTexts.reduce(function (a, b) { return a.length > b.length ? a : b; });

          var nfoWidth = longestTtpText.length;
          var nfoHeight = 20 * tooltipTexts.length;
          console.log(nfoWidth);
          nfoTipG
            .attr("transform", "translate(" + ((direction * d.y) - nfoWidth/2) + ", " + (d.x - (nfoHeight + 10)) + ")");
          
          i = 0;
          while(tooltipTexts[i]) {
            nfoTipTxt.append("tspan")
              .attr("x", "0")
              .attr("dy", "1.2em")
              .attr("class", "ttpLine-" + i)
              .text(tooltipTexts[i]);
            i++;
          }

          nfoTipG
            .attr("visibility", "visible");

          nfoTipBg
            .transition()
            .duration(200)
            .attr("width", (nfoWidth * 0.6) + "em")
            .attr("height", nfoHeight)
            .attr("class", "tooltipBox");

         }
        })
      .on("mouseout", function(d) {
        nfoTipBg
        .transition()
          .duration(600)
          .attr("width", "0")
          .attr("height", "0")
        
        nfoTipG
          .attr("visibility", "hidden");

        nfoTipTxt.selectAll("tspan").remove();
      })
    

  // nodeText.append("")

  // nodeText.append("tspan")
  //   .attr("x", "0")
  //   .attr("dy", "1.2em")
  //   .text("blah");
}
// var element = $("#WNTree");

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
  // tree = d3.layout.tree().size([500,canvasSizes.height]);
  hyperTree = d3.layout.tree().size([treeSizes.height, treeSizes.width/6])
  // hyperTree = d3.layout.tree().size([500,canvasSizes.height])


  // d3.json("kolo_2.json", function(data2) {
  //   var nodes2 = tree.nodes(data2);
  //   console.log(nodes2);

  // });



  // load the json
  d3.json("kolo_2.json", function(data) {
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