(function(){
	function Command(name){
		var args = {};
		this.set = function(key, value){
			args[key] = value;
		}
		this.get = function(){
			var str = "\\" + name,
			first = true;
			for(var i in args){
				if(args.hasOwnProperty(i)){
					if(first){
						str += "["+i+"="+args[i];
						first = false;
					}
					else{
						str += ","+i+"="+args[i];
					}
				}
			}
			if(!first){
				str += "]";
			}
			return str;
		}
	}
	var specialCharacters = {
		"#" : "\\#",
		"$" : "\\textdollar",
		"%" : "\\percent",
		"&" : "\\&",
		"\\" : "\\textbackslash",
		"^" : "\\textcircumflex",
		"_" : "\\textunderscore",
		"{" : "\\textbraceleft",
		"|" : "\\textbar",
		"}" : "\\textbraceright",
		"~" : "\\textasciitilde"
	}
	function getCellContent(cell){
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
					str += "\\bold{";
				}
				else if(tagname == "i"){
					str += "\\italic{";
				}
				else if(tagname == "font"){
					var color = /color\s*=\s*["']?(#?[a-f0-9]+)/i.exec(inside);
					if(color){
						color = color[1];
						if(color){
							color = toRGBA(color);
							color = [color[0], color[1], color[2]].map(function(c){
								return Math.round(c/255*1000)/1000;
							});
							var colored = new Command("colored");
							colored.set("r", color[0]);
							colored.set("g", color[1]);
							colored.set("b", color[2]);
							str += colored.get()+"{"
						}
						else{
							str += "{";
						}
					}
					else{
						str += "{";
					}
				}
				else if(tagname == "strike"){
					str += "\inframed[frame=off]{\overstrike{";
				}
				else if(tagname == "/strike"){
					str += "}}";
				}
				else if(tagname == "sup"){
					str += "\\high{";
				}
				else if(tagname == "/b" || tagname == "/i" || tagname == "/u" || tagname == "/font" || tagname == "/sup"){
					str += "}";
				}
				else if(tagname == "u"){
					str += "\\underbar{"
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
					str += "<";
				}
				else if(inside == "&amp;"){
					str += "\\&";
				}
				else if(inside == "&quot;"){
					str += '"';
				}
				else if(inside == "&gt;"){
					str += ">";
				}
				i += inside.length-1;
			}
			else if(specialCharacters[c]){
				str += specialCharacters[c];
			}
			else{
				str+= c;
			}
		}
		if(str.length == lastcrcr){
			str = str.slice(0,-2);
		}
		str = str.replace(/[ ]{2,}/g, " ")
			.replace(/[\n\r\u200b]+/g, "");

		// Now fix empty cells with newlines

		str = str.split(/\\\\/g);
		if(str.length > 1){
			for(var i=0;i<str.length;i++){
				if(/^\s*$/.test(str[i])){
					str[i] = "~";
				}
			}
		}
		str = str.join("\\\\");

		return str;
	}
	function Apex(){
		var args = {}
		this.add = function(val, nb){
			nb = nb || 1;
			if(!args.hasOwnProperty(val)){
				args[val] = 0;
			}
			args[val] += nb;
		}
		this.get = function(){
			var val = null,
			max = 0;
			for(var i in args){
				if(args.hasOwnProperty(i)){
					if(args[i] > max){
						val = i;
						max = args[i];
					}
				}
			}
			return val;
		}
	}
	function fullRow(type, length){
		var o = {complete:true,color:false,types:{},borders:[]}
		o.types[type] = true;
		for(var i=0;i<length;i++){
			o.borders.push({type:type,sameAsBefore:true,cellIndex:i,color:"black"});
		}
		return o;
	}
	function getBordersArray(start, end, matrix){
		end = end || start
		var arr = [],
		useBooktabs = this.element.hasAttribute("data-booktabs");
		for(var i=start;i<end+1;i++){
			if(useBooktabs && i===0){
				arr.push(fullRow("toprule", matrix[i].length));
			}
			else if(useBooktabs && i === matrix.length){
				arr.push(fullRow("bottomrule", matrix[i-1].length));
			}
			else{
				this.HBorder(i, function(o){
					arr.push(o);
				}, matrix);
			}
		}
		console.log(arr[1]);
		return arr;
	}
	function getBorderSize(border, complete){
		var name = border.type || border;
		if(name == "toprule" || name == "bottomrule"){
			return ".08em";
		}
		else if(name == "midrule"){
			if(complete){
				return ".05em";
			}
			return ".03em";
		}
		return ".4pt";
	}
	function toContextColor(rgba){
		rgba = [+rgba[0], +rgba[1], +rgba[2]];
		return rgba.map(function(c){
			return Math.round(c/255*1000)/1000
		});
	}
	function getChars(rows, borders, fakeRows){
		var align = new Apex(),
		frame = new Apex(),
		framecolor = new Apex(),
		backgroundColor = new Apex(),
		leftFrame = new Apex(),
		bottomFrame = new Apex(),
		rightFrame = new Apex(),
		topFrame = new Apex(),
		thickness = new Apex();

		for(var i=0;i<rows.length;i++){
			var row = rows[i];
			for(var j=0;j<row.length;j++){
				var cell = row[j],
				cellHTML = cell.cell;
				if(cell.refCell){
					continue;
				}

				// Left border
				if(cell.leftBorder){
					leftFrame.add(1);
					thickness.add(getBorderSize(cell.leftBorder, true))
				}
				else{
					var leftcell = row[j-1];
					if(leftcell){
						leftcell = leftcell.refCell || leftcell;
						// Take care of rowspan
						if(leftcell.y == cell.y){
							if(cell.rightBorder){
								leftFrame.add(1);
							}
							else{
								leftFrame.add(0);
							}
						}
					}
					else{
						leftFrame.add(0);
					}
				}
				

				// right border (super easy)
				if(cell.rightBorder){
					rightFrame.add(1);
					thickness.add(getBorderSize(cell.rightBorder, true))
				}

				// Top border
				if(borders[i] && !fakeRows[i]){
					var topborder = borders[i],
					tframecell = topborder.borders[j];
					if(tframecell){
						topFrame.add(1);
						thickness.add(getBorderSize(tframecell, topborder.complete))
					}
					else{
						topFrame.add(0);
					}
				}
				else{
					topFrame.add(0);
				}
				
				// Bottom border if it's the last row

				if(borders[i+1] && !fakeRows[i+1]){
					var bottomborder = borders[i+1],
					bframecell = bottomborder.borders[j];
					if(bframecell){
						bottomFrame.add(1);
						if(!rows[i+1]){
							// Only add thickness once
							thickness.add(getBorderSize(bframecell, bottomborder.complete))
						}
					}
					else{
						bottomFrame.add(0);
					}
				}
				else{
					bottomFrame.add(0);
				}
				// Process alignment
				var cellalign = cell.align;
				cellalign = (cellalign == "c" || cellalign == "r") ? cellalign : "l";
				align.add(cellalign);

				// Background
				var cellbackground = cell.cellBackground;
				cellbackground = cellbackground ? [cellbackground[0],cellbackground[1],cellbackground[2]].join(",") : false;
				backgroundColor.add(cellbackground);

				// Frame color
				["Top","Bottom","Right","Left"].forEach(function(Side){
					var side = Side.toLowerCase();
					if(cellHTML.getAttribute("data-border-"+side)){
						var color = toRGBA(cellHTML.style["border"+Side+"Color"] || "black");
						color.pop();
						color = color.map(function(c){
							return Math.round(c)
						})
						framecolor.add(color.join(","));
					}
				});
			}
		}
		// Now, we add the value for each fake rows for the table
		if(rows.length>1){
			for(var i=0;i<borders.length;i++){
				if(fakeRows[i]){
					var model = rows[i]||rows[0];
					for(var j=0;j<model.length;j++){
						if(!model.refCell){
							var actualborder = borders[i].borders[j];
							if(actualborder){
								topFrame.add(1);
								thickness.add(getBorderSize(actualborder, borders[i].complete))
							}
							else{
								topFrame.add(0);
							}
						}
					}
				}
			}
		}
		topFrame = !!+topFrame.get();
		bottomFrame = !!+bottomFrame.get();
		rightFrame = !!+rightFrame.get();
		leftFrame = !!+leftFrame.get();
		var frame = true;
		if(!topFrame || !bottomFrame || !rightFrame || !leftFrame){
			frame = false;
		}
		backgroundColor = backgroundColor.get();
		var o = {
			align : align.get(),
			backgroundColor : backgroundColor === "false" ? false : backgroundColor,
			frameColor : framecolor.get(),
			topFrame : topFrame,
			bottomFrame : bottomFrame,
			rightFrame : rightFrame,
			leftFrame : leftFrame,
			frame : frame,
			ruleThickness : thickness.get()
		}
		return o;
	}
	function getAlign(align){
		if(align == "c"){
			return "middle";
		}
		else if(align == "r"){
			return "flushright";
		}
		else{
			return "flushleft";
		}
	}
	var contextColors = {},
	contextColorsNames = {}
	newcolors = [];
	function registerColor(name, rgb){
		rgb = rgb.map(function(c){
			return Math.round(c*1000)/1000;
		});
		contextColors[rgb.join(",")] = name;
		contextColorsNames[name] = true;
	}
	function getColorName(rgb){
		var hex = "#" + ((1 << 24) + ((+rgb[0]) << 16) + ((+rgb[1]) << 8) + (+rgb[2])).toString(16).slice(1);
		rgb = [rgb[0], rgb[1], rgb[2]].map(function(c){
			return Math.round(c/255*1000)/1000;
		}),
		rgbstr = rgb.join(",");
		if(contextColors[rgbstr]){
			return contextColors[rgbstr];
		}
		else{
			// We have to register a name
			var prename = ntc.name(hex), name;
			if(!prename){return "black";}
			prename = prename[1];
			if(!prename){return "black";}
			prename = prename.replace(/[^a-zA-Z]/gi,"");
			for(var i=0;true;i++){
				name = prename;
				if(i>0){
					name += i;
				}
				if(!contextColorsNames[name]){
					break;
				}
			}
			registerColor(name, rgb);
			newcolors[name] = rgb;
			return name;
		}
	}
	var defaultColors = {
		red:[1,0,0],
		green:[0,1,0],
		blue:[0,0,1],
		cyan:[0,1,1],
		magenta:[1,0,1],
		yellow:[1,1,0],
		white:[1,1,1],
		black:[0,0,0],
		gray:[.9,.9,.9],
		middlered:[.8,0,0],
		middlegreen:[0,.8,0],
		middleblue:[0,0,.8],
		middlecyan:[0,.6,.6],
		middlemagenta:[.6,0,.6],
		middleyellow:[.6,.6,0],
		darkred:[.6,0,0],
		darkgreen:[0,.6,0],
		darkblue:[0,0,.6],
		darkcyan:[0,.4,.4],
		darkmagenta:[.4,0,.4],
		darkyellow:[.4,.4,0],
		darkgray:[.60,.60,.60],
		middlegray:[.725,.725,.725],
		lightgray:[.85,.85,.85]
	}
	for(var i in defaultColors){
		if(defaultColors.hasOwnProperty(i)){
			registerColor(i, defaultColors[i]);
		}
	}
	function createFakeRow(borders, mainChar, sp, beautify, model){
		var context = sp,
		startxrow = new Command("startxrow");
		startxrow.set("offset", "overlay");
		startxrow.set("location", "hanging");

		// Now we find border size, border color and border
		var size = new Apex(),
		color = new Apex(),
		border = new Apex();

		for(var i=0;i<borders.borders.length;i++){
			var cellborder = borders.borders[i];
			if(model){
				if(model[i] && model[i].refCell && model[i].refCell.y != model[i].y){
					continue;
				}
			}
			if(cellborder){
				border.add(1);
				size.add(getBorderSize(cellborder, borders.complete));
				var cellcolor = toRGBA(cellborder.color||"black");
				cellcolor.pop();
				cellcolor = cellcolor.map(Math.round)
				color.add(cellcolor);
			}
			else{
				border.add(0);
			}
		}
		size = size.get();
		color = color.get();
		border = !!+border.get();
		if(mainChar.frame){
			startxrow.set("frame", "off");
			startxrow.set("topframe", "on");
		}
		else{
			if(mainChar.bottomFrame){
				startxrow.set("bottomframe", "off");
			}
			if(!border){
				if(mainChar.leftFrame){
					startxrow.set("leftframe", "off");
				}
				if(mainChar.rightFrame){
					startxrow.set("rightframe", "off");
				}
			}
		}
		if(border != !!mainChar.topFrame){
			if(border){
				startxrow.set("topframe", "on");
			}
			else{
				startxrow.set("topframe", "off");
			}
		}
		if(size && size != mainChar.ruleThickness){
			startxrow.set("rulethickness", size);
		}
		if(color && color != mainChar.frameColor){
			startxrow.set("framecolor", getColorName(color.split(",")))
		}
		context+= startxrow.get();
		if(beautify){sp+="\t";}
		for(var i=0;i<borders.borders.length;i++){
			var cellborder = borders.borders[i],
			startxcell = new Command("startxcell");
			if(model){
				if(model[i] && model[i].refCell && model[i].refCell.y != model[i].y){
					continue;
				}
			}
			if(cellborder){
				var cellsize = getBorderSize(cellborder, borders.complete),
				cellcolor = toRGBA(cellborder.color||"black");
				cellcolor.pop();
				cellcolor = cellcolor.map(Math.round).join(",")
				if(!border){
					startxcell.set("bottomframe", "on");
				}
				if(cellsize != size){
					startxcell.set("rulethickness", cellsize);
				}
				if(cellcolor != color){
					startxcell.set("framecolor", getColorName(cellcolor.split(",")))
				}
			}
			else if(border){
				startxcell.set("topframe", "off");
			}
			context+="\n"+sp+startxcell.get()+"\\stopxcell";
		}
		if(beautify){sp=sp.slice(0,-1);}
		context+= "\n"+sp+"\\stopxrow";
		return context;
	}
	table.createInterpreter("context", function(){

		// The ConTeXt module uses extreme tables
		// An improved version could select the right format
		// for each table.

		// The difficulty with tables in ConTeXt is borders.

		var matrix = this.matrix(),
		sp = "",
		context = "",
		indent = document.getElementById("opt-context-indent").value || "two",
		beautify = indent != "none",
		borders = getBordersArray.call(this,0, matrix.length, matrix);

		var useFloat = document.getElementById("opt-context-float").checked,
		    useSplit = document.getElementById("opt-context-split").checked,
		    useRotated = document.getElementById("opt-context-landscape").checked;

		// First, we have to travel each row and each cell to find fake rows
		// We need to find this first to adjust "nr" option and other things

		var fakeRows = [];

		for(var i=0;i<matrix.length;i++){
			var row = matrix[i];
			// We then determine if we need a fake row for border
			var needIncludeLeft = true,
			defRow = [],
			borderrow = borders[i],
			needtopfakerow = false;
			fakerowLoop: for(var j=0;j<row.length;j++){
				var cell = row[j];
				if(cell.refCell){continue fakerowLoop;}
				defRow.push(needIncludeLeft);
				var bordertop = (((borderrow||{}).borders)||[])[j];
				var actualcolor = null;
				var actualsize =  null;
				if(bordertop){
					actualcolor = toContextColor(toRGBA(bordertop.color || "black")).join(",");
					actualsize = getBorderSize(bordertop,borderrow.complete)
				}
				if(needIncludeLeft){
					var leftBorder = cell.leftBorder || (((row[j-1]||{}).refCell||row[j-1])||{}).rightBorder,
					    leftcolor = cell.leftBorderColor || ((row[j-1].refCell||row[j-1])||{}).rightBorderColor || "black";
					if(leftBorder){
						var leftcolor = toContextColor(toRGBA(leftcolor)).join(",");
						var leftsize = getBorderSize(leftBorder,true);
						if((actualcolor && leftcolor && actualcolor != leftcolor) || (actualsize && leftsize && actualsize != leftsize)){
							needtopfakerow = true;
							break fakerowLoop;
						}
						actualcolor = actualcolor || leftcolor;
						actualsize = actualsize || leftsize;
					}
				}
				// Now that we included the left border, we try to include the right.
				// It is not mandatory (it could be included as the next cell left border)
				// even for the last cell
				needIncludeLeft = true;
				if(cell.rightBorder){
					var rightcolor = toContextColor(toRGBA(cell.rightBorderColor || "black")).join(",");
					var rightsize = getBorderSize(cell.rightBorder,true);
					if(!((actualcolor && rightcolor && actualcolor != rightcolor) || (actualsize && rightsize && actualsize != rightsize))){
						needIncludeLeft = false;
					}		
				}
			}
			// If it is the last row, we also determine if we need a fake bottom row
			var needbottomfakerow = false;
			if(!matrix[i+1]){
				fakerowLoop: for(var j=0;j<row.length;j++){
					var cell = row[j];
					if(cell.refCell){continue fakerowLoop;}
					defRow.push(needIncludeLeft);
					var bordertop = (((borderrow||{}).borders)||[])[j];
					var borderbottom = (((borders[i+1]||{}).borders)||[])[j];
					var actualcolor = null;
					var actualsize =  null;
					if(!needtopfakerow && bordertop){
						actualcolor = toContextColor(toRGBA(bordertop.color || "black")).join(",");
						actualsize = getBorderSize(bordertop,borderrow.complete)
					}
					if(borderbottom){
						var bottomcolor = toContextColor(toRGBA(borderbottom.color || "black")).join(","),
						    bottomsize = getBorderSize(borderbottom,borders[i+1].complete);
						if(!actualcolor || !actualsize){
							actualcolor = bottomcolor;
							actualsize = bottomsize;
						}
						if(actualcolor != bottomcolor || actualsize != bottomsize){
							needbottomfakerow = true;
							break fakerowLoop;
						}
					}
					if(needIncludeLeft){
						var leftBorder = cell.leftBorder || (((row[j-1]||{}).refCell||row[j-1])||{}).rightBorder,
					    	leftcolor = cell.leftBorderColor || ((row[j-1].refCell||row[j-1])||{}).rightBorderColor || "black";
						if(leftBorder){
							var leftcolor = toContextColor(toRGBA(leftcolor)).join(",");
							var leftsize = getBorderSize(leftBorder,true);
							if((actualcolor && leftcolor && actualcolor != leftcolor) || (actualsize && leftsize && actualsize != leftsize)){
								needbottomfakerow = true;
								break fakerowLoop;
							}
							actualcolor = actualcolor || leftcolor;
							actualsize = actualsize || leftsize;
						}
					}
					// Now that we included the left border, we try to include the right.
					// It is not mandatory (it could be included as the next cell left border)
					// even for the last cell
					needIncludeLeft = true;
					if(cell.rightBorder){
						var rightcolor = toContextColor(toRGBA(cell.rightBorderColor || "black")).join(",");
						var rightsize = getBorderSize(cell.rightBorder,true);
						if(!((actualcolor && rightcolor && actualcolor != rightcolor) || (actualsize && rightsize && actualsize != rightsize))){
							needIncludeLeft = false;
						}		
					}
				}	
			}
			fakeRows.push(needtopfakerow);
			if(!matrix[i+1]){
				fakeRows.push(needbottomfakerow);
			}
		}	

		// Now, we use `placetable`

		if(useFloat){
			// Options
			context+="\\placetable";
			var caption = this.caption(),
			captionOptions = [];
			if(useSplit){captionOptions.push("split")}
			if(useRotated){captionOptions.push("90","page")}
			if(caption.caption && caption.numbered){
				captionOptions.push("nonumber");
			}
			else if(!caption.caption){
				captionOptions.push("none");
			}
			if(caption.label || captionOptions.length>0){
				context+="["+captionOptions.join(",")+"]";
			}
			// Label
			if(caption.label){
				context+="["+caption.label+"]";
			}
			// Caption
			context += "{"+(caption.caption||"")+"}{\n";
			// Indentation
			sp += "\t";
		}

		// Then we start `\startxtable`
		var startxtable = new Command("startxtable");
		var mainCharTable = getChars(matrix, borders, fakeRows);

		// manage alignment
		if(mainCharTable.align){
			var tableAlignment = getAlign(mainCharTable.align);
			if(tableAlignment != "flushleft"){
				startxtable.set("align", "{"+tableAlignment+",lohi}");
			}
			else{
				startxtable.set("align", "lohi");
			}
		}
		if(useSplit){
			startxtable.set("split", "yes");
		}
		// manage background
		if(mainCharTable.backgroundColor){
			startxtable.set("background", "color");
			startxtable.set("backgroundcolor", getColorName(mainCharTable.backgroundColor.split(",")));
		}

		// manage frame color
		if(mainCharTable.frameColor){
			var framecolor = getColorName(mainCharTable.frameColor.split(","));
			if(framecolor && framecolor != "black"){
				startxtable.set("framecolor", getColorName(mainCharTable.frameColor.split(",")));
			}
		}
		if(!mainCharTable.frame){
			startxtable.set("frame", "off");
			if(mainCharTable.topFrame){
				startxtable.set("topframe", "on");
			}
			if(mainCharTable.leftFrame){
				startxtable.set("leftframe", "on");
			}
			if(mainCharTable.rightFrame){
				startxtable.set("rightframe", "on");
			}
			if(mainCharTable.bottomFrame){
				startxtable.set("bottomframe", "on");
			}
		}
		// rule thickness
		if(mainCharTable.ruleThickness && mainCharTable.ruleThickness != ".4pt"){
			startxtable.set("rulethickness", mainCharTable.ruleThickness);
		}
		context += sp + startxtable.get();
		if(beautify){
			sp +="\t";
		}
	

		// Now let start row for real

		for(var i=0;i<matrix.length;i++){
			var row = matrix[i];
			var mainCharRow = getChars([matrix[i]], [borders[i], borders[i+1]], [fakeRows[i], fakeRows[i+1]]);
			if(fakeRows[i]){
				mainCharRow.frame = mainCharRow.topFrame = false;
			}
			if(fakeRows[i+1]){
				mainCharRow.frame = mainCharRow.bottomFrame = false;
			}
			var startxrow = new Command("startxrow");
			// Now let's compare each characteristic... again !
			if(mainCharRow.backgroundColor != mainCharTable.backgroundColor){

				if(mainCharTable.backgroundColor && !mainCharRow.backgroundColor){
					startxrow.set("background", "none");
				}
				else{
					if(!mainCharTable.backgroundColor){
						startxrow.set("background", "color");
					}
					startxrow.set("backgroundcolor", getColorName(mainCharRow.backgroundColor.split(",")));
				}
			}
			if(mainCharRow.align != mainCharTable.align){
				var rowAlignment = getAlign(mainCharRow.align);
				startxrow.set("align", "{"+rowAlignment+",lohi}");
			}
			if(mainCharRow.frame != mainCharTable.frame){
				if(mainCharRow.frame){
					startxrow.set("frame", "on");
				}
				else{
					// we count the number of frame missing
					var totalFrame = (mainCharRow.leftFrame?1:0)+(mainCharRow.topFrame?1:0)
							+(mainCharRow.rightFrame?1:0)+(mainCharRow.bottomFrame?1:0)
					if(totalFrame>2){
						if(!mainCharRow.leftFrame){
							startxrow.set("leftframe", "off");
						}
						if(!mainCharRow.rightFrame){
							startxrow.set("rightframe", "off");
						}
						if(!mainCharRow.topFrame){
							startxrow.set("topframe", "off");
						}
						if(!mainCharRow.bottomFrame){
							startxrow.set("bottomframe", "off");
						}
					}
					else{
						startxrow.set("frame", "off");
						if(mainCharRow.leftFrame){
							startxrow.set("leftframe", "on");
						}
						if(mainCharRow.rightFrame){
							startxrow.set("rightframe", "on");
						}
						if(mainCharRow.topFrame){
							startxrow.set("topframe","on");
						}
						if(mainCharRow.bottomFrame){
							startxrow.set("bottomframe", "on");
						}
					}
				}
			}
			else{
				if(mainCharRow.leftFrame != mainCharTable.leftFrame){
					startxrow.set("leftframe", mainCharRow.leftFrame ? "on" : "off");
				}
				if(mainCharRow.rightFrame != mainCharTable.rightFrame){
					startxrow.set("rightframe", mainCharRow.rightFrame ? "on" : "off");
				}
				if(mainCharRow.topFrame != mainCharTable.topFrame){
					startxrow.set("topframe", mainCharRow.topFrame ? "on" : "off");
				}
				if(mainCharRow.bottomFrame != mainCharTable.bottomFrame){
					startxrow.set("bottomframe", mainCharRow.bottomFrame ? "on" : "off");
				}
			}

			if(fakeRows[i]){
				context += "\n"+createFakeRow(borders[i], mainCharTable, sp, beautify, matrix[i]);
			}
			context += "\n" + sp + startxrow.get();
			if(beautify){sp += "\t"}
			var needIncludeLeft = true;
			cellLoop: for(var j=0;j<row.length;j++){
				var cell = row[j];
				if(cell.refCell){continue cellLoop;}
				var startxcell = new Command("startxcell");
				if(cell.cell.colSpan > 1){
					startxcell.set("nx", cell.cell.colSpan);
				}
				if(cell.cell.rowSpan > 1){
					var rowspan = cell.cell.rowSpan;
					// We adjust for fake rows
					for(var k=i;k<i+cell.cell.rowSpan;k++){
						if(fakeRows[k]){rowspan++}
					}
					startxcell.set("ny", rowspan);
				}
				var beforeCell = (((row[j-1]||{}).refCell||row[j-1])||{})
				if(i!==0){
					needIncludeLeft = !beforeCell.includeRight;
				}
				var actualcolor = null;
				var actualsize = null,
				framecolor = null;
				var leftBorder = cell.leftBorder || beforeCell.rightBorder,
				leftcolor = cell.leftBorderColor || beforeCell.rightBorderColor || "black";
				if(needIncludeLeft){
					if(!!leftBorder != !!mainCharRow.leftFrame){
						startxcell.set("leftframe", leftBorder ? "on" : "off");
					}
				}
				if(needIncludeLeft && leftBorder){
					framecolor = toRGBA(leftcolor)
					actualcolor = toContextColor(framecolor).join(",");
					actualsize = getBorderSize(leftBorder,true);
				}
				else if(!needIncludeLeft && !leftBorder){
					if(mainCharRow.leftFrame){
						startxcell.set("leftframe", "off");
					}
				}
				// Now we try to include the right border
				cell.includeRight = true;
				needIncludeLeft = false;
				if(cell.rightBorder){
					var rightframecolor = toRGBA(cell.rightBorderColor || "black"),
					rightcolor = toContextColor(rightframecolor).join(","),
					rightsize = getBorderSize(cell.leftBorder,true);
					if(!actualcolor || !actualsize){
						framecolor = rightframecolor;
						actualcolor = rightcolor;
						actualsize = rightsize;
					}
					if(actualcolor == rightcolor && actualsize == rightsize){
						if(!mainCharRow.rightFrame){
							startxcell.set("rightframe", "on");
						}
					}
					else{
						if(mainCharRow.rightFrame){
							startxcell.set("rightframe", "off");
						}
						needIncludeLeft = true;
						cell.includeRight = false;
					}
				}
				else{
					if(mainCharRow.rightFrame){
						startxcell.set("rightframe", "off");
					}
				}
				var bordertop = (((borders[i]||{}).borders)||[])[j];
				var borderbottom = (((borders[i+cell.cell.rowSpan]||{}).borders)||[])[j];

				if(bordertop && !fakeRows[i]){
					var topcolor = toRGBA(bordertop.color),
					actualtopcolor = toContextColor(topcolor).join(","),
					topsize = getBorderSize(bordertop, (borders[i]||{}).complete);

					actualcolor = actualcolor || actualtopcolor;
					actualsize = actualsize || topsize;

					if(actualcolor == actualtopcolor && actualsize == topsize){
						if(!mainCharRow.topFrame){
							startxcell.set("topframe", "on");
						}
					}
					else if(mainCharRow.topFrame){
						startxcell.set("topframe", "off");
					}
				}
				else if(mainCharRow.topFrame){
					startxcell.set("topframe", "off");
				}
				if(borderbottom && !fakeRows[i+cell.cell.rowSpan]){
					var bottomcolor = toRGBA(borderbottom.color),
					actualbottomcolor = toContextColor(bottomcolor).join(","),
					bottomsize = getBorderSize(borderbottom, (borders[i+cell.cell.rowSpan]||{}).complete);

					actualcolor = actualcolor || actualbottomcolor;
					actualsize = actualsize || bottomsize;

					if(actualcolor == actualbottomcolor && actualsize == bottomsize){
						if(!mainCharRow.bottomFrame){
							startxcell.set("bottomframe", "on");
						}
					}
					else if(mainCharRow.bottomFrame){
						startxcell.set("bottomframe", "off");
					}
				}
				else if(mainCharRow.bottomFrame){
					startxcell.set("bottomframe", "off");
				}
				if(framecolor && actualcolor){
					framecolor.pop();
					framecolor = framecolor.map(Math.round);
					if(framecolor.join(",") != mainCharRow.frameColor){
						startxcell.set("framecolor", getColorName(framecolor));
					}
					if(actualsize != mainCharRow.ruleThickness){
						startxcell.set("rulethickness", actualsize);
					}
				}
				if(cell.align != mainCharRow.align){
					var cellAlignment = getAlign(cell.align);
					startxcell.set("align", cellAlignment);
				}
				if(cell.align != mainCharRow.align){
					var cellAlignment = getAlign(cell.align);
					startxcell.set("align", "{"+cellAlignment+",lohi}");
				}
				var cellbackground = cell.cellBackground;
				if(cellbackground){
					cellbackground = [cellbackground[0], cellbackground[1], cellbackground[2]].map(Math.round);
					if(cellbackground.join(",") != mainCharRow.backgroundColor){
						if(!mainCharRow.backgroundColor){
							startxcell.set("background", "color");
						}
						startxcell.set("backgroundcolor", getColorName(cellbackground));
					}
				}
				else if(mainCharRow.backgroundColor){
					startxcell.set("background", "none");
				}
				context += "\n"+sp+startxcell.get()+" "+getCellContent.call(this,cell.cell);
				context += "\\stopxcell";
			}
			if(needIncludeLeft && (!row[row.length-1].refCell || row[row.length-1].refCell.y === row[row.length-1].y)){
				// This means that we have to add another cell
				var cell = (row[row.length-1]||{}).refCell||row[row.length-1],
				    cellframecolor = toRGBA(cell.rightBorderColor || "black"),
				    actualsize = getBorderSize(cell.rightBorder,true),
				    startxcell = new Command("startxcell");
				if(cell.cell.rowSpan > 1){
					startxcell.set("ny", cell.cell.rowSpan);
				}
				if(!mainCharRow.leftFrame && !mainCharRow.rightFrame){
					startxcell.set("leftframe", "on");
				}
				startxcell.set("width", "0pt");
				if(cellframecolor.join(",") != mainCharRow.frameColor){
					startxcell.set("framecolor", getColorName(cellframecolor));
				}
				if(actualsize != mainCharRow.ruleThickness){
					startxcell.set("rulethickness", actualsize);
				}
				context += "\n"+sp+startxcell.get()+ "\\stopxcell";
			}
			if(beautify){sp = sp.slice(0, -1);}
			context += "\n"+sp+"\\stopxrow";
			if(fakeRows[i+1] && !matrix[i+1]){
				context += "\n"+createFakeRow(borders[i+1], mainCharTable, sp, beautify);
			}
		}
		if(beautify){sp = sp.slice(0, -1);}
		
		context += "\n"+sp+"\\stopxtable";
		if(useFloat){
			context += "\n}";
		}
		// Add the end, we declare colors
		var declaration = "";
		for(var i in newcolors){
			if(newcolors.hasOwnProperty(i)){
				var color = newcolors[i];
				declaration += "\\definecolor["+i+"]";
				declaration += "[r="+color[0]+",g="+color[1]+",b="+color[2]+"]\n";
			}
		}
		// Indentation
		if(beautify){
			if(indent == "four"){
				context = context.replace(/\t/g,"    ");
			}
			else if(indent != "tab"){
				context = context.replace(/\t/g,"  ");
			}
		}
		return declaration+context;
	})
})();