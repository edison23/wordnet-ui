function WNTree(data) {
	var iter = 0;
	var semgrIt = 1;
	// console.log(data);
	var points = [];
	var cons = [];
	var nodeStack = [];

	

	function addToNodesAndEdges(name, currentID, parentID, nodeType, edgeType) {
		switch(nodeType) {
			case "synset": 
				points.push({"id": currentID, "label": "synset\n" + name, "group": "synsets"}); 
				cons.push({"from": parentID, "to": currentID, "length": 80});
				break;
			case "leaf": 
				points.push({"id": currentID, "label": name, "group": "leaves"});
				cons.push({"from": parentID, "to": currentID, "label": "member\nword", "dashes": true});
				break;
			case "semGroup": 
				points.push({"id": currentID, "label": name, "group": "semgroup"});
				cons.push({"from": parentID, "to": currentID, "label": "semantic\nrelationship", "arrows": "to", "width": 3});
				break;
			case "root": 
				points.push({"id": currentID, "label": name, "group": "root"});
				// cons.push({"from": parentID, "to": currentID, "label": "semantic\nrelationship", "arrows": "to", "width": 3});
				break
			case "rootLeaf": 
				points.push({"id": currentID, "label": name, "group": "rootLeaf"});
				cons.push({"from": parentID, "to": currentID, "label": "member\nword", "dashes": true});
				break;
			default: 
				points.push({"id": currentID, "label": name});
				cons.push({"from": parentID, "to": currentID});
				break
		}

		// if (type == "synset") {
		// 	points.push({"id": currentID, "label": name, "group": "synsets"});
		// 	// cons.push({"from": parentID, "to": currentID});
		// }
		// else if (type == "leaf") {
		// 	points.push({"id": currentID, "label": name});
		// }
		
	}

	function DFSThruSynsets(obj, parentI) {
		iter++;

		// this means it's a synset, not a group name (eg. meronyms) or a leaf word
		if (obj.id) {
			// that would be the root node
			if (iter == 1) {
				addToNodesAndEdges(obj.id, iter, parentI, "root", "")
			}
			else {
				addToNodesAndEdges(obj.id, iter, parentI, "synset", "")
			}
			
		}
		// leaves
		else if (obj.name && !obj.children) {
			if (parentI == 1) {
				addToNodesAndEdges(obj.name, iter, parentI, "rootLeaf", "")
			}
			else {
				addToNodesAndEdges(obj.name, iter, parentI, "leaf", "")
			}
		}
		else if (obj.children.length > 0) {
			addToNodesAndEdges(obj.name, iter, parentI, "semGroup", "")
		}

		// the basterd would throw exception if we didn't test this shit, otherwise it's nothing
		if (obj.children) {
			$.each(obj.children, function(i, child) {
				if (child.name !== "hyperCat") {
					nodeStack.push({obj: child, parentI: iter})
				}
			});
		}
		if (obj.synset) {
			$.each(obj.synset, function(i, word) {
				nodeStack.push({obj: word, parentI: iter})
			});
		};

		// recursion, yay!
		if (nodeStack[0]) {
			out = nodeStack.pop();
			console.log(nodeStack)
			DFSThruSynsets(out.obj, out.parentI)
		}
	};

	DFSThruSynsets(data, iter);

	// non-recursive implementation
	// nodeStack.push({obj: data, parentI: 0})
	// while (nodeStack[0]) {
	// 	console.log(nodeStack)
	// 	out = nodeStack.shift()
	// 	BFSThruSynsets(out.obj, out.parentI)
	// }

	var nodes = new vis.DataSet(points);
	var edges = new vis.DataSet(cons);

	// create a network
	var wntreecontainer = document.getElementById('stromcik');
	setElDimensions($("#stromcik"));
	var dataVis = {
	  nodes: nodes,
	  edges: edges
	};
	
	var options = {
	        layout: {
	            // hierarchical: {
	            //     direction: "LR",
	            //     sortMethod: "directed"
	            // },
	            randomSeed:2
	        },
	        interaction: {
	        	dragNodes :false,
	            navigationButtons: true,
	            keyboard: true
	        },
	        // "edges": {
	        //     "smooth": {
	        //       "forceDirection": "none"
	        //     }
	        //   },
          	"physics": {
	            "barnesHut": {
	              "avoidOverlap": 0.99,
	              "gravitationalConstant": -2300,
	              // "springLength": 50,
	            },
	            // "hierarchicalRepulsion": {
	            // 	"damping": 0.09
	            // },
	            "minVelocity": 0.75,
	            "timestep": 0.9,

				stabilization: {
                    enabled:true,
                    iterations:1000,
                    updateInterval:25
                }	            
	        },
	        nodes: {
	            shape: 'box',
	            font: {
	                size: 14,
	                color: '#3f3f3f',
	                strokeWidth: 3, 
	                strokeColor: 'white',
	                face: 'akrobat'
	            },
	            borderWidth: 2,
	            color: {
	            	background: '#d7d7f3',
	            	border: '#3030a9',
	            },
	            // i totally dont get this
	            // scaling: {
	            //       min: 10,
	            //       max: 50,
	            //       label: {
	            //         enabled: false,
	            //         min: 14,
	            //         max: 20,
	            //         maxVisible: 20,
	            //         drawThreshold: 10
	            //       },
	            // },
	            
	        },
	        groups: {
	        	synsets: {
	        		shape: 'diamond',
	        		size: 5
	        	},
	        	semgroup: {
	        		shape: 'triangle',
	        		size: 5,
	        		font: {
	        			size: 18
	        		}
	        	},
	        	root: {
	        		shape: 'dot',
	        		size: '8',
	        		color: '#a93030',
	        		font: {
	        			size: 18
	        		}
	        	},
	        	rootLeaf: {
	        		// shape: 'dot',
	        		// size: '8',
	        		// color: 'red',
	        		font: {
	        			strokeWidth: 0,
	        			size: 18
	        		},
	        		color: {
	        			background: '#f3d7d7',
	        			border: '#a93030'
	        		}
	        	},
	        	leaves: {
	        		font: {
	        			// color: '#ff00ff',
	        			strokeWidth: 0,
	                	// strokeColor: 'black'
	        		}
	        	}
	        },
	        edges: {
	        	font: {
	        		align: 'middle',
	                face: 'akrobat'
	        	},
	        	"smooth": {
	        	  "forceDirection": "none"
	        	}
	        }
	    };
	
	var network = new vis.Network(wntreecontainer, dataVis, options);
	// network.fit({offset: {x: 1300, y: 300}}); // why doesn't this work
	document.getElementById('loadingBar').style.display = 'block';
	// console.log("loader shown")
	network.on("stabilizationProgress", function(params) {
        var parentDim = {w: $("#WNTree").width(), h: $("#WNTree").height()}
        var minWidth = 20;
        var maxWidth = parentDim.w-(parentDim.w*0.1);
        var widthFactor = params.iterations/params.total;
        var width = Math.max(minWidth,maxWidth * widthFactor);

        $("#loadingBarBar").css({top: parentDim.h/2, left: (parentDim.w/2)-maxWidth/2, width: maxWidth});
        $("#loadingBarInner").width(width);
        $("#loadingBarText").html(Math.round(widthFactor*100) + ' %');
        // console.log("stabilization in progress", width, widthFactor, params.total)
    });
    network.once("stabilizationIterationsDone", function() {
    	network.stopSimulation()
        // console.log("stabilization in done")

        $("#loadingBarInner").css({width: "100%"})
        $("#loadingBarText").html("100 %")
        $("#loadingBar").fadeOut(300)
        // really clean the dom element
        // setTimeout(function () {document.getElementById('loadingBar').style.display = 'none';}, 500);
    });
};