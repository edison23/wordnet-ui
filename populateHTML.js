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
	  data: data,
	  success: function(data) {
	  	console.log(data);
	  }
	});
}

// pak nekde zavolam tu getData() a dam ji call na funkci populateHTML asi nejak
function populateHTML(data) {
	// data = getData()
	console.log(data);
}