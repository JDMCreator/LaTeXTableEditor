(function(){

var toHex = function(color){
	return "#"+Math.round((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2]).toString(16).slice(1);
};

var latex = {},
   envirn = function(code){
	var o = {full: ""}
	var com = command(code);
	if(com.name != "begin"){return false}
	o.command = com;
	var name = com.args[0];
	o.name = name;
	code = code.substring(com.full.length);
	var content = "", commentmode = false;
	for(var i=0, char, sub;i<code.length;i++){
		var char = code.charAt(i),
		sub = code.substring(i);
		if(commentmode && char != "\n"){
			content += char;continue;
		}
		commentmode = false;
		if(char == "\\"){
			if(sub.lastIndexOf("\\begin{",0)===0){
				var env = envirn(sub);
				content += env.full;
				i += env.full.length - 1;
			}
			else if(sub.lastIndexOf("\\end{"+name+"}",0)===0){
				o.content = content;
				o.full = o.command.full + o.content + "\\end{"+name+"}";
				return o;
			}
			else{
				var com2 = command(sub);
				content += com2.full;
				i += com2.full.length - 1;
			}
		}
		else if(char == "%"){
			content += "%";
			commentmode = true;
		}
		else{
			content += char;
		}
	}
},
getLength = function(code){
	// TODO
	var length = "";
	var actu = "";
	for(var i=0;i<code.length;i++){
		var c = code.charAt(i);
		if(c == " " || c == "\\"){
			if(/\s*-?(?:[0-9]*.[0-9]+|[0-9]+)(?:pt|mm|cm|in|ex|em|bp|pc|dd|cc|nd|nc|sp)\s*/i.test(actu)){
				length += actu;
			}
			else if(actu.trim() == "plus" || actu.trim() == "minus"){
				length += actu;
			}
			else if(/\\(baselineskip|baselinestretch|columnsep|columnwidth|evensidemargin|linewidth|normalbaselineskip|oddsidemargin|paperwidth|paperheight|parindent|parskip|tabcolsep|textheight|textwidth|topmargin|unitlength)/.test(actu)){
				length += actu;
			}
		}
	}
},
commandNumbers = {
	multicolumn : 3,
	multirow : 3,
	multirowcell : 2,
	multirowthead : 2,
	tabucline : 1,
	taburowcolors : 2
},
specialSeparators = {
	cmidrule : ["(", ")"],
	taburulecolor : ["|", "|"]
},
 command=function(code){
	var o ={
		options : [],
		args : [],
		sp : [],
		full : "",
		asterisk : false
	}
	var name=/^(\\?(?:[a-z]+|.))/i.exec(code)[1],
	realname = name;
	if(realname.charAt(0) == "\\" && realname.length > 1){
		realname = realname.substring(1);
	}
	var nextchar = code.charAt(name.length);
	if(realname == "verb"){
		code = code.substring(name.length+1);
		var arg = "";
		for(var i=0, char;i<code.length;i++){
			char = code.charAt(i);
			if(char == nextchar){
				o.args.push(arg);
				o.name = realname;
				o.full = "\\verb"+nextchar+arg+nextchar;
				return o;
			}
			else{
				arg += "" + char;
			}
		}
		return false;
	}
	else if(realname == "char"){
		// TODO : Improve `\char` support. Now we just try to prevent bugs
		if(nextchar == "`"){
			var nextchar = code.charAt(name.length+1);
			if(nextchar == "\\"){
				o.args.push("\\"+code.charAt(name.length+2))
				o.name = "char";
				o.full = "\\char`\\"+code.charAt(name.length+2);
				return o;
			}
			else{
				o.name = "char";
				o.sp = "`" + nextchar;
				o.full = "\\char`"+nextchar;
			}
		}

	}
	else if(realname == "\\"){
		o.asterisk = nextchar == "*";
		o.name = realname;
		o.full = "\\\\"+(o.asterisk ? "*" : "");
		return o;
	}
	else if(nextchar == "*"){
		o.asterisk = true;
		nextchar = code.charAt(name.length+1);
	}
	if(nextchar == "]" || nextchar == "}" || nextchar == "\\"){
		o.name = realname;
		o.full = "\\" + realname +(o.asterisk ? "*" : "");
		return o;
	}
	if(nextchar!="[" && nextchar!="{" && !/^\s$/.test(nextchar) && !commandNumbers[realname]){
		o.name = realname;
		o.args.push(nextchar);
		o.full="\\"+realname+""+(o.asterisk ? "*" : "")+nextchar;
		return o;
	}
	code = code.substring(name.length+(o.asterisk?1:0)) + " ";
	var mode = 0, actu = "", nbofbrack=0;
	for(var i=0;i<code.length;i++){
		var char = code.charAt(i);
		if(mode == 0){
			if(char == "["){
				mode = 1;
				actu = "";
			}
			else if(char == "{"){
				mode = 2;
				nbofbrack = 0;
				actu = "";
			}
			else if(specialSeparators[realname] && char == specialSeparators[realname][0]){
				mode = 3;
				actu = "";
			}
			else if(commandNumbers[realname] && o.args.length < commandNumbers[realname]){
				o.args.push(char);
			}
			else{
				o.name = realname;
				o.full = "\\"+realname+code.substring(0,i);
				return o;
			}
		}
		else if(char == "\\"){
			var fullcommand = command(code.substring(i)).full;
			actu += fullcommand;
			i+=fullcommand.length-1;
		}
		else if(char == "%"){
			var index = code.indexOf("\n", i);
			var toadd = code.substring(i, index);
			actu += toadd;
			i += toadd.length-1;
		}
		else if(mode == 1){
			if(char == "]"){
				mode = 0;
				o.options.push(actu);
			}
			else{
				actu += ""+char;
			}
		}
		else if(mode == 3){
			if(char == specialSeparators[realname][1]){
				mode = 0;
				o.sp.push(actu);
			}
			else{
				actu += "" + char;
			}
		}
		else{ // mode 2
			if(char == "}"){
				if(nbofbrack<=0){
					mode = 0;
					o.args.push(actu);
				}
				else{
					nbofbrack--;
					actu += char;
				}
			}
			else if(char == "{"){
				nbofbrack++;
				actu += char;
			}
			else{
				actu += "" + char
			}
		}
	}
},
importTable = function(code){

xcolor.erase();
xcolor.extract(code);
var tabularReg = /(?:\\(ctable)[\[\{])|(?:\\begin{((?:long|)tabu\*?|sidewaystable|wraptable|table\*?|xtabular|tabularht\*?|tabularhtx|tabularkv|longtable|mpxtabular|tabular[xy]?\*?)})/g;
var tabular = tabularReg.exec(code);
	tabularReg.lastIndex = 0;
	if(!tabular){
		return false;
	}
	var type = "", obj = {},  code2 = code.substring(tabular.index),beforeCode = code.substring(0, tabular.index);
	if(tabular[1]){
		// We use ctable, so we now to handle this as a special case, because it's a command instead of an environment
		var initCommand = command(code2);
		var opt = initCommand.options[0];
		if(opt){
			var inComment = false, counter = 0, actuname = "", actus={}, actu = "", actun = 1;
			for(var i=0;i<opt.length;i++){
				var c = opt.charAt(i);
				if(inComment){
					if(c == "\n" || c == "\r"){
						inComment = false;
						actu += c;
					}
					continue;
				}
				if(c == "%"){
					inComment = true;
					continue;
				}
				else if(c == "\\"){
					actu += c + opt.charAt(i+1);
					i++;
				}
				else if(c == "{"){
					counter++;
					if(counter > 1){
						actu += c;
					}
				}
				else if(c == "}"){
					counter--;
					if(counter > 0){
						actu += c;
					}
				}
				else if(c == "=" && actun == 1 && counter === 0){
					actuname = actu.trim();
					actu = "";
					actun = 2;
				}
				else if(c == "," && counter === 0){
					if(actun == 1){
						actus[actu.trim()] = true
					}
					else if(actun == 2){
						actus[actuname] = actu.trim();
					}
					actuname = actu = "";
					actun = 1;
				}
				else{
					actu += c;
				}
			}
			if(actu.trim() === "" && actun == 2){
				actus[actuname] = true;
			}
			else if(actu.trim() !== ""){
				if(actun == 1){
					actus[actu.trim()] = true;
				}
				else if(actun == 2){
					actus[actuname] = actu.trim();
				}
			}

			// Now we treat the options here
			if(actus.caption){
				if(!obj.caption){
					obj.caption = {}
				}
				obj.caption.caption = actus.caption;
			}
			if(actus.label){
				if(!obj.caption){
					obj.caption = {}
				}
				obj.caption.label = actus.label;
			}
		}
		var head = header(initCommand.args[0]);
		code = initCommand.args[2]+" ";
		// Here, we replace some ctable specific commands by their equivalent
		code2 = code = code.replace(/\\(NN|FL|ML|LL)([^a-zA-Z@])/g, function(str, name, c){
			return {
				"NN" : "\\tabularnewline",
				"FL" : "\\toprule",
				"ML" : "\\tabularnewline\\midrule",
				"LL" : "\\tabularnewline\\bottomrule"
			}[name] + c;
		});
		console.log(code);
	}
	else{
		type = tabular[2]
		var initEnv = envirn(code2);
		code = initEnv.content;
		if(type == "table" || type == "table*" || type == "sidewaystable" || type == "wraptable"){
			if(/\\begin{((?:long|)tabu\*?|xtabular|tabularht\*?|tabularhtx|tabularkv|longtable|mpxtabular|tabular[xy]?\*?|)}/.test(code)){
				var caption = code.indexOf("\\caption");
				if(caption >=0){
					caption = command(code.substring(caption));
					obj.caption = {}
					obj.caption.caption = caption.args[0];
					obj.caption.numbered = caption.asterisk;
				}
				var label = code.indexOf("\\label");
				if(label >= 0){
					label = command(code.substring(label));
					if(!obj.caption){ obj.caption = {} }
					obj.caption.label = label.args[0];
				}
				tabular = /\\begin{((?:long|)tabu\*?|xtabular|tabularht\*?|tabularhtx|tabularkv|longtable|mpxtabular|tabular[xy]?\*?)}/g.exec(code2);
				if(!tabular){
					return false; // Should not happen
				}
				type = tabular[1];
				beforeCode += code2.substring(0, tabular.index);
				code2 = code2.substring(tabular.index);
				initEnv = envirn(code2);			
			}
			else{
				return false;
			}
		}
		code = initEnv.content;
		if(type == "longtable" || type=="longtabu"){
			var label = code.indexOf("\\label");
			if(label >= 0){
				label = command(code.substring(label));
				if(!obj.caption){ obj.caption = {} }
				obj.caption.label = label.args[0];
			}
			var caption = code.indexOf("\\caption");
				if(caption >=0){
					var comcaption = command(code.substring(caption));
					// Find end of line
					var comment = false;
					for(var i=caption + comcaption.full.length;i<code.length;i++){
						var char = code.charAt(i);
						if(comment){
							if(char == "\n"){
								comment = false;
							}
							continue;
						}
						if(char == "%"){
							comment = true;continue;
						}
						if(char == "\\"){
							var subcommand = command(code.substring(i)),
							scname = subcommand.name;
							if(scname == "\\" || scname == "tabularnewline" || scname == "cr"){
								code = code.substring(0, caption) + "" + code.substring(i+subcommand.full.length);
								break;
							}
						}
					};
					obj.caption = {}
					obj.caption.caption = comcaption.args[0];
					obj.caption.numbered = comcaption.asterisk;
				}	
		}
		var head;
		if(type == "tabular" || type == "xtabular" || type == "mpxtabular" || type == "longtable" || type == "longtabu"){
			head = header(initEnv.command.args[1]);
		}
		else if(type == "tabular*" || type == "tabularx" || type == "tabulary" || type == "tabularht" || type == "tabularkv"){
			head = header(initEnv.command.args[2]);
		}
		else if(type == "tabularht*" || type == "tabularhtx"){
			head = header(initEnv.command.args[3]);
		}
		else if(type == "tabu" || type == "tabu*"){
			// Because "tabu" supports "tabu to <dim>" and "tabu spread <dim>", we need to handle these special and rarely used cases
			if(initEnv.command.args.length == 2){
				head = header(initEnv.command.args[1]);
			}
			else{
				var totalbracket = 0;
				head = "";
				for(var i=0,c;i<code.length;i++){
					c = code.charAt(i);
					if(totalbracket>0){
						if(c == "\\"){
							head += c + code.charAt(i+1);
							i++;
						}
						else if(c == "{"){
							head += c;
							totalbracket++;
						}
						else if(c == "}"){
							if(totalbracket <= 1){
								code = code.substring(i+1);
								break;
							}
							head += c;
							totalbracket--;
						}
						else{
							head += c;
						}
					}
					else if(c == "\\"){
						i++;
					}
					else if(c == "{"){
						totalbracket++;
					}
				}
				head = header(head);
			}
		}
	}

	// We finish to treat header
	// First, we get the colors of columns

	var columncolors = head.colors;

	// Then, the headers components
	head = head.components;

	// Here we are looking for functions like \rowcolors or \rowcolors*
	// TODO : Make it more solid (take care of comments, etc.)
	var alternateColors;
	if(beforeCode.indexOf("\\rowcolors")>-1){
		var alternateCode = beforeCode.substring(beforeCode.lastIndexOf("\\rowcolors")),
		rowcolors = command(alternateCode);
		if(rowcolors.name == "rowcolors"){
			alternateColors = [parseInt(rowcolors.args[0], 10),
					   rowcolors.args[1] ? xcolor(rowcolors.args[1]) : [255,255,255],
					   rowcolors.args[2] ? xcolor(rowcolors.args[2]) : [255,255,255]];
		}		
	}
	var count = 0, borderCSS = {
		"normal" : "1px solid black",
		"double" : "2px double black",
		"toprule" : "2px solid black",
		"bottomrule" : "2px solid black",
		"midrule" : "1px solid black",
		"cline" : "1px solid black",
		"cdouble" : "2px solid black",
		"cmidrule" : "1px solid black",
		"hdashline" : "1px dashed black",
		"dottedline" : "1px dotted black"
	};
	var cellpos = 0, commandmode = false, otherseparator = "",
	table = [[]], cell = "", row = table[0], ignoreSpace = false, actuBorder="", borders = [],
	backgroundRow = [], actualXColorRowNumber = 1, xcolorRowNumbers = [], inComment = false;
	for(var i=0, c;i<code.length;i++){
		c = code.charAt(i);
		var sub = code.substring(i);
		if(inComment){
			if(c == "\n"){
				inComment = false;
			}
			continue;
		}
		if(ignoreSpace && /^\s$/.test(c)){
			continue;
		}
		ignoreSpace = false;
		if(c == "%"){
			inComment = true;
			continue;
		}
		else if(c == "\\"){
			if(sub.lastIndexOf("\\begin{",0) === 0){
				var env = envirn(sub);
				cell += env.full;
				i += env.full.length - 1;	
				continue;
			}
			var com = command(sub), name = com.name;
			if(name == "\\" || name == "cr" || name == "tabularnewline" || name == "endfirsthead"
			|| name == "endhead" || name == "endfoot" || name == "endlastfoot" || name == "crcr"){
				if(name != "crcr" || (row.length > 0 && (row.length > 1 || /\S/.test(row[0])) || actuBorder != "")){
					row.push(cell);
					var allowadd = true;
					if(name == "endfirsthead" || name == "endhead" || name == "endfoot" || name == "endlastfoot"){
						// Avoid useless cells
						// TODO : Improve
						if(row.length == 0 || (row.length == 1 && /^\s*$/.test(row[0]))){
							table.pop();
							borders.pop();
							xcolorRowNumbers.pop();
						}
					}

					else{
						if((row.length == 0 || (row.length == 1 && /^\s*$/.test(row[0]))) &&
							/^\s*$/.test(actuBorder)){
							table.pop();
							allowadd = false;
						}
					}
					cell = "";
					table.push([]);
					if(allowadd){
						borders.push(actuBorder);
						xcolorRowNumbers.push(actualXColorRowNumber);
					}
					actualXColorRowNumber++;
					actuBorder = "";
					row = table[table.length-1];
					ignoreSpace = true;
				}
				i+=com.full.length-1;
			}
			else if(name == "catcode" && /^\\catcode`\\?.=4/.test(sub)){
				var reg = /^\\catcode`\\?(.)=4/.exec(sub);
				otherseparator = reg[1]
				i+= reg[0].length-1;				
			}
			else if(name == "noalign"){
				if(name.args[0].indexOf("\\hrule",0)>-1){
					actuBorder = "normal";
				}
				i+=com.full.length-1;				
			}
			else if(name == "hline" || name == "firsthline" || name == "lasthline" || name == "Xhline"){
				if(actuBorder == "normal"){
					actuBorder = "double";
				}
				else{
					actuBorder = "normal"
				}
				i+=com.full.length-1;
			}
			else if(name == "toprule" || name == "bottomrule" || name == "midrule"){
				actuBorder = name;
				i+=com.full.length-1;
			}
			else if(name == "hdashline" || name == "firsthdashline" || name == "lasthdashline"){
				if(com.options[0]){
					if(parseInt(com.options[0].split(/\//)[0],10)<=1.5){
						actuBorder = "dottedline";
					}
					else{
						actuBorder = "hdashline"
					}
				}
				else{
					actuBorder = "hdashline";
				}
				i+=com.full.length-1;
			}
			else if(name == "tabucline"){
				actualXColorRowNumber++;
				// TODO : Implement different styles for tabucline (ex : dotted, dashed)
				var span = com.args[0];
				if(span == "-"){
					// Span full row
					actuBorder = "normal";
				}
				else{
					if(!actuBorder){
						if(!actuBorder.push){
							actuBorder = [];
						}
						actuBorder.push(["cline", com.args[0].replace(/^-/,"1-")]);
					}
				}
				i+=com.full.length-1;
			}
			else if(name == "cline" || name == "cmidrule" || name == "cdashline" || name == "Xcline"){
				actualXColorRowNumber++;
				if(name == "Xcline"){
					name = "cline";
				}
				if(name == "cmidrule"){
					var cmidrule = parseInt(com.options[0]||0) || com.options[0] || 0;
					if(cmidrule == "\\heavyrulewidth" || (cmidrule>=7.5 && cmidrule<=8.5)){
						name = "toprule";
					}
				}
				if(name == "cdashline" && com.options[0]){
					if(parseInt(com.options[0].split(/\//)[0],10) <= 1.5){
						name = "cdottedline";
					}
				}

				if(!actuBorder || actuBorder.push){
					if(!actuBorder.push){
						actuBorder = [];
					}
					actuBorder.push([name, com.args[0]]);
				}
				i+=com.full.length-1;
			}
			else if(name == "hhline"){
				actualXColorRowNumber++;
				actuBorder = [];
				var hhline = com.args[0], hhlinecomment = false, insidehhline = 0, pos = 1;
				hhlineLoop: for(var j=0, hc;j<hhline.length;j++){
					hc = hhline.charAt(j);
					if(hhlinecomment){
						if(hc == "\n"){
							hhlinecomment = false;
						}
						continue hhlineLoop;
					}
					if(hc == "%"){
						hhlinecomment = true;
					}
					else if(insidehhline > 0){
						if(hc == "\\"){
							j++;
						}
						else if(hc == "{"){
							insidehhline++;
						}
						else if(hc == "}"){
							insidehhline--;
						}
					}
					else if(hc == ">"){
						j++;
						insidehhline = 1;
					}
					else if(hc == "-"){
						actuBorder.push(["cline", pos+"-"+pos]);
						pos++;
					}
					else if(hc == "="){
						actuBorder.push(["cdouble", pos+"-"+pos]);
						pos++;
					}
					else if(hc == "~"){
						pos++;
					}
				}
				i+=com.full.length-1;
			}
			else if(name == "rowcolor"){
				backgroundRow[table.length-1] = xcolor(com.args[0],com.options[0]);
				i+=com.full.length-1;
			}
			else{
				cell += com.full;
				i+=com.full.length-1;
			}
			continue;
		}
		else if(c == "&" || c === otherseparator){
			row.push(cell);
			ignoreSpace = true;
			cell = "";
			otherseparator = "";
		}
		else{
			cell += c;
		}
	}
	row.push(cell);
	borders.push(actuBorder);
	xcolorRowNumbers.push(actualXColorRowNumber);
	actualXColorRowNumber++;
	var thisRowVCell = false,
	nextRowVCell = false,
	vcellIndex = [],
	newTable = [],
	realBorders = []
	for(var i=0;i<table.length;i++){
		var row = table[i];
		nextRowVCell = false;
		if(!thisRowVCell){
			newTable.push([]);
			realBorders.push(borders[i]);
		}
		for(var j=0;j<row.length;j++){
			if(thisRowVCell){
				var code = row[j];
				if(code.indexOf("\\printcelltop")>=0){
					newTable[newTable.length-1][j].dataset.verticalAlign="t";
				}
				else if(code.indexOf("\\printcellbottom")>=0){
					newTable[newTable.length-1][j].dataset.verticalAlign="b";
				}
				else{
					newTable[newTable.length-1][j].dataset.verticalAlign="m";
				}
			}
			else{
				// Let's determine default background color for this cell
				// Priority to rowcolor
				var backgroundCell = backgroundRow[i];
				
				if(!backgroundCell && alternateColors){
					if(Math.max(+alternateColors[0]||1, 1)<= xcolorRowNumbers[i]){
						if(xcolorRowNumbers[i]%2 === 0){
							// Even
							backgroundCell = alternateColors[2];
						}
						else{
							// Odd
							backgroundCell = alternateColors[1];
						}
					}
				}
				setCellO(newTable, j, newTable.length-1, row[j], head[j], backgroundCell, columncolors[j])
				if(newTable[newTable.length-1][j].vcell){
					nextRowVCell = true;
					delete newTable[newTable.length-1][j].vcell;
				}
			}
		}
		thisRowVCell = nextRowVCell;
	}
	table = newTable;
	// REMOVE EMPTY CELL AT THE END
	if(table[table.length-1].length == 1){
		var lastCell = table[table.length-1][0];
		if(/^\s*$/.test(lastCell.html) && (!lastCell.dataset || (!lastCell.borderLeft && !lastCell.borderRight && !lastCell.borderBottom))){
			table.pop();
		}
	}
	// ROWSPAN
	for(var i=0;i<table.length;i++){
		var row = table[i],
		pos = 0;
		for(var j=0;j<row.length;j++){
			var o = row[j],
			o2;
			if(o.rowSpan && Math.abs(o.rowSpan) != 1){
				if(o.rowSpan < 0){
					var span = Math.abs(o.rowSpan);
					o.rowSpan = span;
					for(var k=i-span+1;k<i+1;k++){
						var row2 = table[k];
						if(row2){
							var pos2 = 0;
							for(var h=0;h<row2.length;h++){
								if(pos2 == pos){
									if(k==i-span+1){
										row2[h] = {};
										// Copy object
										for(var f in o){
											if(o.hasOwnProperty(f)){
												row2[h][f] = o[f];
											}
										}
										row2[h].rowSpan = span;
										o2 = row2[h];
									}
									else{
										row2[h].remove = true;
										row2[h].refCell = o2;
									}
								}
								pos2 += row2[h].colSpan || 1;
							}
						}
					}
				}
				else{
					for(var k=1;k<Math.abs(o.rowSpan);k++){
						var row2 = table[i+((o.rowSpan<0 ? -1 : 1) * k)];
						if(row2){
							var pos2 = 0;
							for(var h=0;h<row2.length;h++){
								if(pos2 == pos){
									row2[h].remove = true;
									row2[h].refCell = o;
								}
								pos2 += row2[h].colSpan || 1;
							}
						}
					}
				}
			}
			pos += o.colSpan || 1;
		}
	}
	borders = realBorders;
	// HORIZONTAL BORDERS
	obj.autoBooktabs = false;
	if(borders){
		if(borders[0] == "toprule" && borders[borders.length-1] == "bottomrule"){
			obj.autoBooktabs = true;
		}
	}
	for(var i=0;i<borders.length;i++){
		var border = borders[i],
		row = table[(i===0) ? 0 : i-1], first = i===0;
		if(obj.autoBooktabs && (i===0 || i===borders.length-1)){
			continue;
		}
		if(!border || !row){continue;}
		if(border == "normal" || border == "double" || border == "midrule" || border == "toprule" || border == "bottomrule" || border == "hdashline" || border == "dottedline"){
			for(var j=0;j<row.length;j++){
				var o = row[j];
				o = o.refCell || o;
				if(first){
					o.dataset.borderTop = border;
					o.css+="border-top:"+borderCSS[border]+";";
				}
				else{
					o.dataset.borderBottom = border;
					o.css+="border-bottom:"+borderCSS[border]+";";
				}
			}
		}
		else if(border.push){
			for(var j=0;j<border.length;j++){
				var subborder = border[j];
				if(subborder[0]  == "cline" || subborder[0] == "cdouble" || subborder[0] == "cmidrule" || subborder[0] == "cdottedline" || subborder[0] == "cdashline" || subborder[0] == "toprule"){
					var end = subborder[1].split(/-+/),
					start = parseInt(end[0],10)-1;
					end = (parseInt(end[1],10)||row.length)-1,
					pos = 0,
					realname = {
						cline : "normal",
						cmidrule : "midrule",
						cdottedline : "dottedline",
						cdashline : "hdashline",
						cdouble: "double",
						toprule: "toprule"
					}[subborder[0]];
					for(k=0;k<row.length;k++){
						var o = row[k];
						o = o.refCell || o;
						if(pos >= start){
							if(pos <= end){
								if(first){
									o.dataset.borderTop = realname;
									o.css+="border-top:"+borderCSS[realname]+";";
								}
								else{
									o.dataset.borderBottom = realname;
									o.css+="border-bottom:"+borderCSS[realname]+";";
								}
							}
							else{
								break;
							}
						}
						pos += o.colSpan || 1;
					}
				}	
			}
		}
	}
	var realtable = [];
	var colLength = 1;
	for(var i=0;i<table.length;i++){
		var rowCount = 0;
		for(var j=0;j<table[i].length;j++){
			rowCount += (table[i][j].colSpan||1);
		}
		colLength = Math.max(colLength, rowCount);
	}
	for(var i=0;i<table.length;i++){
		var realrow = [], row = table[i], rowCount = 0;
		for(var j=0;j<row.length;j++){
			rowCount += (row[j].colSpan||1);
			if(!row[j].remove){
				realrow.push(row[j]);
			}
		}
		for(var j=rowCount;j<colLength;j++){
			realrow.push({
				html:"",
				css:"",
				dataset:{align:"l"}
			});
		}
		realtable.push(realrow);
	}
	obj.cells = realtable;
	return obj;
},
setCellO = function(table, x, y, code, head, backgroundRow, columnColor){
	var o = {html:"", dataset:{}},
	html = getHTML(code,o);
	o.html = html;
	var css = "";
	var span = /\\multicolumn(?:{[ ]*([0-9]*)[ ]*}|([0-9]))/.exec(code);
	if(span){
		span = command(code.substring(span.index));
		head = header(span.args[1]);

		// We set a new column color
		columnColor = head.colors[0]

		// Then we get the real head
		head = head.components[0]
		o.colSpan = parseInt(span.args[0], 10);
	}
	span = /\\multirow(?:cell|thead|)(?:[ ]*\[[^\]]*\]|)(?:{[ ]*(-?[0-9]*)[ ]*}|([0-9]))/.exec(code);
	if(span){
		o.rowSpan = parseInt(span[1]||span[2], 10);
	}

	if(/\\(?:vcell|savecellbox)\s*(?:\{|\\)/.test(code)){
		o.vcell = true;
	}

	// Get cell background info from \cellcolor
	var cellcolor = /\\cellcolor[^a-zA-Z]/.exec(code);
	if(cellcolor){
		cellcolor = command(code.substring(cellcolor.index));
		cellcolor = xcolor(cellcolor.args[0], cellcolor.options[0]);
	}

	// Now treat background
	if(cellcolor){
		css += "background-color:rgb("+cellcolor.join(",")+");";
	}
	else if(backgroundRow){
		css += "background-color:rgb("+backgroundRow.join(",")+");";
	}
	else if(columnColor){
		css += "background-color:rgb("+columnColor.join(",")+");";
	}
	
	// Treat header;
	head = head || "l";
	if(head.substring(0,2) == "||"){
		o.dataset.borderLeft = "double";
		css += "border-left: 2px double black;"
	}
	else if(head.charAt(0) == "|"){
		o.dataset.borderLeft = "normal";
		css += "border-left: 1px solid black;"
	}
	else if(head.charAt(0) == ":"){
		o.dataset.borderLeft = "hdashline";
		css += "border-left: 1px dashed black;"
	}
	else if(head.charAt(0) == ";"){
		o.dataset.borderLeft = "dottedline";
		css += "border-left: 1px dotted black;"
	}
	if(/\|\|$/.test(head)){
		o.dataset.borderRight = "double";
		css += "border-right: 2px double black;";
	}
	else if(head.charAt(head.length-1) == "|"){
		o.dataset.borderRight = "normal";
		css += "border-right: 1px solid black;"
	}
	else if(head.charAt(head.length-1) == ";"){
		o.dataset.borderRight = "dottedline";
		css += "border-right: 1px dotted black;"
	}
	else if(head.charAt(head.length-1) == ":"){
		o.dataset.borderRight = "hdashline";
		css += "border-right: 1px dashed black;"
	}
	o.dataset.align = "l";
	for(var i=0,c;i<head.length;i++){
		c = head.charAt(i);
		if(c == "l" || c == "c" || c == "r"){
			o.dataset.align = c;
			continue;
		}
	}
	if(code.indexOf("\\rotcell") != -1 || code.indexOf("\\begin{sideways}") != -1){
		o.dataset.rotated = "data-rotated";
	}
	o.css = css;
	table[y][x] = o;
},
getHTML = function(code,o){
	o = o || {}
	var html="", commentmode = false, mathmode = false, mathcontent = "", div = document.createElement("div");
	for(var i=0, char, sub;i<code.length;i++){
		char = code.charAt(i);
		sub = code.substring(i);
		if(commentmode && char != "\n"){
			continue;
		}
		commentmode = false;
		if(mathmode){
			if(char == "%"){
				commentmode = true;
				continue;
			}
			else if(char == "$"){
				if(sub.charAt(1) == "$"){
					i++;
				}
				mathmode = false;
				div.textContent = div.innerText = mathcontent;
				mathcontent = "";
				html += div.innerHTML + "</span>";
				continue;
			}
			else if(char == "\\"){
				if(sub.charAt(1) == ")" || sub.charAt(1) == "]"){
					mathmode = false;
					div.textContent = div.innerText = mathcontent;
					mathcontent = "";
					html += div.innerHTML + "</span>";
					continue;
				}
				mathcontent += char + sub.charAt(1); // Prevent \$ and \\ to change output
				i++;
				continue;
			}
			else{
				mathcontent += char;
			}
			continue;
		}
		if(char == "\\"){
			if(sub.charAt(1) == "(" || sub.charAt(1) == "["){
				i++;
				mathmode = true;
				mathcontent = "";
				html += '<span class="latex-equation">';
			}
			else if(sub.lastIndexOf("\\begin{",0) === 0){
				var env = treatEnv(sub);
				html += env.html;
				i += env.env.full.length -1;
			}
			else{
				var com = treatCom(sub);
				html += com.html;
				i += com.command.full.length -1;
			}
		}
		else if(char == "$"){
			if(sub.charAt(1) == "$"){
				i++;
			}
			mathmode = true;
			mathcontent = "";
			html += '<span class="latex-equation">';
		}
		else if(char == '"'){
			// Here we support german and cyrillic
			var nextCharacter = sub.charAt(1);
			if(/^[\|\"\~,]$/.test(nextCharacter)){
				i++;
				continue;
			}
			else if(nextCharacter == "-" || nextCharacter == "="){
				html += "-";i++;continue;
			}
			else if(/^"--[~*-]/.test(sub)){
				html += "&mdash;";
				i += 3;
				continue;
			}
			else if(nextCharacter == "<"){
				html += "&laquo;";
				i++;
				continue;
			}
			else if(nextCharacter == ">"){
				html += "&raquo;";
				i++;
				continue;
			}
			else if(nextCharacter == "'"){
				html += "&ldquo;";
				i++;
				continue;
			}
			else if(nextCharacter == "`"){
				html += "&bdquo;";
				i++;
				continue;
			}
			else if(nextCharacter == "s" || nextCharacter == "z"){
				html += "&szlig;";
				i++;
				continue;
			}
			else if(nextCharacter == "S"){
				html += "SS";
				i++;
				continue;
			}
			else if(nextCharacter == "Z"){
				html += "SZ";
				i++;
				continue;
			}
			else if(nextCharacter == "/"){
				html += "/";
				i++;
				continue;
			}
			else if(/^[aeiou]$/i.test(nextCharacter)){
				html += "&"+nextCharacter+"uml;";
				i++;
				continue;
			}
			else{
				html += '&quot;';
			}
		}
		else if(char == "-"){
			if(sub.lastIndexOf("---",0)===0){
				html += "&mdash;"
				i += 2;
			}
			else if(sub.charAt(1) == "-"){
				html += "&ndash;"
				i++			
			}
			else{html += "-"}
			continue;
		}
		else if(char == "?" && sub.charAt(1) == "`"){
			html += "&iquest;";
			i++;
		}
		else if(char == "!" && sub.charAt(1) == "`"){
			html += "&iexcl;";
			i++;
		}
		else if(char == "`" && sub.charAt(1) == "`"){
			html += "&ldquo;"
			i++;
		}
		else if(char == "'" && sub.charAt(1) == "'"){
			html += "&rdquo;"
			i++;
		}
		else if(char == "%"){
			commentmode = true;
			continue;
		}
		else if(char == "<"){
			html += "&lt;";
		}
		else if(char != "\n" && char != "\t" && char != "{" && char != "}"){
			html += char;
		}
	}
	return html;
},
getHeaderComponent = function(head, i){
	var c = head.charAt(i),
	    next = head.charAt(i+1),
	    o = {char : c, opts : [], args : [], full: c},

	    // These are special column types which requires more than one argument
	    // We need this to parse the shorten construction (i.e. *2c instead of *{2}{c}) 
	    specialColumns = {
		"*" : 2,
		"D" : 3, // From 'dcolumn' package
		"F" : 3, // From 'fcolumn' package
		"w" : 2, // From 'array'
		"W" : 2
	    },
	    ogI = i;

	var nargs = specialColumns[c] || 0
	//if(c == "D"){debugger;}
	i++, commentmode = false, nArg = 0, inOpt = false, actu = "";
	for(var d;i<head.length;i++){
		d = head.charAt(i)
		if(commentmode){
			if(d == "\n" || d == "\r"){
				commentmode = false;
			}
			continue;
		}
		if(d == "%"){
			commentmode = true;
			continue;
		}
		else if(nArg>0 || inOpt){
			// TODO : More robust (aka support `} and \verb)
			if(d == "\\"){
				actu += d + (head.charAt(i+1) || ""); 
				i++;
			}
			else if(d == "]" && inOpt && nArg<=0){
				o.opts.push(actu);
				inOpt = false;
				nArg = 0;
				actu = "";
			}
			else if(d == "}"){
				nArg--;
				if(nArg <= 0 && !inOpt){
					o.args.push(actu);
					actu = "";
					nArg = 0;
				}
				else{
					actu += d;
				}
			}
			else if(d == "{"){
				nArg++;
				actu += d;
			}
			else{
				actu += d;
			}
		}
		else if(d == "{"){
			nArg++;
			continue;	
		}
		else if(d == "["){
			inOpt = true;
			continue;
		}
		else if(o.args.length < nargs){
			o.args.push(d);
		}
		else{
			break;
		}
	}
	o.full += head.substring(ogI+1,i);
	return o;
},
header = function(head){
	var arr=[], actu = "", foundfirst = false, commentmode = false, colors = [], nextAlign = "";
	for(var i=0,c;i<head.length;i++){
		c = head.charAt(i),
		info = getHeaderComponent(head, i);
		if(commentmode){
			if(c == "\n" || c == "\r"){
				commentmode = false;
			}
			continue;
		}
		else if(c == "%"){
			commentmode = true;

			continue;
		}
		else if(c == "*" && info.args.length >= 2 && (+info.args[0] || 0) > 0){
			var subpreamble = "";
			for(var j=0;j<info.args[0];j++){
				subpreamble += info.args[1]
			}
			head = head.substring(0, i) + subpreamble + head.substring(i + info.full.length);
			i--;
			continue;
		}
		i += info.full.length - 1;
		if(c == "|" || c == ":"){
			actu += c;
		}
		else if(/[a-zA-Z]/.test(c)){
			c = c.toLowerCase();
			if(nextAlign){
				c = nextAlign;
				if(c != "c" && c!= "r"){
					c = "l";
				}
				nextAlign = "";
			}
			else if(c == "w"){
				c = info.args[0];
				if(c != "c" && c != "r"){
					c = "l";
				}
			}
			else if(c == "x"){
				if(info.opts.length == 1){
					c = (/^[0-9-]/.test(info.opts[0]) ? /([cr])[\s\S]*$/i : /^[\s\S]*([cr])/i).exec(info.opts[0]);
					c = c ? c[1] : "l";
				}
				else{
					c = "l";
				}
			}
			else if(c != "c" && c != "r"){
				c = "l";
			}
			if(foundfirst){
				arr.push(actu);
				actu = c;
			}
			else{
				foundfirst = true;
				actu += c;
			}
		}
		else if(c == ";"){
			if(info.args.length > 0){
				var splitcom = info.args[0].split(/\//)[0];
				if(parseInt(splitcom,10) <= 1.5){
					actu += ";";
					continue;
				}
			}
			actu += ":";
		}
		else if((c == "!" || c == "@") && info.args.length > 0){
			if(info.args[0].indexOf("\\vrule") != -1){
				actu += "|";
			}
			else if(info.args[0].indexOf("\\vdashline") != -1){
				actu += ":";
			}
		}
		else if(c == ">" && info.args.length > 0){
			var content = info.args[0];

			// Here, we are looking for \columncolor info
			var columncolor = /\\columncolor[\[\{]/.exec(content);
			if(columncolor){
				columncolor = content.substring(columncolor.index);
				columncolor = command(columncolor)
				var color = xcolor(columncolor.args[0], columncolor.options[0]);
				colors[arr.length] = color;
			}

			// Now we are looking for alignment info
			if(/\\[cC]entering([^a-zA-Z]|$)/.test(content)){
				nextAlign = "c";
			}
			else if(/\\(raggedleft|RaggedLeft)([^a-zA-Z]|$)/.test(content)){
				nextAlign = "r";
			}
		}
	}
	if(actu){
		arr.push(actu);
	}
	return {
		components: arr,
		colors: colors
	};
},
treatEnv = function(code){
	var env = envirn(code),
	name = env.name, o = {env : env}, html = ""
	if(name == "verbatism"){
		var div = document.createElement("div");
		div.textContent = div.innerText = env.content;
		html = div.innerHTML;
	}
	else if(name != "comment"){
		html = getHTML(env.content);
	}
	o.html = html;
	return o;
},
graph_table = {
	"`" : 768,
	"'" : 769,
        "\"" : 776,
        "c" : 807,
        "~" : 771,
	"t" : 865,
	"=" : 772,
	"." : 775,
	"r" : 778,
        "u" : 774,
	"v" : 780,
	"H" : 779,
	"k" : 808,
	"d" : 803,
	"b" : 817,
	"q" : 780,
	"w" : 778,
 	"OE" : 338,
	"oe" : 339,
	"AE" : 198,
	"ae" : 230,
	"O" : 216,
	"o" : 248,
	"OE" : 338,
	"L" : 321,
	"l" : 322,
	"ss" : 223,
	"dq" : 34,
	"flq" : 8249,
	"frq" : 8250,
	"flqq" : 171,
	"frqq" : 187,
	"grqq" : 8220,
	"glqq" : 8222,
	"TH" : 222,
	"th" : 254,
	"DH" : 208,
	"dh" : 240,
	"euro" : 8364,
	"NJ" : 330,
	"nj" : 331,
	"aa" : 229,
	"AA" : 196
},
treatCom = function(code){
	var o = {},
	bannedCommands = {
		"cellcolor" : 1,
		"cite" : 1,
		"hhline" : 1,
		"hspace" : 1,
		"interrowspace" : 1,
		"label" : 1,
		"ref" : 1,
		"pageref" : 1,
		"phantom" : 1,
		"rowcolor" : 1,
		"rule" : 1,
		"vspace" : 1
	},
	html = "";
	var com = command(code),
	topush = ""
	name = com.name
	o.command = com;
	if(name == "textit"|| name == "emph" || name=="textsl"){
		html+="<i>" + getHTML(com.args[0]) + "</i>"; 
	}
	else if(name == "textbf"){
		html+="<b>" + getHTML(com.args[0]) + "</b>";
	}
	else if(name == "emph"){
		html+="<i>" + getHTML(com.args[0]) + "</i>";
	}
	else if(name == "tablefootnote" || name == "footnote"){
		var div = document.createElement("div"),
		span = document.createElement("span");
		span.className = "tb-footnote";
		span.innerHTML = "&#x200b;";
		span.title = getHTML(com.args[0]);
		div.appendChild(span);
		html += div.innerHTML;
	}
	else if(name == "uline" || name == "underline"){
		html+="<u>" + getHTML(com.args[0]) + "</u>";
	}
	else if(name == "url" || name == "underline" || name == "part" || name == "chapter" || name == "subsection" || name == "section" ||
		name == "caption"){
		html+= getHTML(com.args[0]);
	}
	else if(name == "TeX" || name == "LaTeX" || name == "%" || name == "}" || name == "{" || name == "_" || name == "#" || name == " " || name == "$" || name == "i" || name == "j"){
		html += name;
	}
	else if(name == "\\" || name == "newline" || name == "linebreak" || name == "par"){
		html += "<br>"
	}
	else if(name == "P"){
		html += "&para;"
	}
	else if(name == "^"){
		if(com.args.length == 0){
			html += "^";
		}
		else{
			html += com.args[0] + String.fromCharCode(770);
		}
	}
	else if(graph_table[name]){
		if(com.args.length > 0){
			html += com.args[0] + String.fromCharCode(graph_table[name]);
		}
		else{
			html += String.fromCharCode(graph_table[name]);
		}
	}
	else if(name == "hbox"){
		html += getHTML(com.args[0])+"<br>";
	}
	else if(name == "multicolumn" || name == "multirow"){
		html += getHTML(com.args[2]);
	}
	else if(name == "textcolor"){
		var color = xcolor(com.args[0], com.options[0]) || [0,0,0];
		html += '<font color="'+toHex(color)+'">'+ getHTML(com.args[1]) + '</font>';
	}
	else if(name == "multirowcell" || name == "multirowhead"){
		html += getHTML(com.args[1]);
	}
	else if(name == "verb"){
		var div = document.createElement("div");
		div.innerText = div.textContent = com.args[0];
		html += div.innerHTML;
	}
	else if(name == "textquestiondown"){
		html += "&iquest;";
	}
	else if(name == "textexclamdown"){
		html += "&iexcl;";
	}
	else if(name == "textbar"){html += "|"}
	else if (name == "textbackslash" || name == "boi"){html += "\\"}
	else if(name == "textthreequartersemdash"){html += "&#8210;"}
	else if(name == "cyrdash" || name == "textemdash"){html += "&mdash;"}
	else if(name == "textasciitilde"){html += "~"}
	else if(name == "textasciicircum"){html += "^"}
	else if(name == "pounds" || name == "textsterling"){html += "&pound;"}
	else if(name == "og"){html+="&laquo;"}
	else if(name == "fg"){html+="&raquo;"}
	else if(com.args.length == 1 && !bannedCommands[name]){
		html += getHTML(com.args[0]);
	}
	
	o.html = html;
	return o;
}
if(!table.latex){
	table.latex = {}
}
table.latex.importTable = importTable;
})();