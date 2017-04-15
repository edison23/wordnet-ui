function getData(coalback, input) {
	console.log(input)
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
function search() {
	var input = $("#search-input").val();
	// window.history.pushState(input, "Title", "?q=" + input)
	getData(populateHTML.bind(null), input);
}

function parseURL(url) {
	var uri = new URI(url)
	parsedUrl = {}
	parsedUrl["fragment"] = uri.fragment();
	parsedUrl["query"] = uri.query();
	return parseURL
}

function listSynsets(synsets) {
	// var address = URI.parse(window.location.href);
	// var query = URI.parseQuery(address.query);
	// // console.log(URI.fragment(window.location.href));
	// console.log(query)

	var list = $("#synsets");
	list.empty()
	$.each(synsets, function(id, synset) {
		list.append('<a href="#' + id + '" class="list-group-item" id="synsetItem-' + id + '">' + synString(synset.synset) + '</a>')
		$("#synsetItem-" + id).click(function() {
			showWord(synset)
		})
	})

}

function populateHTML(wordsArr) {
	// convert the array with synsets to object where we can reference the synsets by their ids
	var wordsObj = {}
	$.each(wordsArr, function(i, word) {
		wordsObj[word.id] = word;
	})

	listSynsets(wordsObj);
	// zjistit ID prvniho synsetu, to poslat do adresy a pak zavolat clickSynset, aby zobrazil spravne slovo
	showWord(wordsArr[3])
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
	console.log(word);
	$("#wordPOS").html(word.pos);
	$("#wordID").html(word.id);
	$("#wordMain").html(synString(word.synset))
	$("#wordDef").html(word.def);

	$("#paths").empty();
	$("#semGroups").empty();

	$.each(word.paths, function(i, path) {
		// $("#paths").append('<div class="btn-group btn-breadcrumb breadcrumbs" id="breadcrumbs-' + i + '">')
		// $.each(path.breadcrumbs, function(j, breadcrumb) {
		// 	$("#breadcrumbs-" + i).append('<a href="#" class="btn btn-default">' + breadcrumb.name + '</a>');
		// })
		$("#paths").append('<div class="breadcrumbs properties" id="breadcrumb-' + i + '">')
		$.each(path.breadcrumbs, function(j, breadcrumb) {
			// $("#breadcrumb-" + i).append('<a href="#">' + breadcrumb.name + '</a> > ');
			$("#breadcrumb-" + i).append('<a href="#">' + synString(breadcrumb.synset) + '</a> > ');
		});
	});

	// <ul class="list-group" id="list-col-' + i + '">\n\
     // <li class="list-group-item head" id="semGroups-head-' + i + '">\
     // ' + relations.name + '</li>'
			                 
	$.each(word.children, function(i, relations) {
		if (relations.name !== "hyperCat") {
			$("#semGroups").append('<div class="sem-rels col-lg-4 col-md-6 col-sm-6 col-xs-12" id="semGroup-' + i + '">\n\
			                 <h4 class="yon c-acc b600" id="semGroups-head-' + i + '">' + relations.name + '</h4>\n\
			                 <ul class="list-group" id="list-col-' + i + '">\n'
			                 );
			// if (i % 2 !== 0) {
			// 	$()
			// }
			$.each(relations.children, function(j, synsets) {
				$('#list-col-' + i).append('<li class="list-group-item">' + synsets.synset[0].name + '</li>');
			});
		};
	});
}