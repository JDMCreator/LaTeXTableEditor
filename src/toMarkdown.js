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
})();


