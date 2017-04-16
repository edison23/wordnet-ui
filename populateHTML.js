function getData(coalback, input) {
	$.ajax({
	  url: "kolo-server.json",
	  // url: "https://nlp.fi.muni.cz/~xrambous/fw/abulafia/wncz?action=jsonvis&query=" + input,
	  beforeSend: function(xhr){
	    if (xhr.overrideMimeType)
	    {
	      xhr.overrideMimeType("application/json");
	    }
	  },
	dataType: 'json',
	success: coalback,
	error: function() {
		console.log("Way hay, what shall we do with the drunken sailor?")
	},
	complete: function(e, xhr, settings) {
		console.log("status code: ", e.status )
	},
	});
}

function onLoad() {
	var url = parseURL(window.location.href)
	if (url.query["q"]) {
		$("#search-input").val(url.query["q"]) // is this correct way of doing it? it's Javascript, after all...
		getData(populateHTML.bind(null, url.fragment), url.query["q"]);
	}
	else {
		$("#wordMain").html("Hledej, šmudlo.")
	}
}

function search() {
	var input = $("#search-input").val();
	window.history.pushState(input, "Title", "?q=" + input)
	getData(populateHTML.bind(null, ""), input);
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
		list.append('<a href="#' + id + '" class="list-group-item" id="synsetItem-' + id + '">' + synString(synset.synset) + '</a>')
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

	$("#paths").empty();
	$("#semGroups > .row").empty();

	$.each(word.paths, function(i, path) {
		$("#paths").append('<div class="breadcrumbs properties" id="breadcrumb-' + i + '">')
		$.each(path.breadcrumbs, function(j, breadcrumb) {
			$("#breadcrumb-" + i).append('<a href="#">' + synString(breadcrumb.synset) + '</a> > ');
		});
	});

	$.each(word.children, function(i, relations) {
		if (relations.name !== "hyperCat") {
			$("#semGroups > .row").append('<div class="sem-rels col-lg-4 col-md-6 col-sm-6 col-xs-12" id="semGroup-' + i + '">\n\
			                 <h4 class="yon c-acc b600" id="semGroups-head-' + i + '">' + relations.name + '</h4>\n\
			                 <ul class="list-group" id="list-col-' + i + '">\n'
			                 );
			$.each(relations.children, function(j, synsets) {
				$('#list-col-' + i).append('<li class="list-group-item">' + synsets.synset[0].name + '</li>');
			});
		};
	});
}