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
	$("#wordMain").html(word.synset[0].name);
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

	$.each(word.children, function(i, relations) {
		if (relations.name !== "hyperCat") {
			$("#semGroups").append('<div class="sem-rels col-lg-4 col-md-6 col-xs-12" id="semGroup-' + i + '">\n\
			                 <ul class="list-group" id="list-col-' + i + '">\n\
			                 <li class="list-group-item head" id="semGroups-head-' + i + '">\
			                 ' + relations.name + '</li>'
			                 );
			$.each(relations.children, function(j, synsets) {
				$('#list-col-' + i).append('<li class="list-group-item">' + synsets.synset[0].name + '</li>');
			});
		};
	});
}