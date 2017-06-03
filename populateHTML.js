function main() {
	var synsets = {}
	var uri = new URI();

	function initialSetup() {
		// just for cosmetics of the code, i guess
		var queries	= uri.search(true)
		var fragment = uri.fragment();
	
		if ($(window).width() > 768) {
			setElDimensions($("#synsets"))
			setElDimensions($("#theContent"))
			// setElDimensions($("#container"))
			$("#synsets, #theContent").perfectScrollbar();
			// $('#synsets').perfectScrollbar('update');
		}
	
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
	
		// default resource (wncz)
		if (! queries.source) {
			$("#data-source-selection").val("wncz")
			uri.setSearch({source: "wncz"})
		}
		else {
			$("#data-source-selection").val(queries.source)
		}

		// set default vis
		if (! queries.vis) {
			uri.setSearch({vis: "text"})
		}
	
		// initial push state
		pushGuai()
	
		// initial decision whether we show empty start page or start searching (in case user wants to restore the page)
		// nothing to search for, show default screen
		if (! queries.input) {
			hideContent(true)
			$("#emptySearch").show()
		}
		else {
			$("#search-input").val(queries.input)
			search()
		}
	}

	function getData(coalback) {
		$.ajax({
			url: "kolo-server.json",
			// url: "https://nlp.fi.muni.cz/~xrambous/fw/abulafia/" + source + "?action=jsonvis&query=" + input,
			beforeSend: function(xhr){
				// we should encode it first
				console.log("https://nlp.fi.muni.cz/~xrambous/fw/abulafia/" + uri.search(true).source + "?action=jsonvis&query=" + uri.search(true).input)
				if (xhr.overrideMimeType)
				{
					xhr.overrideMimeType("application/json");
				}
			},
		dataType: 'json',
		success: coalback,
		error: function(e, xhr, settings) {
			console.log("Ajax error:", e)
			hideContent(true);
			$("#ajaxError").show()
		},
		complete: function(e, xhr, settings) {
			console.log("Ajax operation completed with status code " + e.status )
		},
		});
	}

	// converting ems to px: https://chrissilich.com/blog/convert-em-size-to-pixels-with-jquery/
	function setElDimensions(el) {
		var topOffset = 0, safetyConstant = 0;
		if ($(window).width() > 768) {
			topOffset = $(el).offset().top;
			safetyConstant = 1*(parseFloat($("body").css("font-size")))
		}
		// $(el).css({"width": "100%"})
		el.height($(window).height()-(topOffset+safetyConstant));
	}

	// run on search button press
	function onSearchButt() {
		// var uri = new URI();
		// var queries = uri.search(true)
		// console.log(queries)
		uri.setSearch({input: $("#search-input").val()});
		uri.setSearch({source: $("#data-source-selection").val()});
		// queries['input'] = $("#search-input").val();
		// queries['source'] = $("#data-source-selection").val()
		
		// if user is dumb and pressed search on empty input
		if (! uri.search(true).input) {
			hideContent(true)
			$("#emptySearch").show()
			return false;
		}
		// wrong
		// pushGuai(queries)
		
		search();
		// why is this return false here?
		return false;
	}

	// updateURL(newParameters) {
	// 	// this means the newParameters is not an actual query map but a fragment (ie. string); happens when clicking synset in sidebar
	// 	if (typeof(newParameters) == "string")
	// 		uri.hash(newParameters)
	// 	else {
	// 		$.extend(newParameters, queries)
	// 		uri.search(newParameters)
	// 	}
	// }

	// pushState stuff to historyAPI of the browser on clicks
	// newParameters = dict or string; 
	// Guai for state because we can't/shouldn't use "pushState" as that's taken
	function pushGuai(newParameters) { 
		// if (newParameters) {
		// 	updateURL(newParameters)
		// }
		// we should pass some string into the "title" newParameters, but as of 2017 everybody ignores it
		var title = "NSWF - search " + uri.search(true).input + " in " + uri.search(true).source + "(" + uri.search(true).vis + ")"
		$(document).prop('title', title);
		window.history.pushState({queries: uri.search(true), fragment: uri.fragment()}, null, uri)
	}

	// http://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string
	// seems very dirty but there might not be a better way as what we need is this:
	// when returning to saved state, it is necessary to rerun the functions that got us into that state (search, showWord, etc.).
	// This wouldn't be a problem if we were willing to do an ajax request (search) on every move, but that's nonsense, since we have mostly all the data we need. (but not trivially accessible, probably)
	// One solution would be a global variable, but so far we got around without them, so storing the data in the browser history seems like a better idea. This is, however, subject to be discussed and changed for better, let's hope.
	// might be doable via switch and checking for string to know what function we want to run.. there's not that many of them
	// data = dict from browser historyAPI
	function popGuai(data) {
		// if (data) {
		// 	// console.log(data.fn, data.arg[0], data.arg[1])
		// 	if (data.arg[2]) {
		// 		window[data.fn](data.arg[0], data.arg[1], data.arg[2])
		// 	}
		// 	else if (data.arg[1]) {
		// 		window[data.fn](data.arg[0], data.arg[1])
		// 	}
		// }
		// var addrBarQueries = uri.search(true)
		var historicQueries = data.queries;
		var historicFragment = data.fragment;

		if ((historicQueries.input !== uri.search(true).input) || (historicQueries.source !== uri.search(true).source)) {
			uri.setSearch(historicQueries);
			search();
		}
		else if (historicQueries.vis !== uri.search(true).vis) {
			uri.setSearch(historicQueries);
			renderView();
		}
		else if (historicFragment !== uri.fragment()) {
			uri.fragment(historicFragment);
			renderView();
		}
		// console.log(data._parts.path)
		console.log(data.queries, data.fragment)
	};

	// show/hide some content and proceed with the ajax call
	// query = str, source = str (with WN ID), wordID = str (with the hash/fragment)
	function search() {
		hideContent(true);
		$("#ajaxLoader").show();
		$("#search-input").val(uri.search(true).input);
		getData(populateHTML.bind(null));
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

	// function getQueries() {
	// 	var uri = new URI;
	// 	return {"blah": "debil"};
	// 	// return uri.search(true);

	// }

	function updateSynsetList() {
		$("#synsets > .active").removeClass("active");
		$("#synsets > #" + uri.fragment()).addClass("active");
	}

	// write down the list of found synsets
	// synsets = dict, currentID = string
	function listSynsets() {

		// 1st empty the place to prevent cumulating the lines
		var list = $("#synsets");
		list.empty()
		
		// delete all existing and append a new event listener to the whole div and let the clicks from links propagate; 
		// also prevent default (click) and stop them from further propagation; 
		// on click remove the .active class from wherever it is and append it to the clicked link; 
		// then push new state
		$("#synsets, #settings").off();
		$("#synsets, #settings").on("click", function(e) {
			if (e.target !== e.currentTarget) {
				e.preventDefault();
				// var uri = new URI; //this is rather disgusting way of passing the right parametr from url to function
				// var vis = queries.vis
				// var hash = uri.fragment ? uri.fragment() : currentID;
				// var hash = uri.fragment()
				// console.log(hash)
				// the problem here is that setting queries erases the hash... -- is it? i dont think so...
				if (e.target.id == "text-rep") {
					if (uri.search(true).vis !== "text") {
						uri.setSearch({vis:"text"})
						renderView()
						// console.log("vis->text", synsets[hash])
						// pushGuai({"vis":"text"});
					}
				}
				else if (e.target.id == "dendr-rep") {
					if (uri.search(true).vis !== "graph") {
						// console.log("vis->graph", synsets[hash])
						uri.setSearch({vis:"graph"})
						renderView()
						// pushGuai({"vis":"graph"}, {"fn":"renderView", "arg":[synsets[hash], "graph"]});
					}
				}
				else {
					// renderView(synsets[e.target.id], vis);
					// $("#synsets > .active").removeClass("active");
					// $("#synsets > #" + e.target.id).addClass("active");
					uri.fragment(e.target.id)
					updateSynsetList()
					renderView();
					// console.log("kliklo se na synset", vis)
					// pushGuai(e.target.id, {"fn":"updateSynsetList", "arg":[synsets, e.target.id, vis]}, true);
					// pushGuai(hash)
				}
				// renderView(synsets[e.target.id], vis);
				// $("#synsets > .active").removeClass("active");
				// $("#synsets > #" + e.target.id).addClass("active");
				// pushGuai(e.target.id, {"fn":"renderView", "arg":[synsets[e.target.id], vis]}, true);
			}
			e.stopPropagation();
		});

		// add eventlistener for switcher
		// $("#settings").off();
		// $("#settings").on("click", function(e) {
		// 	console.log(renderView(synsets[e.target.id]))
		// 	if (e.target !== e.currentTarget) {
		// 		e.preventDefault();
		// 		if (e.target.id == "text-rep") {
		// 			renderView(synsets[e.target.id], "text")
		// 		}
		// 		else {
		// 			renderView(synsets[e.target.id], "graph")
		// 		}
		// 	}
		// 	e.stopPropagation();
		// });

		// potential to break due to multiple places where wordID is assigned as elID (see elsewhere)
		$.each(synsets, function(id, synset) {
			list.append('<a href="#' + id + '" class="list-group-item" id="' + id + '">(' + synset.pos +") " + synString(synset.synset) + '</a>')
		})

		// add the active class on first load (when restoring state or initially after search)
		$("#" + uri.fragment()).addClass("active")
	}

	// callback from ajax;
	// converts returned array to dict, lists synsets in sidebar and then shows word in main
	// wordID = string (with ID, usually empty), wordsArr = arr from ajax
	// why the fuck are the arguments other way round when called via bind?! (the one from ajax is evidently always last)
	function populateHTML(wordsArr) {
		// console.log(vis)
		
		// by default, let's display first word
		if (typeof wordsArr !== 'undefined' && wordsArr.length > 0) {
			hideContent(false);
			
			// convert the array with synsets to object/dick where we can reference the synsets by their ids

			$.each(wordsArr, function(i, obj) {
				synsets[obj.id] = obj;
			})

			// number of found synsets (in case we need it)
			// console.log(Object.keys(synsets).length);

			// this usually means that user hasn't clicked anything in sidebar yet
			// or the ID is invalid for some reason (we should report that)
			// it's kinda breaking the app anyway, because the id doesnt get pushed to the URL automatically. BUG I guess
			// var wordID = ""
			if (!uri.fragment() || !synsets[uri.fragment()]) {
				console.log("ID of synset not found or the ID is invalid")
				// wordID = wordsArr[0].id;
				uri.fragment(wordsArr[0].id)
			}

			// var word = synsets[uri.fragment()]

			// pushGuai(wordID, {"fn":"renderView", "arg":[word, vis]}, true)
			

			// write synsets to sidebar
			listSynsets();

			// write word details into main
			// showWord(synsets[wordID])
			renderView()
		}
		else {
			hideContent(true);
			$("#wordNotFound").show();
			pushGuai()
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

	function renderView() {
		pushGuai()
		if (uri.search.vis == "text" || uri.search.vis == undefined) {
			$("#WNTree").hide();
			// pushGuai({"vis": "text"});
			$("#theContent").show();
			showWord(synsets[uri.fragment()]);
		}
		else if (uri.search.vis == "graph") {
			$("#theContent").hide();
			// pushGuai({"vis": "graph"});
			$("#WNTree").show();
			WNTree(synsets[uri.fragment()]);
		}
	}

	// let's show the details of selected word!
	// word = object/dict
	function showWord(word) {
		// WNTree(word);
		$("#wordPOS").html(word.pos);
		$("#wordID").html("<a href=\"?input=" + word.id + "\" id=\"" + word.id + "\" class=\"synset-links\">" + word.id + "</a>");
		// $("#wordID").html(word.id);
		$("#wordMain").html(synString(word.synset, true));
		$("#wordDef").html(word.def);

		// $("#WNTree").empty();
		$("#paths").empty();
		$("#semGroups > .row").empty();
		
		

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

		// event listeners
		// using .one() is a shitty way of going around a problem when the event listeners where being exponentially stuck up on each other resulting in a very annoying amount of ajax requests
		// btw i have no idea why this kept happening, but God bless .one() and .off() (they might be slightly redundant, but .one() wasn't enough, somethings looping the shit )
		$("#theContent").off()
		$("#theContent").on("click", function(e) {
			if (   e.target.className == "path-item" 
				|| e.target.className == "synset-links" 
				|| e.target.className == "list-group-item") {
				e.preventDefault();
				var src = $("#data-source-selection").val();
				uri.setSearch({input: e.target.id, source: src})
				search();
				// pushGuai({input: e.target.id, source: src}, {"fn":"search", "arg":[e.target.id, src]}, false)
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

	initialSetup();
}