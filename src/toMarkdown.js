(function(){
	var getMdFromCell = function(cell){
		if(!cell || !cell.cell){return "";}
		if(cell.cell.rowSpan>1 || cell.cell.colSpan>1){
			this.message("Merged cells unsupported in Markdown.");
		}
		if(cell.cell.hasAttribute("data-rotated")){
			this.message("Rotated cells unsupported in Markdown.");
		}
		if(cell.cell.hasAttribute("data-diagonal") || cell.cell.hasAttribute("data-two-diagonals")){
			this.message("Cells with diagonal slashes are unsupported in Markdown.");
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
			colHeaders.push(convert[value]||"---");
		}
		return "|"+colHeaders.join("|")+"|";
	}
	table.createInterpreter("md", function(){

		var matrix = this.matrix(),
		headersNb = parseInt(document.getElementById('md-header').value,10)||0,
		str = ""
		isHeader = true,
		header = generateHeaderFromMatrix(matrix);
		headersNb = Math.max(isNaN(headersNb) ? 0 : headersNb,0);
		if(headersNb>=matrix.length){
			headersNb=0;
			this.message("The number of header rows requested is too high. Set to 0 by default.", 1)
		}
		for(var i=0;i<matrix.length;i++){
			var row = matrix[i];
			if(i!==0){
				str += "\n";
			}
			if(i==headersNb && isHeader){
				str += header + "\n";
			}
			str += "|";
			for(var j=0;j<row.length;j++){
				var cell = row[j];
				str += getMdFromCell.call(this, cell) + "|";
			}
		}
		return str;
	})
})();


