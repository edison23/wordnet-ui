function getData(coalback, input, source) {
		// console.log(input, source)
	$.ajax({
	  // url: "kolo-server.json",
	  url: "https://nlp.fi.muni.cz/~xrambous/fw/abulafia/" + source + "?action=jsonvis&query=" + input,
	  beforeSend: function(xhr){
	  	console.log("https://nlp.fi.muni.cz/~xrambous/fw/abulafia/" + source + "?action=jsonvis&query=" + input)
	    if (xhr.overrideMimeType)
	    {
	      xhr.overrideMimeType("application/json");
	    }
	  },
	dataType: 'json',
	success: coalback,
	error: function(e, xhr, settings) {
		
		console.log("Ajax error")
		hideContent(true);
		$("#ajaxError").show()
	},
	complete: function(e, xhr, settings) {
		console.log("Ajax operation completed with status code " + e.status )
	},
	});
}

function onLoad() {
	$("#text-rep").click(function() {
    	$("#WNTree").hide();
        $("#theContent").show();
    });
    $("#dendr-rep").click(function() {
    	$("#theContent").hide();
    	$("#WNTree").show();
    });

    $('[data-toggle="tooltip"]').tooltip(); 

    $("#search").on("submit", function(e) {
		e.preventDefault();
    	onSearchButt();
    })


	window.addEventListener('popstate', function(e) {
		
		popGuai(e.state)
	});


	var uri = new URI();
	var queries  = uri.search(true)
	var fragment = uri.fragment();
	
	$("#search-input").val(queries["input"])
	$("#data-source-selection").val(queries["source"])

	if (! queries["source"]) {
		$("#data-source-selection").val("wncz")
	}

	if (! queries["input"]) {
		hideContent(true)
		$("#emptySearch").show()
	}
	else {
		search(queries["input"], queries["source"], fragment)
	}
	// var url = parseURL(window.location.href)
	// if (url.query["q"]) { // is this correct way of doing it? it's Javascript, after all...
	// 	$("#search-input").val(url.query["q"]) 
	// 	$("#data-source-selection").val(url.query["src"]) 
	// 	search(url.query["q"], url.query["src"], url.fragment)
	// 	// getData(populateHTML.bind(null, url.fragment), url.query["q"]);
	// }
	// else {
		// hideContent(true)
		// $("#emptySearch").show()
	// }

    
}

function onSearchButt() {
	var queries = {};
	queries['input'] = $("#search-input").val();
	queries['source'] = $("#data-source-selection").val()
	if (! queries["input"]) {
		hideContent(true)
		$("#emptySearch").show()
		return false;
	}
	// pushGuai(queries, {"fn":"search","arg":"'" + queries['input'] + "','" + queries['source'] + "'"})
	pushGuai(queries, {"fn":"search","arg":[queries['input'], queries['source']]})
	search(queries['input'], queries['source'], "");
	return false;
}

function pushGuai(queryMap, data, frag) { // Guai because we can't/shouldn't use "pushState" as that's taken
	var uri = new URI();
	if (frag) {
		// this means the queryMap is not an actual query map but a fragment (string)
		uri.hash("#" + queryMap)
	}
	else {
		var queries  = uri.search(true)
		uri.hash("")
		$.extend(queries, queryMap) // add new queries to current ones
		uri.search(queries);
	}
	window.history.pushState(data, null, uri)
}

function popGuai(data) {
	// http://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string
	
	window[data.fn](data.arg[0], data.arg[1])
}

// function synsetClick(e) {
// 	
// 	if (e.target !== e.currentTarget) {
// 		var clickedItem = e.target.id;
// 		alert("Hello " + clickedItem);
// 	}
// 	e.stopPropagation();
// }

function search(query, source, wordID) {
	hideContent(true);
	// $("#wordNotFound").hide();
	$("#ajaxLoader").show();
	$("#search-input").val(query);
	getData(populateHTML.bind(null, wordID), query, source);
}

function hideContent(way) {
	if (way == true) {
		$("#theContent-alt").children().hide()
		$(".kitty").hide()
		$(".schrodinger").show()
	}
	else {
		$(".schrodinger").hide()
		$(".kitty").show()
	}
}

function parseURL(url) {
	var uri = new URI(url)
	pUrl = {} // parsed URL
	pUrl["fragment"] = uri.fragment();
	pUrl["query"] = uri.query(true); // true makes it serialize the shit to data map
	return pUrl
}

