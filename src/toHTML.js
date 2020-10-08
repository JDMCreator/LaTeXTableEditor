(function(){
	var indent = "tab";
	function beautify(html){
		var str = ""
		html = html.replace(/<\s*(\/?)\s*([a-z]+)[^>]*>/gi,function(full,close,name){
			var beforestr = str;
			name = name.toLowerCase();
			if(name == "table" || name == "tr" || name == "td" || name == "th" || name == "caption" || name == "tbody" || name == "thead" || name == "tfooter" || name == "p" || name == "div" || name == "ul" || name == "li"){
				if(close != "/"){
					str+="\t";
					return "\n"+beforestr+full+"\n"+str;
				}
				else{
					str = str.slice(0, -1);
					return "\n"+str+full+"\n"+str;
				}
			}
			else if(name == "br" || name == "hr"){
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
	table.createInterpreter("html", function(){
		indent = this._id("opt-html-indent").value;
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
		var fulltable = otable;
		if(document.getElementById("opt-html-tbody").checked){
			var tbody = document.createElement("tbody");
			otable.appendChild(tbody);
			otable = tbody;
		}
		for(var i=(this.Table.shadowFirstRow?1:0);i<table.rows.length;i++){
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
				if(cell.getAttribute("data-vertical-align") == "b"){
					ocell.style.verticalAlign = "bottom";
				}
				else if(cell.getAttribute("data-vertical-align") == "t"){
					ocell.style.verticalAlign = "top";
				}
				if(booktabs){
					if(i === 0){
						ocell.style.borderTop = "2px solid black";
					}
					if(i+cell.rowSpan-1 === table.rows.length-1){
						ocell.style.borderBottom = "2px solid black";
					}
				}
				ocell.style.paddingLeft = ocell.style.paddingRight = "3pt";
				if(cell.rowSpan != 1){ocell.rowSpan=cell.rowSpan}
				if(cell.colSpan != 1){ocell.colSpan=cell.colSpan}
				if(cell.hasAttribute("data-diagonal")){
					ocell.innerHTML = '<div style="padding-left: 50px;word-break: keep-all;white-space: nowrap;">'+this.getHTML(cell)+'</div>'+
							 '<div style="padding-right:50px;word-break: keep-all;white-space: nowrap;">'+this.getHTML(cell, 1)+'</div>';
					ocell.style.cssText += "background-image:linear-gradient(to right top, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 49.9%, #000000 50%, #000000 51%, rgba(255, 255, 255, 0) 51.1%, rgba(255, 255, 255, 0) 100%);";
				}
				else{
					ocell.innerHTML = this.getHTML(cell);
				}
				orow.appendChild(ocell);
			}
			otable.appendChild(orow);
		}

		otable.appendChild(orow);
		var oddevenrow = this.oddEvenColors();
		if(oddevenrow){
			for(var i=oddevenrow[0];i<otable.rows.length+1;i++){
				var row = otable.rows[i-1];
				if(i%2<1){
					row.style.backgroundColor = oddevenrow[1];
				}
				else{
					row.style.backgroundColor = oddevenrow[2];
				}
			}
		}
		var container = document.createElement("div");
		container.appendChild(fulltable);
		var equations = container.querySelectorAll("span.latex-equation");
		// TODO : SPACE PROBLEMS!!!
		for(var i=0,eq;i<equations.length;i++){
			eq = equations[i];
			var text = document.createTextNode("$$"+(eq.innerText || eq.textContent)+"$$");
			eq.parentNode.replaceChild(text, eq);
		}
		var footnotes = container.querySelectorAll("span.tb-footnote");
		// TODO : SPACE PROBLEMS!!!
		for(var i=0,ft;i<footnotes.length;i++){
			ft = footnotes[i];
			var text = document.createElement("sup");
			var a = document.createElement("a");
			a.innerHTML = i+1;
			a.href = "#";
			a.title = ft.title;
			text.appendChild(a)
			ft.parentNode.replaceChild(text, ft);
		}
		var html = beautify(container.innerHTML.replace(/<\s*wbr[^>]*>/i,"<br>"));
		if(document.getElementById("opt-html-remove-tag").checked){
			html = html.replace(/\s+<\s*\/\s*(?:p|dt|dd|li|option|thead|th|tbody|tr|td|tfoot|colgroup)\s*>/gm, "")
				   .replace(/[\n\r]{2,}/g, "\n");
		}
		return html;
	})
})();