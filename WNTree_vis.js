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
				cons.push({"from": parentID, "to": currentID});
				break;
			case "leaf": 
				points.push({"id": currentID, "label": name});
				cons.push({"from": parentID, "to": currentID, "label": "member\nword", "dashes": true});
				break;
			case "semGroup": 
				points.push({"id": currentID, "label": name, "group": "semgroup"});
				cons.push({"from": parentID, "to": currentID, "label": "semantic\nrelationship", "arrows": "to"});
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
			console.log(iter, obj)
			addToNodesAndEdges(obj.id, iter, parentI, "synset", "")
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
	        physics: {
	            enabled: false,
	        },
	        nodes: {
	            shape: 'box',
	            font: {
	                size: 14,
	                color: '#000000'
	            },
	            borderWidth: 2
	        },
	        groups: {
	        	synsets: {
	        		shape: 'diamond',
	        		size: 5
	        	},
	        	semgroup: {
	        		font: {
	        			size: 18
	        		}
	        	}
	        },
	        edges: {
	        	font: {
	        		align: 'middle'
	        	}
	        }
	        // edges: {
	        //     width: 2
	        // }
	    };
	
	var network = new vis.Network(wntreecontainer, dataVis, options);
};
