(function(){
	function getTextileFromCell(cell){
		var html = "", hasMultiline;
		if(cell.hasAttribute("data-diagonal")){
			html = this.getHTML(cell, 0) + "<br>"+ this.getHTML(cell, 1);
		}
		else if(cell.hasAttribute("data-two-diagonals")){
			html = this.getHTML(cell, 0) + " " + this.getHTML(cell, 1) + "<br>"+ this.getHTML(cell, 2);
		}
		else{
			html = this.getHTML(cell, 0)
		}
		html = html.replace(/<wbr[^>]*>/gi,"<br>");
		var div = document.createElement("div");
		div.innerHTML = html;
		var el = div.querySelectorAll("span.latex-equation");
		var eq = []
		for (var i = 0; i < el.length; i++) {
			var text_formula = el[i].innerText || el[i].textContent;
			if(/\S/.test(text_formula)){
				var kbd = document.createElement("kbd");
				eq.push("$" + text_formula + "$");
				el[i].parentNode.replaceChild(kbd, el[i]);
			}
			else{
				el[i].parentNode.removeChild(el[i]);
			}
		}
		html = div.innerHTML;
		var str = "", kbdcount = 0, ulcount = 0, lastcrcr = -1, whitespace = true;
		for(var i=0,c;i<html.length;i++){
			c = html.charAt(i);
			if(c == "<"){
				var inside = html.substring(i, html.indexOf(">", i+1)+1),
				tagname = /^<?\s*\/?\s*([a-z]+)/i.exec(inside)[1].toLowerCase();
				if(/^<?\s*\//.test(inside)){tagname="/"+tagname;}
				if(tagname == "br"){
					hasMultiline = true;
					if(!/^<?\s*br[^>]*>\s*<\s*\/?\s*li[^a-zA-Z]/i.test(html.substring(i))){
						str += "\n";
					}
				}
				else if(tagname == "kbd"){
					str += eq[kbdcount];
					kbdcount++;
				}
				else if(tagname == "b"){
					if(!whitespace){
						str += "<notextile></notextile>";
					}
					str += "**";
				}
				else if(tagname == "i"){
					if(!whitespace){
						str += "<notextile></notextile>";
					}
					str += "__";
				}
				else if(tagname == "font"){
					if(!whitespace){
						str += "<notextile></notextile>";
					}
					var color = /color\s*=\s*["']?(#?[a-f0-9]+)/i.exec(inside);
					if(color){
						color = color[1];
						if(color){
							color = toRGBA(color);
							color = "#" + ((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2]).toString(16).slice(1).toUpperCase();
							str += "%{color: "+color+";}";
						}
						else{
							str += "%";
						}
					}
					else{
						str += "%";
					}
				}
				else if(tagname == "/b"){
					str += "**";
				}
				else if(tagname == "/i"){
					str += "__";
				}
				else if(tagname == "/u" || tagname == "/font"){
					str += "%";
				}
				else if(tagname == "li"){
					if(/(^\s*$)|([\n\r]\s*$)/.test(str)){
						str += "* ";
					}
					else{
						str += "\n* ";
					}
				}
				else if(tagname == "u"){
					if(!whitespace){
						str += "<notextile></notextile>";
					}
					str += "%{text-decoration: underline;}"
				}
				i += inside.length-1;
				whitespace = false;
				continue;
			}
			else if(/^[\*\%\_{\|]+/.test(html.substring(i))){
				var chars = /^[\*\%\_{\|]+/.exec(html.substring(i))[0];
				i += chars.length-1;
				str += "<notextile>"+chars+"</notextile>";
				whitespace = true;
			}
			else if(/^\s+$/.test(c)){
				var whitespace = true;
				str += c;
			}
			else{
				str+= c;
				whitespace = false
			}
		}
		if(str.length == lastcrcr){
			str = str.slice(0,-2);
		}
		str = str.replace(/[ ]{2,}/g, " ")
			.replace(/[\u200b]+/g, "");

		// Now fix empty cells with newlines

		return str;
	}
	table.createInterpreter("textile", function(){
		var element = this.element,
		matrix = this.Table.matrix(),
		str = ""; // result

		// We start with the label and the caption
		var caption = this.caption();
		str += "table"
		if(caption.label){
			str += "(#"+caption.label.replace(/[^a-zA-Z]/g,"")+")";
		}
		str += "{border-collapse:collapse;}.\n";
		if(caption.caption){
			str+="|= "+caption.caption.replace(/\|+/g, "<notextile>$&</notextile>") + "\n";
		}
		var realRows = [],
		realRow,
		rowsDefinitions = [],
		spanFirstCellCounter = 0;
		for(var i=0;i<matrix.length;i++){
			var rows = matrix[i];
			realRow = [];
			// We try to find all background to avoid repetition
			var colors = {},
			found = true;
			cellLoop: for(var j=0;j<rows.length;j++){
				var cellO = rows[j];
				if(cellO.cell){
					var color = window.getComputedStyle(cellO.cell,null).getPropertyValue("background-color") || "#FFFFFF";
					if(color == "transparent" || /rgba?\s*\(\s*\d+[\s,]+\d+[\s,]+\d+[\s,]+0\s*\)/.test(color)){
						color = [255,255,255,0];
					}
					else{
						color = toRGBA(color);
					}
					color = "#" + ((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2]).toString(16).slice(1).toUpperCase();
					if(color == "#FFFFFF"){
						found = false;
						break cellLoop;
					}
					cellO.background = color;
					if(!colors[color]){
						colors[color] = 0;
					}
					colors[color]++;
				}
			}
			var rowColor = false;
			if(found){
				var max = 0, value = false;
				for(var j in colors){
					if(colors.hasOwnProperty(j) && colors[j] > max){
						value = j;
						max = colors[j];
					}
				}
				if(value){
					rowColor = value;
					rowsDefinitions.push("{background-color: "+value+";}. ")
				}
			}
			else{
				rowsDefinitions.push("");
			}
			for(var j=0;j<rows.length;j++){
				var cellO = rows[j];
				if(cellO.refCell){
					if(realRows.length>0){
						realRows[realRows.length-1].span++;
					}
					else{
						spanFirstCellCounter++;
					}
					continue;
				}
				else{
					var cell = cellO.cell,
					realCell = {colSpan:cell.colSpan+spanFirstCellCounter, text:""}
					// Try to set special value for cells
					var header = "";
					if(cell.colSpan > 1){
						header+="\\"+cell.colSpan;
					}
					if(cell.rowSpan > 1){
						header += "/"+cell.rowSpan;
					}
					// Alignment
					var alignment = cell.getAttribute("data-align");
					if(alignment == "r"){
						header+=">";
					}
					else if(alignment == "c"){
						header += "=";
					}
					var css = "",
					    color = cellO.background;
					if(color && color != "#FFFFFF" && color != rowColor){
						css += "background-color: "+color+";";
					}
					if(css){
						header += "{"+css+"}";
					}
					if(header){
						realCell.text = header + ".";
					}
					realCell.text += " ";
					var textile = getTextileFromCell.call(this, cell);
					realCell.text += textile;
					spanFirstCellCounter = 0;
					realRow.push(realCell);
				}
			}
			realRows.push(realRow);
		}
		for(var i=0;i<realRows.length;i++){
			str += rowsDefinitions[i] + "|";
			for(var j=0;j<realRows[i].length;j++){
				str+=realRows[i][j].text+" |";
			}
			str += "\n";
		}
		return str;
	})
})();