(function(){
	var table = this;
	var removeTag = function(node, selector){
		var nodes = Array.from(node.querySelectorAll(selector));
		for(var i=0;i<nodes.length;i++){
			var frag = document.createDocumentFragment();
			while(nodes[i].firstChild){
				frag.appendChild(nodes[i].firstChild);
			}
			nodes[i].parentNode.replaceChild(frag,nodes[i]);
		}
	}
	var arrayToRange = function(arr, max){
		arr.sort(function (a, b) {  return a - b;  });
		var str = "";
		var inRange = false;
		for(var i=0;i<arr.length;i++){
			var nb = arr[i];
			if(isNaN(+nb)){
				if(str){str+=","}
				str += nb;
			}
			else{
				nb = +nb;
				if(+arr[i+1] == nb + 1){
					if(inRange){
						continue;
					}
					else{
						if(str){str+=","}
						str += nb;
						inRange = true;
					}
				}
				else{
					if(inRange){
						str += "-" + nb;
						inRange = false;
					}
					else{
						if(str){str+=","}
						str += nb;
					}
				}
			}
		}
		if(str == "1-"+max){return "-"}
		/*str = str.replace(/\d+/g, function(nb){
			if(+nb == max){
				return "Z";
			}
			else if(+nb == max-1){
				return "Y";
			}
			else if(+nb == max-2){
				return "X";
			}
			else{
				return nb;
			}
		})*/
		return str;
	}
	var generateCode = function(cell, obj,isS, width){
		var o = {}
		var code = "";
		if(cell.hasAttribute("data-two-diagonals") || cell.hasAttribute("data-diagonal")){
			var html = table.getHTML(cell);
			var div = document.createElement("div");
			div.innerHTML = html;
			var frag = document.createDocumentFragment();
			frag.appendChild(div);

			var html = table.getHTML(cell, 1);
			var div = document.createElement("div");
			div.innerHTML = html;
			frag.appendChild(div);
			if(cell.hasAttribute("data-two-diagonals")){
				var html = table.getHTML(cell, 2);
				var div = document.createElement("div");
				div.innerHTML = html;
				frag.appendChild(div);
			}

			var treeWalker = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT);
	 		treeWalker.nextNode();
	 		var currentNode = treeWalker.currentNode;
			var color = null;
	 		treeWalkerLoop: while (currentNode) {
				if(/\S/.test(currentNode.nodeValue)){
					var parent = currentNode;
					lookForParent:while(parent = parent.parentElement){
						if(parent.tagName == "FONT"){
							if(color && color != parent.color){
								break treeWalkerLoop;
							}
							color = parent.color
							currentNode = treeWalker.nextNode()
							continue treeWalkerLoop;
						}
					}
					break treeWalkerLoop;	
				}
				currentNode = treeWalker.nextNode()
			}
			if(!currentNode && color){
				// Remove font tags
				removeTag(frag, "FONT");
				o.color = toRGBA(color);
			}
			// Generate code
			if(frag.childNodes[2]){
				code = "\\diagboxthree";
			}
			else{
				code = "\\diagbox";
			}
			var optarg = "";
			if(cell.hasAttribute("data-diagonal-color") && cell.getAttribute("data-diagonal-color") != "#000000"){
				table.packages["color"] = true;
				optarg += "linecolor="+table.tabuColor(cell.getAttribute("data-diagonal-color"));
			}
			if(width){
				if(optarg){optarg+=","}
				optarg+="innerwidth=\\linewidth";
			}
			if(optarg){
				code+="["+optarg+"]";
			}
			if(frag.childNodes[2]){
				code += "{"+table.generateFromHTML(frag.childNodes[2].innerHTML, true, "l")+
				  "}{"+table.generateFromHTML(frag.childNodes[0].innerHTML, true, "l")+"}{"+
				  table.generateFromHTML(frag.childNodes[1].innerHTML, true, "l")+"}";
			}
			else if(frag.childNodes[1]){
				code += "{"+table.generateFromHTML(frag.childNodes[0].innerHTML, true, "l")+
				  "}{"+ table.generateFromHTML(frag.childNodes[0].innerHTML, true, "l") + "}";
			}
		}
		else{
			var html = table.getHTMLPerLine(cell, 0,true);
			var options = {
				ignoreMultiline:true,
				numberColumn:isS,
				tablenum: cell.colSpan>1,
				number: obj.align == "d",
				nonNumberFormat: isS ? "{{{@}}}" : false
			};
			if(obj.align == "d"){
				options.siunitx = "table-format="+table.formatDecimalCharacters(obj.globalDecimals || obj.columnDecimals);
			}
			code = table.generateFromHTMLPerLine(html.lines,options);
			if(!isS && html.lines.length>1){
				code = "{" + code + "}";
			}
			o.color = html.color;
		}
/*
		if(!noS && obj.align == "d"){
			var lines = cell.innerText.replace(/\u200b/g,"").trim().split(/\n/g);
			o.code = "";
			for(var i=0;i<lines.length;i++){
				var code = lines[i];
				if(i>0){o.code+="\\\\"}
				if(div.getElementsByTagName("U").length>0){
					table.packages["ulem"] = true;
					code = "\\uline{"+code+"}";
				}
				if(div.getElementsByTagName("B").length>0){
					o.useBold = true;
					if(div.getElementsByTagName("I").length>0){
						o.useItalic = true;
						code = "\\bfseries\\itshape "+code;
					}
					else{
						code = "\\bfseries "+code;
					}
				}
				else if(div.getElementsByTagName("I").length>0){
					o.useItalic = true;
					code = "\\itshape "+code;
				}
				if((!isS || lines.length>1) && table.isANumber(lines[i])){
					code = "\\tablenum[table-format="+
					table.formatDecimalCharacters(obj.globalDecimals)
					+"]{"+code+"}";
				}
				o.code += code;
			}
			if(lines.length>1){o.code = "{{{"+o.code+"}}}";}
			return o;
		}
*/
		if(cell.hasAttribute("data-rotated")){
			code = "\\begin{sideways}"+code+"\\end{sideways}";
			table.packages["rotating"] = true;
		}
/*
		if(isS){
			if(obj.align != "d" || noS || !table.isANumber(cell)){
				code = "{{{"+code+"}}}";
			}
		}
*/

		o.code = code;
		return o;
	}
	var keys = new (function(){
		var keyCell = [],
		keyCells = {},
		keys = [],
		borders = [],
		hlines = {},
		vlines = {};
		this.cell = function(x,y,right, left){
			left = left || {};
			var cell = null;
			for(var i=0;i<keyCell.length;i++){
				if(keyCell[i].y == y && keyCell[i].x == x){
					cell = keyCell[i];break;
				}
			}
			if(!cell){
				keyCell.push({y:y,x:x,left:{},right:{}})
				cell = keyCell[keyCell.length-1]
			}
			for(var i in right){
				if(right.hasOwnProperty(i)){
					cell.right[i] = right[i];
				}
			}
			for(var i in left){
				if(left.hasOwnProperty(i)){
					cell.left[i] = left[i];
				}
			}
		}
		this.border = function(vhborder,y,x,props){
			props = props || {};
			var bor = null;
			for(var i=0;i<borders.length;i++){
				if(borders[i].y == y && borders[i].x == x && borders[i].type == vhborder){
					bor = borders[i];break;
				}
			}
			if(!bor){
				borders.push({type:vhborder,y:y,x:x,right:{}})
				bor = borders[borders.length-1]
			}
			for(var i in props){
				if(props.hasOwnProperty(i)){
					bor.right[i] = props[i];
				}
			}
		}
		this.erase = function(){
			keyCell = [];
			keyCells = {};
			keys=[];
			borders = [];
			hlines = {};
			vlines = {};
		}
		this.forCommonProperties = function(keyCell,isAvailableFn, callback){
			var found = false;
			for(var i=0;i<keyCell.length;i++){
				var cell = keyCell[i];
				if(!isAvailableFn.call(this, cell, cell.y, cell.x)){
					continue;
				}
				else{
					found = true;break;
				}
				
			}
			if(!found){return;}
			outside:for(var i in cell.right){
				var values = {}
				var listOfCells = []
				for(var j=0;j<keyCell.length;j++){
					var subcell = keyCell[j]
					if(isAvailableFn.call(this, subcell, subcell.y, subcell.x)){
						if(subcell.right.hasOwnProperty(i)){
							if(!values[subcell.right[i]]){
								values[subcell.right[i]] = 0;
							}
							values[subcell.right[i]]++;
							listOfCells.push(subcell);
						}
						else{
							continue outside;
						}
					}
				}
				var max = 0;
				var topvalue = "";
				for(var j in values){
					if(values[j] > max || (values[j] == max && j.length>topvalue.length)){
						topvalue = j;
						max = values[j]
					}
				}
				var remove = false;
				if(topvalue){
					remove = callback.call(this, i, topvalue);
				}
				if(remove){
					for(var j=0;j<listOfCells.length;j++){
						if(topvalue == listOfCells[j].right[i]){
							if(remove == "keep"){
								listOfCells[j].right["_"+i] = listOfCells[j].right[i];
							}
							delete listOfCells[j].right[i];
						}
					}
				}
			}
		}
		this.prepare = function(){
			var matrix = table.Table.matrix()
			this.forCommonProperties(keyCell,function(cell, y, x){ return true }, function(prop, value){
				keyCells[prop] = value;
				return true;
			});
			if(matrix.length > 3){
				// odd row
				this.forCommonProperties(keyCell,function(cell, y, x){ return y % 2 == 1 }, function(prop, value){
					var last = keys[keys.length-1];
					if(prop == "wd"){return false;}
					if(!last ||!(last[0] == "row" && last[1] == "odd")){
						keys.push(["row","odd",{}])
						last = keys[keys.length-1]
					}
					last[2][prop] = value;
					return true;
				});
			}
			if(matrix.length > 3){
				// even row
				this.forCommonProperties(keyCell,function(cell, y, x){ return y % 2 == 0 }, function(prop, value){
					var last = keys[keys.length-1];
					if(prop == "wd"){return false;}
					if(!last ||!(last[0] == "row" && last[1] == "even")){
						keys.push(["row","even",{}])
						last = keys[keys.length-1]
					}
					last[2][prop] = value;
					return true;
				});
			}
			// row
			for(var i=0;i<matrix.length;i++){
				this.forCommonProperties(keyCell,function(cell, y, x){ return y == i+1 }, function(prop, value){
					var last = keys[keys.length-1];
					if(prop == "wd"){return false;}
					if(!last ||!(last[0] == "row" && last[1] == i+1)){
						keys.push(["row",i+1,{}])
						last = keys[keys.length-1]
					}
					last[2][prop] = value;
					return true;
				});
			}
			if(matrix[0].length>3){
				// odd column
				this.forCommonProperties(keyCell,function(cell, y, x){ return x % 2 == 1 }, function(prop, value){
					var last = keys[keys.length-1];
					if(!last ||!(last[0] == "column" && last[1] == "odd")){
						keys.push(["column","odd",{}])
						last = keys[keys.length-1]
					}
					last[2][prop] = value;
					return true;
				});
			}
			if(matrix[0].length > 3){
				// even column
				this.forCommonProperties(keyCell,function(cell, y, x){ return x % 2 == 0 }, function(prop, value){
					var last = keys[keys.length-1];
					if(!last ||!(last[0] == "column" && last[1] == "even")){
						keys.push(["column","even",{}])
						last = keys[keys.length-1]
					}
					last[2][prop] = value;
					return true;
				});
			}
			// column
			for(var i=0;i<matrix[0].length;i++){
				this.forCommonProperties(keyCell,function(cell, y, x){ return x == i+1 }, function(prop, value){
					var last = keys[keys.length-1];
					if(!last ||!(last[0] == "column" && last[1] == i+1)){
						keys.push(["column",i+1,{}])
						last = keys[keys.length-1]
					}
					last[2][prop] = value;
					return true;
				});
			}
		}
		this.getBorders = function(sp,sep,hasAllHBorders,hasAllVBorders, maxY, maxX){
			sp = sp || "";
			sep = sep || "";
			var str = "",
			isHBorders = false,
			isVBorders = false;
			var allBorders = [];
			if(hasAllVBorders){
				var allDoubles = true;
				for(var i=0;i<borders.length;i++){
					if(borders[i].type == "vline" && borders[i].right.type != "double"){
						allDoubles = false;break;
					}
				}
				this.forCommonProperties(borders,
					function(border, y, x){ 
						return border.type == "vline" && (allDoubles || border.right.type != "double")
					},
					function(prop, value){
						vlines[prop] = value
						isVBorders = true;
						return true;
					}
				);
			}
			if(hasAllHBorders){
				var allDoubles = true;
				for(var i=0;i<borders.length;i++){
					if(borders[i].type == "hline" && borders[i].right.type != "double"){
						allDoubles = false;break;
					}
				}
				this.forCommonProperties(borders,
					function(border, y, x){ 
						return border.type == "hline" && (allDoubles || border.right.type != "double")
					},
					function(prop, value){
						hlines[prop] = value
						isHBorders = true;
						return true;
					}
				);
			}
			function callAllBorders(lines,name){
				var found = false;
				double:for(var k=1;k<=2;k++){
					str+="\n"+sp;
					str+= name+" = ";
					var isDouble = lines.type == "double" || k>1;
					if(isDouble){
						if(k>1){
							str += "{"+k+"}{-}";
						}
						lines.type = "solid";
					}
					str += "{";
					var found = false;
					for(var j in lines){
						if(lines.hasOwnProperty(j)){
							if(j == "type"){
								if(lines[j] != "solid"){
									if(found){str+=","}else{found=true}
									str += lines[j];
								}
							}
							else if(j == "fg"){
								if(lines[j] != "black"){
									if(found){str+=","}else{found=true}
									str += lines[j];
								}
							}
							else if(j == "wd"){
								if(lines[j] != "0.4pt"){
									if(found){str+=","}else{found=true}
									str += lines[j];
								}
							}
							else{
								if(found){str+=","}else{found=true}
								if(lines[j] === true){
									str+=j;
								}
								else{
									str+= j+"="+lines[j];
								}
							}
						}
					}
					str+="},";
					if(!isDouble){
						break double;
					}
				}
			}
			if(isHBorders){
				callAllBorders(hlines,"hlines");
			}
			if(isVBorders){
				callAllBorders(vlines,"vlines");
			}
			outside: for(var i=0;i<borders.length;i++){
				var border = borders[i];
				double: for(var k=1;k<=2;k++){
					var borderText = [border.type];
					var substr = "";
					var isThere = false;
					var hasAll = (hasAllHBorders && border.type == "hline") || (hasAllVBorders && border.type == "vline");
					if(hasAll){
						for(var j in border.right){
							isThere = true;break;
						}
						if(!isThere){continue outside;}
					}
					if(border.type == "hline"){
						borderText.push([border.y])
					}
					else{
						borderText.push([border.x]);
					}
					var found = false;
					var isDouble = border.right.type == "double" || k>1;
					borderText.push(k);
					if(isDouble){
						border.right.type = "solid";
					}
					if(border.type == "hline"){
						borderText.push([border.x]);
					}
					else{
						borderText.push([border.y]);
					}
					for(var j in border.right){
						if(border.right.hasOwnProperty(j)){
							if(j == "type"){
								if(border.right[j] != "solid" || hasAll){
									if(found){substr+=","}else{found=true}
									substr += border.right[j];
								}
							}
							else if(j == "type"){
								if(border.right[j] != "solid" || hasAll){
									if(found){substr+=","}else{found=true}
									substr += border.right[j];
								}
							}
							else if(j == "fg"){
								if(border.right[j] != "black" || hasAll){
									if(found){substr+=","}else{found=true}
									substr += border.right[j];
								}
							}
							else if(j == "wd"){
								if(border.right[j] != "0.4pt" || hasAll){
									if(found){substr+=","}else{found=true}
									substr += border.right[j];
								}
							}
							else{
								if(found){substr+=","}else{found=true}
								if(border.right[j] === true){
									substr+=j;
								}
								else{
									substr+= j+"="+border.right[j];
								}
							}
						}
					}
					borderText.push(substr);
					allBorders.push(borderText);
					if(!isDouble){
						break double;
					}
				}
			}
			for(var i=0;i<allBorders.length;i++){
				var comp = allBorders[i];
				if(!comp){continue;}
				for(var j=0;j<allBorders.length;j++){
					if(i == j){continue;}
					var comp2 = allBorders[j];
					if(!comp2){continue}
					if(comp[0] == comp2[0] && comp[2] == comp2[2] && comp[4] == comp2[4]){
						if(comp[0] == "hline" && comp[1].toString() == comp2[1].toString()){
							comp[3].push(+comp2[3].toString());
							comp[3].sort(function (a, b) {  return a - b;  });
							allBorders[j] = false;
						}
						else if(comp[0] == "vline" && comp[3].toString() == comp2[3].toString()){
							comp[1].push(+comp2[1].toString());
							comp[1].sort(function (a, b) {  return a - b;  });
							allBorders[j] = false;
						}
					} 
				}
			}
			for(var i=0;i<allBorders.length;i++){
				var comp = allBorders[i];
				if(!comp){continue;}
				for(var j=0;j<allBorders.length;j++){
					if(i == j){continue;}
					var comp2 = allBorders[j];
					if(!comp2){continue}
					if(comp[0] == comp2[0] && comp[2] == comp2[2] && comp[4] == comp2[4]){
						if(comp[0] == "vline" && comp[1].toString() == comp2[1].toString()){
							comp[3].push(+comp2[3].toString());
							comp[3].sort(function (a, b) {  return a - b;  });
							allBorders[j] = false;
						}
						else if(comp[0] == "hline" && comp[3].toString() == comp2[3].toString()){
							comp[1].push(+comp2[1].toString());
							comp[1].sort(function (a, b) {  return a - b;  });
							allBorders[j] = false;
						}
					} 
				}
			}
			for(var i=0;i<allBorders.length;i++){
				var border = allBorders[i];
				if(!border){continue}
				str += "\n"+sp+border[0] + "{"+arrayToRange(border[1], border[0] == "hline" ? maxY+1 : maxX+1)+"} = "
				if(border[2] > 1){
					str += "{"+border[2]+"}";
				}
				str += "{"+arrayToRange(border[3], border[0] == "hline" ? maxX : maxY)+"}{"+border[4]+"},";
			}
			return str.replace(/\s+=\s+\{\}(,(?:\n|$))/gi,"$1");
		}
		this.getCell = function(sp, sep){
			this.prepare();
			sp = sp || "";
			sep = sep || "";
			var str = "";
			var foundCells = 0;
			for(var i in keyCells){
				if(!foundCells){
					str+=sp+"cells = {";
				}
				foundCells++;
				if(foundCells > 1){str+=","}
				if(i == "bg" || i == "halign" || i == "valign" || i == "wd"){
					str += keyCells[i];
				}
				else{
					str += i + sep + "=" + sep + keyCells[i]
				}
			}
			if(foundCells){str += "},"}
			for(var i=0;i<keys.length;i++){
				var key = keys[i];
				if(str){str+="\n"}
				str += sp+key[0]+"{"+key[1]+"} = {";
				var found = false;
				for(var j in key[2]){
					if(!found){found = true;}else{str+=","}
					if(j == "bg" || j == "halign" || j == "valign" || j == "wd"){
						str+= key[2][j];
					}
					else{
						str += j + sep + "=" + sep + key[2][j];
					}
				}
				str+="},"
			}
			for(var i=0;i<keyCell.length;i++){
				var left = "";
				for(var j in keyCell[i].left){
					if(left){left+=","+sep}
					left += j + sep + "=" +sep + keyCell[i].left[j];
				}
				var right = "";
				for(var j in keyCell[i].right){
					if(right){right+=","+sep}
					if(keyCell[i].right[j] === true){
						right += j;
					}
					else if(j == "bg" || j == "halign" || j == "valign" || j == "wd"){
						right += keyCell[i].right[j];
					}
					else{
						right += j + sep + "=" +sep + keyCell[i].right[j];
					}
				}
				if(!left && !right){continue;}
				if(str){str+="\n"+sp}else{str = sp}
				str+="cell{"+keyCell[i].y+"}{"+keyCell[i].x+"} = ";
				if(left){
					str += "{"+sep+left+sep+"}"+sep
				}
				str+="{"+sep+right+sep+"},";
			}
			return str;
		}
	})()
	var toTabularray = function(){
		keys.erase();
		table.useTabularray = true;
		table.tabuColors = {}
		table.tabuColorsDic = {}
		var rg = table.matrix();
		var str = "";
		var rows = [];
		var longtableBefore = "";
		var decCols = [];
		var hasSiUnitX = false;
		var siBold = false,
		siItalic = false,
		siArgs = [];
		var fit = $id("opt-fit-table").value,
		scale = fit.indexOf("sc") >= 0,
		shrink = fit.indexOf("sh") >= 0;

		table.shrink = shrink;
		var widthArray = shrink ? table.shrinkRatios(rg) : null;
		var colspec = "";
		table.headers(rg);

		// Look for `S` column
		// We need to this before to protect columns
		for(var i=0;i<rg.length;i++){
			var row = rg[i];
			for(var j=0;j<row.length;j++){
				var cell = row[j];
				if(cell.getHeader){
					cell.getHeader("#000000", true);
				}
				if(cell.decimalChars && cell.cell && cell.cell.colSpan == 1){
					hasSiUnitX = true
					decCols[cell.x+1] = table.formatDecimalCharacters(cell.globalDecimals);
				}
			}
		}
		if(decCols.length>0 || widthArray){
			var row = rg[0];
			for(var i=0;i<row.length;i++){
				if(decCols[i+1]){
					colspec+= "S[table-format="+decCols[i+1];
					if(widthArray){
						colspec += ",table-column-width="+widthArray[i]+"\\linewidth";
					}
					colspec+= "]"
				}
				else if(widthArray){
					colspec += "Q["+widthArray[i]*1000+"]"
				}
				else{
					colspec+="Q";
				}
			}
		}
		var hasAllVBorders = true;
		for(var i=0;i<rg.length;i++){
			var row = rg[i];
			var row2 = [];
			for(var j=0;j<row.length;j++){
				var cell = row[j];
				var o = {text:"",colSpan:1}
				if(cell.cell){
					var left = {};
					var right = {};
					if(cell.cell.colSpan > 1){
						left.c = cell.cell.colSpan;
						if(cell.shrinkRatio){
							right.wd = cell.shrinkRatio+"\\linewidth";
						}
					}
					if(cell.cell.rowSpan > 1){left.r = cell.cell.rowSpan}
					if(cell.leftBorder){
						var borderO = {}
						borderO.type = {
							double:"double",
							hdashline:"dashed",
							dottedline:"dotted"
						}[cell.leftBorder] || "solid";
						borderO.fg = table.tabuColor(toRGBA(cell.leftBorderColor));
						if(cell.leftBorder == "toprule" || cell.leftBorder == "bottomrule"){
							borderO.wd = "0.08em";
						}
						else if(cell.leftBorder == "midrule"){
							borderO.wd = "0.05em";
						}
						keys.border("vline",i+1,j+1,borderO);
					}
					else if(j===0){hasAllVBorders = false}
					if(cell.rightBorder){
						var borderO = {}
						borderO.type = {
							double:"double",
							hdashline:"dashed",
							dottedline:"dotted"
						}[cell.rightBorder] || "solid";
						borderO.fg = table.tabuColor(toRGBA(cell.rightBorderColor));
						if(cell.rightBorder == "toprule" || cell.rightBorder == "bottomrule"){
							borderO.wd = "0.08em";
						}
						else if(cell.rightBorder == "midrule"){
							borderO.wd = "0.05em";
						}
						keys.border("vline",i+1,j+2,borderO);
					}
					else{hasAllVBorders = false}
					if(cell.cellBackground){
						table.packages["color"] = true;
						right.bg = table.tabuColor(cell.cellBackground)
					}
					if(cell.align != "l" && cell.align != "d"){
						right.halign = cell.align
					}
					if(cell.valign != "m"){
						right.valign = cell.valign
					}
					var props = generateCode(cell.cell, cell,decCols[cell.x+1],widthArray?widthArray[cell.x+1]:null);
					if(props.color){
						right.fg = table.tabuColor(props.color)
					}
					keys.cell(cell.x+1,cell.y+1,right,left);
					if(props.useBold){
						siBold = true;
					}
					if(props.useItalic){
						siItalic = true;
					}
					o.text = props.code;
				}
				row2.push(o);
			}
			rows.push(row2);
		}
		var sp = "  ";
		if(widthArray){
			str += sp + "width = \\linewidth,\n";
		}
		if(colspec){
			str += sp + "colspec = {"+colspec+"},\n";
		}
		var hasAllHBorders = true;
		var booktabs = this.element.hasAttribute("data-booktabs")
		for(var i=0;i<rg.length+1;i++){
			table.actualColor = [0,0,0]
			this.HBorder(i, function(o){
				var borders = o.borders;
				if(i == 0 && booktabs){
					// toprule
					for(var j=0;j<o.borders.length;j++){
						o.borders[j] = {
							cellIndex:j,
							color: "rgb(0, 0, 0)",
							sameAsBefore: true,
							type: "toprule"
						}
					}
				}
				if(i == rg.length && booktabs){
					// bottomrule
					for(var j=0;j<o.borders.length;j++){
						o.borders[j] = {
							cellIndex:j,
							color: "rgb(0, 0, 0)",
							sameAsBefore: true,
							type: "bottomrule"
						}
					}
				}
				for(var j=0;j<o.borders.length;j++){
					var border = o.borders[j]
					if(!border){hasAllHBorders = false;continue;}
					var obj = {};

					// Type of rule : Special for double. Default: solid
					obj.type = {
						double:"double",
						hdashline:"dashed",
						dottedline:"dotted"
					}[border.type] || "solid";

					// Width. Special care for midrule, as in booktabs there is two
					// different width. We keep this behaviour here for cross-compatibility
					// and conversion purposes.

					if(border.type == "midrule"){
						var complete = true;
						for(var k=0;k<o.borders.length;k++){
							if(!o.borders[k] || o.borders[k].type != "midrule"){
								complete = false;
							}
						}
						if(complete){
							obj.wd = "0.05em";
						}
						else{
							obj.wd = "0.03em";
						}
					}
					else if(border.type == "toprule" || border.type == "bottomrule"){
						obj.wd = "0.08em";
					}
					// Trimmed rule
					if(border.type == "trimleft"){
						obj.l = true;
					}
					else if(border.type == "trimright"){
						obj.r = true;
					}
					else if(border.type == "trimboth"){
						obj.lr = true;
					}
					// Color
					if(border.color){
						obj.fg = table.tabuColor(toRGBA(border.color));
					}
					keys.border("hline",i+1,j+1,obj);
				}
			},rg)
		}
		var cellStr = keys.getCell(sp, "");
		if(cellStr.trim()){
			str += sp+cellStr.trim()+"\n"
		}
		var borderStr = keys.getBorders(sp,"",hasAllHBorders,hasAllVBorders,rg.length, rg[0].length)
		if(borderStr.trim()){
			str += sp+borderStr.trim()+"\n";
		}
		str += "\n}\n";
		var beautifyRows = table.beautifyRows(rows);
		for(var i=0;i<beautifyRows.length;i++){
			str += beautifyRows[i];
			if(i<beautifyRows.length-1){
				str += "\\\\";
			}
			str += "\n";
		}
		var firstPart = "";
		if(table.packages["color"]){
			firstPart += "% \\usepackage{color}\n";
		}
		if(table.packages["ulem"]){
			firstPart += "% \\usepackage[normalem]{ulem}\n"
		}
		if(table.packages["rotating"]){
			firstPart += "% \\usepackage{rotating}\n";
		}
		firstPart += "% \\usepackage{tabularray}\n";
		if(str.indexOf("\\diagbox") >= 0){
			firstPart+="% \\UseTblrLibrary{diagbox}\n";
		}
		if(hasSiUnitX){
			firstPart+="% \\UseTblrLibrary{siunitx}\n";
		}
		var tabuColors = this.tabuColors;
		for(var i in tabuColors){
			if(tabuColors.hasOwnProperty(i)){
				var color = tabuColors[i];
				firstPart += "\\definecolor{"+color.name+"}{rgb}{"+color.rgb.join(",")+"}\n";
			}
		}
		firstPart += "\n";
		var float = this._id("opt-latex-float").checked,
		useLongtable = this._id("opt-latex-split").checked,
		rotateTable = this._id("opt-latex-landscape").checked;

		var caption = table.caption();
		if(useLongtable){
			if(siBold){
				longtableBefore += "\\sisetup{reset-text-series=false,text-series-to-math=true}\n";
			}
			str += "\\end{longtblr}";
			if(longtableBefore){
				firstPart += "{\n"+longtableBefore;
				str += "\n}";
			}
			firstPart += "\\begin{longtblr}";
			var optStr = "";
			if(caption.caption){
				optStr += "  caption = {"+caption.caption+"},\n";
				if(caption.label){
					optStr += "  label = {"+caption.label+"},\n";
				}
			}
			else{
				optStr += "  label = none,\n  entry = none,\n";
			}
			if(optStr){
				firstPart+="[\n"+optStr+"]";
			}
			firstPart+="{\n";
		}
		else{
			str += "\\end{tblr}\n";
			if(scale){
				str+="}\n"
			}
			if(float){
				firstPart += "\\begin{"+ (rotateTable ? "sidewaystable" : "table") +"}\n";
				str += "\\end{"+(rotateTable ? "sidewaystable" : "table")+"}"
			}
			else{
				firstPart += "\\noindent\\begin{minipage}{\\linewidth}\n";
				str += "\\end{minipage}"
			}
			if(this._id("table-opt-center").checked){
				firstPart += "\\centering\n"
			}
			if(siBold){
				firstPart += "\\sisetup{reset-text-series=false,text-series-to-math=true}\n";
			}
			if (caption.caption) {
				if(caption.numbered){
					this.packages["caption"] = true;
					firstPart += "\\captionsetup{labelformat=empty}\n";
				}
				if(float){
					firstPart += "\\caption{" + caption.caption + "}\n";
				}
				else{
					this.packages["caption"] = true;
					firstPart += "\\captionof{table}{" + caption.caption + "}";
				}
			}
			if (caption.label) {
				if(!caption.caption){
					firstPart += "\\refstepcounter{table}\n";
				}
				firstPart += "\\label{" + caption.label + "}\n";
			}
			if(scale){
				firstPart += "\\resizebox{\\linewidth}{!}{%\n";
			}
			firstPart += "\\begin{tblr}{\n";
		}
		return (firstPart+str).replace(/\n{2,}/g,"\n");
	}
	this.generateTabularray = toTabularray;
}).call(window.table);