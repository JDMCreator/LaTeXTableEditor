(function(){
	"use strict";
	var getTexFromCell = function(cell){
		if(!cell || !cell.cell){return "";}
		var latex = generateFromHTML(this.getHTML(cell.cell));
		if(latex.indexOf("\\\\") >= 0){
			latex = "\\vtop{\\hbox{\\strut " + latex.replace(/\s*\\{2}\s*/g, "}\\hbox{\\strut ") + "}}";
		}
		latex = "\\kern3pt "+latex+"\\kern3pt";
		if(cell.align == "r"){
			latex = "\\hfill"+latex;
		}
		else if(cell.align == "c"){
			latex = "\\hfill" + latex + "\\hfill";
		}
		else{
			latex+="\\hfill";
		}
		latex = latex.replace(/\\textbackslash\{\}/g, "{\\char`\\\\}");
		return latex;
	},
	generateFromHTML = function(html, ignoreMultiline, align) {
		align = align || "l";
		var div = document.createElement("div"), hasMultiline;
		div.innerHTML = html;
		var el = div.querySelectorAll("span.latex-equation");
		var eq = []
		for (var i = 0; i < el.length; i++) {
			var kbd = document.createElement("kbd");
			eq.push("$" + (el[i].innerText || el[i].textContent) + "$");
			el[i].parentNode.replaceChild(kbd, el[i]);
		}
		html = div.innerHTML;
		var str = "", kbdcount = 0, ulcount = 0, lastcrcr = -1;
		for(var i=0,c;i<html.length;i++){
			c = html.charAt(i);
			if(c == "<"){
				var inside = html.substring(i, html.indexOf(">", i+1)+1),
				tagname = /^<?\s*\/?\s*([a-z]+)/i.exec(inside)[1].toLowerCase();
				if(/^<?\s*\//.test(inside)){tagname="/"+tagname;}
				if(tagname == "br"){
					hasMultiline = true;
					str += "\\\\";
				}
				else if(tagname == "kbd"){
					str += eq[kbdcount];
					kbdcount++;
				}
				else if(tagname == "b"){
					str += "{\\bf ";
				}
				else if(tagname == "i"){
					str += "{\\it ";
				}
				else if(tagname == "/b" || tagname == "/i"){
					str += "}";
				}
				i += inside.length-1;
				continue;
			}
			else if(c == "&"){
				var inside = html.substring(i, html.indexOf(";", i+1)+1);
				if(inside == "&nbsp;"){
					str += "~";
				}
				else if(inside == "&lt;"){
					str += "$<$";
				}
				else if(inside == "&amp;"){
					str += "\\&";
				}
				else if(inside == "&quot;"){
					str += '"';
				}
				else if(inside == "&gt;"){
					str += "$>$";
				}
				i += inside.length-1;
			}
			else if(c == "\\"){
				str += "\\textbackslash{}";
			}
			else if(c == ">"){
				str += "$>$";
			}
			else if(c == "$" || c == "%" || c == "^" || c == "_" || c == "{" || c == "}" || c == "#"){
				str += "\\" + c;
			}
			else if(c == "|"){
				str += "$|$";
			}
			else if(c.charCodeAt(0)==182){
				str += "\\P{}";
			}
			else if(c == "~"){
				str += "{\\char`\\~}";
			}
			else{
				str+= c;
			}
		}
		if(str.length == lastcrcr){
			str = str.slice(0,-2);
		}
		str = str.replace(/[ ]{2,}/g, " ")
			.replace(/[\n\r]+/g, "");
		return str
	},
	nonASCII = false,
	escapeStr = function(str) {
		if (!str.normalize) {
			return str;
		}
		var newstr = "",
			graph_table = {
				"768": "`",
				"769": "'",
				"770": "^",
				"776": "\"",
				"807": "c ",
				"771": "~",
				"776": "\"",
				"865": "t ",
				"772": "=",
				"775": ".",
				"778": "r ",
				"774": "u ",
				"780": "v ",
				"779": "H ",
				"808": "k ",
				"803": "d ",
				"817": "b ",
			},
			char_table = {
				"338": "OE",
				"339": "oe",
				"198": "AE",
				"230": "ae",
				"216": "O",
				"248": "o",
				"338": "OE",
				"321": "L",
				"322": "l",
				"223": "ss"
			};
		str = str.normalize("NFD");
		var lastchar = "",
			waiting = false;
		for (var i = 0, code, char; i < str.length; i++) {
			code = str.charCodeAt(i),
				char = str.charAt(i);
			if (waiting) {
				if (char == "i" || char == "j") {
					newstr += "\\";
				}
				newstr += char + "}";
				waiting = false;
				continue;
			}
			waiting = false;
			if (code < 128) {
				newstr += "" + char;
				lastchar = char;
			} else if (graph_table[code.toString()]) {
				var code = graph_table[code.toString()];
				newstr = newstr.slice(0, -1)
				if (code == "t ") {
					newstr += "\\t{";
					if (lastchar == "i" || lastchar == "j") {
						newstr += "\\";
					}
					newstr += lastchar;
					waiting = true;
				} else {
					newstr += "\\" + code;
					if (lastchar == "i" || lastchar == "j") {
						newstr += "\\";
					}
					newstr += lastchar;
				}
			} else if (char_table[code.toString()]) {
				newstr += "\\" + char_table[code.toString()] + "{}";
			} else {
				nonASCII = true;
				newstr += "" + char;
				lastchar = char;
			}
		}
		return newstr
	};
	table.createInterpreter("eplain", function(){

		var matrix = this.matrix(),
		str = "\\vbox{\n\\makecolumns ";
		var maxCols = 0;
		for(var i=0;i<matrix.length;i++){
			maxCols = Math.max(maxCols, matrix[i].length);
		}
		str+= (maxCols*matrix.length)+"/"+(matrix.length)+":\n";
		for(var j=0;j<maxCols;j++){
			for(var i=0;i<matrix.length;i++){
				var cell = matrix[i][j];
				if(cell.refCell){
					str+="\n";
				}
				else{
					str += getTexFromCell.call(this,cell)+"\n";
				}
			}
		}

		str += "}"
		str = escapeStr(str);
		if(nonASCII){
			this.message("Your generated Eplain code still contains non-ASCII characters.", "warning")
		}
		return str;
	})
})();