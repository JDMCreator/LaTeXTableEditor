(function(){
	"use strict";
	var getTexFromCell = function(cell){
		if(!cell || !cell.cell){return "";}
		var latex = generateFromHTML(this.getHTML(cell.cell));
		if(latex.indexOf("\\\\") >= 0){
			latex = "\\vtop{\\hbox{\\strut " + latex.replace(/\s*\\{2}\s*/g, "}\\hbox{\\strut ") + "}}";
		}
		if(cell.cell.hasAttribute("data-rotated") && document.getElementById('opt-tex-macro').checked){
			useRotate = true;
			latex = "\\rotatecell{"+latex+"}";
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
			var text_formula = el[i].innerText || el[i].textContent;
			if(/\S/.test(text_formula)){
				var kbd = document.createElement("kbd");
				eq.push("$" + (el[i].innerText || el[i].textContent) + "$");
				el[i].parentNode.replaceChild(kbd, el[i]);
			}
			else{
				el[i].parentNode.removeChild(el[i]);
			}
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
				str += "\\textbackslash{}"; // Will be changed later.
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
			var code = str.charCodeAt(i),
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
	},
	useRotate = false,
	updateCellInfo = function(cell, isFirst, rule, headerAlign, headerRule){
		var tex = getTexFromCell.call(this, cell), oldtex = tex, expand = arguments.length<5;
		if(headerAlign != cell.align || expand){
			if(cell.align == "c"){
				tex = "\\hfill " + tex + "\\hfill";
			}
			else if(cell.align == "r"){
				tex = "\\hfill " + tex
			}
			else{
				tex += "\\hfill"
			}
		}
		if(headerRule != rule || expand){
			if(oldtex == tex){
				tex = "\\kern3pt " + tex + "\\hfill\\kern3pt ";
			}
			else{
				tex = "\\kern3pt " + tex + "\\kern3pt ";
			}
			if(isFirst){
				if(/^[^%]+%/.test(rule)){
					tex = "\\vrule"+tex;
				}
				if(/%[^%]+$/.test(rule)){
					tex += "\\vrule";
				}
			}
			else if(/[^a-z]+$/.test(rule)){
				tex += "\\vrule";				
			}
			if(!expand){
				tex = "\\omit" + tex;
			}
		}
		return tex;
	},
	// The rotate macro (\rotatecell) was made by Pr. Petr Olsak and myself. Thanks a lot for his help
	rotateMacro = "% Insert the following macro once in your document\n\\newdimen\\boxwd\n\\newdimen\\boxht\n\n\\def\\rotatecell#1{%\n\t\\setbox 0 = \\vbox{\\baselineskip=\\normalbaselineskip \\lineskiplimit=0pt\n\t\t\\halign{##\\unskip\\kern2ex\\hfil\\cr#1\\crcr}}%\n\t\\boxwd=\\wd0\n\t\\boxht=\ht0\n\t\\setbox 1 = \\hbox{\\pdfsave\\pdfsetmatrix{0 1 -1  0}\\hbox to0pt{\\box0\\hss}\\pdfrestore}%\n\t\\ht1=\\boxwd\n\t\\boxwd=\\dp1\n\t\\kern\\boxht \\box1 \\kern\\boxwd\n}\n\n",
	generateHeaderFromMatrix = function(matrix){
		var header = "\\strut\n\\vrule height1ex depth1ex width0px #\n",
		    align = [],
		    vrules = [];
		for(var i=0;i<matrix.length;i++){
			var cells = matrix[i];
			for(var j=0;j<cells.length;j++){
				var cell = cells[j];
				if(!cell.ignore){
					if(!align[j]){align[j]={}}
					if(!vrules[j]){vrules[j]={}}
					if(!align[j][cell.align]){align[j][cell.align]=0}
					align[j][cell.align]++
					var comparable = this.getComparableHeader(cells[j-1],cell,cells[j+((cell.cell||{}).colSpan||1)]),
					rules="";
					if(cells[j-1]){
						rules=comparable.replace(/[a-z]+/ig,"");
					}
					else{
						rules = comparable.replace(/[a-z]+/ig,"%");
					}
					if(!vrules[j][rules]){vrules[j][rules]=0}
					vrules[j][rules]++;
					cell.update = updateCellInfo.bind(this, cell, !cells[j-1], rules);
				}
			}
		}
		var finalalign = [],
		actufinalalign = 0, actufinalalignnb=0;
		for(var i=0;i<align.length;i++){
			for(var j in align[i]){
				if(align[i].hasOwnProperty(j)){
					if(align[i][j] > actufinalalignnb){
						actufinalalign = j;
						actufinalalignnb = align[i][j]
					}
				}
			}
			finalalign.push(actufinalalign);
			actufinalalign = actufinalalignnb = 0;
		}
		var finalvrules = [],
		actufinalvrules = "", actufinalvrulesnb=0;
		for(var i=0;i<vrules.length;i++){
			for(var j in vrules[i]){
				if(vrules[i].hasOwnProperty(j)){
					if(vrules[i][j] > actufinalvrulesnb){
						actufinalvrules = j;
						actufinalvrulesnb = vrules[i][j]
					}
				}
			}
			finalvrules.push(actufinalvrules);
			actufinalvrules = "";actufinalvrulesnb = 0;
		}
		for(var i=0;i<finalvrules.length;i++){
			header += "&";
			if(i==0 && finalvrules[i] && finalvrules[i].charAt(0) != "%"){
				header+="\\vrule";
			}
			header += "\\kern3pt "
			if(finalalign[i] != "l"){
				header += "\\hfil ";
			}
			header += "#";
			if(finalalign[i] != "r"){
				header += "\\hfil";
			}
			header+="\\kern3pt";
			if(finalvrules[i] && !/^[^%]*%$/.test(finalvrules[i])){
				header += "\\vrule"
			}
			header+= "\n";
		}
		length = finalvrules.length;
		return {header : header,
			rules : finalvrules,
			align : finalalign};
	},
	length = 0,
	getHBorder = function(o){
		if(arguments.length == ""){
			return "";
		}
		var complete = o.complete,
		borders = o.borders,
		border = "";
		if(complete){
			if(!borders[0]){
				return "";
			}
			else{
				return "\\noalign{" +
					(({
						"toprule" : "\\hrule height0.8pt",
						"bottomrule" : "\\hrule height0.8pt",
						"midrule" : "\\hrule height0.5pt",
						"double" : "\\hrule\\kern1pt\\hrule"
					}[borders[0].type]) || "\\hrule" )
				+ "}"
			}
		}
		else{
			for(var i=-1;i<borders.length;i++){
				var borderO = borders[i];
				if(i!=-1){border+= "&"}
				else{border+="\\omit"}
				if(borderO){
					border+="\\omit" + ({
							"toprule" : "\\leavevmode\\leaders\\hrule height 0.8pt\\hfill\\kern 0pt",
							"bottomrule" : "\\leavevmode\\leaders\\hrule height 0.8pt\\hfill\\kern 0pt",
							"midrule" : "\\leavevmode\\leaders\\hrule height 0.5pt\\hfill\\kern 0pt",
							"double" : "\\hrulefill"
						}[borderO.type] || "\\hrulefill") 
				}
			}
			if(o.types["double"]){
				border += "\\cr\n\\noalign{\\kern1pt}\n"
				for(var i=-1;i<borders.length;i++){
					var borderO = borders[i];
					if(i!=-1){border+= "&"}
					else{border+="\\omit"}
					if(borderO){
						border += "\\omit";
						if(borderO.type == "double"){
							border += "\\hrulefill";
						}
					}
				}
			}
			return border+"\\cr";
		}
	}
	table.createInterpreter("plain", function(){

		var matrix = this.matrix(),
		booktabs = this.element.hasAttribute("data-booktabs"),
                centering = this._id("table-opt-center").checked,
		str = "";
		if(centering){
			str = "$$"; 
		}
		useRotate = false;
		str += "\\vbox{\n";
		str += "\\offinterlineskip\n"
		str += "\\halign{\n";
		var isHeader = true,
		headerO = generateHeaderFromMatrix.call(this, matrix),
		header = headerO.header,
		headerV = headerO.rules,
		headerA = headerO.align;
		str += header;
		var rg = [];
		for(var i=0, border;i<matrix.length;i++){
			var row = matrix[i],
			rgrow = [{text:"",colSpan:1}];
			for(var j=0;j<row.length;j++){
				var cell = row[j];
				if(!cell || cell.ignore){
					rgrow.push(false);
				}
				else{
					var data = cell.update(headerA[j],headerV[j]),
					colspan = (cell.cell||cell.refCell.cell).colSpan,
					content = "";
					j+=colspan-1;
					if(colspan>1){
						if(colspan>9){
							colspan = "{" + colspan + "}";
						}
						content = "\\multispan"+colspan+ cell.update(true);
					}
					else{
						content = data;
					}
					rgrow.push({text:content, colSpan:colspan});
				}
				
			}
			rg.push(rgrow);
			
		}
		var beautifyRows = this.beautifyRows(rg);
		for(var i=0;i<beautifyRows.length;i++){
			if(i  == 0 && booktabs){
				border = "\\noalign{\\hrule height0.8pt}"
			}
			else{
				border = this.HBorder(i, getHBorder, matrix);
			}
			str +="\\cr\n"+(border ? border + "\n" : "");
			str += beautifyRows[i];
		}
		var bottomborder;
		if(booktabs){
			bottomborder = "\\noalign{\\hrule height0.8pt}"
		}
		else{
			bottomborder = this.HBorder(matrix.length, getHBorder, matrix);
		}
		str += "\\cr"
		if(bottomborder){
			str += "\n"+bottomborder
		}
		str += "\n}\n}";
		if(centering){
			str += "$$";
		}
		if(useRotate){
			this.message("The rotation macro for Plain TeX only works with PDFTeX.", "warning");
			str = rotateMacro+str;
		}
		if(document.getElementById('opt-tex-escape').checked){
			// We escape the characters in the document
			str = escapeStr(str);
			if(nonASCII){
				this.message("Your generated TeX code still contains non-ASCII characters.", "warning")
			}
		}
		return str;
	})
})();