(function(){
	function beautify(html){
		var str = ""
		return html.replace(/<\s*(\/?)\s*([a-z]+)[^>]*>/gi,function(full,close,name){
			name = name.toLowerCase();
			if(name == "table" || name == "tr" || name == "td" || name == "th" || name == "caption" || name == "tbody" || name == "thead" || name == "tfooter" || name == "p" || name == "div"){
				if(close != "/"){
					str+="\t";
				}
				else{
					str = str.slice(0, -1);
				}
				return "\n"+str+full+"\n"+str;
			}
			else if(name == "br" || name == "hr"){
				return "\n"+str+full+"\n"+str;
			}
			return full;
		}).replace(/[ \t]+\n/g,"\n").replace(/[\n\r]{2,}/g,"\n").trim();
	}
	table.createInterpreter("html", function(){
		var table = this.element,
		caption = this.caption(),
		booktabs = table.hasAttribute("data-booktabs"),
		otable = document.createElement("table");
		if(caption.caption){
			otable.createCaption().appendChild(document.createTextNode(caption.caption));
		}
		otable.style.borderCollapse = "collapse";
		otable.style.border = "none";
		otable.style.borderSpacing = "0";
		for(var i=0;i<table.rows.length;i++){
			var cells = table.rows[i].cells,
			orow = document.createElement("tr");
			for(var j=0;j<cells.length;j++){
				var cell = cells[j], ocell = document.createElement("td");
				ocell.style.cssText = cell.style.cssText;
				if(cell.getAttribute("data-align")=="c"){
					ocell.style.textAlign = "center";
				}
				else if(cell.getAttribute("data-align") == "r"){
					ocell.style.textAlign = "right";
				}
				if(booktabs){
					if(i === 0){
						ocell.style.borderTop = "2px solid black";
					}
					if(i+cell.rowSpan-1 === table.rows.length-1){
						ocell.style.borderBottom = "2px solid black";
					}
				}
				ocell.style.paddingLeft = ocell.style.paddingRight = "3cm";
				if(cell.rowSpan != 1){ocell.rowSpan=cell.rowSpan}
				if(cell.colSpan != 1){ocell.colSpan=cell.rowSpan}
				ocell.innerHTML = this.getHTML(cell);
				orow.appendChild(ocell);
			}
			otable.appendChild(orow);
		}

		otable.appendChild(orow);
		var container = document.createElement("div");
		container.appendChild(otable);
		var equations = container.querySelectorAll("span.latex-equation");
		// TODO : SPACE PROBLEMS!!!
		for(var i=0,eq;i<equations.length;i++){
			eq = equations[i];
			var text = document.createTextNode("$$"+(eq.textContent || eq.innerText)+"$$");
			eq.parentNode.replaceChild(text, eq);
		}
		return beautify(container.innerHTML);
	})
})();