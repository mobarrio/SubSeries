Go = function(url_popup) { chrome.tabs.create({url: url_popup, "selected":false}); }

Go2 = function(url_popup,txt) { if(txt.length <= 0) { alert('Se tiene que definir texto para la busqueda!'); return false; } chrome.tabs.create({url: url_popup}); }

showComboSubtitulosES = function(Tags){
	// Representa el Select con Autocomplete
	$( "#tagsSubtitulosES" ).autocomplete({ 
		source: Tags, 
		minLength: 2, 
		select: function(event, ui) 
		{ 
			$('#tagsSubtitulosES').val(ui.item.label); 
			Go(ui.item.value); 
			return false;
		} 
	});
}

showComboEZTV = function(Tags){
	// Representa el Select con Autocomplete
	$( "#tagsEZTV" ).autocomplete({ 
		source: Tags, 
		minLength: 2, 
		select: function(event, ui) 
		{ 
			$('#tagsEZTV').val(ui.item.label); 
			Go(ui.item.value); 
			return false;
		} 
	});
}

ListarSubtitulosES = function(callback){
	if(typeof(Storage)!=="undefined") 
	{ 
		var Tags_subtitulosES = new Array();
		var hoy  = new Date();
		var expirationDays = 7;
		var expiration = 60000 * 60 * 24 * expirationDays;
		var exp;
		if($.jStorage.getTTL("Tags_subtitulosES") > 0){ // NO EXPIRADA
			Tags_subtitulosES = JSON.parse($.jStorage.get("Tags_subtitulosES"));
			showComboSubtitulosES(Tags_subtitulosES);
		} else {
			$.ajax({
				url: "http://www.subtitulos.es/series",
				type: 'GET',
				async:   false,
				cache: false,
				error: function(e) { console.log("Recuperacion de datos erronea:", this); },
				beforeSend: function ( data ) { $(".container").html("<i class='fa fa-refresh fa-spin'></i> Indexando titulos de Subtitulos.es..."); },				
				success: function(res) 
				{
					$(".container").html("");
					var html  = res.responseText;
					var max   = $(html).find('.line0 a').length;
					var domEl = $(html).find('.line0 a');
					domEl.each(function() 
					{
						var href  = 'http://www.subtitulos.es' + $(this).attr('href');
						var label = $(this).text();
						if (href != undefined && href.length > 0 && label != undefined && label.length > 0) 
						{
							var valueToPush =  { };
							valueToPush.label = label;
							valueToPush.value = href;
							Tags_subtitulosES.push(valueToPush);
						}
					});
					$.jStorage.set("Tags_subtitulosES", JSON.stringify(Tags_subtitulosES),{TTL: expiration});
					showComboSubtitulosES(Tags_subtitulosES);
				}
			});
		}
		callback();
	}
	else { alert('Su navegador no soporte HTML5.');  return false; }
}

ShowDate = function(ms) { 
  var now = new Date(parseInt(ms)); 
  var fmt = now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDay() + ' ' + now.getHours()+':'+now.getMinutes()+':'+now.getSeconds(); 
  return(fmt);
} 

ListarShowsEZTV = function(){
	if(typeof(Storage)!=="undefined") { 
		var Tags_EZTV = new Array();
		var hoy  = new Date();
		var expirationDays = 7;
		var expiration = 60000 * 60 * 24 * expirationDays;
		var exp;
		if($.jStorage.getTTL("Tags_EZTV") > 0){ // NO EXPIRADA
			Tags_EZTV = JSON.parse($.jStorage.get("Tags_EZTV"));
			showComboEZTV(Tags_EZTV);
			//$( "#Tags_EZTV" ).autocomplete({ source: Tags_EZTV });
		} else {
			$.ajax({
				url: "http://eztv.it/showlist/",
				type: 'GET',
				async:   false,
				cache: false,
				error: function(e)	{ console.log("Recuperacion de datos erronea:", this); },
				beforeSend: function ( data ) { $(".container").html("<i class='fa fa-refresh fa-spin'></i> Indexando titulos de EZTV..."); },				
				success: function(res) 
				{
					$(".container").html("");
					var html  = res.responseText;
					var domEl = $(html).find('.thread_link');
					var max   = domEl.length;
					domEl.each(function() 
					{
						var href  = 'http://eztv.it' + $(this).attr('href');
						var label = $(this).text();
						if (href != undefined && href.length > 0 && label != undefined && label.length > 0) 
						{
							var valueToPush =  { };
							valueToPush.label = label;
							valueToPush.value = href;
							Tags_EZTV.push(valueToPush);
						}
					});
					$.jStorage.set("Tags_EZTV", JSON.stringify(Tags_EZTV),{TTL: expiration});
					//$( "#Tags_EZTV" ).autocomplete({ source: Tags_EZTV });
					showComboEZTV(Tags_EZTV);
				}
			});
		}
	}
	else { alert('Su navegador no soporte HTML5.');  return false; }
}

$(document).ready(function() 
{
	ListarSubtitulosES(ListarShowsEZTV);

	$('#idUpdated').html("<span id='flushcache' class='btn btn-danger btn-xs' style='cursor:pointer;margin-top:1em;'>Flush cache</span>");

	$("#frmSeeker").on('click','#flushcache',function(evt){
		evt.preventDefault();
		console.log("Flush Cache");
		$.jStorage.flush();
		console.log("Reindexa webs");
		ListarSubtitulosES(ListarShowsEZTV);
	});

	$('#tagsEZTV').bind('keypress', function(e) {
		// event.preventDefault();
		$("#tagsSubtitulosES").autocomplete( "search" , $('#tagsEZTV').val() );
        // if(e.keyCode==13) { }
		
	});
	$('#tagsSubtitulosES').bind('keypress', function(e) {
		// event.preventDefault();
		$("#tagsEZTV").autocomplete( "search" , $('#tagsSubtitulosES').val() );
        // if(e.keyCode==13) { }
		
	});
	
	
});
