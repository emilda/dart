var map;
var marker;
var geocoder;
var insuredlist;
var addy;
function GoogleMapInit(id, latitude, longitude, address) 
{    
   var latlng = new google.maps.LatLng(latitude, longitude);
   var latlngMarker = new google.maps.LatLng(latitude, longitude);
   var mapOptions = 
   {        
      center: latlng,        
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,        
      scrollwheel: true,
      streetViewControl: false,        
      zoom: 9,
      zoomControl: true,        
      zoomControlOptions: { style: google.maps.ZoomControlStyle.SMALL }
   }
   element = document.getElementById(id);
   map = new google.maps.Map(element, mapOptions);   
   marker = new google.maps.Marker({ draggable:true, map: map, position: latlngMarker});   
   geocoder = new google.maps.Geocoder();
   geocoder.geocode({'address': address}, function(results, status) 
   {
      if (status == google.maps.GeocoderStatus.OK) 
      {
         map.setCenter(results[0].geometry.location);
      } 
      else 
      {
        //    alert("Geocode was not successful: " + status);
      }
   });
}
//geocode function
function GoogleMapcall()
{
	addy = document.getElementById("Editbox1").value;
	GoogleMapRecall(addy);
}

function GoogleMapRecall(address) {
	//alert("new");
	//alert(address); 
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) 
        {
            map.setCenter(results[0].geometry.location); 
            map.setZoom(14);
            var cityCircle = new google.maps.Circle({
                strokeColor: '#496775',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#496775',
                fillOpacity: 0.15,
                map: map,
                center: results[0].geometry.location,
                radius: Math.sqrt(10000) * 15
              });
            callFindClaimSvcByzip();
        } 
        else 
        {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}

function callFindClaimSvcByzip()
{
        //alert("In claim");
		var claimSvcURL = "/custbypostalcode/"+ addy;
        var returnData = "";
        $.ajax({
            type: "GET",
            dataType: 'jsonp',
			jsonp: 'callback',
			jsonpCallback: 'jsonpCallback',
            async: true,
            url: claimSvcURL,
            success: function(data) {
					//alert("Server said123:\n '" + data + "'");
            },
			error: function(e){  
					alert('Error121212: ' + e);
					console.log(e);
					
       }  
        });
        return (false);

    }

function callClaimSvcByzip()
{
        //alert("In claim");
		var claimSvcURL = "/custbypostalcode/"+ addy;
        var returnData = "";
        $.ajax({
            type: "GET",
            dataType: 'jsonp',
			jsonp: 'callback',
			jsonpCallback: 'jsonpCallbackWithSeverity',
            async: true,
            url: claimSvcURL,
            success: function(data) {
					//alert("Server said123:\n '" + data + "'");
            },
			error: function(e){  
					alert('Error121212: ' + e);
					console.log(e);
					
       }  
        });
        return (false);

    }
function jsonpCallback(data) {
	//alert("in callback");

	console.log(data);
	insuredlist = data;
	console.log(insuredlist);
	console.log(insuredlist.Customer_zip.length);
	buildInsured(insuredlist, 'no');
}

function jsonpCallbackWithSeverity(data) {
	//alert("in callback");

	console.log(data);
	insuredlist = data;
	console.log(insuredlist);
	console.log(insuredlist.Customer_zip.length);
	buildInsured(insuredlist, 'yes');
	map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('legend'));
	getBestPoint(35.474223, -97.521404, 35.469994, -97.510719);
}

