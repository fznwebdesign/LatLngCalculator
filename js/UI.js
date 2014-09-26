var UI = {
	APIKey: "",
	dataFile: "",
	dataType: "",
	data: null,
	headers: null,
	addressCols: [],
	console: false,
	start: function(){
		var keyInput = document.getElementById("APIKey"),
			keyBtn = document.getElementById("APIKeyBtn"),
			dataFile = document.getElementById("dataFile"),
			key,file;
		if(!UI.console){
			UI.console = document.createElement("section");
			UI.console.id = "status";
			document.body.appendChild(UI.console);
			UI.print = document.createElement("section");
			UI.print.id = "print";
			document.body.appendChild(UI.print);
		}
		keyBtn.onclick = function(){
			key = keyInput.value || false;
			if(key){
				UI.APIKey = key;
				UI.console.innerHTML = "";
				keyInput.value = "";
				keyInput.disabled = "disabled";
				keyBtn.disabled = "disabled";
				UI.googleMapsLoad();
			}else{
				UI.console.innerHTML = "Please enter a key";
			}
		}
		dataFile.addEventListener('change', function(evt){
			var dataFile = document.getElementById("dataFile"),
				file = evt.target.files[0] || false,
				r;
			if(file){
				UI.dataFile = file;
				r = new FileReader();
				r.onload = UI.fileOnLoad;
				r.readAsText(file);
			}else{
				UI.console.innerHTML = "Please select a file to load";
			}
			return false;
		}, false);
		selectFieldsBtn.onclick = function(){
			var arr = document.forms.selectFields.selectedFields,
				el = document.getElementById("selectFields"),
				i = 0,
				len = arr.length,
				res = [],
				step3 = document.getElementById("step3"),
				step4 = document.getElementById("step4");
			if(!len){
				UI.console.innerHTML = "Please select at least 1 column to indicate the Address";
				return false;
			}
			for(;i < len; i++){
				if(arr[i].checked){
					res.push(arr[i].value);
				}
			}
			UI.console.innerHTML = "Process started... please wait";
			this.disabled = true;
			step3.style.display = "none";
			step4.style.display = "block";
			UI.addressCols = res;
			GetLatLng.start(UI.data);
		}
	},
	googleMapsLoad:function(callback){
		var k = UI.APIKey || false,
			keyInput = document.getElementById("APIKey") || {},
			keyBtn = document.getElementById("APIKeyBtn") || {},
			callback = callback || "UI.googleMapsOnLoad";
		if(k){
			$.getScript( "http://maps.googleapis.com/maps/api/js?key=" + k + "&callback=" + callback).fail(function(){
				keyInput.disabled = false;
				keyBtn.disabled = false;
				alert("Error Loading Google Maps, Please try again");
			});
		}
	},
	googleMapsOnLoad: function(){
		var step1 = document.getElementById("step1"),
			step2 = document.getElementById("step2");
		step1.innerHTML = "";
		step1.style.display = "none";
		step2.style.display = "block";
	},
	fileOnLoad: function(e){
		var name = UI.dataFile.name,
			dataFile = document.getElementById("dataFile"),
			ext = name.substr(name.length-3,name.length-1).toLowerCase(),
			contents = e.target.result,
			step2 = document.getElementById("step2"),
			step3 = document.getElementById("step3");
		switch(ext){
			case "csv":
				UI.data = UI.csvJSON(contents);
				step2.style.display = "none";
				step3.style.display = "block";
				UI.console.innerHTML = "";
				dataFile.value = "";
				dataFile.disabled = "disabled";
				this.disabled = "disabled";
				UI.getAddressColums();
			break;
			case "js":default:
				UI.console.innerHTML = "Please select a CSV file";
		}
	},
	onFinalize: function(blob){
		var step4 = document.getElementById("step4"),
			step5 = document.getElementById("step5"),
			target = document.getElementById('downloadContainer')
			link = document.createElement("a");
		step4.style.display = "none";
		step5.style.display = "block";
		//UI.console.innerHTML = "Completed!"
		link.href = window.URL.createObjectURL(blob);
		link.download = "ResultsWithLatLng.csv";
		link.id = "downloadFile";
		link.innerText = "Download File";
		target.appendChild(link);
	},
	csvJSON: function(csv){
		var lines = csv.split("\n"),
			result = [],
			h = "",
			val,
			obj,currentline,i,j,len,len2;
		this.headers = this.sanitizeLine(lines[0],true);
		for(i = 1, len = lines.length; i < len; i++){
			obj = {};
			currentline = this.sanitizeLine(lines[i]);
			if(currentline.length > 0){
				for(j = 0, len2 = this.headers.length; j < len2; j++){
					h = this.headers[j];
					obj[h] = currentline[j];
				}
				result.push(obj);
			}
		}
		return result;
	},
	sanitizeLine: function(line,ignoreBlanks){
		var q = 0,
			c = 0,
			end = 0,
			start = 0,
			hasQuotes = false,
			s = "",
			res = [],
			ignore = ignoreBlanks || false
			count = 0;
		if(line.length == 0){
			return [];
		}
		line += ","
		line = line.replace(/[\n\r]/g,"");
		while(line.length > 0){
			q = line.indexOf('"');
			c = line.indexOf(',');
			hasQuotes = (q >= 0 && q < c) ? true : false;
			end =(hasQuotes) ? line.indexOf('"',q + 2) : line.indexOf(',');
			start = (hasQuotes) ? 1 : 0;
			s = line.substring(start,end);
			if(!ignore || s != ""){
				res.push(s);
			}
			line = line.substring(end + 1 + start);
		}
		return res;
	},
	getAddressColums: function(){
		var el = document.getElementById("selectFields"),
			i = 0,
			len = this.headers.length,
			html = "";
		
		for(; i < len; i++){
			html += "<label><input name='selectedFields' type='checkbox' value='" + this.headers[i] + "' /><span>" +this.headers[i] + "</span></label>"
		}
		el.innerHTML = html;
	}
}
window.onload = function(){
	UI.start();
}