function listSynsets(synsets, currentID) {
	var list = $("#synsets");
	list.empty()
	$("#synsets").off();
	$("#synsets").on("click", function(e) {
		if (e.target !== e.currentTarget) {
			e.preventDefault();
			console.log(synsets)
			showWord(synsets[e.target.id]);
			$("#synsets > .active").removeClass("active");
			$("#synsets > #" + e.target.id).addClass("active");
			pushGuai(e.target.id, {"fn":"showWord", "arg":[synsets[e.target.id], ""]}, true)
		}
		e.stopPropagation();
	});
	// potential to break due to multiple places where wordID is assigned as elID (see elsewhere)
	$.each(synsets, function(id, synset) {
		list.append('<a href="#' + id + '" class="list-group-item" id="' + id + '">(' + synset.pos +") " + synString(synset.synset) + '</a>')
	})
	$("#" + currentID).addClass("active")
}

// why the fuck are the arguments other way round when called via bind?! (the one from ajax is evidently always last)
function populateHTML(wordID, wordsArr) {
	// by default, let's display first word
	
	if (typeof wordsArr !== 'undefined' && wordsArr.length > 0) {
		
		hideContent(false);
		// if (wordID == "") {
		if (!wordID) {
			// console.log("slovo nedefinovano")
			wordID = wordsArr[0].id;
		}

		// convert the array with synsets to object where we can reference the synsets by their ids
		var wordsObj = {}
		$.each(wordsArr, function(i, word) {
			wordsObj[word.id] = word;
		})

		listSynsets(wordsObj, wordID);
		showWord(wordsObj[wordID])
	}
	else {
		
		// $("#ajaxLoader").hide();
		hideContent(true);
		$("#wordNotFound").show();
	}
}

function synString(synset) {
	var synString = "";
	$.each(synset, function(i, synWord) {
		if (i < synset.length - 1) {
			comma = ", "
		}
		else {
			comma = ""
		}
		synString += synWord.name + "<sup>" + synWord.meaning + "</sup>" + comma;
	});
	return synString;
}

function showWord(word) {
	
	$("#wordPOS").html(word.pos);
	$("#wordID").html(word.id);
	$("#wordMain").html(synString(word.synset))
	$("#wordDef").html(word.def);

	$("#WNTree").empty();
	$("#paths").empty();
	$("#semGroups > .row").empty();
	// WNTree(word); //not working


	$.each(word.paths, function(i, path) {
		$("#paths").append('<div class="breadcrumbs properties" id="breadcrumb-' + i + '">')
		$.each(path.breadcrumbs, function(j, breadcrumb) {
			
			if (j < path.breadcrumbs.length-1) {
				var arrow = "➡ "
			}
			else {
				var arrow = ""
			}
			// this has potential to break because it's at least a second place where we use word ID as an element ID without additional string (because it's used as search query on click)
			// we might wanna fix this by prepending a uniq-ish string and stripping it later.. if it proves to break anyway
			$("#breadcrumb-" + i).append('<a href="?q=' + breadcrumb.id + '" id="' + breadcrumb.id + '" class="path-item">' + synString(breadcrumb.synset) + '</a> ' + arrow);
		});
	});

	// using one is a shitty way of going around a problem when the event listeners where being exponentially stuck up on each other resulting in a very annoying amount of ajax requests
	// btw i have no idea why this kept happening, but God bless .one() and .off() (they might be slightly redundant, but .one() wasn't enough, somethings looping the shit )
	$("#paths").off()
	$("#paths").one("click", function(e) {
		if (e.target.className == "path-item") {
			e.preventDefault();
			var src = $("#data-source-selection").val();
			search(e.target.id, src);
			pushGuai({input: e.target.id, source: src}, {"fn":"search", "arg":[e.target.id, src]}, false)
		}
		e.stopPropagation();
	});

	$.each(word.children, function(i, relation) {
		if (relation.name !== "hyperCat") {
			$("#semGroups > .row").append('<div class="sem-rels col-lg-4 col-md-6 col-sm-6 col-xs-12" id="semGroup-' + i + '">\n\
			                 <h4 class="yon c-acc b600" id="semGroups-head-' + i + '">' + relation.name + '</h4>\n\
			                 <ul class="list-group" id="list-col-' + i + '">\n'
			                 );

			$.each(relation.children, function(j, synset) {
				$('#list-col-' + i).append('<a href="?q=' + synset.id + '" id="' + synset.id + '" class="list-group-item">' + synString(synset.synset) + '</a>');
			});
		};
	});

	$("#semGroups").off()
	$("#semGroups").one("click", function(e) {
		if (e.target.className == "list-group-item") {
			e.preventDefault();
			var src = $("#data-source-selection").val();
			search(e.target.id, src);
			pushGuai({input: e.target.id, source: src}, {"fn":"search", "arg":[e.target.id, src]})
		}
		e.stopPropagation();
	});
}