function getData(coalback, input, source) {
	$.ajax({
	  url: "kolo-server.json",
	  // url: "https://nlp.fi.muni.cz/~xrambous/fw/abulafia/" + source + "?action=jsonvis&query=" + input,
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
	// stuff that are needed on document ready
	$("#text-rep").click(function() {
    	$("#WNTree").hide();
        $("#theContent").show();
    });
    $("#dendr-rep").click(function() {
    	$("#theContent").hide();
    	$("#WNTree").show();
    });

    $('[data-toggle="tooltip"]').tooltip(); 

    // preventing default submit on search form
    $("#search").on("submit", function(e) {
		e.preventDefault();
    	onSearchButt();
    })

    // event listener for back/forth browser movement
	window.addEventListener('popstate', function(e) {
		popGuai(e.state)
	});

	// initial decision whether we show empty start page or start searching (in case user wants to restore the page)
	// get the URL queries (search) and fragment (hash)
	var uri = new URI();
	var queries  = uri.search(true)
	var fragment = uri.fragment();
	
	// default resource (wncz)
	if (! queries["source"]) {
		$("#data-source-selection").val("wncz")
	}
	else {
		$("#data-source-selection").val(queries["source"])
	}

	if (! queries["input"]) {
		hideContent(true)
		$("#emptySearch").show()
	}
	else {
		$("#search-input").val(queries["input"])
		search(queries["input"], queries["source"], fragment)
	}    
}

// run on search button press
function onSearchButt() {
	var queries = {};
	queries['input'] = $("#search-input").val();
	queries['source'] = $("#data-source-selection").val()
	
	// if user is dumb and pressed search on empty input
	if (! queries["input"]) {
		hideContent(true)
		$("#emptySearch").show()
		return false;
	}
	pushGuai(queries, {"fn":"search","arg":[queries['input'], queries['source']]})
	search(queries['input'], queries['source'], "");
	return false;
}

// pushState stuff to historyAPI of the browser on clicks
// queryMap = dict or string; data = dict (with function name which is to be run on popState and its args in array); frag = bool to detect whether we're passing just a fragment (see below)
// Guai for state because we can't/shouldn't use "pushState" as that's taken
function pushGuai(queryMap, data, frag) { 
	var uri = new URI();
	
	// this means the queryMap is not an actual query map but a fragment (ie. string); happens when clicking synset in sidebar
	if (frag) {
		uri.hash("#" + queryMap)
	}
	else {
		var queries  = uri.search(true)
		uri.hash("")
		$.extend(queries, queryMap) // add new queries to current ones
		uri.search(queries);
	}

	// we should pass some string into the "title" param, but as of 2017 everybody ignores it
	window.history.pushState(data, null, uri)
}

// http://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string
// seems very dirty but there might not be a better way as what we need is this:
// when returning to saved state, it is necessary to rerun the functions that got us into that state (search, showWord, etc.).
// This wouldn't be a problem if we were willing to do an ajax request (search) on every move, but that's nonsense, since we have mostly all the data we need. (but not trivially accessible, probably)
// One solution would be a global variable, but so far we got around without them, so storing the data in the browser history seems like a better idea. This is, however, subject to be discussed and changed for better, let's hope.
// data = dict from browser historyAPI
function popGuai(data) {
	if (data) {
		window[data.fn](data.arg[0], data.arg[1])
	}
}

// show/hide some content and proceed with the ajax call
// query = str, source = str (with WN ID), wordID = str (with the hash/fragment)
function search(query, source, wordID) {
	hideContent(true);
	$("#ajaxLoader").show();
	$("#search-input").val(query);
	getData(populateHTML.bind(null, wordID), query, source);
}

// hide/show the main content when search, show loader...
// way = bool (whether we're going from hiding main content or to it, not sure which is which anymore)
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

// write down the list of found synsets
// synsets = dict, currentID = string
function listSynsets(synsets, currentID) {

	// 1st empty the place to prevent cumulating the lines
	var list = $("#synsets");
	list.empty()
	
	// delete all existing and append a new event listener to the whole div and let the clicks from links propagate; 
	// also prevent default (click) and stop them from further propagation; 
	// on click remove the .active class from wherever it is and append it to the clicked link; 
	// then push new state
	$("#synsets").off();
	$("#synsets").on("click", function(e) {
		if (e.target !== e.currentTarget) {
			e.preventDefault();
			showWord(synsets[e.target.id]);
			$("#synsets > .active").removeClass("active");
			$("#synsets > #" + e.target.id).addClass("active");
			pushGuai(e.target.id, {"fn":"showWord", "arg":[synsets[e.target.id], ""]}, true);
		}
		e.stopPropagation();
	});

	// potential to break due to multiple places where wordID is assigned as elID (see elsewhere)
	$.each(synsets, function(id, synset) {
		list.append('<a href="#' + id + '" class="list-group-item" id="' + id + '">(' + synset.pos +") " + synString(synset.synset) + '</a>')
	})

	// add the active class on first load (when restoring state or initially after search)
	$("#" + currentID).addClass("active")
}

// callback from ajax;
// converts returned array to dict, lists synsets in sidebar and then shows word in main
// wordID = string (with ID, usually empty), wordsArr = arr from ajax
// why the fuck are the arguments other way round when called via bind?! (the one from ajax is evidently always last)
function populateHTML(wordID, wordsArr) {
	// by default, let's display first word
	
	if (typeof wordsArr !== 'undefined' && wordsArr.length > 0) {
		hideContent(false);
		
		// this usually means that user hasn't clicked anything in sidebar yet
		if (!wordID) {
			wordID = wordsArr[0].id;
		}

		// convert the array with synsets to object/dick where we can reference the synsets by their ids
		var wordsObj = {}
		$.each(wordsArr, function(i, word) {
			wordsObj[word.id] = word;
		})

		// write synsets to sidebar
		listSynsets(wordsObj, wordID);

		// write word details into main
		showWord(wordsObj[wordID])
	}
	else {
		hideContent(true);
		$("#wordNotFound").show();
	}
}

// convert array with synsets into a string delimited by ", "
// synset = array
function synString(synset, linking) {
	var synString = "";
	$.each(synset, function(i, synWord) {
		if (i < synset.length - 1) {
			comma = ", "
		}
		else {
			comma = ""
		}

		if (linking) {
			// beware of the c-acc class, it's just an ugly hack for main word for now
			synString += "<a href=\"?input=" + synWord.name + "\" id=\"" + synWord.name + "\" class=\"synset-links\">" + synWord.name + "</a><sup>" + synWord.meaning + "</sup>" + comma;
		}
		else {
			synString += synWord.name + "<sup>" + synWord.meaning + "</sup>" + comma;
		}
	});
	return synString;
}

// let's show the details of selected word!
// word = object/dict
function showWord(word) {
	WNTree(word);
	$("#wordPOS").html(word.pos);
	$("#wordID").html("<a href=\"?input=" + word.id + "\" id=\"" + word.id + "\" class=\"synset-links\">" + word.id + "</a>");
	// $("#wordID").html(word.id);
	$("#wordMain").html(synString(word.synset, true));
	$("#wordDef").html(word.def);

	// $("#WNTree").empty();
	$("#paths").empty();
	$("#semGroups > .row").empty();
	
	// call to the WNTree which is yet to be made alive again
	// WNTree(word); //not working

	// write the path (breadcrumbs) to the word (this looks a bit to similiar with the synString fc)
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
			$("#breadcrumb-" + i).append('<a href="?input=' + breadcrumb.id + '" id="' + breadcrumb.id + '" class="path-item">' + synString(breadcrumb.synset) + '</a> ' + arrow);
		});
	});

	// event listeren again (for paths)
	// using .one() is a shitty way of going around a problem when the event listeners where being exponentially stuck up on each other resulting in a very annoying amount of ajax requests
	// btw i have no idea why this kept happening, but God bless .one() and .off() (they might be slightly redundant, but .one() wasn't enough, somethings looping the shit )
	$("#theContent").off()
	$("#theContent").on("click", function(e) {
		console.log("neco se tu sere")
		if (   e.target.className == "path-item" 
		    || e.target.className == "synset-links" 
		    || e.target.className == "list-group-item") {
			e.preventDefault();
			var src = $("#data-source-selection").val();
			console.log("ale proslo to", e.target.id, src)
			search(e.target.id, src);
			pushGuai({input: e.target.id, source: src}, {"fn":"search", "arg":[e.target.id, src]}, false)
		}
		e.stopPropagation();
	});

	// write the columns with related synsets
	$.each(word.children, function(i, relation) {
		if (relation.name !== "hyperCat") {
			$("#semGroups > .row").append('<div class="sem-rels col-lg-4 col-md-6 col-sm-6 col-xs-12" id="semGroup-' + i + '">\n\
				<h4 class="yon c-acc b600" id="semGroups-head-' + i + '">' + relation.name + '</h4>\n\
				<ul class="list-group" id="list-col-' + i + '">\n'
				);

			$.each(relation.children, function(j, synset) {
				$('#list-col-' + i).append('<a href="?input=' + synset.id + '" id="' + synset.id + '" class="list-group-item">' + synString(synset.synset) + '</a>');
			});
		};
	});

	// event listeren again (for related synsets)
	// $("#semGroups").off()
	// $("#semGroups").one("click", function(e) {
	// 	if (e.target.className == "list-group-item") {
	// 		e.preventDefault();
	// 		var src = $("#data-source-selection").val();
	// 		search(e.target.id, src);
	// 		pushGuai({input: e.target.id, source: src}, {"fn":"search", "arg":[e.target.id, src]})
	// 	}
	// 	e.stopPropagation();
	// });
}