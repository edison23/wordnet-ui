function getData(coalback, input, source) {
		console.log(source)
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
		console.log(e)
		hideContent(true);
		$("#ajaxError").show()
	},
	complete: function(e, xhr, settings) {
		console.log("Ajax operation completed with status code " + e.status )
	},
	});
}

function onLoad() {
	var url = parseURL(window.location.href)
	if (url.query["q"]) { // is this correct way of doing it? it's Javascript, after all...
		$("#search-input").val(url.query["q"]) 
		$("#data-source-selection").val(url.query["src"]) 
		search(url.query["q"], url.query["src"], url.fragment)
		// getData(populateHTML.bind(null, url.fragment), url.query["q"]);
	}
	else {
		hideContent(true)
		$("#emptySearch").show()
	}
}

function onSearchButt() {
	var input = $("#search-input").val();
	var source = $("#data-source-selection").val()
	window.history.pushState(input, "Title", "?q=" + input)
	window.history.pushState(source, "asdfsadf", "?src=" + source)
	search(input, source, "");
}

function search(query, source, fragment) {
	hideContent(true);
	// $("#wordNotFound").hide();
	$("#ajaxLoader").show();
	getData(populateHTML.bind(null, fragment), query, source);
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
	$.each(synsets, function(id, synset) {
		list.append('<a href="#' + id + '" class="list-group-item" id="synsetItem-' + id + '">(' + synset.pos +") " + synString(synset.synset) + '</a>')
		$("#synsetItem-" + id).click(function() {
			showWord(synset)
			$("#synsets > .active").removeClass("active");
			$(this).addClass("active")
		})
	})
	$("#synsetItem-" + currentID).addClass("active")
}

// why the fuck are the arguments other way round when called via bind?! (the one from ajax is evidently always last)
function populateHTML(wordID, wordsArr) {
	// by default, let's display first word
	// console.log("delka ", wordsArr.length)
	if (typeof wordsArr !== 'undefined' && wordsArr.length > 0) {
		// console.log("Word found")
		hideContent(false);
		if (wordID == "") {
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
		// console.log("Word not found")
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
	// console.log(word);
	$("#wordPOS").html(word.pos);
	$("#wordID").html(word.id);
	$("#wordMain").html(synString(word.synset))
	$("#wordDef").html(word.def);

	$("#WNTree").empty();
	$("#paths").empty();
	$("#semGroups > .row").empty();
	WNTree(word); //not working


	$.each(word.paths, function(i, path) {
		$("#paths").append('<div class="breadcrumbs properties" id="breadcrumb-' + i + '">')
		$.each(path.breadcrumbs, function(j, breadcrumb) {
			// console.log(breadcrumb)
			if (j < path.breadcrumbs.length-1) {
				var arrow = "➡ "
			}
			else {
				var arrow = ""
			}
			$("#breadcrumb-" + i).append('<a href="?q=' + breadcrumb.id + '">' + synString(breadcrumb.synset) + '</a> ' + arrow);
		});
	});

	$.each(word.children, function(i, relation) {
		if (relation.name !== "hyperCat") {
			$("#semGroups > .row").append('<div class="sem-rels col-lg-4 col-md-6 col-sm-6 col-xs-12" id="semGroup-' + i + '">\n\
			                 <h4 class="yon c-acc b600" id="semGroups-head-' + i + '">' + relation.name + '</h4>\n\
			                 <ul class="list-group" id="list-col-' + i + '">\n'
			                 );
			$.each(relation.children, function(j, synset) {
				$('#list-col-' + i).append('<a href="?q=' + synset.id + '" class="list-group-item">' + synString(synset.synset) + '</a>');
			});
		};
	});
}