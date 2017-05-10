function WNTree(data) {
	var iter = 0;
	var semgrIt = 1;
	// console.log(data);
	var points = [];
	var cons = [];
	var nodeStack = [];

	function setGraphDimensions(el) {
		var headerHeight = 0, safetyConstant = 0;
		if ($(window).width() > 768) {
			headerHeight = $("#header").height();
			safetyConstant = 5*(parseFloat($("body").css("font-size")))
		}
		console.log(headerHeight, safetyConstant)
		$(el).css({"width": "100%"})
		$(el).height($(window).height()-(headerHeight+safetyConstant));
	}

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

	function BFSThruSynsets(obj, parentI) {
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
			addToNodesAndEdges(obj.name, iter, parentI, "leaf", "")
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

		if (nodeStack[0]) {
			out = nodeStack.pop();
			BFSThruSynsets(out.obj, out.parentI)
		}
	};

	BFSThruSynsets(data, iter);

	var nodes = new vis.DataSet(points);
	var edges = new vis.DataSet(cons);

	// create a network
	var wntreecontainer = document.getElementById('WNTree');
	setGraphDimensions(wntreecontainer);
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
	              "avoidOverlap": 1,
	              "gravitationalConstant": -3300,
	              "springLength": 150,
	            },
	            "minVelocity": 0.75,
	            "timestep": 0.67
	          },
	        nodes: {
	            shape: 'box',
	            font: {
	                size: 14,
	                color: '#3f3f3f',
	                strokeWidth: 3, 
	                strokeColor: 'white'
	            },
	            borderWidth: 2,
	            color: {
	            	background: '#d7d7f3',
	            	border: '#3030a9',
	            }
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
	        		color: 'red',
	        		font: {
	        			size: 18
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
	        		align: 'middle'
	        	},
	        	"smooth": {
	        	  "forceDirection": "none"
	        	}
	        }
	    };
	
	var network = new vis.Network(wntreecontainer, dataVis, options);
	// network.fit({offset: {x: 1300, y: 300}}); // why doesn't this work
};
