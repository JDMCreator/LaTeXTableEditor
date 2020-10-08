(function(){
	var separator = ",",
	getText = function(cell){
		var html = "";
		if(cell.hasAttribute("data-two-diagonals")){
			html = table.getHTML(cell, 0) + " " + table.getHTML(cell, 1) + "<br>" + table.getHTML(cell, 2);
		}
		else if(cell.hasAttribute("data-diagonal")){
			html = table.getHTML(cell, 0) + "<br>" + table.getHTML(cell, 1);
		}
		else{
			html = table.getHTML(cell);
		}
		var text = html.replace(/<\s*br\s*\/?\s*>/gi, "\n").replace(/<[^>]+?>/g,"").replace(/\&(lt|gt|amp|quot);?/gi, function(total, name){
			if(name == "lt"){ return "<" }
			if(name == "gt"){ return ">" }
			if(name == "amp"){ return "&" }
			if(name == "quot"){ return "quot" }
		});
		if(/[\n"]/.test(text) || text.indexOf(separator)>-1){
			text = '"'+text.replace(/"/,"\\\"")+'"';
		}
		return text;
	},
	getTextn = function(cell, n){
	}
	table.createInterpreter("csv", function(){

		var matrix = this.Table.matrix(),
		str = "";
		separator = document.getElementById('opt-csv-separator').value;
		if(separator == "tab"){
			separator = "\t";
		}
		for(var i=0;i<matrix.length;i++){
			var row = matrix[i];
			if(i>0){
				str += "\n";
			}
			for(var j=0;j<row.length;j++){
				var cell = row[j];
				if(j>0){
					str += separator;
				}
				if(cell.cell){
					str += getText(cell.cell);
				}
			}
		}
		return str;
	})
})();