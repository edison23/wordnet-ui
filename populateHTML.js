function getData(coalback) {
	$.ajax({
	  url: "kolo.json",
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

getData(populateHTML.bind(null));

function populateHTML(word) {
	// console.log(word);
	$("#wordPOS").html(word.pos);
	$("#wordID").html(word.id);
	$.each(word.synset, function(i, synset) {
		// JA TO JEBEM
		// $("#wordMain").append(synset.name);
		// if (($.trim($("#wordMain").text()).length < 11) && (i < word.synset.length-1)) {
		// 	$("#wordMain").append(',');
		// } 
		// elif ($.trim($("#wordMain").text()).length > 11) {
		// 	$("#wordMain").append('…');
		// }
		// console.log(i)
		// $("#wordMain").append(synset.name);
		// if (i < word.synset.length-1) {
		// 	$("#wordMain").append(', ');
		// }
		if (i < word.synset.length-1) {
			$("#wordMain").append(synset.name + ", ");
		}
		else {
			$("#wordMain").append(synset.name);
		}
	});
	// console.log($.trim($("#wordMain").text()).length);
	$("#wordDef").html(word.def);

	
	$.each(word.paths, function(i, path) {
		// $("#paths").append('<div class="btn-group btn-breadcrumb breadcrumbs" id="breadcrumbs-' + i + '">')
		// $.each(path.breadcrumbs, function(j, breadcrumb) {
		// 	$("#breadcrumbs-" + i).append('<a href="#" class="btn btn-default">' + breadcrumb.name + '</a>');
		// })
		$("#paths").append('<div class="breadcrumbs properties" id="breadcrumb-' + i + '">')
		$.each(path.breadcrumbs, function(j, breadcrumb) {
			$("#breadcrumb-" + i).append('<a href="#">' + breadcrumb.name + '</a> > ');
		});
	})

	// <ul class="list-group" id="list-col-' + i + '">\n\
     // <li class="list-group-item head" id="semGroups-head-' + i + '">\
     // ' + relations.name + '</li>'
			                 
	$.each(word.children, function(i, relations) {
		if (relations.name !== "hyperCat") {
			$("#semGroups > .row").append('<div class="sem-rels col-lg-4 col-md-6 col-xs-12" id="semGroup-' + i + '">\n\
			                 <h4 class="yon c-acc b600" id="semGroups-head-' + i + '">' + relations.name + '</h4>\n\
			                 <ul class="list-group" id="list-col-' + i + '">\n'
			                 );
			$.each(relations.children, function(j, synsets) {
				$('#list-col-' + i).append('<li class="list-group-item">' + synsets.synset[0].name + '</li>');
			});
		};
	});
}