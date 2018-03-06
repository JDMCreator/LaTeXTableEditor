(function(){
	var getMdFromCell = function(cell){
		if(!cell || !cell.cell){return "";}
		if(cell.cell.rowSpan>1 || cell.cell.colSpan>1){
			this.message("Merged cells unsupported in Markdown.", "warning");
		}
		if(cell.cell.hasAttribute("data-rotated")){
			this.message("Rotated cells unsupported in Markdown.", "warning");
		}
		if(cell.cell.hasAttribute("data-diagonal") || cell.cell.hasAttribute("data-two-diagonals")){
			this.message("Cells with diagonal slashes are unsupported in Markdown.", "warning");
		}
		var html = table.getHTML(cell.cell);
		if(document.getElementById('md-html').checked){
			html = html.replace(/(<\s*(?:p|br|div)[^>]*>)/g," &lt;br&gt; $1");
		}
		else{
			html = html.replace(/(<\s*(?:p|br|div)[^>]*>)/g," $1");
		}
		html = html.replace(/(\\|\||\*|_|#)/g,"\\$1").replace(/(\d)\./,"$1\\.");
		html = html.replace(/<\s*\/?\s*(b|(strong))((\s+[^>]*)|)>/ig,"**").replace(/<\s*\/?\s*(i|(em))[^>]*>/ig,"*")
		var div = document.createElement("div");
		div.innerHTML = html;
		var text = (div.textContent||div.innerText||"").replace(/\n\r ?/g, " ")
		return text;
	},
	generateHeaderFromMatrix = function(matrix){
		var headers = [], colHeaders = [],
		    convert = {
			"l" : ":--",
			"c" : ":-:",
			"r" : "--:"
		    }
		for(var i=0;i<matrix.length;i++){
			var cells = matrix[i];
			for(var j=0;j<cells.length;j++){
				var cell = cells[j];
				if(cell && !cell.ignore){
					var align = cell.align;
					if(!headers[j]){headers[j]={}}
					var headernow = headers[j]
					if(!headernow[align]){headernow[align]=0}
					headernow[align]++;
				}
			}
		}
		for(var i=0;i<headers.length;i++){
			var max = 0, value = "", headernow=headers[i];
			for(var j in headernow){
				if(headernow.hasOwnProperty(j) && headernow[j]>max){
					max = headernow[j];value = j;
				}
			}
			colHeaders.push(value||"l");
		}
		return colHeaders;
	},
	beautify = function(rows, headerN, headers){
		var cols = 0,
		rg = [],
		header = "";
		for(var i=0;i<rows.length;i++){
			cols = Math.max(cols, rows[i].length);
			rg[i] = "";
		}
		for(var i=0;i<cols;i++){
			var maxChar = 3;
			for(var j=0;j<rows.length;j++){
				maxChar = Math.max(maxChar, rows[j][i].length);
			}
			for(var j=0;j<rows.length;j++){
				var content = rows[j][i]
				rg[j] += content;
				for(var h = content.length;h<maxChar;h++){
					rg[j] += " ";
				}
				if(i+1<cols){
					rg[j] += " | ";
				}
			}
			var actualHeader = headers[i];
			if(actualHeader == "r"){
				for(var h=0;h<maxChar-1;h++){
					header += "-";
				}
				header += ":";
			}
			else {
				header += ":";
				for(var h=1;h<maxChar-1;h++){
					header += "-";
				}
				if(actualHeader == "c"){
					header += ":";
				}
				else{
					header += "-";
				}
			}
			if(i+1<cols){
				header += " | ";
			}	
		}
		rg.splice(headerN, 0, header);
		return rg;
	}
	table.createInterpreter("md", function(){

		var matrix = this.matrix(),
		headersNb = parseInt(document.getElementById('md-header').value,10)||0,
		str = ""
		isHeader = true,
		headers = generateHeaderFromMatrix(matrix);
		headersNb = Math.max(isNaN(headersNb) ? 0 : headersNb,0);
		if(headersNb>=matrix.length){
			headersNb=0;
			this.message("The number of header rows requested is too high. Set to 0 by default.", 1)
		}
		var rows=[];
		for(var i=0;i<matrix.length;i++){
			var row = matrix[i],
			cells = [];
			for(var j=0;j<row.length;j++){
				var cell = row[j];
				cells.push(getMdFromCell.call(this, cell));
			}
			rows.push(cells);
		}
		rows = beautify(rows, headersNb, headers);
		for(var i=0;i<rows.length;i++){
			if(i>0){str += "\n";}
			str += "| " + rows[i] + " |";
		}
		return str;
	})
	var getContent = function(str, header){
		var newstr = "", openItalique = false, openBold = false;
		for(var i=0;i<str.length;i++){
			var char = str[i],
			before = str[i-1], after = str[i+1];
			if((char == "*" || char == "_") && after != char){
				if(openItalique){
					newstr += "</i>";
					openItalique = false;
				}
				else{
					newstr += "<i>";
					openItalique = true;
				}
			}
			else if((char == "*" || char == "_") && after == char){
				i++;
				if(openBold){
					newstr += "</b>";
					openBold = false;
				}
				else{
					newstr += "<b>";
					openBold = true;
				}
			}
			else if(char == "\\"){
				if(i+1<str.length){
					newstr += after;
				}
			}
			else{
				newstr += "" + char;
			}
		}
		return newstr;
	}
	table.importMd = function(str){
		var o = {cells:[]}
		str = str.split(/\n/g),
		caption;
		var newstr = [], index=-1, caption = "";
		var headers = [];
		for(var i=0;i<str.length;i++){
			if(/^[\|=:.+\s-]+$/.test(str[i]) && str[i].indexOf("|") >= 0){
				index = i;break;
			}
		}
		if(index == -1){
			return false;
		}
		for(var i=index-1;i>=0;i--){
			if(str[i].indexOf("|") < 0){
				str[i].replace(/^\s*\[([\s\S]*)\]\s*$/, function(full, result){
					caption = result;
				})
				index = i+1;break;
			}
			else{
				headers.push(str[i].replace(/^\s*\|?/, "").replace(/\|?\s*$/, "")+"|");
			}
		}
		for(var i=index+1;i<str.length;i++){
			if(str[i].indexOf("|") != -1){
				newstr.push(str[i].replace(/^\s*\|?/, "").replace(/\|?\s*$/, "")+"|");
			}
			else{
				break;
			}
		}
		var colsAlign = [],
		align = str[index].replace(/^\s*\|/g, "").replace(/\|\s*$/g, "").split("|");
		for(var i=0;i<align.length;i++){
			if(/\:[^\:]+\:/.test(align[i])){
				colsAlign.push("c");
			}
			else if(/[^\:]+\:/.test(align[i])){
				colsAlign.push("r");
			}
			else{
				colsAlign.push("l");
			}
		}
		for(var i=0;i<headers.length;i++){
			var row = [];
			var content = "",
			cellO = {};
			for(var j=0, char;j<headers[i].length;j++){
				cellO = {dataset:{}};
				char = headers[i].charAt(j);
				if(char == "|"){
					cellO.html = "<b>"+getContent(content, true)+"</b>";
					console.log(colsAlign[row.length]);
					if(colsAlign[row.length] != "l"){
						cellO.dataset.align = colsAlign[row.length];
					}
					row.push(cellO);
					content = "";
					continue;
				}
				content += "" + char;
				if(char == "\\"){
					j++;
				}
			}
			o.cells.push(row);
		}
		for(var i=0;i<newstr.length;i++){
			var row = [];
			var content = "",
			cellO = {};
			for(var j=0, char;j<newstr[i].length;j++){
				cellO = {dataset:{}};
				char = newstr[i].charAt(j);
				if(char == "|"){
					cellO.html = getContent(content);
					if(colsAlign[row.length] != "l"){
						cellO.dataset.align = colsAlign[row.length];
					}
					row.push(cellO);
					content = "";
					continue;
				}
				content += "" + char;
				if(char == "\\"){
					j++;
				}
			}
			o.cells.push(row);
		}
		return o;
	}
})();


