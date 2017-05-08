function WNTree(data) {
	var iter = 0;
	// console.log(data);
	var points = [];
	var cons = [];
	var nodeStack = [];

	function addToNodesAndEdges(name, currentID, parentID, type) {
		if (type == "synset") {
			points.push({"id": currentID, "label": name, "group": "synsets"});
			cons.push({"from": parentID, "to": currentID});
		}
		else if (type == "leaf") {
			points.push({"id": currentID, "label": name});
			cons.push({"from": parentID, "to": currentID});
		}
	}

	function BFSThruSynsets(obj, parentI) {
		iter++;
		// console.log(parentI, obj)
		// if (obj.id) {
		// 	points.push({"id": iter, "label": obj.id, "group": "synsets"});
		// 	// points.push({"id": iter, "label": obj.id});
		// 	cons.push({"from": parentI, "to": iter});
		// }
		// else if (obj.name) {
		// 	points.push({"id": iter, "label": obj.name});
		// 	cons.push({"from": parentI, "to": iter});
		// }
		// else {
		// 	points.push({"id": iter, "label": "unknown name"})
		// };

		if (obj.id) {
			addToNodesAndEdges(obj.id, iter, parentI, "synset")
		}

		else if (obj.name && (!obj.children || obj.children.length > 0)) {
			console.log(obj)
			addToNodesAndEdges(obj.name, iter, parentI, "leaf")
		}

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
	// $("#WNTree").html("asdfkasdfas")
	var wntreecontainer = document.getElementById('WNTree');
	console.log(wntreecontainer)
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
	        	}
	        },
	        // edges: {
	        //     width: 2
	        // }
	    };
	
	var network = new vis.Network(wntreecontainer, dataVis, options);
};
