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
         var marker = new google.maps.Marker(
         {
            map: map, 
            position: results[0].geometry.location
         });
         //populate Travelers field offices
         findFieldOffice();
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
            map.setZoom(16);
            var marker = new google.maps.Marker({
                map: map, 
                position: results[0].geometry.location
            });
            var cityCircle = new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.35,
                map: map,
                //center: {lat: 35.4676, lng: -97.5164},
                center: results[0].geometry.location,
                radius: Math.sqrt(10000) * 100
              });
        } 
        else 
        {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
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
function jsonpCallback(data) {
	//alert("in callback");

	console.log(data);
	insuredlist = data;
	console.log(insuredlist);
	console.log(insuredlist.Customer_zip.length);
	buildInsured(insuredlist);
}
function buildInsured(insuredlist) {
   console.log("in build insured");
   var insured = 0;
   var _lat;

	for (insured = 0; insured < insuredlist.Customer_zip.length; insured++) {
	  var parsed_lat_long = { lat:parseFloat( insuredlist.Customer_zip[insured].position.substring(0, 9) ), lng:parseFloat( insuredlist.Customer_zip[insured].position.substring(10, 19)  ) };
	  var insuredCust = insuredlist.Customer_zip[insured];
	  console.log(parsed_lat_long);
	  createMarker(insuredCust, parsed_lat_long);
	 };
}
 		  
  //call createMarker
function createMarker(insuredCust, position) {
  	var infowindow = new google.maps.InfoWindow();
  	var iconcolor = determineDamageColor(insuredCust.severity);
  	var marker = new google.maps.Marker({
		icon: iconcolor,
    	position: position,
      	title: insuredCust.policyNbr,
      	map: map
   });
     		
  	marker.addListener('click', function() {
		//creates infowindow
  		createInfoWindow(insuredCust, marker);
		//map.setCenter(marker.getPosition());
	   	});
   }
 		   		 

function createInfoWindow(insuredCust, marker) {
	var infowindow = new google.maps.InfoWindow({
   		content:'<IMG BORDER="0" ALIGN="Left" SRC="icon.png">' + 
  				"Insured: " +  insuredCust.name + "<br />" + 
  				"Policy #: " + insuredCust.policyNbr + "<br />" +
  				"Contact Info: " + insuredCust.telephoneNbr + "<br />" +  
  				'<IMG BORDER="0" ALIGN="Left" SRC="' + insuredCust.url_img + '">'
  	}); 
  	infowindow.open(map, marker);	
   }      
    
//determine icon color based on severity
function determineDamageColor(severity) {
  	 var iconcolor = "blueHome.png"; 	  
  	 if(severity > 7){
  	 	iconcolor = 'greenHome.png';
  	 }
  	 else if(severity <= 7 && severity > 4){
  	  	iconcolor = 'yellowHome.png';
  	 }
   	 else if(severity <= 4){
   	  	iconcolor = 'redHome.png';
  	 }
	return iconcolor;
}

function findFieldOffice(){
	var marker = new google.maps.Marker({
		icon: "icon.png",
    	position: {lat: 38.889956, lng: -94.673202},
      	map: map
   });
}

 	 	