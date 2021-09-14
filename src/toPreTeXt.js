(function(){
	var indent = "two";
	function beautify(html){
		var str = ""
		html = html.replace(/<\s*(\/?)\s*([a-z]+)[^>]*>/gi,function(full,close,name){
			var beforestr = str;
			name = name.toLowerCase();
			if(name == "table" || name == "tabular" || name == "row" || name == "cell" || name == "caption" || name == "line"){
				if(close != "/"){
					str+="\t";
					return "\n"+beforestr+full+"\n"+str;
				}
				else{
					str = str.slice(0, -1);
					return "\n"+str+full+"\n"+str;
				}
			}
			else if(name == "col" || name == "hr" || name == "br"){
				return "\n"+str+full+"\n"+str;
			}
			return full;
		}).replace(/[ \t]+\n/g,"\n").replace(/[\n\r]{2,}/g,"\n").trim();
		if(indent == "two"){
			html = html.replace(/\t/g, "  ");
		}
		else if(indent == "four"){
			html = html.replace(/\t/g, "    ");
		}
		return html;
	}
	var getContent = function(cell){
		var container = (cell.refCell||cell).cell.cloneNode(true);
		// First, we take care of math
		var equations = container.querySelectorAll("span.latex-equation"),
		equationArr = [];
		for(var i=0,eq;i<equations.length;i++){
			eq = equations[i];
			var text = document.createTextNode("****m"+equationArr.length+"****"),
			contentMath = (eq.innerText||eq.textContent).replace(/[\n\r]+/g, "")
					.replace(/</g, "\\lt ").replace(/>/g, "\\gt ").replace(/\&/g, "\\amp ");
			equationArr.push(contentMath);
			eq.parentNode.replaceChild(text, eq);
		}
		var text = container.innerText.replace(/([^\n\r])[\n\r]+$/, "$1");
		if(text.indexOf("\n") > -1){
			text = "****line****"+text.replace(/\n/g, "****/line********line****")+"****/line****";
		}
		text = text.replace(/[\#\$\%\^\&\_\{\}\\\~\<\>]/g, function(char){
			return "<"+{
				"#" : "hash",
				"$" : "dollar",
				"%" : "percent",
				"^" : "circumflex",
				"&" : "ampersand",
				"_" : "underscore",
				"{" : "lbrace",
				"}" : "rbrace",
				"~" : "tilde",
				"\\" : "backslash",
				"<" : "less",
				">" : "greater"
			}[char]+">";
		});
		text = text.replace(/\*\*\*\*(\/?(?:line|m\d+))\*\*\*\*/g, function(full, name){
			if(name.charAt(0) == "m"){
				name = +(name.substring(1));
				var contentMath = equationArr[name];
				return "<m>"+contentMath+"</m>";
			}
			return "<"+name+">";
		}).replace(/\&nbsp\;/gi,"<nbsp></nbsp>");
		var frag = document.createDocumentFragment(),
		div = document.createElement("div");
		div.innerHTML = text;
		while(div.firstChild){
			frag.appendChild(div.firstChild);
		}
		return frag;

	},
	getMax = function(matrix, analyze){
		var results = {}, undefined;
		for(var i=0;i<matrix.length;i++){
			var cells = matrix[i];
			for(var j=0;j<cells.length;j++){
				var cell = cells[j],
				result = analyze(cell);
				if(result !== undefined){
					if(!results[result]){
						results[result] = 0;
					}
					results[result]++;
				}
			}
		}
		var max = 0, value;
		for(var i in results){
			if(results.hasOwnProperty(i) && results[i] > max){
				max = results[i];
				value = i;
			}
		}
		return value;
	},
	getHBorder = function(o){
		return o;
	},
	borderName = function(name){
		if(!name){return ""}
		if(name == "midrule"){
			return "minor";
		}
		if(name == "toprule" || name == "bottomrule"){
			return "major";
		}
		return "medium";
	},
	alignName = function(name){
		if(name == "r"){return "right"}
		if(name == "c"){return "center"}
		return "left";
	}
	table.createInterpreter("pretext", function(){
		var matrix = this.matrix(),
		tableContainer = document.createElement("table"),
		caption = this.caption().caption,
		nbofcols = matrix[0].length,
		booktabs = this.element.hasAttribute("data-booktabs"),
		tabular = document.createElement("tabular");
		indent = document.getElementById('opt-pretext-indent').value || "two";
		// Caption
		if(caption){
			var captionE = document.createElement("title");
			tableContainer.appendChild(captionE);
			captionE.innerHTML = caption.replace(/[\#\$\%\^\&\_\{\}\\\~\<\>]/g, function(char){
				return "<"+{
					"#" : "hash",
					"$" : "dollar",
					"%" : "percent",
					"^" : "circumflex",
					"&" : "ampersand",
					"_" : "underscore",
					"{" : "lbrace",
					"}" : "rbrace",
					"~" : "tilde",
					"\\" : "backslash",
					"<" : "less",
					">" : "greater"
				}[char]+">";
			});
		}
		// Let's start by defining attributes for tabular
		var tabular_align = getMax(matrix, function(cell){
			if(!cell.refCell){
				var subalign = cell.align;
				if(subalign != "r" && subalign != "c"){
					subalign = "l";
				}
				return subalign;
			}
		});
		tabular_align = alignName(tabular_align);
		if(tabular_align != "left"){
			tabular.setAttribute("halign", tabular_align);
		}
		// Top border
		if(booktabs){
			tabular.setAttribute("top", "major");
		}
		else{
			var topborder = this.HBorder(0, getHBorder, matrix);
			if(topborder.complete){
				if(topborder.borders[0]){
					tabular.setAttribute("top", borderName(topborder.borders[0].type));
				}
			}
			else{
				// We need to create <col> elements;
				for(var i=0;i<nbofcols;i++){
					var col = document.createElement("col"),
					subborder = borderName((topborder.borders[i]||{}).type);
					if(subborder){
						col.setAttribute("top", subborder);
					}
					tabular.appendChild(col);
				}
			}
		}
		// Now rows and cells
		for(var i=0;i<matrix.length;i++){
			var row = document.createElement("row"), cells = matrix[i];
			for(var j=0;j<cells.length;j++){
				var cell = cells[j],
				cellElement = document.createElement("cell");
				if(cell.refCell){
					if(cell.refCell.x == cell.x){
						if(cell.refCell.cell.colSpan > 1){
							cellElement.setAttribute("colspan", cell.refCell.cell.colSpan);
						}
						if(cell.refCell.leftBorder){
							cellElement.setAttribute("left", borderName(cell.refCell.leftBorder));
						}
						if(cell.refCell.rightBorder){
							cellElement.setAttribute("right", borderName(cell.refCell.rightBorder));
						}
						row.appendChild(cellElement);
					}
					continue;
				}
				var cell_align = alignName(cell.align);
				if(cell_align != tabular_align){
					cellElement.setAttribute("halign", cell_align);
				}
				if(cell.cell.colSpan > 1){
					cellElement.setAttribute("colspan", cell.cell.colSpan);
				}
				if(cell.leftBorder){
					cellElement.setAttribute("left", borderName(cell.leftBorder));
				}
				if(cell.rightBorder){
					cellElement.setAttribute("right", borderName(cell.rightBorder));
				}
				row.appendChild(cellElement);
				cellElement.appendChild(getContent(cell))
				cell += cell.cell.colSpan - 1;
			}
			// Bottom border
			if(booktabs && i+1 >= matrix.length){
				row.setAttribute("bottom", "major");
			}
			else{
				var bottomborder = this.HBorder(i+1, getHBorder, matrix);
				if(bottomborder.complete){
					if(bottomborder.borders[0]){
						row.setAttribute("bottom", borderName(bottomborder.borders[0].type));
					}
				}
				else{
					var matrixcount = 0;
					for(var j=0;j<row.childNodes.length;j++){
						var cell = row.childNodes[j];
						var subborder = bottomborder.borders[matrixcount];
						if(subborder){
							cell.setAttribute("bottom", borderName(subborder.type));
						}
						matrixcount += +(cell.getAttribute("colspan") || 1);
					}
				}
			}
			tabular.appendChild(row);
		}
		tableContainer.appendChild(tabular);
		var div = document.createElement("div");
		div.appendChild(tableContainer);
		// Remove useless end of elements
		var text = div.innerHTML.replace(/\&nbsp\;/gi,"<nbsp></nbsp>").replace(/<\s*(\/?)\s*(hash|dollar|percent|circumflex|nbsp|ampersand|underscore|lbrace|rbrace|tilde|backslash|less|greater)[^>]*>/gi, function(full, close, name){
	if(close){return ""}
	return "<" + name + " />";
});
		return beautify(text).replace(/\u200B/g,"");
	});
})();