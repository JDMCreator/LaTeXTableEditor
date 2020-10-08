(function(){
	var $ = function(id){return document.getElementById(id)};
	var ColorPicker = new (function(){
		var analyzeColor = function(e){
			var color = e.target.value;
			if(e.target.id == "colorpicker-rgb"){
				if(color.indexOf("rgb")<0){
					color = "rgb("+color+")";
				}
			}
			if(e.target.id == "colorpicker-hsl"){
				if(color.indexOf("hsl")<0){
					color = "hsl("+color+")";
				}
			}
			ColorPicker.color(color);
			
		},
		shadeColor = function(color, percent) {   
    			var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    			return "#"+Math.round(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
		},
		toHex = function(color){
			return "#"+Math.round((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2]).toString(16).slice(1);
		},
		rangeColor = function(){
			var color = "rgb(";
			color += $("colorpicker-r").value + ",";
			color += $("colorpicker-g").value + ",";
			color += $("colorpicker-b").value + ")";
			ColorPicker.color(color);
		},
rgbToHsl = function(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = (max - min);
        s = l >= 0.5 ? d / (2 - (max + min)) : d / (max + min);
        switch(max){
            case r: h = ((g - b) / d + 0)*60; break;
            case g: h = ((b - r) / d + 2)*60; break;
            case b: h = ((r - g) / d + 4)*60; break;
        }
    }
    return [h, s, l];
}

		this.actualSettings = null;
		this.toHex = toHex;
		this.color = function(color){
			color = toRGBA(color) || [0,0,0,1];
			color = color.map(function(a){return a||0})
			color.pop();
			var rgb = "rgb("+color.map(Math.round).join()+")",
			hex = toHex(color),
			hsl = rgbToHsl(color[0], color[1], color[2]);
			hsl = "hsl("+Math.round((hsl[0]+720)%360)+","+Math.round(hsl[1]*100)+"%,"+Math.round(hsl[2]*100)+"%)";
			var name = ntc.name(hex)[1];
			$("colorpicker-r").value = color[0];
			$("colorpicker-g").value = color[1];
			$("colorpicker-b").value = color[2];
			$("colorpicker-rgb").value = rgb;
			$("colorpicker-hex").value = hex;
			$("colorpicker-system-input").value = hex;
			$("colorpicker-hsl").value = hsl;
			$("colorpicker-container").style.color = hex;
			$("colorpicker-name").innerHTML = name;
			$("colorpicker-name1").innerHTML = name;
			$("colorpicker-name2").innerHTML = name;
		}
		this.choose = function(){
			if(this.actualSettings){
				var rgba = this.actualRGBA(),
				hex = toHex(rgba);
				if(this.actualSettings[0].type){
					this.actualSettings[0].value = hex;
				}
				if(this.actualSettings[1]){
					this.actualSettings[1](hex);
				}
			}
			this.actualSettings = null;
			jQuery("#colorpicker").modal('hide');
		}
		this.cancel = function(){
			if(this.actualSettings && this.actualSettings[1]){
				this.actualSettings[1]();
			}
			this.actualSettings = null;
			jQuery("#colorpicker").modal('hide');
		}
		this.get = function(color, callback){
			color = color || "#000000";
			this.actualSettings = [color, callback];
			if(color.nodeType){
				color = color.value;
			}
			this.color(color);
			var element = $("colorpicker-table-scheme");
			while(element.firstChild){
				element.removeChild(element.firstChild);
			}
			var schemes = this.getTableColorScheme(),
			frag = document.createDocumentFragment();
			for(var i=0;i<schemes.length;i++){
				var div = document.createElement("div"),
				scheme = "rgb("+schemes[i].join(",")+")";
				div.setAttribute("data-color", scheme);
				div.title = scheme;
				div.style.backgroundColor = scheme;
				div.addEventListener("click", function(){
					ColorPicker.color(this.getAttribute("data-color"));
				}, false);
				frag.appendChild(div);
			}
			element.appendChild(frag);
			element = $("colorpicker-default-scheme"),
			frag = document.createDocumentFragment();
			if(!element.firstElementChild){
				schemes = ["white", "silver", "gray", "black",
				"orange", "red", "maroon", "yellow", "olive", "lime",
				"green", "aqua", "teal", "blue",
				"navy", "fuchsia", "purple"];
				for(var i=0;i<schemes.length;i++){
					var div = document.createElement("div"),
					scheme = schemes[i];
					div.setAttribute("data-color", scheme);
					div.title = scheme;
					div.style.backgroundColor = scheme;
					div.addEventListener("click", function(){
						ColorPicker.color(this.getAttribute("data-color"));
					}, false);
					frag.appendChild(div);
				}
			}
			element.appendChild(frag);
			jQuery("#colorpicker").modal('show');
		}
		this.actualRGBA = function(){
			return toRGBA($("colorpicker-container").style.color)
		}
		this.getTableColorScheme = function(){
			var table = $("table"),
			colors = ["#000000", "#ffffff"],
			alternate = window.table.oddEvenColors();
			if(alternate){
				colors.push(alternate[1], alternate[2])
			}
			for(var i=0;i<table.rows.length;i++){
				var cells = table.rows[i].cells;
				for(var j=0;j<cells.length;j++){
					var cell = cells[j], style = cell.style;
					if(style.backgroundColor){
						colors.push(style.backgroundColor);
					}
					if(style.borderLeftColor){
						colors.push(style.borderLeftColor);
					}
					if(style.borderTopColor){
						colors.push(style.borderTopColor);
					}
					if(style.borderRightColor){
						colors.push(style.borderRightColor);
					}
					if(style.borderBottomColor){
						colors.push(style.borderBottomColor);
					}
				}
			}
			var elements = table.querySelectorAll('font[color], tr > * [style*="color"]');
			for(var i=0;i<elements.length;i++){
				var element = elements[i];
				if(element.hasAttribute("color")){
					colors.push(element.getAttribute("color"));
				}
				if(element.style.color){
					colors.push(element.style.color);
				}
			}
			var col = {};
			for(var i=0;i<colors.length;i++){
				var rgba = toRGBA(colors[i]) || [0,0,0,1];
				if(rgba[3] === 0){continue;}
				rgba.pop();
				col[rgba.join(",")] = true;
			}
			colors = [];
			for(var i in col){
				if(col.hasOwnProperty(i)){
					colors.push(i.split(","));
				}
			}
			return colors;
		}
		this.shade = function(p){
			var hex = toHex(this.actualRGBA());
			this.color(shadeColor(hex, p));
		}
		this.init = function(){
			$("colorpicker-rgb").addEventListener("blur", analyzeColor, false);
			$("colorpicker-hex").addEventListener("blur", analyzeColor, false);
			$("colorpicker-hsl").addEventListener("blur", analyzeColor, false);
			$("colorpicker-r").addEventListener("input", rangeColor, false);
			$("colorpicker-g").addEventListener("input", rangeColor, false);
			$("colorpicker-b").addEventListener("input", rangeColor, false);
		}
	})();
	ColorPicker.init();
	window.ColorPicker = ColorPicker;
})();