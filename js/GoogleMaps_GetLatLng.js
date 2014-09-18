/* PLUGINS NEEDED:
 *  - jQuery
 *  - Google Maps JavaScript API v3
*/

var GetLatLng = {
	/**** Generate Random Address ****/
	output : "CSV", // "CSV" of "JSON"
	tBody : "", // jQuery target to print the results
	printFields : [ // The fields that will be printed
				"Address",
				"Country"
	],
	accReady : [],
	accFailed : [],
	acc : [],
	debug:true,
		
	/**** Output Functions ****/
	print : function (item){
		var i,
			len,
			end,
			field,
			print = (this.output=="CSV") ? "" : "{";
		
		for(i = 0, len = this.printFields.length; i < len; i++){
			end = (i!=(len-1)) ? ',' : '',
			field = this.printFields[i];
			
			print += '';
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
			aCols = UI.addressCols || ["Address"],
			i,len;
		cItem = this.acc[0];
		for(i = 0, len = aCols.length; i < len; i++){
			cItemAdd += cItem[aCols[i]];
			if(i != len - 1){
				cItemAdd += ", ";
			}
		}
		console.log(cItemAdd,cItem,aCols)
		geocoder.geocode( { 'address': cItemAdd}, function(results, status) {
			self.acc.splice(0,1);
			if (status == google.maps.GeocoderStatus.OK) {
				cItem.Latitude = results[0].geometry.location.lat();
				cItem.Longitude = results[0].geometry.location.lng();
			} else {
				cItem.Latitude = status;
				cItem.Longitude = status;
			}
			self.print(cItem);
			self.accReady.push(cItem);
		
			UI.console.innerHTML = "Processed: " + self.accReady.length + " of " + (self.acc.length + self.accReady.length);
			
			if(self.acc.length>=1){
				setTimeout(function(){GetLatLng.getLatLng();},1000);
			}else{
				if(self.output != "CSV"){
					self.tBody += "\n ]";
				}
				self.finalize();
			}
		});
	},
	start : function(accounts){
		var theHeader = "",i,len,end,field,
			h = [];
		this.acc = accounts;
		this.printFields = ["Latitude","Longitude"];
		this.printFields = this.printFields.concat(UI.headers);
		
		if(this.output == "CSV"){
			theHeader = this.printFields.join(",");
		}else{
			theHeader = "[";
		}
		this.tBody += theHeader;
		this.getLatLng();
	},
	finalize: function(){
		var oMyBlob = new Blob([this.tBody], {type : 'text/vnd.ms-excel'}); 
		UI.onFinalize(oMyBlob);
	}
}

/**** Example Data ****/

var exampleData = [
  {
    "Place Name":"Softtek Aguascalientes",
    "Address":"Eugenio Garza Sada, Aguascalientes, Aguascalientes",
    "Country":"Mexico"
  },
  {
    "Place Name":"Pedro's House",
    "Address":"Canal Interceptor, Aguascalientes, Aguascalientes",
    "Country":"Mexico",
  }
]

/**** Script Starters ****/

//GetLatLng.start(TestData);
