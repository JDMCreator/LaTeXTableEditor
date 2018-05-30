(function(){
	var indent = "tab";
	function beautify(html){
		var str = "";
		html = html.replace(/<\s*(\/?)\s*([a-z]+)[^>]*>/gi,function(full,close,name){
			var beforestr = str;
			name = name.toLowerCase();
			if(name == "table" || name == "tr" || name == "td"){
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
	function generateFromHTML(html){
		// TODO : Support unordered list
		html = html.replace(/<\s*(\/?)\s*([a-z]+)[^>]*>/gi, function(full, open, tagname){
			tagname = tagname.toLowerCase();
			if(tagname != "i" && tagname != "b" && tagname != "strong" 
			   && tagname != "em" && tagname != "u" && tagname != "br" && tagname != "wbr"){
				return "";
			}
			if(tagname == "wbr"){
				return "<br />";
			}
			return full;
		})
		return html;
	}
	table.createInterpreter("wml", function(){
		indent = "tab" || this._id("opt-wml-indent").value;
		var otable = document.createElement("table"),
		caption = this.caption(),
		div = document.createElement("div"),
		matrix = this.Table.matrix(), wml;
		if(!matrix[0]){
			this.uniqueLog("Empty table");
			return "";
		}
		div.appendChild(otable);
		if(caption && caption.caption){
			otable.setAttribute("title", caption.caption);
		}
		otable.setAttribute("columns", matrix[0].length);
		// Define alignment for columns
		var alignment = {c:0,l:0,r:0},
		align = "",
		actualRow;
		for(var j=0;j<matrix[0].length;j++){
			for(var i=0;i<matrix.length;i++){
				var cell = matrix[i][j],
				cellAlign = "l";
				if(cell.cell){
					// TODO : See if WML supports specific alignment with paragraph (are paragraphs supported in cells?)
					cellAlign = (cell.cell.getAttribute("data-align")||"l").charAt(0).toLowerCase();
					if(cellAlign != "r" && cellAlign != "c"){ cellAlign = "l"}
					alignment[cellAlign]++;
				}
			}
			if(alignment.c > alignment.l && alignment.c > alignment.r){
				align += "C";
			}
			else if(alignment.r > alignment.l && alignment.r > alignment.c){
				align += "R";
			}
			else{
				align += "L";
			}
			alignment = {c:0,l:0,r:0};
		}
		otable.setAttribute("align", align);
		for(var i=0;i<matrix.length;i++){
			actualRow = document.createElement("tr");
			otable.appendChild(actualRow);
			for(var j=0;j<matrix[i].length;j++){
				var cello = document.createElement("td"),
				cell = matrix[i][j];
				actualRow.appendChild(cello);
				if(cell.cell){
					cell = cell.cell;
					if(cello.hasAttribute("data-diagonal")){
						cello.innerHTML = generateFromHTML(this.getHTML(cell,0)+"<br>"+this.getHTML(cell,1))
					}
					else{
						cello.innerHTML = generateFromHTML(this.getHTML(cell))
					}
				}
			}
		}
		wml = beautify(div.innerHTML).replace(/<\s*br[^>]*>/gi, "<br />");
		return wml;
	});
})();