function buildInsured(insuredlist, hasSeverity) {
   console.log("in build insured");
   var insured = 0;
   var _lat;

	for (insured = 0; insured < insuredlist.Customer_zip.length; insured++) {
	  var parsed_lat_long = { lat:parseFloat( insuredlist.Customer_zip[insured].position.substring(0, 9) ), lng:parseFloat( insuredlist.Customer_zip[insured].position.substring(10, 19)  ) };
	  var insuredCust = insuredlist.Customer_zip[insured];
	  console.log(parsed_lat_long);
	  createMarker(insuredCust, parsed_lat_long, hasSeverity);
	 };
	 
	 if (hasSeverity =='yes'){
	//CREATE legend
		var legend = document.getElementById('legend');
		var div = document.createElement('div');
		div.innerHTML = '<img src="redHome.png"> ' + '<b>SEVERE</b>';
		legend.appendChild(div);
		div = document.createElement('div');
		div.innerHTML = '<img src="yellowHome.png"> ' + '<b>MODERATE</b>';
		legend.appendChild(div);
		div = document.createElement('div');
		div.innerHTML = '<img src="greenHome.png"> ' + '<b>MILD</b>';
		legend.appendChild(div);
		div = document.createElement('div');
		div.innerHTML = '<img src="blueHome.png"> ' + '<b>NO DATA</b>';
		legend.appendChild(div);
	 }
}
 		  
  //call createMarker
function createMarker(insuredCust, position, hasSeverity) {
  	var infowindow = new google.maps.InfoWindow();
 	var iconcolor = "blueHome.png";
 	if (hasSeverity == 'yes'){
 		iconcolor = determineDamageColor(insuredCust.severity);
 	}
  	var marker = new google.maps.Marker({
		icon: iconcolor,
    	position: position,
      	title: insuredCust.policyNbr,
      	map: map
   });
     		
  	marker.addListener('click', function() {
		//creates infowindow
  		createInfoWindow(insuredCust, marker, hasSeverity);
	   	});
   }
 		   		 

function createInfoWindow(insuredCust, marker, hasSeverity) {
	var txt = '<IMG BORDER="0" ALIGN="Left" SRC="icon.png">' + 
			  "Insured: " +  insuredCust.name + "<br />" +  
			  "Policy #: " + insuredCust.policyNbr + "<br />" +
			  "Phone: " + insuredCust.telephoneNbr;
	var txtWithSeverity =  txt +  '<IMG BORDER="0" ALIGN="Left" SRC="' + insuredCust.url_img + '">';	  
	var contentString = txt;
	if (hasSeverity == 'yes'){
		contentString = txtWithSeverity;
	}
	var infowindow = new google.maps.InfoWindow({
	    content: contentString,
	  });
	
	infowindow.open(map, marker);	
}
    
//determine icon color based on severity
function determineDamageColor(severity) {
  	 if(severity > 7){
	  	 	iconcolor = 'redHome.png';
	  	 }
	  	 else if(severity <= 7 && severity > 4){
	  	  	iconcolor = 'yellowHome.png';
	  	 }
	   	 else if(severity <= 4 && severity >0){
	   	  	iconcolor = 'greenHome.png';
	  	 }
	   	 else{
	   		 iconcolor= 'blueHome.png';
	   	 }
	return iconcolor;
}

function getBestPoint(lat1, lon1, lat2, lon2) {
	var newlat = (lat1 + lat2)/2;
	var newlon = (lon1 + lon2)/2;
	var locate = new google.maps.LatLng(parseFloat(newlat), parseFloat(newlon));
	var marker = new google.maps.Marker({
		icon: "bestpointicon.png",
		animation: google.maps.Animation.DROP,
		//size: new google.maps.Size(20, 32),
    	position: locate,
      	title: "Best Point",
      	map: map
   });
	map.setZoom(15);
	
}

function callDamageAlgorithm(){
	  var elem = document.getElementById("myBar");   
	  var width = 0;
	  var id = setInterval(frame, 10);
	  function frame() {
	    if (width >= 100) {
	      clearInterval(id);
	    } else {
	      width++; 
	      elem.style.width = width + '%'; 
	      document.getElementById("label").innerHTML = width * 1  + '%';
	    }
	  }
	  setTimeout(loadPostAlgorithmImage, 3000);
}
function loadPostAlgorithmImage(){
	var elem = document.createElement("img");
	//elem.setAttribute("src", "images/hydrangeas.jpg");
	elem.setAttribute("height", "200");
	elem.setAttribute("width", "200");
	elem.setAttribute("align","middle");
	elem.setAttribute("src","\roof-hail-damage_after.jpg");
	elem.src = 'roof-hail-damage_after.jpg';
	
	document.getElementById("postAnalysisImg").appendChild(elem);
	
	
}

 	 	