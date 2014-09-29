/* PLUGINS NEEDED:
 *  - jQuery
 *  - Google Maps JavaScript API v3
*/

var GetLatLng = {
	/**** Generate Random Address ****/
	output : "CSV", // "CSV" of "JSON"
	console : null,
	callback : null,
	APIKey : null,
	tBody : "", // jQuery target to print the results
	printFields : [ // The fields that will be printed
		"Address",
		"Country"
	],
	addressCols : [],
	accReady : [],
	accFailed : [],
	acc : [],
		
	/**** Output Functions ****/
	print : function (item){
		var i,
			len,
			end,
			field,
			print = (this.output=="CSV") ? '' : "{";
		
		for(i = 0, len = this.printFields.length; i < len; i++){
			end = (i!=(len-1)) ? '",' : '"',
			field = this.printFields[i];
			
			print += '"';
			if(this.output!="CSV"){
				print += field + '":"' 
			}
			print += (typeof item[field] != "undefined") ? item[field] : "";
			print += end;
		}
		print += (this.output=="CSV") ? '' : '},';
		print.replace("\n","");
		print.replace("\r","");
		print = "\n" + print;
		
		this.tBody += print;
	},
	/**** Google Maps Geocoding Service ****/
	getLatLng : function(){
		var geocoder = new google.maps.Geocoder(),
			cItem,
			cItemAdd = "",
			self = this,
			i,len;
		cItem = this.acc[0];
		for(i = 0, len = this.addressCols.length; i < len; i++){
			cItemAdd += cItem[this.addressCols[i]];
			if(i != len - 1){
				cItemAdd += ", ";
			}
		}
		geocoder.geocode( { 'address': cItemAdd}, function(results, status) {
			if (status != google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
				var lat,lng,cooldown;
				self.acc.splice(0,1);
				if(status == google.maps.GeocoderStatus.OK){
					cItem.Latitude = results[0].geometry.location.lat();
					cItem.Longitude = results[0].geometry.location.lng();
				}else{
					cItem.Latitude = status;
					cItem.Longitude = status;
				}
				
				self.print(cItem);
				self.accReady.push(cItem);
				
				if(self.accReady.length % 100 == 0){
					self.console.innerHTML = "Reloading Google Service";
					
					if(self.acc.length >= 1){
						self.googleMapsLoad("GetLatLng.getLatLng");
					}else{
						self.finalize();
					}
				}else{
					self.console.innerHTML = "Processed: " + self.accReady.length + " of " + (self.acc.length + self.accReady.length);
				
					if(self.acc.length >= 1){
						setTimeout(function(){GetLatLng.getLatLng()},1000);
					}else{
						self.finalize();
					}
				}
			} else {
				setTimeout(function(){GetLatLng.getLatLng();},1000);
			}
		});
	},
	start : function(accounts,headers,addressCols,console){
		var theHeader = "",i,len,end,field,
			h = [],
			g = google || false,
			m = g.maps || false;
		if(!this.APIKey){
			alert("Please enter an API Key")
			return false;
		}
		if(!m){
			alert("Google Maps Service isn't loaded yet");
			return false;
		}
		this.acc = accounts;
		this.printFields = ["Latitude","Longitude"];
		this.printFields = this.printFields.concat(headers);
		this.addressCols = addressCols || ["Address"];
		this.console = console || null;
		
		if(this.output == "CSV"){
			theHeader = this.printFields.join(",");
		}else{
			theHeader = "[";
		}
		this.tBody += theHeader;
		this.getLatLng();
	},
	finalize: function(){
		if(this.output != "CSV"){
			this.tBody += "\n ]";
		}
		this.onEnd(this.tBody);
	},
	onEnd:function(){},
	googleMapsLoad:function(callback,onFail){
		var k = GetLatLng.APIKey || false,
			callback = callback || false;
		if(k){
			$.getScript( "http://maps.googleapis.com/maps/api/js?key=" + k + "&callback=" + callback).fail(function(){onFail();});
		}
	},
}
