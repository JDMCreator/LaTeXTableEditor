function $id(id) {
	return document.getElementById(id);
}
(function() {
	"use strict"
	function intersectRect(r1, r2) {
	  return !(r2.left > r1.right || 
	           r2.right < r1.left || 
	           r2.top > r1.bottom ||
	           r2.bottom < r1.top);
	   }


	/* ==== START CAMPAIGN INFO ==== */
	window.sendGAEvent = function(category, action, label){
			var hash = (location.hash||"").toLowerCase();
			if(window.isProduction && window.ga && hash != "#anonymous" && hash != "#/anonymous"){
				ga('send', 'event', category, action, label);
			}
		}
	var campaign = {
		start: new Date(2021,10,2),
		end: new Date(2021,11,20),
		year:2021
	},
	campaignUsed = localStorage.getItem("campaign") == campaign.year,

	/* ==== END CAMPAIGN INFO ==== */

	sameHeader = function(cellHeader, colHeader, rowN) {
			if (rowN !== 0) {
				colHeader = (/[a-z].*/i.exec(colHeader) || ["l"])[0];
			}
			return cellHeader == colHeader
		},
		packagesDatabase = {
			"adjustbox":["xkeyval","adjcalc","trimclip","graphicx","collectbox"],
			"array" : [],
			"arydshln" : [],
			"booktabs" : [],
			"color" : [],
			"colortbl" : ["array", "color"],
			"diagbox" : ["keyval","pict2e","fp"],
			"expl3" : ["etex"],
			"fp" : ["defpattern"],
			"graphics" : ["trig"],
			"graphicx" : ["keyval", "graphics"],
			"hhline" : [],
			"l3keys2e" : ["xparse"],
			"makecell" : ["array"],
			"multirow" : [],
			"pdflscape": ["lscape"],
			"ragged2e" : ["everysel"],
			"rotating" : ["graphicx", "ifthen"],
			"siunitx" : ["expl3","amstext" , "array" , "l3keys2e"],
			"slashbox" : [],
			"tablefootnote": ["ltxcmds","letltxmacro","xifthen"],
			"tabu" : ["array","varwidth"],
			"tabularx" : ["array"],
			"ulem" : []
		},
		rgb2cymk = function(r,g,b){
			var c = 1 - r/255,
			y = 1 - g/255,
			m = 1 - b/255,
			k = Math.min(c,y,m);
			c = Math.min(1, Math.max(0, c-k));
			y = Math.min(1, Math.max(0, y-k));
			m = Math.min(1, Math.max(0, m-k));
			return [c,y,m,k]
		},
		noColor = false,
		defaultColors = {
			"1,0,0" : "red",
			"0,1,0" : "green",
			"0,0,1" : "blue",
			"0,1,1" : "cyan",
			"1,0,1" : "magenta",
			"1,1,0" : "yellow",
			"0,0,0" : "black",
			"1,1,1" : "white"
		},
		areSameColors = function(color1, color2){
			if(noColor){return true;}
			if(typeof color1 == "string"){
				color1 = toRGBA(color1);
			}
			if(typeof color2 == "string"){
				color2 = toRGBA(color2);
			}
			for(var i=0;i<3;i++){
				if(color1[i] !== color2[i]){
					return false;
				}
			}
			return true;
		},
		getColor = function(color){
			var arr = []
			if(typeof color == "string"){
				color = toRGBA(color);
			}
			for(var i=0;i<3;i++){
				arr.push(Math.round((+color[i]||0)/255*1000)/1000);
			}
			var sep = arr.join(",");
			if(defaultColors[sep]){
				return "{"+defaultColors[sep]+"}";
			}
			if(document.getElementById("opt-latex-color").checked){
				var cymk = rgb2cymk(arr[0]*255,arr[1]*255,arr[2]*255);
				return "[cymk]{"+cymk.join(",")+"}";
			}
			return "[rgb]{"+sep+"}";
		},
		table = new(function() {
			this.version = "2.3.3";
			this.create = function(cols, rows) {
				rows = parseInt(rows, 10);
				cols = parseInt(cols, 10);
				var fr = document.createDocumentFragment();
				for (var i = 0; i < rows; i++) {
					fr.appendChild(this.createRow(cols));
				}
				this.element.innerHTML = "";
				this.element.appendChild(fr);
				this.Table.update();
				this.loadAllFootnotes();
			};
			this.importData = function(content, format){
				content = content || $id("import_value").value;
				format = (format || $id("import_format").value).toLowerCase();
				if(format == "auto"){
					var json;
					if(/(\\begin{|\\halign|\\valign|\\ctable({|\[))/.test(content)){
						try{
							this.importFromJSON(this.latex.importTable(content));
						}
						catch(e){
							try{
								this.importFromJSON(JSON.parse(content));
								$('#importModal').modal('hide');
								sendGAEvent("Code", "import", "latex");
							}
							catch(f){
								alert("Your file was detected as LaTeX but could not be loaded.");
								if(window.console){
									console.error(e);
								}
							}
						}
					}
					else{
						try{
							json = JSON.parse(content);
							sendGAEvent("Code", "import", "json");
						}
						catch(e){
							try{
								json = this.importCSV(content);
								$('#importModal').modal('hide');
								sendGAEvent("Code", "import", "csv");
							}
							catch(f){
								alert("Your file could not be loaded");
								if(window.console){
									console.error(e);
									console.error(f);
								}
								return false;							
							}
						}
						this.importFromJSON(json);
					}
				}
				else if(format == "json"){
					try{
						this.importFromJSON(JSON.parse(content));
						$('#importModal').modal('hide');
						sendGAEvent("Code", "import", "json");
					}
					catch(e){
						alert("Your JSON file could not be loaded. Be sure the JSON was generated by this generator");
					}
				}
				else if(format == "latex"){
					if(!window.isProduction){
							this.importFromJSON(table.latex.importTable(content));
							$('#importModal').modal('hide');
							sendGAEvent("Code", "import", "latex");
					}
					else{
						try{
							this.importFromJSON(table.latex.importTable(content));
							$('#importModal').modal('hide');
							sendGAEvent("Code", "import", "latex");
						}
						catch(e){
							if(window.console){
								console.error(e);
							}
							$("#latex-import-error").show();
						}
					}
				}
				else if(format == "markdown"){
					try{
						this.importFromJSON(this.importMd(content));
						$('#importModal').modal('hide');
						sendGAEvent("Code", "import", "md");
					}
					catch(e){
						alert("Your Markdown file could not be loaded");
					}
				}
				else if(format == "csv"){
					try{
						this.importFromJSON(this.importCSV(content));
						$('#importModal').modal('hide');
						sendGAEvent("Code", "import", "csv");
					}
					catch(e){
						alert("Your CSV file could not be loaded");
					}
				}
				this.loadAllFootnotes();
			}
			this.selectFormat = function(format){
				$("div[data-option-group]").hide();
				$("div[data-option-group=\""+format+"\"]").show();
				var drop = $id("format-drop");
				var li = drop.querySelector('li[data-value="'+format+'"]');
				if(li){
					var btn = $id("format-btn");
					btn.setAttribute("data-value", format);
					btn.innerHTML = li.innerText+' <span class="caret"></span>';
				}
				$id("format-in").value = format;
			}
			this.removeAllSelection = function() {
				this.selectedCell = null;
				var allSelected = document.querySelectorAll("#table td[data-selected]");
				for (var i = 0, l = allSelected.length; i < l; i++) {
					allSelected[i].removeAttribute("data-selected");
				}
			}
			this.forEachSelectedCell = function(fn) {
				var allCells = document.querySelectorAll("#table td[data-selected]");
				for (var i = 0, l = allCells.length; i < l; i++) {
					if (fn.call(this, allCells[i], i) === false) {
						break;
					}
				}
			}
			this.separators = function(hm) {
				$id("info_diag_zero")
					.classList.remove("active");
				$id("info_diag_one")
					.classList.remove("active");
				$id("info_diag_two")
					.classList.remove("active");
				if (hm == 2) {
					$id("info_diag_two")
						.classList.add("active");
					this.twoDiagonals();

					$id("info-diagonal-block").style.display="block";
				} else if (hm == 1) {
					$id("info_diag_one")
						.classList.add("active");
					this.diagonal();

					$id("info-diagonal-block").style.display="block";
				} else {
					$id("info_diag_zero")
						.classList.add("active");

					$id("info-diagonal-block").style.display="none";
					this.forEachSelectedCell(function(cell) {
						if (cell.hasAttribute("data-two-diagonals")) {
							var toDel = cell.querySelector("div[contenteditable]");
							cell.setAttribute("data-two-diagonals-data", toDel.innerHTML);
							toDel.parentElement.removeChild(toDel);
						}
						if (cell.hasAttribute("data-two-diagonals") || cell.hasAttribute("data-diagonal")) {
							var toDel = cell.querySelector("div[contenteditable]:last-child");
							cell.setAttribute("data-diagonal-data", toDel.innerHTML);
							toDel.parentElement.removeChild(toDel);
						}
						cell.removeAttribute("data-two-diagonals");
						cell.removeAttribute("data-diagonal");
					});
				}
			}
			this.interpreters = {};
			this.createInterpreter = function(format, fn) {
				this.interpreters[format] = fn;
			}
			this.interpret = function(format) {
				document.getElementById('c')
					.value = this.interpreters[format].call(this);
			}
			this.deleteContent = function(force){
				force = force || confirm("Are you sure you want to delete the content of your table ?");
				if(force){
					this.statesManager.registerState();
					var div = this.element.querySelectorAll(".outer>div");
					for(var i=0;i<div.length;i++){
						div[i].innerHTML = "";
					}					
				}
			}
			this._importExcel = function(a){
				document.getElementById('worksheet-loading-status').innerHTML = "";
				var surround = document.getElementById("opt-gen-surround").checked;
				a = JSON.parse(a);
				var results = a.results,
				frag = document.createDocumentFragment(),
				loadWorkbook = function(n){
					n = Math.max(0,parseInt(n, 10)||0);
					if(results[n]){
						var div = document.createElement("div");
						div.innerHTML = results[n].html;
						if(surround){
							var tb = div.getElementsByTagName("table")[0];
							if(tb){
								for(var i=0;i<tb.rows.length;i++){
									var cells = tb.rows[i].cells;
									for(var j=0;j<cells.length;j++){
										var cell = cells[j];
										if(cell.getAttribute("t") == "n" &&
										/^[\d\+\-e\.,\s]*\d[\d\+\-e\.,\s]*$/.test(cell.innerText)){
											cell.innerHTML = "<span class=\"latex-equation\">"+
												cell.innerHTML + "</span>";
										}
									}
								}
							}
						}
						table.extract(div);
					}
					$("#worksheet-options").hide()
					$("#worksheet-dialog").modal("hide");
				};
				if(results.length > 1){
					for(var i=0;i<results.length;i++){
						var option = document.createElement("option");
						option.value = i;
						option.text = results[i].name;
						frag.appendChild(option);
					}
					var select = table._id("select-workbook");
					while(select.firstChild){
						select.removeChild(select.firstChild);
					}
					select.appendChild(frag);
					var button = table._id("button-workbook");
					button.onclick = function(){
						loadWorkbook(document.getElementById('select-workbook').value);
					}
					$("#worksheet-options").show()
				}
				else if(results.length > 0){
					loadWorkbook(0);
				}
				sendGAEvent("Code", "importFile", "file");
				table._id("excel-button").disabled = false;
			}
			this.importExcel = function(file){
				file = file || this._id("excel-file").files[0]
				var elem_status = this._id('worksheet-loading-status');
				if(file){	
					this._id("excel-button").disabled = true;
					var _this = this;
					var excelWorker = function excelWorker(data, cb, th) {
						try{
							var worker = new Worker("js/xlsxworker.js");
						}
						catch(e){
							if(/origin.+null/.test(e.message)){
								elem_status.innerHTML = "Impossible to load worksheets locally with this browser. Use another browser or load this page in a server.";
							}
							else{
								console.error(e);
								elem_status.innerHTML = "An unknown error occured";
							}
							document.getElementById("excel-button").disabled = false;
							return false;
						}
						worker.onmessage = function(e) {
							var t = e.data.t;
							if(t == "e"){
								console.error(e.data.d);
								elem_status.innerHTML = "An error occured";
								document.getElementById("excel-button").disabled = false;
								worker.terminate();
							}
							else if(t == "xlsx"){
								console.dir(e.data.d);
								cb(e.data.d);
								worker.terminate();
							}
						};
						worker.onerror = function(e){
							console.error(e);
							elem_status.innerHTML = "An error occured";
							document.getElementById("excel-button").disabled = false;
						}
						worker.postMessage({d:data,
							b:'binary', 
							c:document.getElementById("opt-gen-comma").checked
						});
					};
					var reader = new FileReader(), _this = this;
					reader.onload = function(e){
						elem_status.innerHTML = 'Converting... <a href="#" id="worksheet-cancel">Cancel</a>';
						document.getElementById("worksheet-cancel").addEventListener("click", function(e){
							e.preventDefault();
							worker.terminate();
							document.getElementById("excel-button").disabled = false;
							elem_status.innerHTML = "";
						},false);
						excelWorker(e.target.result, _this._importExcel);
					};
					reader.onprogress = function(e){
						if(e.lengthComputable){
							var percent = Math.round(e.loaded/e.total*100);
							elem_status.innerHTML = "Loading "+percent+"%";
						}
					}
					reader.onerror = function(e){
						console.error(e);
						elem_status.innerHTML = "An error occured";
						document.getElementById("excel-button").disabled = false;
					}
					reader.readAsBinaryString(file);
				}
			}
			this.openImportModal = function(format){
				$('#myModal').modal('hide');
				$id('import_format').value=format;
				$('#importModal').modal('show');
			}
			this.insertRowUnder = function(cell) {
				this.statesManager.registerState();
				cell = cell || this.selectedCell;
				if (!cell) {
					return false;
				}
				var position = this.Table.position(cell),
					y = -1;
				if (position) {
					y = position.y + cell.rowSpan;
				}
				var _this = this;
				this.Table.insertRow(y, function(cell) {
					_this.applyToCell(cell)
				});
			}
			this.insertRowOver = function(cell) {
				this.statesManager.registerState();
				cell = cell || this.selectedCell;
				if (!cell) {
					return false;
				}
				var position = this.Table.position(cell),
					y = 0;
				if (position) {
					y = Math.max(position.y, 0);
				}
				var _this = this;
				this.Table.insertRow(y, function(cell) {
					_this.applyToCell(cell)
				});
			}
			this.insertColBefore = function(cell) {
				this.statesManager.registerState();
				cell = cell || this.selectedCell;
				if (!cell) {
					return false;
				}
				var position = this.Table.position(cell),
					x = 0;
				if (position) {
					x = Math.max(position.x, 0);
				}
				var _this = this;
				this.Table.insertCol(x, function(cell) {
					_this.applyToCell(cell)
				});
			}
			this.insertColAfter = function(cell) {
				this.statesManager.registerState();
				cell = cell || this.selectedCell;
				if (!cell) {
					return false;
				}
				var position = this.Table.position(cell),
					x = 0;
				if (position) {
					x = position.x + cell.colSpan;
				}
				var _this = this;
				this.Table.insertCol(x, function(cell) {
					_this.applyToCell(cell)
				});
			}
			this.split = function() {
				this.statesManager.registerState();
				var _this = this;
				this.Table.split(document.querySelectorAll("#table td[data-selected]"), function(cell) {
					_this.applyToCell(cell)
				});
			}
			this.createCellLike = function(cell) {
				var td = this.createCell();
				td.rowSpan = cell.rowSpan;
				td.colSpan = cell.colSpan;
				for (var i in cell.dataset) {
					td.dataset[i] = cell.dataset[i];
				}
				td.removeAttribute("data-selected");
				return td;
			}
			this.textColor = function(color){
				if(color){
					this._id("text-color-span").style.borderBottomColor = color;
					this._id("text-color-button").setAttribute("data-color", color);
				}
				else{
					return this._id("text-color-button").getAttribute("data-color") || "#000000";
				}
			}
			this.diagonal = function() {
				this.statesManager.registerState();
				this.updateLaTeXInfoCell();
				this.forEachSelectedCell(function(cell) {
					if (!cell.hasAttribute("data-diagonal")) {
						if (cell.hasAttribute("data-two-diagonals")) {
							var toDel = cell.querySelector("div[contenteditable]");
							cell.setAttribute("data-two-diagonals-data", this.getHTML(cell));
							toDel.parentElement.removeChild(toDel);
							cell.removeAttribute("data-two-diagonals");
						} else {
							if(!(cell.querySelector(".outer > div").innerText||"").trim()){cell.querySelector(".outer > div").innerHTML = "[1]"}
							cell.querySelector(".outer")
								.innerHTML += "<div contenteditable>" + (cell.getAttribute("data-diagonal-data") || "[2]") +
								"</div>";
						}
						cell.setAttribute("data-diagonal", "data-diagonal")
					}
				});
			}
			this.twoDiagonals = function() {
				this.statesManager.registerState();
				this.updateLaTeXInfoCell();
				this.forEachSelectedCell(function(cell) {
					if (!cell.hasAttribute("data-two-diagonals")) {
						var div = cell.querySelector(".outer");
						if (cell.hasAttribute("data-diagonal")) {
							cell.removeAttribute("data-diagonal");
							div.innerHTML = "<div contenteditable>" + (cell.getAttribute("data-two-diagonals-data") || "[1]") +
								"</div>" + div.innerHTML;
						} else {

							if(!(cell.querySelector(".outer > div").innerText||"").trim()){cell.querySelector(".outer > div").innerHTML = "[2]"}
							div.innerHTML = "<div contenteditable>" + (cell.getAttribute("data-two-diagonals-data") || "[1]") +
								"</div>" + div.innerHTML + "<div contenteditable>" + (cell.getAttribute("data-diagonal-data") ||
									"[3]") + "</div>";
						}
						cell.setAttribute("data-two-diagonals", "data-two-diagonals");
					}
				});
			}
			this.rotate = function(state) {
				var _this = this;
				this.statesManager.registerState();
				this.forEachSelectedCell(function(cell) {
					if (state) {
						_this.refreshRotatedCellSize(cell);
						cell.setAttribute("data-rotated", "data-rotated");
					} else {
						cell.style.width = cell.style.height = "";
						if(cell.style.removeProperty){
							cell.style.removeProperty("width");
							cell.style.removeProperty("height");
						}
						cell.removeAttribute("data-rotated");
					}
				});
				if(state){
					$id("info-unrotated").classList.remove("active");
					$id("info-rotated").classList.add("active");
				}
				else{
					$id("info-unrotated").classList.add("active");
					$id("info-rotated").classList.remove("active");
				}
				this.updateLaTeXInfoCell();
			}
			this.selectedCell = null;
			this.merge = function(name) {
				this.statesManager.registerState();
				var _this = this;
				this.Table[name||"merge"](document.querySelectorAll("#table td[data-selected]"), function(colspan, rowspan, keep, removed) {
					var html = _this.getHTML(keep);
					for (var i = 0; i < removed.length; i++) {
						html += " " + _this.getHTML(removed[i])
					}
					_this.setHTML(keep, html);
				});
			}
			this.getCellPosition = function(_cell) {
				var table = this.element,
					occupied = [],
					rows = table.rows;
				for (var i = 0; i < rows.length; i++) {
					occupied.push([]);
				}
				for (var i = 0; i < rows.length; i++) {
					var cols = rows[i].cells,
						realcount = 0;
					for (var j = 0; j < cols.length; j++) {
						var cell = cols[j];
						if (occupied[i][realcount]) {
							j--;
							realcount++;
							continue;
						}
						if (cell == _cell) {
							return {
								x: i,
								y: realcount
							}
						}
						for (var h = 1; h < cell.rowSpan; h++) {
							for (var g = 0; g < cell.colSpan; g++) {
								occupied[i + h][realcount + g] = true;
							}
						}
						realcount += cell.colSpan;
					}
				}

			}
			this.getCellByPosition = function(x, y) {
				var table = this.element,
					occupied = [],
					rows = table.rows;
				if (x >= rows.length) {
					return null;
				}
				for (var i = 0; i < rows.length; i++) {
					occupied.push([]);
				}
				for (var i = 0, l = Math.min(rows.length, x + 1); i < l; i++) {
					var cols = rows[i].cells,
						realcount = 0;
					for (var j = 0; j < cols.length; j++) {
						var cell = cols[j];
						if (occupied[i][realcount]) {
							j--;
							realcount++;
							continue;
						}
						if (i == x && realcount == y) {
							return cell;
						}
						for (var h = 1; h < cell.rowSpan; h++) {
							for (var g = 0; g < cell.colSpan; g++) {
								occupied[i + h][realcount + g] = true;
							}
						}
						realcount += cell.colSpan;
					}
				}
			};
			this.unselectCells = function(group) {
				for (var i = 0; i < group.length; i++) {
					group.removeAttribute("data-selected");
				}
			}
			this.setMargin = function(left, value) {
				this.forEachSelectedCell(function(cell) {
					if (left) {
						cell.setAttribute("data-margin-left", value);
					} else {
						cell.setAttribute("data-margin-right", value);
					}
				});
			}
			this.backgroundColor = function(color) {
				this.statesManager.registerState();
				this.forEachSelectedCell(function(cell) {
					cell.style.backgroundColor = color;
				});
			}
			this.diagonalColor = function(color) {
				this.statesManager.registerState();
				this.forEachSelectedCell(function(cell) {
					cell.style.color = color;
					cell.setAttribute("data-diagonal-color", color);
				});
			}
			this.removeBackgroundColor = function(color) {
				this.statesManager.registerState();
				this.forEachSelectedCell(function(cell) {
					cell.style.backgroundColor = "";
					if(cell.style.removeProperty){
						cell.style.removeProperty("background-color");
					}
				});
			}
			this.setAlign = function(value) {
				this.statesManager.registerState();
				if (value != "l" && value != "r" && value != "c" && value != "d") {
					value = "l";
				}
				$id("info_align_left")
					.classList.remove("active");
				$id("info_align_center")
					.classList.remove("active");
				$id("info_align_right")
					.classList.remove("active");
				$id("info_align_decimal")
					.classList.remove("active");
				this.forEachSelectedCell(function(cell) {
					cell.setAttribute("data-align", value);
				});
				$id({
						"l": "info_align_left",
						"c": "info_align_center",
						"r": "info_align_right",
						"d": "info_align_decimal"
					}[value])
					.classList.add("active");
			}
			this.setVAlign = function(value) {
				this.statesManager.registerState();
				if (value != "t" && value != "m" && value != "b") {
					value = "m";
				}
				$id("info_align_top")
					.classList.remove("active");
				$id("info_align_middle")
					.classList.remove("active");
				$id("info_align_bottom")
					.classList.remove("active");
				if(value != "m"){
					this.forEachSelectedCell(function(cell) {
						cell.setAttribute("data-vertical-align", value);
					});
				}
				else{
					this.forEachSelectedCell(function(cell) {
						cell.removeAttribute("data-vertical-align");
					});
				}
				$id({
						"t": "info_align_top",
						"m": "info_align_middle",
						"b": "info_align_bottom"
					}[value])
					.classList.add("active");
			}

			this.updateLaTeXInfoCell = function(cell) {
				cell = cell || this.selectedCell;
				if (cell) {
					document.querySelector("#latex_content")
						.value = this.generateForCell(cell);
				}
			}
this.getHTML = (function(){
	var newline = false,
	_eqHTML = function(node, cont){
		if(node.nodeType == 3){
			cont.appendChild(node.cloneNode(true));
			if(!newline && /\S/.test(node.nodeValue)){
				newline = true;
			}
		}
		else if(node.nodeType == 1){
			var tagName = node.tagName, newnode;
			if(tagName == "TITLE" || tagName == "SCRIPT" || tagName == "STYLE" || tagName == "VIDEO" || tagName == "OBJECT"){
				return false;
			}
			else if(tagName == "B" || tagName == "I" || tagName == "UL" || tagName == "SUP"
				 || tagName == "U" || tagName == "STRIKE"){
				newnode = document.createElement(tagName);
				cont.appendChild(newnode);
			}
			else if(tagName == "LI"){
				newnode = document.createElement(tagName);
				if(cont.tagName == "UL"){
					cont.appendChild(newnode);
				}
				else if(cont.lastElementChild && cont.lastElementChild.tagName == "UL"){
					cont.lastElementChild.appendChild(newnode);
				}
				else{
					var ul = document.createElement("UL");
					cont.appendChild(ul);
					ul.appendChild(newnode);
				}
			}
			else if((tagName == "FONT" && node.hasAttribute("color")) || node.style.color){
				var rgba = toRGBA(node.color || node.style.color) || [0,0,0,1],
				color = "#" + ((1 << 24) + (rgba[0] << 16) + (rgba[1] << 8) + rgba[2]).toString(16).slice(1);
				rgba = rgba.join(",");
				var ok = rgba !== "0,0,0,1";
				// black is the default color. If there's no parent element which set another color, it will be removed
				// If it's another color and its parent set the same color, it will also be removed.
				var trav = cont;
				do{
					if((trav.tagName == "FONT" && trav.hasAttribute("color")) || trav.style.color){
						var rgba2 = (toRGBA(trav.color || trav.style.color) || [0,0,0,1]).join(",");
						ok = rgba != rgba2;
						break;
					}
					else if(trav.tagName == "TD"){
						break;
					}
				}
				while(trav = trav.parentElement)
				if(ok){
					newnode = document.createElement("FONT");
					newnode.color = color;
					cont.appendChild(newnode);
				}
			}
			else if(tagName == "OL"){
				newnode = document.createElement("UL");
				cont.appendChild(newnode);
			}
			else if(tagName == "STRONG"){
				newnode = document.createElement("B");
				cont.appendChild(newnode);
			}
			else if(tagName == "S" || tagName == "DEL"){
				newnode = document.createElement("STRIKE");
				cont.appendChild(newnode);
			}
			else if(tagName == "EM"){
				newnode = document.createElement("I");
				cont.appendChild(newnode);
			}
			else if(tagName.charAt(0) == "H" && /^\d$/.test(tagName.charAt(1))){
				// H1, H2, H3, H4, H5, H6
				if(newline){
					cont.appendChild(document.createElement("BR"));
				}
				newnode = document.createElement("B");
				cont.appendChild(newnode);
				cont.appendChild(document.createElement("BR"));
				newline = false;
			}
			else if(newline && (tagName == "DIV" || tagName == "P" || tagName == "HEADER" || tagName == "SECTION" || tagName == "FOOTER" || tagName == "TR" || tagName == "BLOCKQUOTE")){
				if(!node.previousElementSibling || node.previousElementSibling.tagName != "UL"){
					cont.appendChild(document.createElement("BR"));
				}
				newline = false;
			}
			else if(tagName == "BR"){
				if(node.parentElement.childNodes[node.parentElement.childNodes.length-1] != node){
					cont.appendChild(document.createElement("BR"));
					newline = false;
				}
				else{
					cont.appendChild(document.createElement("WBR"));
				}
			}
			else if(node.className == "tb-footnote"){
				newnode = document.createElement("span");
				newnode.className = node.className;
				if(node.hasAttribute("data-footnote-id")){
					var id = node.getAttribute("data-footnote-id");
					if(document.getElementById(id)){
						newnode.setAttribute("data-footnote-id", id);
						newnode.title = document.getElementById(id).querySelector("textarea").value;
					}
				}
				newnode.innerHTML = "&#x200b;";
				cont.appendChild(newnode);
			}
			else if(node.className == "latex-equation"){
				newnode = document.createElement("span");
				newnode.className = node.className;
				cont.appendChild(newnode);
			}
			if(true){
				var frag = document.createDocumentFragment(), lastnode;
				if(newnode){
					frag.appendChild(newnode);
				}
				else{
					newnode = frag;
				}
				
				if(node.style.fontWeight == "bold" || node.style.fontWeight == "bolder" || (+node.style.fontWeight)>= 700){
					lastnode = document.createElement("B");
					newnode.appendChild(lastnode);
					newnode = lastnode;
				}
				if(node.style.fontStyle == "italic" || node.style.fontStyle == "oblique"){
					lastnode = document.createElement("I");
					newnode.appendChild(lastnode);
					newnode = lastnode;
				}
				if(node.style.textDecoration && node.style.textDecoration.indexOf("underline") > -1){
					lastnode = document.createElement("U");
					newnode.appendChild(lastnode);
					newnode = lastnode;
				}
				if(node.style.textDecoration && node.style.textDecoration.indexOf("line-through") > -1){
					lastnode = document.createElement("STRIKE");
					newnode.appendChild(lastnode);
					newnode = lastnode;
				}
				if(frag === newnode){
					newnode = null;
				}
				cont.appendChild(frag);
			}
			for(var i=0;i<node.childNodes.length;i++){
				_eqHTML(node.childNodes[i], newnode || cont)
			}
		}
	}
	return function getHTML(cell, n){
		var div;
		if(cell.tagName == "TD" || cell.tagName == "TH"){
			if(!n){
				div = cell.querySelector("div[contenteditable]");
			}
			else{
				div = cell.querySelectorAll("div[contenteditable]")[n]
			}
			if(!div){div = cell;}
		}
		else{
			div = cell;
		}
		if(div.childNodes.length === 1 && div.firstChild.tagName == "BR" && div.innerText === ""){
			// Fix this : https://connect.microsoft.com/IE/feedback/details/802442/ie11-rtm-implicit-br-tags-in-innerhtml-on-empty-content-editable-elements
			return "";
		}
		if(div.innerHTML.indexOf("<") == -1){
			// Shortcut for text-only cells (most cells)
			return div.innerHTML.replace(/\s*$/, "").replace(/^\s*/, "");
		}
		var cont = document.createElement("div");
		newline = false;
		for(var i=0;i<div.childNodes.length;i++){
			_eqHTML(div.childNodes[i], cont)
		}
		var html = cont.innerHTML.replace(/<\/(b|i)\s*>(\s*)<\s*(b|i)\s*>/gi, function(full, close, space, open){
			if(open.toLowerCase() == close.toLowerCase()){
				return space;
			}
			return full;
		}).replace(/\u200B/g,'');
		if(/<br[^a-z>]*>/i.test(html)){
			var opentags = [], html = html.replace(/<\s*(\/?)\s*(br|b|i|u|font\s+[^>]*|font)[^a-z>]*>/ig,function(full,close,tag){
				tag = tag.toLowerCase();
				if(tag == "br"){
					if(opentags.length > 0){
						var str = "</";
						opentags.reverse();
						str += opentags.join("></")+"><br><";
						opentags.reverse();
						str += opentags.join("><")+">";
						str = str.replace(/<\/\s*font[^>]*>/gi,"</font>");
						return str;
					}
					else{
						return "<br>";
					}
				}
				else if(close){
					opentags.pop();
					return full;
				}
				else{
					opentags.push(tag);
					return full;
				}
			})
		}
		return html;
	}
})();
			this.setHTML = function(cell, HTML) {
				cell.querySelector("div[contenteditable]")
					.innerHTML = HTML;
			}
			this.cellBefore = function(cell) {
				return cell.previousSibling;
			}
			this.blacklistPackages = {};
			this.isSelected = function(cell) {
				return cell.hasAttribute("data-selected");
			}
			this.lastSelectedCell = false;
			this.selectCell = function(element, CTRL, SHIFT) {
				if ((!CTRL && !SHIFT) || !this.lastSelectedCell || !this.lastSelectedCell.offsetWidth) {
					this.removeAllSelection();
					this.showInfo(element);
					this.lastSelectedCell = this.selectedCell = element;
					element.setAttribute("data-selected", "data-selected");
				}
				else if (SHIFT) { //TODO
					var rows = this.Table.matrix();
					var posThis = this.Table.position(element, rows);
					var posLast = this.Table.position(this.lastSelectedCell, rows);
					for(var i=Math.min(posThis.y,posLast.y);i<=Math.max(posThis.y,posLast.y);i++){
						var cells = rows[i];
						for(var j=Math.min(posThis.x,posLast.x);j<=Math.max(posThis.x,posLast.x);j++){
							var cell = cells[j];
							var el = (cell.refCell||cell).cell
							el.setAttribute("data-selected", "data-selected");
							this.lastSelectedCell = el;
						}
					}
				} else {
					if (CTRL && element.hasAttribute("data-selected")) {
						element.removeAttribute("data-selected");
						if(this.lastSelectedCell === element){
							this.lastSelectedCell = null;
						}
					} else {
						element.setAttribute("data-selected", "data-selected");
						this.lastSelectedCell = element
					}
				}
			}
			this._id = function(id) {
				return document.getElementById(id)
			}
			this.showInfo = function(element) {
				document.querySelector("#latex_content")
					.value = this.generateForCell(element);
				// Diagonal
				$id("info_diag_zero")
					.classList.remove("active");
				$id("info_diag_one")
					.classList.remove("active");
				$id("info_diag_two")
					.classList.remove("active");
				if (element.hasAttribute("data-two-diagonals")) {
					$id("info-diagonal-block").style.display="block";
					$id("info_diag_two")
						.classList.add("active");
				} else if (element.hasAttribute("data-diagonal")) {
					$id("info_diag_one")
						.classList.add("active");
					$id("info-diagonal-block").style.display="block";
				} else {
					$id("info_diag_zero")
						.classList.add("active");
					$id("info-diagonal-block").style.display="none";
				}
				$id("info-diagonal-color").value = element.getAttribute("data-diagonal-color") || "#000000";
				// Align
				this._id("info_align_left")
					.classList.remove("active");
				this._id("info_align_center")
					.classList.remove("active");

				this._id("info_align_decimal")
					.classList.remove("active");
				this._id("info_align_right")
					.classList.remove("active");
				var align = element.getAttribute("data-align");
				if (align == "c") {
					this._id("info_align_center")
						.classList.add("active");
				} else if (align == "r") {
					this._id("info_align_right")
						.classList.add("active");
				} else if (align == "d") {
					this._id("info_align_decimal")
						.classList.add("active");
				} else {
					this._id("info_align_left")
						.classList.add("active");
				}
				// Vertical align
				this._id("info_align_top")
					.classList.remove("active");
				this._id("info_align_middle")
					.classList.remove("active");

				this._id("info_align_bottom")
					.classList.remove("active");	
				align = element.getAttribute("data-vertical-align");
				if (align == "t") {
					this._id("info_align_top")
						.classList.add("active");
				} else if (align == "b") {
					this._id("info_align_bottom")
						.classList.add("active");
				} else {
					this._id("info_align_middle")
						.classList.add("active");
				}		
				// Rotated ?
				if(element.hasAttribute("data-rotated")){
					this._id("info-rotated")
					.classList.add("active");
					this._id("info-unrotated").classList.remove("active")
				}
				else{
					this._id("info-unrotated").classList.add("active");
					this._id("info-rotated").classList.remove("active")
				}
				// Background color
				var color = window.getComputedStyle(element,null).getPropertyValue("background-color") || "#FFFFFF";
				if(color == "transparent" || /rgba?\s*\(\s*\d+[\s,]+\d+[\s,]+\d+[\s,]+0\s*\)/.test(color)){
					color = [255,255,255,0];
				}
				else{
					color = toRGBA(color);
				}
				color = "#" + ((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2]).toString(16).slice(1);
				this._id('info-background-color').value = color;
				
			}
			this.applyToCell = function(td) {
				var div1 = document.createElement("div");
				div1.className = "outer";
				var div2 = document.createElement("div");
				div2.contentEditable = true;
				div2.innerHTML = "";
				div1.appendChild(div2);
				td.appendChild(div1);
				td.addEventListener("mousedown", this._clickCellManager, false);
				return td;
			}
			this.createCell = function(classNames) {
				var td = document.createElement("td");
				td.classNames = classNames || "";
				return this.applyToCell(td);
			}
			this.createRow = function(cols, classNames) {
				var tr = document.createElement("tr");
				for (var i = 0; i < cols; i++) {
					tr.appendChild(this.createCell(classNames));
				}
				return tr;
			}
			this.statesManager = new (function(table) {
				// A better undo manager is on the way;
				this.states = []
				this.registerState = function(){
					this.states.push(table.exportToJSON());
					this.stateNumber = this.states.length-1
				}
				this.stateNumber = 0;
				this.undo = function(){
					if (document.queryCommandEnabled("undo")) {
						document.execCommand("undo");
					}
					else if(this.states[this.stateNumber]){
						table.importFromJSON(this.states[this.stateNumber]);
						this.stateNumber--;
						this.states.pop();
					}
				}
			})(this)
			this.selectionAllowed = true;
			this.hasShownBorderEditorInfo = false;
			this.topWidth = 100;
			this.mode = function(n) {
				if (arguments.length == 0) {
					if (document.body.hasAttribute("data-view-editor")) {
						return 1
					}
					if (document.body.hasAttribute("data-border-editor")) {
						return 2
					}
					return 0;
				} else {
					$id("button-mode-border")
						.classList.remove("active");
					$id("button-mode-border").setAttribute("aria-pressed","false")
					$id("button-mode-view")
						.classList.remove("active");
					$id("button-mode-view").setAttribute("aria-pressed","false")
					var toolbarGroup = document.querySelector(".toolbar-groups"),
					buttonStyleGroup = document.getElementById("btn-group-btn-style");
					if(n !== 2){
						if(toolbarGroup.offsetWidth == 0){
							window.requestAnimationFrame((function(){
								toolbarGroup.style.width = this.topWidth + "px";
								toolbarGroup.classList.add("toolbar-group-visible")
								buttonStyleGroup.classList.remove("toolbar-group-visible")
								buttonStyleGroup.style.display = "none";
							}).bind(this));
						}
					}
					else{
						this.topWidth = toolbarGroup.offsetWidth;
						window.requestAnimationFrame(function(){
							buttonStyleGroup.style.display = "flex";
							toolbarGroup.style.width = "0";
							toolbarGroup.classList.remove("toolbar-group-visible")
							buttonStyleGroup.classList.add("toolbar-group-visible")
						});
					}
					// Set
					if (n == 1 || n == 2) {
						var l = this.element.querySelectorAll("div[contenteditable]");
						for (var i = 0; i < l.length; i++) {
							(l[i] || {})
							.contentEditable = false;
						}
						this.selectionAllowed = false;
						if (n == 1) {
							// View
							document.body.removeAttribute("data-border-editor")
							document.body.setAttribute("data-view-editor", "data-view-editor");
							$id("button-mode-view")
								.classList.add("active");							$id("button-mode-view")
							$id("button-mode-view").setAttribute("aria-pressed","true");
						} else {
							// Border
							if (!this.hasShownBorderEditorInfo) {
								this.hasShownBorderEditorInfo = true;
								$("#border-editor-info")
									.show(100);
							}
							$("#right_border").collapse('show')
							document.body.removeAttribute("data-view-editor");
							document.body.setAttribute("data-border-editor", "data-border-editor");
							$id("button-mode-border")
								.classList.add("active");
							$id("button-mode-border").setAttribute("aria-pressed","true")
						}
					} else {
						// Edit
						document.body.removeAttribute("data-view-editor")
						document.body.removeAttribute("data-border-editor")
						this.selectionAllowed = true;
						var l = this.element.querySelectorAll("div[contenteditable]");
						for (var i = 0; i < l.length; i++) {
							(l[i] || {})
							.contentEditable = true
						}
					}
					if(n != 2){
						// If we are not in the border editor, we hide information about it
						$("#border-editor-info").hide();
					}
				}
			}
			this.log = "";
			this.findReplace = function(){
				var text = document.getElementById("findreplace-from").value,
				replace = document.getElementById("findreplace-to").value,
				mode = document.getElementById("findreplace-mode").value;
				if(text){
					this.statesManager.registerState();
					var elements;
					if(mode == "1"){
						elements = this.element.querySelectorAll("td[data-selected] div[contenteditable]");
					}
					else if(mode == "2"){
						elements = this.element.querySelectorAll("td:not([data-selected]) div[contenteditable]");
					}
					else{
						elements = this.element.querySelectorAll("td div[contenteditable]");
					}
					var nb = this.findReplaceElements(text,replace,elements);
				}
				else{nb = 0}
				alert(nb+" instance"+(nb>1?"s":"")+" replaced");
				$("#findreplace-dialog").modal("hide");
			}
			this.findReplaceElements = function(text, replace, elements){
				// let's build a regexp
				var regexp = "";
				for(var i=0;i<text.length;i++){
					if(i>0){
						regexp+="((?:<(?!\s*\/?\s*(?:br|li|ul|p|div))[^>]+?>)*)";
					}
					var c = text[i];
					regexp+="(?:";
					if(c == ">"){
						regexp+="&gt;";
					}
					else if(c == "<"){
						regexp+="&lt;";
					}
					else if(c == "&"){
						regexp+="(?:&amp;|&)";
					}
					else if(c == '"'){
						regexp+='(?:&quot;|")';
					}
					else if(c == "\\" || c == "(" || c == ")" || c == "/" || c == "." || c == "[" || c == "]" || c ==  "?" || c == "*" || c == "+" || c == "^" || c == "$"){
						regexp+= "\\"+c;
					}
					else if(c == " "){
						regexp+="\s+";
					}
					else{
						regexp+=c;
					}
					regexp+=")(?!([^<]+)?>)";
				}
				var div = document.createElement("div"), nb = 0;
				div.innerText = replace;
				replace = div.innerHTML;
				for(var i=0;i<elements.length;i++){
					var html = elements[i].innerHTML
					var newhtml = html.replace(new RegExp(regexp,"gi"),function(full){
						// let's build overtags;
						var tags = [],
						tagName = [];
						for(var i=1;i<arguments.length-2;i++){
							if(!arguments[i]){continue;}
							arguments[i].replace(/<\s*(\/?)\s*([a-z]+)[^>]*?>/gi, function(full,close,tagname){
								tagname = tagname.toLowerCase();
								if(close){
									if(tagName[tagName.length-1] == tagname){
										tagName.pop();
										tags.pop();
									}
									else{
										tags.push(full);
										tagName.push("/"+tagname);
									}
								}
								else{
									tagName.push(tagname);
									tags.push(full);
								}
							});
						}
						nb++
						return replace+tags.join("");
					});
					if(newhtml != html){
						elements[i].innerHTML = newhtml;
					}
				}
				return nb;
			}
			var logArchive = {};
			this.showFootnotePanel = function(){
				$('#right_cell').collapse('hide');
				$('#right_footnote').collapse('show');
			}
			this.toggleFootnotePanel = function(){
				$('#right_cell').collapse('toggle');
				$('#right_footnote').collapse('toggle');
			}
			this.uniqueLog = function(text, type){
				if(!logArchive[text]){
					this.message(text, type);
				}
			}
			this.message = function(text, type) {
				if(type){
					type=type.toString().toLowerCase();
				}
				else{type = "";}
				if(this.log == ""){
					logArchive = {};
				}
				logArchive[text] = true;
				if(type == "warning" || type == "1"){
					this.log += "<table><tr><td><span class='glyphicon glyphicon-exclamation-sign' style='padding-right:4px;'></span></td><td>"+text+"</td><tr></table><hr>";
				}
				else{
					this.log += "<p class='"+type+"'>"+text+"</p><hr>";
				}
			}
			this.importFromJSON = function(o) {
				if (o.autoBooktabs) {
					this.element.setAttribute("data-booktabs", "data-booktabs");
					$id("button-booktabs")
						.classList.add("active");
				} else {
					this.element.removeAttribute("data-booktabs");
					$id("button-booktabs")
						.classList.remove("active");
				}
				if (o.options){
					for(var i in o.options){
						var elem = $id("opt-"+i);
						if(o.options.hasOwnProperty(i) && elem){
							if(elem.type == "radio" || elem.type == "checkbox"){
								elem.checked = o.options[i];
							}
							else{
								elem.value = o.options[i];
							}
						}
					}
				}
				if (o.oddEvenColors){
					this.oddEvenColors.apply(this, o.oddEvenColors);
				}
				if (o.caption) {
					if (o.caption.numbered) {
						$id("caption-nb")
							.value = "*";
					}
					$id("caption")
						.value = o.caption.caption || "";
					$id("label")
						.value = o.caption.label || "";
				}
				var table = document.createDocumentFragment(),
				colLength = 0;
				for (var i = 0; i < o.cells.length; i++) {
					var row = o.cells[i],
						elem = document.createElement("tr");
					for (var j = 0; j < row.length; j++) {
						var cellO = row[j];
						cellO.dataset = cellO.dataset || {};
						var cell = document.createElement("td");
						cell = this.applyToCell(cell);
						if (cellO.dataset.twoDiagonals){
							var div = cell.querySelector(".outer")
							div.innerHTML = "<div contenteditable>" + cellO.html[0] + "</div><div contenteditable>"
									+ cellO.html[1] + "</div><div contenteditable>" + cellO.html[2] + "</div>";
						}
						else if (cellO.dataset.diagonal) {
							cell.querySelector(".outer")
								.innerHTML += "<div contenteditable>" + cellO.html[1] +
								"</div>";
							this.setHTML(cell, cellO.html[0]);
						} else {
							this.setHTML(cell, cellO.html || "");
						}
						for (var k in cellO.dataset) {
							if (cellO.dataset.hasOwnProperty(k)) {
								cell.dataset[k] = cellO.dataset[k];
							}
						}
						if ("rowSpan" in cellO && cellO.rowSpan > 1) {
							cell.rowSpan = cellO.rowSpan;
						}
						if (cellO.colSpan && cellO.colSpan > 1) {
							cell.colSpan = cellO.colSpan;
						}
						if (cellO.css) {
							cell.style.cssText = cellO.css;
						}
						elem.appendChild(cell);
					}
					table.appendChild(elem);
				}
				while (this.element.firstChild) {
					this.element.removeChild(this.element.firstChild);
				}
				this.element.appendChild(table);
				this.Table.update();
			}
			this.exportToJSON = function(useHTML) {
				var o = {options:{}},
					table = this.element;
				o.autoBooktabs = table.hasAttribute("data-booktabs");
				o.caption = this.caption();
				o.cells = [];
				var options = document.querySelectorAll("*[id^='opt-']");
				var oddeven = this.oddEvenColors();
				if(oddeven){
					o.oddEvenColors = oddeven;
				}
				for( var i = 0,option; i < options.length;i++){
					option = options[i];
					o.options[option.id.substring(option.id.indexOf("-")+1)] = (option.type == "radio" || option.type == "checkbox") ? option.checked : option.value;
				}
				for (var i = 1; i < table.rows.length; i++) {
					var cells = table.rows[i].cells;
					o.cells.push([]);
					for (var j = 0; j < cells.length; j++) {
						var cell = cells[j],
							cellO = {dataset:{}},
							hasDataset = false;
						for(var prop in cell.dataset){
							if(cell.dataset.hasOwnProperty(prop)){
								cellO.dataset[prop] = cell.dataset[prop];
								if(prop!="selected"){
									hasDataset = true;
								}
							}
						}
						if (cell.dataset.twoDiagonals){
							cellO.html = [this.getHTML(cell), this.getHTML(cell, 1), this.getHTML(cell, 2)].forEach(function(html){
								return html.replace(/<\s*wbr[^>]*>/i, "<br>");
							});
						}
						else if (cell.dataset.diagonal) {
							cellO.html = [this.getHTML(cell), this.getHTML(cell, 1)].forEach(function(html){
								return html.replace(/<\s*wbr[^>]*>/i, "<br>");
							});
						} else {
							cellO.html = this.getHTML(cell).replace(/<\s*wbr[^>]*>/i, "<br>");
							if(!cellO.html){delete cellO.html}
						}
						if (cellO.dataset.selected) {
							delete cellO.dataset.selected;
						}
						if(!hasDataset){
							delete cellO.dataset;
						}
						cellO.css = cell.style.cssText;
						if(!cellO.css){delete cellO.css}
							if(cell.rowSpan>1){
								cellO.rowSpan = cell.rowSpan;
							}
							if(cell.colSpan>1){
								cellO.colSpan = cell.colSpan;
							}
						o.cells[o.cells.length - 1].push(cellO);
					}
				}
				o.version = this.version;
				return o;
			}
			this.importCSV = function(text){
				function createObject(str){
					var o = {}, div = document.createElement("div");
					div.innerText = div.textContent = str;
					o.html = div.innerHTML.replace(/\n/g, "<br>");
					return o;
				}

				text = text.replace(/^[\n\r]+/, "").replace(/[\n\r]+$/, "") + "\n";
				var table = [],
				row = [],
				indbl = false,
				start = true,
				content = "";
				for(var i=0, c;i<text.length;i++){
					c = text.charAt(i);
					if(start){
						start = false;
						if(c == '"'){
							indbl = true;
						}
						else{
							content += c;
						}
					}
					else if(c == '"' && indbl){
						if(text.charAt(i+1) == '"'){
							i++;
							content += c;
						}
						else{
							indbl = false;
						}
					}
					else if(c == "," && !indbl){
						row.push(createObject(content));
						indbl = false;
						content = "";
						start = true
					}
					else if(c == "\n" && !indbl){
						row.push(createObject(content));
						indbl = false;
						content = "";
						start = true
						table.push(row);
						row = [];
					}
					else{
						content += c;
					}
				}
				return {
					autoBooktabs : false,
					caption: {
       						caption: "",
        					numbered: false,
       			 			label: ""
    					},
					cells: table
				}
			};
			this.insertEquation = function() {
				if (window.getSelection) {
					var sel = window.getSelection();
					if (sel.rangeCount) {
						var range = sel.getRangeAt(0);
						if (range) {
							var eq = document.createElement("span");
							eq.className = "latex-equation";
							eq.appendChild(range.extractContents())
							eq.insertBefore(document.createTextNode("\u200B"),eq.firstChild)
							range.insertNode(eq);
							range.selectNodeContents(eq);
						}
					}
				}
			}
			this.insertFootnote = function(){
				document.execCommand("insertHTML",false, "<span class='tb-footnote'>&#x200b;</span>");
			}
			this.saveToJSON = function() {
				var o = this.exportToJSON(true);
				document.getElementById('c')
					.value = JSON.stringify(o, null, "    ");
			}
			this.autoBooktabs = function() {
				this.statesManager.registerState();
				var table = this.element,
				btn = $id('button-booktabs');
				if (table.hasAttribute("data-booktabs")) {
					table.removeAttribute("data-booktabs");
					btn.className = "";
					btn.setAttribute("aria-pressed", "false");
				} else {
					table.setAttribute("data-booktabs", "data-booktabs");
					btn.className = "active";
					btn.setAttribute("aria-pressed", "true");
				}
			}
			this._clickCellManager = function(event) {
				if (table.selectionAllowed) {
					var mobileKey = table.mobileKey(),
					    ctrlKey = event.ctrlKey || (mobileKey === 1),
					    shiftKey = event.shiftKey || (mobileKey === 2);
					table.selectCell(this, ctrlKey, shiftKey);
				}
			}
			this.isBorderSet = function(element, where){
				where = where.toLowerCase();
				var where2 = where.charAt(0).toUpperCase() + where.substring(1);
				return element.getAttribute("data-border-" + where.toLowerCase()) == document.getElementById('border').value
					&& areSameColors(element.style["border"+where2+"Color"], document.getElementById('border-color').getAttribute("data-value"));
			}
			this.setBorder = function(element, where, affect, index, othercells, index2){
				// Okay, this is an ugly fix, but it is way easier to do it
				// this way instead of rewriting all the other functions

				index = index || index2;
				if(this.isDrawingBorder){
					this.statesManager.registerState();
					this.isDrawingBorder = false;
				}
				where = where.toLowerCase();
				var where2 = where.charAt(0).toUpperCase() + where.substring(1),
				border = this.borderStyle(null, index, where);
				var isTrim = /^trim/.test(border.name),
				    styleAttribute = isTrim ? "border" + where2+ "Color" : "border" + where2;

				if(othercells && othercells.length){
					for(var i=0;i<othercells.length;i++){
						this.setBorder(othercells[i], {
							top:"bottom",
							bottom:"top",
							left:"right",
							right:"left"
						}[where], isTrim ? false : affect, index);
					}
				}
				if(affect){
					element.setAttribute("data-border-" + where, border.name);
					if(element.style.removeProperty){
						element.style.removeProperty("border-" + where);
						element.style.removeProperty("border-" + where + "-color");
					}
					else{
						element.style["border" + where2] = "";
						element.style["border" + where2 + "Color"] = "";
					}
					element.style[styleAttribute] = border.css;
				}
				else if(element.style.removeProperty){
					element.removeAttribute("data-border-" + where);
					element.style.removeProperty("border-" + where);
					element.style.removeProperty("border-" + where + "-color");
				}
				else{
					element.removeAttribute("data-border-" + where);
					element.style["border" + where2] = "";
					element.style["border" + where2 + "Color"] = "";
				}
			}
			this.borderStyle = function(style, index, where){
				style = (style || document.getElementById('border').value).toLowerCase();
				if((where == "left" || where == "right") && style == "trimfull"){
					style = "normal";
				}
				var color = this._id("border-color").getAttribute("data-value");
				var css = "1px solid " + color;
				if(style == "toprule" || style == "bottomrule"){
					css = "2px solid " + color;
				}
				else if(style == "double"){
					css = "2px double " + color;
				}
				else if(style == "hdashline"){
					css = "1px dashed " + color;
				}
				else if(style == "dottedline"){
					css = "1px dotted " + color;
				}
				else if(style == "trimfull"){
					css = color;
				}
				if(style == "trimfull"){
					if(index === 0){
						style = "trimleft";
					}
					else if(index == 1){
						style = "trimright"; 
					}
					else if(index == -1){
						style = "trimboth";
					}
				}
				return {
					name : style,
					css : css,
					color : color
				}
			}
			this.textColorPick = function(){
				var _this = this;
				ColorPicker.get(this._id("text-color-input").value, function(hex){
					if(hex){
						_this._id("text-color-input").value = hex;
						_this.textColor(hex);
					}
				});
			}
			this.backgroundPick = function(){
				var _this = this;
				ColorPicker.get(this._id("info-background-color").value, function(hex){
					if(hex){
						_this._id("info-background-color").value = hex;
						_this.backgroundColor(hex);
					}
				});
			}
			this.borderPick = function(){
				var _this = this,
				borderColor = this._id("border-color")
				ColorPicker.get(borderColor.style.borderBottomColor || "#000000", function(color){
					borderColor.style.borderBottomColor = color;
					borderColor.setAttribute("data-value", color);
				});
			}
			this.setAllBorders = function() {
				this.statesManager.registerState();
				var borderType = document.getElementById('border')
					.value,
					color = this._id("border-color").getAttribute("data-value"),
					border = "1px solid " + color;
				if (borderType == "toprule" || borderType == "bottomrule") {
					border = "2px solid " + color;
				} else if (borderType == "double") {
					border = "2px double " + color;
				} else if (borderType == "hdashline") {
					border = "1px dashed " + color;
				} else if (borderType == "dottedline") {
					border = "1px dotted " + color;
				}
				this.forEachSelectedCell(function(cell) {
					var style = cell.style;
					style.borderTop = style.borderLeft = style.borderRight = style.borderBottom = border;
					cell.setAttribute("data-border-top", borderType);
					cell.setAttribute("data-border-left", borderType);
					cell.setAttribute("data-border-right", borderType);
					cell.setAttribute("data-border-bottom", borderType);
				});
			}
			this.removeBorders = function() {
				this.statesManager.registerState();
				var matrix = this.Table.matrix();
				this.forEachSelectedCell(function(cell) {
					this._removeBorders(cell, matrix);
				});
			}
			this._removeBorders = function(cell, matrix){
					var position = this.Table.position(cell, matrix);
					cell.removeAttribute("data-border-top");
					cell.removeAttribute("data-border-left");
					cell.removeAttribute("data-border-right");
					cell.removeAttribute("data-border-bottom");
					var style = cell.style;
					style.borderTop = style.borderLeft = style.borderRight = style.borderBottom = "";
					//Top border
					if(position.y>0){
						for(var i=0;i<cell.colSpan;i++){
							var cell2 = matrix[position.y-1][position.x+i];
							cell2 = (cell2.refCell||cell2).cell;
							cell2.style.borderBottom = "";
							cell2.removeAttribute("data-border-bottom");
						}
					}
					//Bottom border
					if(matrix[position.y+cell.rowSpan]){
						for(var i=0;i<cell.colSpan;i++){
							var cell2 = matrix[position.y+cell.rowSpan][position.x+i];
							cell2 = (cell2.refCell||cell2).cell;
							cell2.style.borderTop = "";
							cell2.removeAttribute("data-border-top");
						}
					}
					//Left border
					if(position.x>0){
						for(var i=0;i<cell.rowSpan;i++){
							var cell2 = matrix[position.y+i][position.x-1];
							cell2 = (cell2.refCell||cell2).cell;
							cell2.style.borderRight = "";
							cell2.removeAttribute("data-border-right");
						}
					}
					//Right border
					if(matrix[position.y][position.x+1]){
						for(var i=0;i<cell.rowSpan;i++){
							var cell2 = matrix[position.y+i][position.x+cell.colSpan];
							cell2 = (cell2.refCell||cell2).cell;
							cell2.style.borderLeft = "";
							cell2.removeAttribute("data-border-left");
						}
					}
			}
			this._absolutePosition = function(el) {
				// Stolen from here : https://stackoverflow.com/a/32623832/8022172
				var found,
					left = 0,
					top = 0,
					width = 0,
					height = 0,
					offsetBase = this._absolutePosition.offsetBase;
				if (!offsetBase && document.body) {
					offsetBase = this._absolutePosition.offsetBase = document.createElement('div');
					offsetBase.style.cssText = 'position:absolute;left:0;top:0';
					document.body.appendChild(offsetBase);
				}
				if (el && el.ownerDocument === document && 'getBoundingClientRect' in el && offsetBase) {
					var boundingRect = el.getBoundingClientRect();
					var baseRect = offsetBase.getBoundingClientRect();
					found = true;
					left = boundingRect.left - baseRect.left;
					top = boundingRect.top - baseRect.top;
					width = boundingRect.right - boundingRect.left;
					height = boundingRect.bottom - boundingRect.top;
				}
				return {
					found: found,
					left: left,
					top: top,
					width: width,
					height: height,
					right: left + width,
					bottom: top + height
				};
			}
			this.defineBorder = function(element, where){	
				var borderType = document.getElementById('border').value,
					border = "1px solid black";
				if (borderType == "toprule" || borderType == "bottomrule") {
					border = "2px solid black";
				} else if (borderType == "double") {
					border = "2px double black";
				} else if (borderType == "hdashline") {
					border = "1px dashed black";
				} else if (borderType == "dottedline") {
					border = "1px dotted black";
				}
				where = where.toLowerCase();
				where = where.charAt(0).toUpperCase() + where.substring(1);
				this.setBorder(element, where, borderType, border, true)
			}
			this.editBorder = function(element, x, y,objcells) {
				var pos = this._absolutePosition(element),
					borderType = document.getElementById('border')
					.value,
					border = "1px solid black";
				if (borderType == "toprule" || borderType == "bottomrule") {
					border = "2px solid black";
				} else if (borderType == "double") {
					border = "2px double black";
				} else if (borderType == "hdashline") {
					border = "1px dashed black";
				} else if (borderType == "dottedline") {
					border = "1px dotted black";
				}
				if (y - pos.top < 4) {
					var isSet = this.isBorderSet(element, "top");
					if(!isSet && objcells.up.length){
						isSet = this.isBorderSet(objcells.up[0], "bottom")
					}
					this.setBorder(element, "top", !isSet, -1, objcells.up);
				} else if (pos.bottom - y < 4) {
					var isSet = this.isBorderSet(element, "bottom");
					if(!isSet && objcells.down.length){
						isSet = this.isBorderSet(objcells.down[0], "top")
					}
					this.setBorder(element, "bottom", !isSet, -1,objcells.down);
				} else if (x - pos.left < 4) {
					var isSet = this.isBorderSet(element, "left");
					if(!isSet && objcells.left.length){
						isSet = this.isBorderSet(objcells.left[0], "right")
					}
					this.setBorder(element, "left", !isSet, null, objcells.left);
				} else if (pos.right - x < 4) {
					var isSet = this.isBorderSet(element, "right");
					if(!isSet && objcells.right.length){
						isSet = this.isBorderSet(objcells.right[0], "left")
					}
					this.setBorder(element, "right", !isSet,null, objcells.right);
				}
			}
			this.loaded = false;
			this.element = null;
			this.footnoteObserver = function(mutationsList, observer) {
				for(let mutation of mutationsList) {
					if (mutation.type === 'childList') {
						for(var i=0, m = mutation.addedNodes,n;i<m.length;i++){
							n = m[i];
							if(n.className == "tb-footnote"){
								this.addFootnote(n);
							}
						}
						for(var i=0, m = mutation.removedNodes,n;i<m.length;i++){
							n = m[i];
							if(n.className == "tb-footnote"){
								this.removeFootnote(n);
							}
							else if(mutation.target.className == "tb-footnote"){
								mutation.target.parentElement.removeChild(mutation.target);
							}
						}
					}
				}
			}
			this.refreshFootnotes = function(){
				var els = document.querySelectorAll(".right-footnote-content");
				for(var i=0,el;i<els.length;i++){
					var id = els[i].id;
					el = document.querySelector(".tb-footnote[data-footnote-id=\""+id+"\"]");
					if(el){
						el.title = els[i].querySelector("textarea").value;
					}
				}
				this.loadAllFootnotes();
			}
			this.addFootnote = function(el){
				var position = null,
				footnotes = this.element.querySelectorAll(".tb-footnote");
				for(var i=0;i<footnotes.length;i++){
					if(footnotes[i] === el){break;}
					var id = footnotes[i].getAttribute("data-footnote-id");
					if(id){position = id}
				}
				var oldid = el.getAttribute("data-footnote-id");
				var div = document.createElement("div"),
				nb = document.createElement("div"),
				txt = document.createElement("textarea");
				div.className = "input-group right-footnote-content";
				nb.className = "input-group-addon";
				txt.className = "form-control";
				if(oldid){
					if(document.getElementById(oldid)){
						txt.value = document.getElementById(oldid).querySelector("textarea").value;
					}
				}
				div.appendChild(nb);
				div.appendChild(txt);
				for(;;){
					var rand = "footnote" + Math.floor(Math.random()*100000);
					if(!document.getElementById(rand)){break;}
				}
				div.id = rand;
				el.setAttribute("data-footnote-id", rand);
				var container = document.getElementById("footnotes-txt");
				if(!position){
					container.insertBefore(div,container.firstChild)
				}
				else{
					var container = document.getElementById(position);
					container.parentNode.insertBefore(div, container.nextSibling);
				}
			}
			this.removeFootnote = function(el){
				var id = el.getAttribute("data-footnote-id"),
				div = document.getElementById(id || "null");
				if(id && document.getElementById(id)){
					div.parentNode.removeChild(div);
				}
			}
			this.indentList = function(outdent){
				var selObj = window.getSelection();
    				var selRange = selObj.getRangeAt(0);
				if(selRange){
					var target = selRange.commonAncestorContainer;
					var listN = 0;
					var td = false;
					do{
						if(target.tagName == "TD" || target.tagName == "TH"){
							td = target;break;
						}
						else if(target.tagName == "UL" || target.tagName == "OL"){
							listN++;
						}
					}
					while(target = target.parentElement);
					if(listN > 0){
						if(outdent){
							document.execCommand("outdent",false,false);
							return true;
						}
						else if(listN < 4){
							document.execCommand("indent",false,false);
							if(td.innerHTML.indexOf("<blockquote") > -1){
								document.execCommand("undo",false,false);
								return false;
							}
							else{
								return true;
							}
						}
					}
				}
				return false;
			}
			this.loadAllFootnotes = function(){
				document.getElementById("footnotes-txt").innerHTML = "";
				var footnotes = this.element.querySelectorAll(".tb-footnote"),
				frag = document.createDocumentFragment();
				for(var i=0;i<footnotes.length;i++){
					var footnote = footnotes[i];
					var div = document.createElement("div"),
					nb = document.createElement("div"),
					txt = document.createElement("textarea");
					div.className = "input-group right-footnote-content";
					nb.className = "input-group-addon";
					txt.className = "form-control";
					div.appendChild(nb);div.appendChild(txt);
					for(;;){
						var rand = "footnote" + Math.floor(Math.random()*100000);
						if(!document.getElementById(rand)){break;}
					}
					div.id = rand;
					footnote.setAttribute("data-footnote-id", rand);
					txt.value = footnote.title || "";
					frag.appendChild(div);
				}
				document.getElementById("footnotes-txt").appendChild(frag);
			}
			this.load = function(table) {
				this.loaded = true;
				this.element = table;
				this.setTouchEvents(table);
				var _this = this,
				waitingforpaste = false,
				waitingfortab = false,
				improvePaste = false;
				if(window.MutationObserver){
					var observer = new MutationObserver(_this.footnoteObserver.bind(_this));
					observer.observe(table, { childList: true, subtree: true});
				}
				else{
					document.getElementById("panel-footnotes").style.display = "none";
					document.getElementById("group-footnotes").style.display = "none";
				}
				table.addEventListener("click", function(e){
					if(!document.body.hasAttribute("data-border-editor")){
						var target = e.target || e.srcElement;
						target = target.nodeType == 3 ? target.parentElement : target;
						if(target.tagName == "TD" && target.parentElement.rowIndex === 0){
							var matrix = _this.Table.matrix();
							for(var i=0;i<matrix.length;i++){
								var row = matrix[i];
								for(var j=0;j<row.length;j++){
									var cell = row[j];
									cell = (cell.refCell||cell).cell;
									if(j === target.cellIndex){
										cell.setAttribute("data-selected","data-selected");
									}
									else if(!e.ctrlKey && cell.hasAttribute("data-selected")){
										cell.removeAttribute("data-selected");
									}
								}
							}
						}
						else if(target.tagName == "TR"){
							var matrix = _this.Table.matrix();
							for(var i=0;i<matrix.length;i++){
								var row = matrix[i];
								for(var j=0;j<row.length;j++){
									var cell = row[j];
									cell = (cell.refCell||cell).cell;
									if(i === target.rowIndex-1 || target.rowIndex === 0){
										cell.setAttribute("data-selected","data-selected");
									}
									else if(!e.ctrlKey && cell.hasAttribute("data-selected")){
										cell.removeAttribute("data-selected");
									}
								}
							}
						}
					}	
				});
				document.addEventListener("selectionchange", function(e) {
					var selections = window.getSelection();
					if(selections.rangeCount>1){
						for(var i=0;i<selections.rangeCount;i++){
							var range = selections.getRangeAt(i);
							var ancestor = range.commonAncestorContainer;
							if(ancestor.tagName == "TR"){
								if(ancestor.parentElement.id == "table" || 
								   ancestor.parentElement.parentElement.id == "table"){
									var el = ancestor.childNodes[range.startOffset];
									el.setAttribute("data-selected", "data-selected");
									this.lastSelectedCell = el;
								}
							}
						}
					}
				},false);
				table.addEventListener("paste", function(e) {
					if(improvePaste){
						improvePaste = false;
						return true;
					}
					var target = e.target || e.srcElement;
					target = target.nodeType == 3 ? target.parentElement : target;
					do{
						if(target.tagName && target.hasAttribute("contenteditable")){
							break;
						}
					}while(target = target.parentElement);
					if(!target){e.preventDefault();return null;}
					if(e.clipboardData){
						var d = document.createElement("div");
						var plain = e.clipboardData.getData("text/plain");
						// We get the plain version to determine if we have to trim the HTML
						var trimLeft = /^\S/.test(plain),
						trimRight = /\S$/.test(plain);
						var dataHtml = e.clipboardData.getData("text/html");
						if(e.shiftKey){dataHtml = null;}
						if(dataHtml){
							d.innerHTML = dataHtml;
							// A little bit of clean up
							// Should move to another function
							var pastedbody = d.querySelector("body");
							if(pastedbody){
								var d2 = document.createElement("div");
								while(pasted.firstChild){
									d2.appendChild(pastedbody.firstChild);
								}
								d = d2;
							}
							var toremove = null;
							while(toremove = d.querySelector("meta, script, style")){
								toremove.parentNode.removeChild(toremove);
							}
							var pastedtable = d.querySelector("table");
							if(pastedtable){
								var frag = document.createDocumentFragment();
								frag.appendChild(pastedtable);
								var newtext = d.innerText.trim();
								if(!newtext){
									var tableo = new Table(pastedtable);
									var acell = target.parentElement.parentElement;
									var pos = _this.Table.position(acell);
									var amatrix = _this.Table.matrix();
									var afcol = amatrix[0];
									var alrow = amatrix[amatrix.length-1];
									var mtable = tableo.matrix();
									var changed = false;
									for(var i=0;i<pos.x+mtable[0].length-afcol.length;i++){
										var afcell = afcol[afcol.length-1]
										_this.insertColAfter((afcell.refCell||afcell).cell);
										changed = true;
									}
									for(var i=0;i<pos.y+mtable.length-amatrix.length;i++){
										var alcell = alrow[0]
										_this.insertRowUnder((alcell.refCell||alcell).cell);
										changed = true;
									}
									if(changed){
										amatrix = _this.Table.matrix();
									}
									for(var i=0;i<mtable.length;i++){
										var mrow = mtable[i];
										for(var j=0;j<mrow.length;j++){
											var mcell = mrow[j];
											if(!mcell.refCell){
												var fcell = amatrix[pos.y+i][pos.x+j];
												fcell = (fcell.refCell||fcell).cell;
												var fdiv = fcell.querySelector("div[contenteditable]");
												fdiv.innerHTML = _this.getHTML(mcell.cell);
											}
										}
									}
									e.preventDefault();
									return false;
								}
								else{
									d.innerHTML = dataHtml;
								}
							}
						}
						else{
							d.innerText = plain;
						}
						var html = _this.getHTML(d);
						if(trimLeft){html = html.replace(/^\s+/, "")}
						if(trimRight){html = html.replace(/\s+$/, "")}
						e.preventDefault();
						if(document.queryCommandEnabled("insertHTML")){
							document.execCommand("insertHTML",false, html);
							//return false;
						}
						else if(document.queryCommandEnabled("paste")){
							document.execCommand("paste",false, html);
							//return false;
						}
						else if(document.queryCommandEnabled("insertText")){
							document.execCommand("insertText",false, plain);
							//return false;
						}
						else{
							waitingforpaste = target;
						}
					}
					else{
						waitingforpaste = target;
					}
				}, false);
				table.addEventListener("input", function(e) {
					var target = e.target || e.srcElement;
					target = target.nodeType == 3 ? target.parentElement : target;
					if(target && target == waitingforpaste){	
						waitingforpaste = false;
						target.innerHTML = _this.getHTML(target);
					}
					var td = (target.parentElement || {}).parentElement;
					if (_this.selectedCell === (target.parentElement || {})
						.parentElement) {
						_this.updateLaTeXInfoCell();
					}
					if(td.hasAttribute("data-rotated")){
						_this.refreshRotatedCellSize(td)
					}
				}, false);
				table.addEventListener("click", function(e) {
					var target = e.currentTarget;
					waitingfortab = false;
					if (target.tagName == "TD" || target.tagName == "TH") {
						_this._clickCellManager.apply(this, arguments);
					}
				}, false);
				table.addEventListener("focusin", function(e) {
					if(waitingfortab){
						waitingfortab = false;
						var target = e.target;
						do{
							if(target.tagName == "TD" || target.tagName == "TH"){
								break;
							}
						}
						while(target = target.parentElement);
						if(target){
							_this._clickCellManager.apply(target, arguments);
						}
					}
				}, false);
				table.addEventListener("mouseup", function(e){
					// Tooltip helper
					// Upcoming feature
					return;
					e = window.event || e;
					var sel = window.getSelection();
					var range = sel.getRangeAt(0);
					var tooltip = document.getElementById("tooltip-helper");
					if(range && !range.collapsed){
						var coo = range.getBoundingClientRect();
						tooltip.style.display = "block";
						var ht = tooltip.offsetHeight;
						tooltip.style.top = (coo.top + window.scrollY - ht - 10) + "px";
						tooltip.style.left = (coo.right + window.scrollX + 10) + "px";
					}
				});
				table.addEventListener("keydown", function(e){
					e = window.event || e;
					if(e.keyCode == 9 && !e.ctrlKey){
						var resp = _this.indentList(e.shiftKey);
						if(resp){
							e.preventDefault();
						}
						else{
							waitingfortab = true;
						}
					}
				}, false);
				this._id("worksheet-drop").addEventListener("drop", function(e){
					e.stopPropagation();
					e.preventDefault();
					this.classList.remove("dragover");
					var file;
					if(e.dataTransfer.items){
						for(var i=0;i<e.dataTransfer.items.length;i++){
							if(e.dataTransfer.items[i].kind == "file"){
								file = e.dataTransfer.items[i].getAsFile();
								break;
							}
						}
					}
					else{
						file = e.dataTransfer.files[0];
					}
					if(file){
						_this.importExcel(file);
					}
					if(e.dataTransfer.items){
						e.dataTransfer.items.clear();
					}
					else{
						e.dataTransfer.clearData();
					}
				}, false);
				this._id("worksheet-drop").addEventListener("dragenter", function(e){
					e.stopPropagation();
					e.preventDefault();
					this.classList.add("dragover");
				}, false);
				this._id("worksheet-drop").addEventListener("dragover", function(e){
					e.stopPropagation();
					e.preventDefault();
					this.classList.add("dragover");
				}, false);
				this._id("worksheet-drop").addEventListener("dragleave", function(e){
					e.stopPropagation();
					e.preventDefault();
					this.classList.remove("dragover");
				}, false);


				document.execCommand("styleWithCSS", false, false);
				document.execCommand("insertBrOnReturn", false, false);
				this.Table = new Table(table);
				this.Table.shadowFirstRow = true;
				if(document.querySelector(".toolbar-group-container")){
					// New code
					var toolbarContainer = document.querySelector(".toolbar-group-container");
					var caretFont = toolbarContainer.querySelector(".btn-caret");
					var caretMerge = toolbarContainer.querySelector(".btn-caret-merge");
					toolbarContainer.addEventListener("keydown", function(e){
						if(e.keyCode == 37){ // Left
							var focus = toolbarContainer.querySelector(":focus");
							var btns = toolbarContainer.querySelectorAll(".toolbar-group-visible button, .toolbar-group-visible .btn-caret[aria-expanded='true'] + #font-color-picker td[tabindex]");
							if(!focus){btns[0].focus()}
							else{
								for(var i=0;i<btns.length;i++){
									if(btns[i] == focus){
										if(btns[i-1]){btns[i-1].focus()}
										break;
									}
								}
							}
						}
						else if(e.keyCode == 39){ // Right
							var focus = toolbarContainer.querySelector(":focus"),
							btns = toolbarContainer.querySelectorAll(".toolbar-group-visible button, .toolbar-group-visible .btn-caret[aria-expanded='true'] + #font-color-picker td[tabindex]");
							if(!focus){btns[0].focus()}
							else{
								for(var i=0;i<btns.length;i++){
									if(btns[i] == focus){
										if(btns[i+1]){btns[i+1].focus()}
										break;
									}
								}
							}
						}
						else if(e.keyCode == 36){ // Home
							toolbarContainer.querySelector(".toolbar-group-visible button").focus();
						}
						else if(e.keyCode == 35){ // End
							var allButtons = toolbarContainer.querySelectorAll(".toolbar-group-visible button");
							allButtons[allButtons.length-1].focus();
						}
					},false)
					var that = this;
					caretFont.addEventListener("click", function(e){
						that.toggleFontColorPicker(this);
						e.stopPropagation();
					}, false);
					caretMerge.addEventListener("click", function(e){
						that.toggleMergePicker(this);
						e.stopPropagation();
					}, false);
					document.addEventListener("click", function(e){
						if(caretFont.getAttribute("aria-expanded") == "true"){
							that.toggleFontColorPicker(caretFont);
						}
						else if(caretMerge.getAttribute("aria-expanded") == "true"){
							that.toggleMergePicker(caretMerge);
						}
					}, false);
					document.addEventListener("keydown", function(e){
						if(e.keyCode == 27){
							if(caretFont.getAttribute("aria-expanded") == "true"){
								that.toggleFontColorPicker(caretFont);
							}
							else if(caretMerge.getAttribute("aria-expanded") == "true"){
								that.toggleMergePicker(caretMerge);
							}
						}
					},false);
					var tdFont = toolbarContainer.querySelectorAll("td[data-color]");
					for(var i=0;i<tdFont.length;i++){
						var color = tdFont[i].getAttribute("data-color");
						tdFont[i].style.backgroundColor = color;
						tdFont[i].title = color[0].toUpperCase() + color.substring(1);
					}
					toolbarContainer.querySelector("table").addEventListener("mousedown", function(e){e.preventDefault()}, false);
					document.getElementById("font-color-picker").addEventListener("click", function(e){
						if((e.target || e.originalTarget || e.srcElement).tagName == "TD"){
							e.preventDefault();
							var color = (e.target || e.originalTarget || e.srcElement).getAttribute("data-color");
							if(color){
								that.toggleExecCommand('foreColor', color);
								that.textColor(color);
							}
							else{
								var text = (e.target || e.originalTarget || e.srcElement).innerText;
								if(text.indexOf("Auto") >= 0){	
									that.textColor("#000000");
									document.getElementById("text-color-button").setAttribute("data-color", "none");
								}
								else if(text.indexOf("More") >= 0){
									color = document.getElementById("text-color-button").getAttribute("data-color");
									color = (color || "#000000");
									ColorPicker.get(color == "none" ? "#000000" : color, that.textColor.bind(that))
								}
							}
						}
					}, false);
					document.getElementById("format-drop").addEventListener("click", function(e){
						var li = e.target || e.originalTarget || e.srcElement;
						if(li.tagName == "A"){li = li.parentElement;}
						if(li.tagName == "LI" && li.hasAttribute("data-value")){
							that.selectFormat(li.getAttribute("data-value"));
						}
						e.preventDefault();
					}, false);
					$(document).on("hidden.bs.collapse", "#right_footnote", function(e){
						alert("Closed");
					},false);
				}
			}
			this.setTextColor = function(color){
				color = color || "#000000";
				if(color == "none"){
					this.toggleExecCommand("foreColor", "black");
				}
				else{
					this.toggleExecCommand('foreColor', color)
				}
			}
			this.toggleMergePicker = function(el){
				var mergePicker = document.getElementById("merge-picker");
				if(el.getAttribute("aria-expanded") == "false"){
					el.setAttribute("aria-expanded", "true");
					mergePicker.style.display = "block";
					mergePicker.style.left = (el.offsetLeft - document.querySelector(".toolbar-group-container").scrollLeft) + "px";
					mergePicker.style.top = (el.offsetTop + el.offsetHeight) + "px";
				}
				else{
					el.setAttribute("aria-expanded", "false");
					mergePicker.style.display = "none";
				}
			}
			this.toggleFontColorPicker = function(el){
				var fontPicker = document.getElementById("font-color-picker");
				if(el.getAttribute("aria-expanded") == "false"){

					var colors = ColorPicker.getTableColorScheme(),
					themeTD = document.getElementById("font-color-theme").querySelectorAll("td");
					for(var j=0;j<themeTD.length;j++){
						var color = colors[j], td = themeTD[j];
						if(color){
							color = ColorPicker.toHex(color.map(parseFloat));
							td.title = ntc.name(color)[1];
							td.setAttribute("data-color", color);
							td.tabIndex = "0";
							td.style.backgroundColor = color;
						}
						else{
							td.removeAttribute("title");
							td.removeAttribute("data-color");
							td.removeAttribute("tabindex");
							td.style.backgroundColor = "transparent";
						}
					}


					el.setAttribute("aria-expanded", "true");
					fontPicker.style.display = "block";
					fontPicker.style.left = (el.offsetLeft - document.querySelector(".toolbar-group-container").scrollLeft) + "px";
					fontPicker.style.top = (el.offsetTop + el.offsetHeight) + "px";
				}
				else{
					el.setAttribute("aria-expanded", "false");
					fontPicker.style.display = "none";
				}
			}
			this.refreshRotatedCellSize = function(td){
				// - Get the width and set it as the height
				// - To get the width, we are gonna set a range around its content
				//   and get its size
				var range = document.createRange();
				range.selectNodeContents(td.querySelector("div[contenteditable]"));
				var size = range.getBoundingClientRect();
				range.detach() // We don't need the range anymore
				if(td.getAttribute("data-rotated") == "45"){
					td.style.width = (Math.abs(size.width * Math.sin(-45*Math.PI/180)) + Math.abs(size.height * Math.cos(-45*Math.PI/180)) + 6) + "px";
					td.style.height = (Math.abs(size.width * Math.cos(-45*Math.PI/180)) + Math.abs(size.height * Math.sin(-45*Math.PI/180)) + 6) + "px";
				}
				else{
					td.style.height=(size.width+6)+"px";
					td.style.width=(size.height+6)+"px";
				}
			}
			this.fastGenerateFromHTML = function(html, ignoreMultiline, align){
				return html.replace(/(?:&([^;]+);|[_\\$%^_\{\}#\[`\|\xb6~])/g, function(full, inside){
					if(inside){
						if(inside == "nbsp"){return "~"}
						else if(inside == "&lt;"){ return "\\textless{}"; }
						else if(inside == "&amp;"){ return "\\&"; }
						else if(inside == "&quot;"){ return '"'; }
						else if(inside == "&gt;"){ return "\\textgreater{}"; }
						else { return ""; }
					}
					else if(full == "|"){
						return "\\textbar{}"
					}
					else if(full == "\\"){
						return "\\textbackslash{}"
					}
					else if(full == "`" || full == "^"){
						return "\\" + full + "{}";
					}
					else if(full == "\xb6"){
						return "\\P{}";
					}
					else if(full == "~"){
						return "\\textasciitilde{}";
					}
					else{
						return "\\" + full;
					}
				});
			}
			this.calculateCommand = function(command){
				var content = "\\",
				after = "",
				inHTML = false,
				foundName = false,
				name = "",
				mode = 0,
				braces = 0,
				foundHTMLName = false,
				htmlName = "",
				inEq = false,
				eqName = "",
				verbChar = "";
				var index = 1;
				if(command.length == 1){return false;}
				for(var i=1;i<command.length;i++){
					index = i;
					var c = command[i];
					if(inHTML){
						if(c == ">"){
							inHTML = false;
							after += c;
							htmlName = htmlName.toLowerCase();
							if(htmlName != "b" && htmlName != "i" && htmlName != "u" &&
							   htmlName != "sup" && htmlName != "strike" && htmlName != "font"){
								break;
							}
						}
						else{
							after += c;
							if(!foundHTMLName){
								if(/^[a-zA-Z]$/.test(c)){
									htmlName += c;
								}
								else if(c != "/" && htmlName){
									foundHTMLName = true;
								}
							}
						}
					}
					else if(inEq){
						if(c == ";"){
							var div = document.createElement("div");
							div.innerHTML="&"+eqName+";";
							var sym = div.innerText;
							if(!foundName){
								name += sym;
							}
							content += sym;
						}
						else{eqName+=c;}
					}
					else if(c == "<"){
						inHTML = true;
						foundHTMLName = false;
						htmlName = "";
						after += c;
					}
					else if(c == "&"){
						inEq = true;
					}
					else if(!foundName){
						if(/^[a-zA-Z]$/.test(c)){
							name += c;
							content += c;
						}
						else if(!name){
							name = c;
							content += c;
							foundName = true;
							if(c == "("){
								mode = 4;
							}
						}
						else{
							foundName = true;
							if(name == "verb"){
								verbChar = c;
								content+= c;
								mode = 5;
							}
							else if(c == "{"){
								content += c;
								mode = 1;
								braces = 1;
							}
							else if(c == "["){
								content += c;
								mode = 2;
							}
							else if(c == "*"){
								content+= c;
								c = command[index+1]
								if(c == "{"){
									index++;
									mode =1;
									braces=1;
								}
								else if(c == "["){
									index++;
									mode = 2;
								}
								else{
									break;
								}
							}
							else{
								index--;
								break;
							}
						}
					}
					else if(mode == 1){
						if(c == "{"){
							braces++;
						}
						if(c == "}"){
							braces--;
							if(braces <= 0){mode = 0}
						}
						content += c;
					}
					else if(mode == 2){
						if(c == "]"){mode = 0}
						content += c;
					}
					else if(mode == 4){
						// Mode for mathematical expressions surrounded by \(...\)
						if(c == "\\" && command[i+1] == ")"){
							content += "\\)";
							index++;
							mode = 0;
							break;
						}
						else{
							content += c;
						}
					}
					else if(mode == 5){
						// Mode for \verb+d+
						if(c == verbChar){
							content += c;
							mode = 0;
							break;
						}
						else{
							content += c;
						}
					}
					else if(c == "{"){
						content += c;
						mode = 1;
						braces = 1;
					}
					else if(c == "["){
						content += c;
						mode = 2;
					}
					else{
						index--;
						break;
					}
				}
				var cont = true;
				if(mode == 4 || mode == 5){
					// If the mode is still 4, that means that the mathemical expression
					// is not completed. We send an error, otherwise it won't compile.
					// If the mode is still 5, that means \verb is not completed.
					return false;
				}
				while(cont){
					cont = false;
					after = after.replace(/<\s*([^\s>]+)\s*[^>]*>\s*<\s*\/\s*([^\s>]+)\s*[^>]*>/g, function(full, a, b){
						if(a.toLowerCase() == b.toLowerCase()){
							cont = true;
							return "";
						}
						return full;
					})
				}
				return [content,after, index-1]
			}
			this.generateFromHTML = function(html, ignoreMultiline, align, oldEq) {
				align = align || "l";
				var useLatex = document.getElementById("opt-latex-command").checked;
				if(html.indexOf("<")<0 && html.indexOf("[")<0 && (!useLatex || html.indexOf("\\")<0)){
					return this.fastGenerateFromHTML(html, ignoreMultiline, align);
				}
				var div = document.createElement("div"), hasMultiline;
				div.innerHTML = html.trim();
				var el = div.querySelectorAll("span.latex-equation");
				var eq = oldEq || []
				for (var i = 0; i < el.length; i++) {
					var equation_text = (el[i].innerText || el[i].textContent);
					if(/\S/.test(equation_text)){
						var kbd = document.createElement("kbd");
						eq.push("$" + equation_text + "$");
						el[i].parentNode.replaceChild(kbd, el[i]);
					}
					else{
						el[i].parentNode.removeChild(el[i]);
					}
				}
				var ul = div.querySelectorAll("ul");
				var ULs = [],
				maxLevel = 1;
				for (var i = 0; i < ul.length; i++) {
					var uli = ul[i];
					if(!uli.parentElement || uli.parentElement.tagName == "LI" || uli.parentElement.tagName == "UL"){continue;}
					var ins = document.createElement("ins"),
					    li = ul[i].querySelectorAll("li"),
					    lis = [];
					for(var j=0;j<li.length;j++){
						var c = li[j],level=0;
						levelLoop:while(c = c.parentElement){
							if(c.tagName == "UL" || c.tagName == "OL"){level++}
							else if(c.tagName != "LI"){
								break levelLoop;
							}
						}
						if(level>4){level = 4;}
						var liHTML = li[j].innerHTML, continueWhile = true;
						// Let's remove weird <br> tags at the end of <li>
						// TODO : Move this to the function that normalize HTML (getHTML)
						while(continueWhile){
							if(/<\s*w?br\s*\/?\s*>$/i.test(liHTML)){
								liHTML = liHTML.replace(/<\s*w?br\s*\/?\s*>$/i,"");
							}
							else{
								continueWhile = false;
							}
						}
						if(level>maxLevel){maxLevel = level;}
						lis.push({html:this.generateFromHTML(liHTML, false, align, eq),level:level});
					}
					var licode = "";
					if(maxLevel == 1){
						for(var j=0;j<lis.length;j++){
							if(j>0){licode += "\\\\"}
							licode += lis[j].html;
						}
						if(align.charAt(0) == "p"){
							ULs.push("\\begin{tabular}{@{}>{\\labelitemi\\hspace{\\dimexpr\\labelsep+0.5\\tabcolsep}}"+align+"@{}}"
								+licode+"\\end{tabular}");
							this.packages["array"] = true;
						}
						else{
							ULs.push("\\begin{tabular}{@{\\labelitemi\\hspace{\\dimexpr\\labelsep+0.5\\tabcolsep}}"+align+"@{}}"
								+licode+"\\end{tabular}");
						}
					}
					else{
						for(var j=0,li;j<lis.length;j++){
							li = lis[j]
							if(j>0){licode += "\\\\"}
							if(li.level > 1){
								licode+="\\hspace{"+(li.level-1)/2+"\\leftmargin}"
							}
							licode += "{\\labelitem"+["i","ii","iii","iv"][li.level-1]+"}";
							licode += "\\hspace{\\dimexpr\\labelsep+0.5\\tabcolsep}"+li.html;
						}
						ULs.push("\\begin{tabular}{@{}"+align+"@{}}"
							+licode+"\\end{tabular}");
					}
					while(uli.firstChild){
						uli.removeChild(uli.firstChild);
					}
				}
				html = div.innerHTML;
				var str = "", kbdcount = 0, ulcount = 0, lastcrcr = -1,
				useColor = !this.blacklistPackages["color"],
				useU = !this.blacklistPackages["ulem"];
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
						else if(tagname == "span"){
							var div = document.createElement("div");
							div.innerHTML = inside+"</span>";
							div=div.firstChild;
							if(div.className == "tb-footnote"){
								this.packages["tablefootnote"] = true;
								str += "\\tablefootnote{"+(div.title||"")+"}";
							}
						}
						else if(tagname == "ul"){
							if(str.length > 0){
								str += "\\\\"
								hasMultiline = true;
							}
							str += ULs[ulcount] + "\\\\";
							lastcrcr = str.length;
							ulcount++;
						}
						else if(tagname == "b"){
							str += "\\textbf{";
						}
						else if(tagname == "sup"){
							str += "\\textsuperscript{"
						}
						else if(tagname == "strike" && useU){
							str += "\\sout{"
							this.packages["ulem"] = true;
						}
						else if(tagname == "i"){
							str += "\\textit{";
						}
						else if(tagname == "u" && useU){
							this.packages["ulem"] = true;
							str+="\\uline{";
						}
						else if(tagname == "font" && useColor){
							var color = /color\s*=\s*["']?\s*([^ "'\s]+)/i.exec(inside);
							if(color){
								color = color[1];
								if(color){
									this.packages["color"] = true;
									str += "\\textcolor"+getColor(color)+"{"
								}
								else{
									str += "{";
								}
							}
							else{str += "{"}
						}
						else if(tagname == "/b" || tagname == "/strike" || tagname == "/sup" || tagname == "/i"
						 || (tagname == "/font" && useColor)){
							str += "}";
						}
						else if(tagname == "/u" && useU){
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
							str += "\\textless{}";
						}
						else if(inside == "&amp;"){
							str += "\\&";
						}
						else if(inside == "&quot;"){
							str += '"';
						}
						else if(inside == "&gt;"){
							str += "\\textgreater{}"
						}
						i += inside.length-1;
					}
					else if(c == "["){
						if(/(^\s*$)|(\\(.|[a-zA-Z]+)$)|(\}\s*$)/.test(str)){
							str+="{[}";
						}
						else{
							str += c;
						}
					}
					else if(c == "\\"){
						if(useLatex){
							var command = this.calculateCommand(html.substring(i));
							if(command){
								html = html.substring(0,i) + "" + command[1] + "" + html.substring(i+command[2]+2);
								i--;
								str += command[0];
								this.uniqueLog("The editor detected LaTeX commands in your text and did not escape those. You can change this behaviour in the settings.", "warning");
							}
							else{
								str += "\\textbackslash{}";
							}
						}
						else{
							str += "\\textbackslash{}";
						}
					}
					else if(c == "$" || c == "%" || c == "^" || c == "_" || c == "{" || c == "}" || c == "#"){
						str += "\\" + c;
					}
					else if(c == "`" || c == "^"){
						str += "\\"+c+"{}";					}
					else if(c == "|"){
						str += "\\textbar{}";
					}
					else if(c.charCodeAt(0)==182){
						str += "\\P{}";
					}
					else if(c == "~"){
						str += "\\textasciitilde{}";
					}
					else{
						str+= c;
					}
				}
				if(str.length == lastcrcr){
					str = str.slice(0,-2);
				}
				else if(lastcrcr>0){
					hasMultiline = true;
				}
				str = str.replace(/[ ]{2,}/g, " ")
					.replace(/[\n\r]+/g, "");
				if (hasMultiline && !ignoreMultiline) {
					str = "\\begin{tabular}[c]{@{}"+ align +"@{}}" + str + "\\end{tabular}";
				}
				return str
			};

			this.generateForCell = function(cell, align, shrinkRatio, o) {
				align = align || "l";
				var text = "",
				background = o ? o.cellBackground : false,
				leftCorrection = o ? o.leftCorrection : "",
				rightCorrection = o ? o.rightCorrection : "";
				if (cell.hasAttribute("data-two-diagonals")) {
					this.packages["diagbox"] = true;
					text = "\\diagbox";
						if(cell.hasAttribute("data-diagonal-color") && cell.getAttribute("data-diagonal-color") != "#000000"){
	text += "[linecolor="+this.tabuColor(cell.getAttribute("data-diagonal-color"))+"]"						
						}
					text += "{" + this.generateFromHTML(this.getHTML(cell, 2)) + "}{" + this.generateFromHTML(this.getHTML(cell)) + "}{" +
						this.generateFromHTML(this.getHTML(cell, 1)) + "}"
				} else if (cell.hasAttribute("data-diagonal")) {
					var ce = cell.querySelectorAll("div[contenteditable]");
					if (this.blacklistPackages["diagbox"]) {
						this.packages["slashbox"] = true;
						text = "\\backslashbox{" + this.generateFromHTML(this.getHTML(cell, 1)) + "}{" + this.generateFromHTML(this.getHTML(cell)) + "}";
					} else {
						this.packages["diagbox"] = true;
						text = "\\diagbox";
						if(cell.hasAttribute("data-diagonal-color") && cell.getAttribute("data-diagonal-color") != "#000000"){
	text += "[linecolor="+this.tabuColor(cell.getAttribute("data-diagonal-color"))+"]"						
						}
						text += "{" + this.generateFromHTML(this.getHTML(cell, 1)) + "}{" + this.generateFromHTML(this.getHTML(cell)) + "}";
					}
				} else if (cell.hasAttribute("data-rotated")) {
					if (cell.rowSpan > 1) {
						if (this.blacklistPackages["makecell"]) {
							var inside = this.generateFromHTML(this.getHTML(cell), true, align)
								this.message("You may have to adjust the following value in one of your rotated cell : \"" + (cell.rowSpan) + "\\normalbaselineskip\"", "warning");
								text = "\\begin{sideways}\\begin{tabular*}{" + 
									cell.rowSpan + "\\normalbaselineskip}{"+align+"}"
									+ inside +
									"\\end{tabular*}\\end{sideways}";
								this.packages["rotating"] = true;
						} else {
							text = "\\rotcell{" + this.generateFromHTML(this.getHTML(cell), false, align) + "}"
							this.packages["makecell"] = true;
						}
					} else {
						if (this.blacklistPackages["rotating"]) {
							text = "\\rotcell{" + this.generateFromHTML(this.getHTML(cell), false, align) + "}"
							this.packages["makecell"] = true;
						} else {
							text = "\\begin{sideways}" + this.generateFromHTML(this.getHTML(cell), false, align) + "\\end{sideways}"
							this.packages["rotating"] = true;
						}
					}
				} else if(align == "d"){
					this.packages["siunitx"] = true;
					text = this.generateFromHTML(this.getHTML(cell), false, "S");
					if(text.indexOf("\\\\")>-1){
						text = text.replace(/\\{4,}/g, function(full){
							var after = "", str = "", nb = full.length;
							if(nb % 2 == 1){
								after = "\\";
								nb--;
							}
							for(var i=0;i<nb;i=i+2){
								str += "\\\\";
								if(i+2<nb){
									str+= "{~}";
								}
							}
							return str + after;
						});
					}
					else if((!this.blacklistPackages["multirow"] && cell.rowSpan > 1) || cell.colSpan > 1){
						var text2 = "\\tablenum"
						var sioptions = [];
						if(o.decimalChars){
							sioptions.push("table-format="+o.decimalChars[0]+"."
									  +o.decimalChars[1]);
						}
						if(shrinkRatio || o.shrinkRatio){
							sioptions.push("table-column-width="+(shrinkRatio||o.shrinkRatio)+"\\linewidth");
						}
						if(sioptions.length>0){
							text2+="["+sioptions.join(",")+"]";
						}
						text = text2 + "{" + text + "}";
					}
				}else if (cell.rowSpan > 1 && (!this.blacklistPackages["makecell"] || this.shrink) && !this.blacklistPackages["multirow"]) {
						text = this.generateFromHTML(this.getHTML(cell), false, align);
						text = text.replace(/\\{4,}/g, function(full){
							var after = "", str = "", nb = full.length;
							if(nb % 2 == 1){
								after = "\\";
								nb--;
							}
							for(var i=0;i<nb;i=i+2){
								str += "\\\\";
								if(i+2<nb){
									str+= "~";
								}
							}
							return str + after;
						});
					
				} else if(this.shrink){
					var tb = 0;
					text = this.generateFromHTML(this.getHTML(cell), true, align).replace(/(?:\\{2,}|\\(?:begin|end)\{tabular\})/g, function(full){
						if(full == "\\begin{tabular}"){
							tb++;
							return full;
						}
						else if(full == "\\end{tabular}"){
							tb--;
							return full;
						}
						else if(tb > 0){
							var after = "", str = "", nb = full.length;
							if(nb % 2 == 1){
								after = "\\";
								nb--;
							}
							for(var i=0;i<nb;i=i+2){
								str += "\\\\";
								if(i+2<nb){
									str+= "~";
								}
							}
							return str + after;
						}
						else{
							var after = "", str = "", nb = full.length;
							if(nb % 2 == 1){
								after = "\\";
								nb--;
							}
							for(var i=0;i<nb;i=i+2){
								str += "\\par";
								if(i+2<nb){
									str+= "\\null";
								}
								else{
									str += "{}";
								}
							}
							return str + after;
						}
					});
				}
				else{
					text = this.generateFromHTML(this.getHTML(cell), false, align);
				}

				// We have to use a stupid .replace to fix an issue with multiline and background color
				// TODO : Optimize
				text = leftCorrection + text + rightCorrection;
				if(background){
					// TODO : ANALYZE SOMETHING IS WEIRD HERE
					text = text.replace(/\\begin\{tabular\}[^@\{]*\{@\{(?:\\labelitemi\\hspace\{\\dimexpr\\labelsep\+0\.5\\tabcolsep\}|)\}/g, function(full){
						return full + ">{\\cellcolor"+getColor(background)+"}";
					});
				}


				return text;
			}
			this.packages = {};
			this.getHeaderForCell = function(cell) {
				var align = cell.getAttribute("data-align") || "l",
					leftBorder = cell.getAttribute("data-border-left") || "",
					rightBorder = cell.getAttribute("data-border-right") || "",
					o = {
						"": "",
						"normal": "|",
						"double": "||",
						"toprule": "!{\\vrule width \\heavyrulewidth}",
						"midrule": "!{\\vrule width \\lightrulewidth}",
						"bottomrule": "!{\\vrule width \\heavyrulewidth}",
						"hdashline": ":",
						"dottedline": ";{1pt/1pt}"
					}
				leftBorder = o[leftBorder] || "";
				rightBorder = o[rightBorder] || "";
				return leftBorder + align + rightBorder
			}
			this.getSimiliHeaderForCell = function(cell) {
				var align = cell.getAttribute("data-align") || "l",
					leftBorder = cell.getAttribute("data-border-left") || "",
					rightBorder = cell.getAttribute("data-border-right") || "",
					o = {
						"": "",
						"normal": "|",
						"double": "=",
						"toprule": "^",
						"midrule": "#",
						"bottomrule": "_",
						"hdashline": ":",
						"dottedline": ";"
					}
				leftBorder = o[leftBorder] || "";
				rightBorder = o[rightBorder] || "";
				return leftBorder + align + rightBorder
			}
			this.toggleExecCommand = function(command, value){
				var sel = window.getSelection();
				if(this.element.querySelectorAll("td[data-selected]").length <= 1){
					return document.execCommand(command, false, value || null);
				}
				else{
					var foundFirst = false,
					state = null;
					sel.removeAllRanges();
					this.forEachSelectedCell(function(cell){
						setTimeout(function(){
							var node = cell.querySelector("div[contenteditable]");
							sel.selectAllChildren(node);
							if(!foundFirst){
								foundFirst = true;
								state = !document.queryCommandEnabled(command);
								document.execCommand(command, false, value || null);
							}
							else{
								if(document.queryCommandEnabled(command) == state){
									document.execCommand(command, false, value || null);
								}
								document.execCommand(command, false, value || null);
							}
							sel.removeAllRanges();
						}, 1);
					});
					return state;
				}
			}
			this.calculateDecimalCharacters = function(cell, separator){
				separator = separator || ".";
				var text = cell.innerText || cell.textContent;
				text = text.split(/\n+/g);
				var first = 0,
				second = 0;
				for(var i=0, subtext;i<text.length;i++){
					subtext = text[i].trim();
					if(subtext){
						if(subtext.indexOf(separator)>=0){
							first = Math.max(first,subtext.lastIndexOf(separator));
							second = Math.max(second,subtext.length-1-subtext.lastIndexOf(separator));
						}
						else{
							first = Math.max(first,subtext.length);
						}
					}
				}
				return [first, second]
			}
			this.createCellO = function(o, row){
				var before = null,
				    after = null,
				    cell = o.cell,
				    blockMultirow = this.blacklistPackages["multirow"];
				// find real Before
				for(var i=o.x-1;i>=0;i--){
					var before2 = row[i];
					if(!before2.refCell || before2.refCell != (o.refCell || o)){
						before = before2;break;
					}
				}
				// find real After
				for(var i=o.x+1;i<row.length;i++){
					var after2 = row[i];
					if(!after2.refCell || after2.refCell != (o.refCell || o)){
						after = after2;break;
					}
				}
				o.align = cell.getAttribute("data-align") || "l";
				o.valign = cell.getAttribute("data-vertical-align") || "m";
				if(o.align == "d"){
					o.decimalChars = this.calculateDecimalCharacters(cell);
				}
				// calculate if you need vcell
				if(!this.blacklistPackages["vcell"]){
					if((before && before.vcell) || o.valign != "m"){
						o.vcell = true;
					}
					else{
						for(var i=0;i<row.length;i++){
							if(row[i].cell && (row[i].cell.getAttribute("data-vertical-align") || "m") != "m"){
								o.vcell = true;break;
							}
						}
					}
				}
				else{
					o.vcell = false;
				}
				o.getHeader = this.comparableHeader(before, o, after);
				//o.header = o.getHeader(this.actualMainColor);
				o.span = (cell.rowSpan != 1 || cell.colSpan != 1);
				o.static = false;
				o.isInPreambule = false;
				o.switch = false; // Is it a rowspan cell with a background color ?
				o.rowSpan = cell.rowSpan;
				o.colSpan = cell.colSpan;
				o.fullContent = o.content;
				o.leftCorrection = o.rightCorrection = "";
				o.background = false;
				var _this = this;
				// Determine background
				var background = window.getComputedStyle(cell,null).getPropertyValue("background-color");
				if(!this.blacklistPackages["colortbl"]){
					if(background && !/rgba?\s*\(\d+[,\s]+\d+[,\s]+\d+[,\s]+0\)/.test(background)){
						background = toRGBA(background);
						if(background && background[3] > 0){
							if(!(background[0] == 255 && background[1] == 255 && background[2] == 255)){
								// We have a non-white non-transparent background
								o.background = background;
								if(o.rowSpan > 1){
									o.switch = true;
								}
							}						
						}
					}
				}
				o.cellBackground = o.background;
				o.content = this.generateForCell(cell, o.align, o.shrinkRatio, o);
				o.getVCellContent = function(actualColor, forceMulti){
					if(o.rowSpan != 1){
						return "";
					} else if(o.align == "d"){
						o.content = "";
						if(o.valign != "m"){
							_this.uniqueLog("Vertical alignment of decimal-aligned cells is not supported yet.","warning");
						}
					}else if(o.valign == "t"){
						o.content = "\\printcelltop";
					}
					else if(o.valign == "b"){
						o.content = "\\printcellbottom";
					}
					else{
						o.content = "\\printcellmiddle";
					}
					return o.getFullContent(actualColor, forceMulti);
				}
				o.getFullContent = function(actualColor, forceMulti){
					var header = "", before = "",
					content = o.content;
					actualColor = actualColor || _this.actualColor;
					// Set background
					if(cell.rowSpan != 1 && !blockMultirow){
						_this.packages["multirow"] = true;
						if((_this.shrink || o.shrinkRatio)) {
							var alignment = "";
							if(o.align == "c"){
								if(_this.blacklistPackages["ragged2e"]){
									alignment = "\\centering\\arraybackslash{}";
								}
								else{
									alignment = "\\Centering{}";
									_this.packages["ragged2e"] = true;
								}
							}
							else if(o.align == "r"){
								if(_this.blacklistPackages["ragged2e"]){
									alignment += "\\raggedleft\\arraybackslash{}";
								}
								else{
									alignment += "\\RaggedLeft{}";
									_this.packages["ragged2e"] = true;
								}
							}
							content = alignment + content;
						}
						/* === LEGACY CODE / Makecell for multirow ===
 						/* if(!_this.blacklistPackages["makecell"]) {
						/* 	if(_this.shrink && o.shrinkRatio){
						/* 		content = "\\makecell[{{p{"+o.shrinkRatio+"\\linewidth}}}]{" + content + "}";
						/* 	}
						/* 	else{
						/* 		var align = o.align;
						/* 		align = align == "d" ? "c" : align;
						/* 		content = "\\makecell["+align+"]{" + content + "}";
						/* 	}
						/* 	_this.packages["makecell"] = true;
						/* }
						/* === END OF LEGACY CODE === */
						if(o.background){
							_this.packages["colortbl"] = true;
							content="{\\cellcolor"+getColor(o.background)+"}"+content;
						}
						var ratio = o.switch ? -1 : 1;
						if(_this.shrink){
							content = _this.multirow(ratio*cell.rowSpan, "\\hspace{0pt}"+content, o.shrinkRatio+"\\linewidth");
						}
						else{
							content = _this.multirow(ratio*cell.rowSpan, content);
						}
					}
					else {
						if(o.vcell && o.align != "d" && !_this.blacklistPackages["vcell"]){
							content="\\vcell{"+content.replace(/\{tabular\}\[c\]/g,"{tabular}[b]")+"}";
						}
						if(o.background){
							_this.packages["colortbl"] = true;
							content="{\\cellcolor"+getColor(o.background)+"}"+content;
						}
					}
					if(cell.colSpan != 1 || forceMulti || !o.isInPreambule){
						header = o.getHeader(actualColor);
						if(header.charAt(0) == "@"){
							header = header.replace(/^@\{[^{]+\{[\s,]*([\d.]+)[\s,]*([\d.]+)[\s,]*([\d.]+)\s*}\s*}/, function(full, r, g, b){
								var r2 = r*255,
								g2 = g*255,
								b2 = b*255,
								color = "rgb("+r2+","+g2+","+b2+")";
								_this.actualColor = color;
								before = "\\arrayrulecolor" + getColor(color);
								return "";
							});
						}
						return before + _this.multicolumn(cell.colSpan, header, content);						
					}
					else{
						return content;
					}
				}
			}
			this.applyOddEvenColors = function() {
				this.statesManager.registerState();
				this.oddEvenColors(this._id("oddevencolors-number").value,
					this._id("oddevencolors-even").value || "white",
					this._id("oddevencolors-odd").value || "white"
				);
			}
			this.showOddEvenColorsModal = function(){
				var actual = this.oddEvenColors() || [1,"FFFFFF","FFFFFF"];
				function toHex(color){
					return "#" + ((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2]).toString(16).slice(1);
				}
				this._id("oddevencolors-number").value = actual[0];
				this._id("oddevencolors-even").value = toHex(toRGBA(actual[1])) || "#FFFFFF";
				this._id("oddevencolors-odd").value = toHex(toRGBA(actual[2])) || "#FFFFFF";
				$('#oddevencolors').modal('show');
			}
			this.oddEvenColors = (function(){
				var css = null,
				actual = null;
				function addRule(rule){
					if(!css){
						css = document.createElement("style");
						document.head.appendChild(css);
						css = css.sheet;
					}
					css.insertRule(rule, 0);
				}
				function removeAllRules(){
					actual = null;
					if(css){
						while(css.cssRules.length>0){
							css.deleteRule(0);
						}
					}
				}
				return function(n, even, odd){
					if(arguments.length < 1){
						return actual;
					}
					else if(arguments.length < 2){
						removeAllRules();
					}
					else{
						n = Math.round(Math.max(n||1, 1))+1;
						removeAllRules();
						actual = [n-1, even, odd];
						if(n%2<1){
							addRule("#table tr:nth-child(2n+"+n+") td {background-color:"+odd+";}");
							addRule("#table tr:nth-child(2n+"+(n+1)+") td {background-color:"+even+";}");
						}
						else{
							addRule("#table tr:nth-child(2n+"+n+") td {background-color:"+even+";}");
							addRule("#table tr:nth-child(2n+"+(n+1)+") td {background-color:"+odd+";}");
						}

					}
				}
			})()
			this.multicolumn = function(span, header, content){
				return "\\multicolumn{"+span+"}{" + header + "}{" + content + "}";
			}
			this.multirow = function(span, content, width){
				width = width || "*";
				return "\\multirow{"+span+"}{"+width+"}{"+content+"}";
			}
			this.matrix = function(){
				var table = this.element,
				    result = this.Table.matrix();
				for(var i=0;i<result.length;i++){
					var row = result[i];
					for(var j=0;j<row.length;j++){
						var cell = row[j];
						cell.matrix = (function(){
							return function(){
								return result;
							}
						})(result);
						if(!cell.refCell){
							this.createCellO(cell, row);
						}
						else if(cell.refCell.x == cell.x){
							// ROWSPAN
							var refCell = cell.refCell;
							cell.ignore = false;
							cell.header = refCell.header;
							cell.getHeader = refCell.getHeader;
							cell.background = refCell.cellBackground;
							var _this = this;
							cell.getFullContent = (function(cell, refCell){
								return function(actualColor, forceMulti){
									actualColor = actualColor || _this.actualColor;
									var content = "";
									if(cell.background){
										content = "{\\cellcolor"+getColor(cell.background)+"}";
									}
									if(refCell.colSpan != 1 || forceMulti || !refCell.isInPreambule){
										return _this.multicolumn(refCell.colSpan, cell.getHeader(actualColor), content)
									}
									return content;
								}
							})(cell, refCell);
							cell.getVCellContent = cell.getFullContent;
						}
						else{
							// COLSPAN
							cell.ignore = true;
						}
					}
				}
				return result;
			}
			this.buildBlacklist = function() {
				var o = {},
					check = document.querySelectorAll("input[type=checkbox][id^=blacklist]");
				for (var i = 0; i < check.length; i++) {
					if (!check[i].checked) {
						o[check[i].value] = true;
					}
				}
				this.blacklistPackages = o;
				return o;
			}
			this.removeRow = function() {
				this.statesManager.registerState();
				var cell = this.selectedCell;
				do{				
					if (cell) {
						if(cell.closest && cell.closest("table").rows.length <= 2){
							break;
						}
						this.Table.removeRow(cell.parentElement.rowIndex - 1);
					}
					if(!this.selectedCell || !this.selectedCell.parentElement){
						this.selectedCell = null;
					}
				}
				while(cell = this.element.querySelector("td[data-selected]"))
			}
			this.removeCol = function() {
				this.statesManager.registerState();
				var cell = this.selectedCell;
				do{
					if (cell) {
						if(cell.closest("table").rows[0].childNodes.length <= 1){
							break;
						}
						this.Table.removeCol(this.Table.position(cell).x);
					}
					if(!this.selectedCell || !this.selectedCell.parentElement){
						this.selectedCell = null;
					}
				}
				while(cell = this.element.querySelector("td[data-selected]"))
			}
			this.caption = function() {
				return {
					caption: $id("caption")
						.value,
					numbered: $id("caption-nb")
						.value == "*",
					label: $id("label")
						.value
				}
			}
			this.headerBorder = function(type, color, mainColor, preambule, char, bg){
				char = char || ">";
				if(color && mainColor){
					if(areSameColors(color, mainColor)){
						color = false;
					}
				}
				if(!color){
					if(type == "normal"){return "|"}
					else if(type == "double"){return "||"}
					else if(type == "toprule" || type == "bottomrule"){
						return "!{\\vrule width \\heavyrulewidth}";
					}
					else if(type == "midrule"){
						return "!{\\vrule width \\lightrulewidth}";
					}
					else if(type == "hdashline"){
						if(this.useTabu){
							var border = "|[on 4pt off 4pt";
								if(bg){
									this.packages["color"] = true;
									border+= " "+this.tabuColor(bg)
								}
							return border + "]";
						}
						else{
							this.packages["arydshln"] = true;
							return ":";
						}
					}
					else if(type == "dottedline"){
						if(this.useTabu){
							var border = "|[on 1pt off 1pt";
								if(bg){
									this.packages["color"] = true;
									border+= " "+this.tabuColor(bg)
								}
							return border + "]";
						}
						else{
							this.packages["arydshln"] = true;
							return ";{1pt/1pt}";
						}
					}
				}
				else{
					var before = "",
					colorcomm = "\\color" + getColor(color);
					this.packages["color"] = true;
					if(type == "normal"){
						if(this.useTabu){
							return "|["+this.tabuColor(color)+"]"
						}
						else{
							return "!{"+colorcomm+"\\vrule}"
						}
					}
					else if(type == "double"){
						if(this.useTabu){
							return "|["+this.tabuColor(color)+"]|["+this.tabuColor(color)+"]"
						}
						else{
							return "!{"+colorcomm+"\\vrule}!{"+colorcomm+"\\vrule}"
						}
					}
					else if(type == "toprule" || type == "bottomrule"){
						return "!{"+colorcomm+"\\vrule width \\heavyrulewidth}";
					}
					else if(type == "midrule"){
						return "!{"+colorcomm+"\\vrule width \\lightrulewidth}";
					}
					else if(type == "hdashline"){
						before = char + "{\\arrayrulecolor"+getColor(color)+"}"
						if(this.useTabu){
							var border = "|["+this.tabuColor(color)+" on 4pt off 4pt";
							if(bg){
								border += " "+this.tabuColor(bg)
							}
							return border + "]";
						}
						else{
							this.packages["arydshln"] = true;
							return before + ":";
						}
					}
					else if(type == "dottedline"){
						before = char + "{\\arrayrulecolor"+getColor(color)+"}"
						if(this.useTabu){
							var border = "|["+this.tabuColor(color)+" on 1pt off 1pt";
							if(bg){
								border += " "+this.tabuColor(bg)
							}
							return border + "]";
						}
						else{
							this.packages["arydshln"] = true;
							return before + ";{1pt/1pt}";
						}
					}
				}
			}
			this.toMWE = function(){
				var element = this._id("c"),
				src = element.value,
				format = this._id("format-in").value;
				if(format == "latex" && src.indexOf("\\documentclass")<0){
					var utf8 = !/^[\x00-\x7F]*$/.test(src);
					src = src.replace(/^%\s*\\usepack/mg, "\\usepack");
					src = "\\documentclass{article}\n" + (utf8 ? "\\usepackage[utf8]{inputenc}\n" : "") + src;
					var lastpackage = src.lastIndexOf("\\usepackage"),
					endofheader = src.indexOf("}", lastpackage);
					src = src.substring(0, endofheader+1) + "\n\n\\begin{document}\n"+src.substring(endofheader+1)+"\n\\end{document}";
					src = src.replace(/\n{3,}/g, "\n\n");
				}
				else if((format == "plain" || format == "eplain") && !/\\bye$/.test(src)){
					src += "\n\\bye";
				}
				else if(format == "html" && src.indexOf("<!doctype>")<0){
					src = "<!doctype>\n<html>\n<head>\n\t<title>Minimal Working Example</title>\n</head>\n<body>\n"+src+"\n</body>\n</html>";
				}
				else if(format == "wml" && src.indexOf("<!DOCTYPE wml")<0){
					src = '<?xml version="1.0"?>\n<!DOCTYPE wml PUBLIC "-//WAPFORUM//DTD WML 1.3//EN" "http://www.wapforum.org/DTD/wml13.dtd">\n<wml>\n<card id="page" title="Minimal Working Example">\n<p>\n' + src;
					src += '\n</p>\n</card>\n</wml>';
				}
				element.value = src;
			}
			this.comparableHeader = function(before, middle, after) {
				if (before) {
					before = before.cell || before.refCell.cell;
				}
				if (after) {
					after = after.cell || after.refCell.cell;
				}
				var align = middle.align,
					leftBorder = "",
					rightBorder = "",
					leftColor = "",
					rightColor = "",
					incorrectLeft = false,
					o = middle;
				middle = middle.cell || middle.refCell.cell;
				if (before) {
					leftBorder = "";
				} else {
					leftBorder = middle.getAttribute("data-border-left");
					leftColor = middle.style.borderLeftColor || "black";
				}
				rightBorder = middle.getAttribute("data-border-right");
				rightColor = middle.style.borderRightColor;
				var between = "";
				if (after && !rightBorder) {
					rightBorder = after.getAttribute("data-border-left");
					rightColor = after.style.borderLeftColor;
				}
				o.leftBorder = leftBorder || "";
				o.leftBorderColor = leftColor;
				o.rightBorder = rightBorder || "";
				o.rightBorderColor = rightColor;
				var _this = this;
				return function(color, isPreambule){
					var preambule = "",
					align2 = align,
					shrinkRatio = o.shrinkRatio,
					microfixBorderActivate = _this._id("opt-latex-microfix-alignment").checked;

					if(microfixBorderActivate){
						// Introduce a 'microfix' : some cells may have a strange alignment
						var lengthTable = {
							"midrule" : 1,
							"normal" : 1,
							"dottedline" : 1,
							"hdashline" : 1,
							"toprule" : 3,
							"bottomrule" : 3,
							"double" : 4
						    },
						    biggestLeftBorder = 0,
						    biggestRightBorder = 0,
						    matrix = o.matrix();
						for(var i=0;i<matrix.length;i++){
							if((o.refCell||o).x == 0){
								var microfixLeftCell = matrix[i][0];
								if(microfixLeftCell){
									var microfixLeftBorder = (microfixLeftCell.refCell||microfixLeftCell).leftBorder;
									biggestLeftBorder = Math.max(biggestLeftBorder,
											    lengthTable[microfixLeftBorder] || 0);
								}
							}
							var microfixRightCell = matrix[i][o.x+middle.colSpan-1];
							if(microfixRightCell){
								microfixRightCell = (microfixRightCell.refCell||microfixRightCell);
								if(microfixRightCell.x+microfixRightCell.colSpan-1 == (o.refCell||o).x+middle.colSpan-1){
									var microfixRightBorder = microfixRightCell.rightBorder;
									biggestRightBorder = Math.max(biggestRightBorder, 
											    lengthTable[microfixRightBorder] || 0);
								}
							}
						}
						o.leftCorrection = o.rightCorrection = "";
						if(o.x == 0){
							var leftBorderSize = lengthTable[leftBorder] || 0;
							if(leftBorderSize < biggestLeftBorder){
								o.leftCorrection = _this.microfixBorderCorrection(leftBorderSize, 
										   biggestLeftBorder, o.cellBackground);
							}
						}
						var rightBorderSize = lengthTable[rightBorder] || 0;
						if(rightBorderSize < biggestRightBorder){
							o.rightCorrection = _this.microfixBorderCorrection(rightBorderSize,
									    biggestRightBorder, o.cellBackground);
						}
						
						// End of 'microfix'
					}

					if(leftBorder){
						leftColor = leftColor || "#000000";
						preambule += _this.headerBorder(leftBorder, leftColor, color, isPreambule, "@", o.cellBackground);
						if(preambule.charAt(0) == "@"){
							color = leftColor;
							if(isPreambule){
								_this.actualColor = rightColor;
							}
						}
					}

					var before = "";
					if(align2 == "d"){
						if(!o.globalDecimals){
							// Let's travel the matrix !
							var matrix = o.matrix(),
							first = 0,
							second = 0;
							for(var i=0;i<matrix.length;i++){
								var traveledCell = matrix[i][(o.refCell||o).x];
								traveledCell = traveledCell.refCell||traveledCell;
								if(traveledCell.x == (o.refCell||o).x && traveledCell.cell.colSpan == middle.colSpan){
									if(traveledCell.align == "d"){
										first = Math.max(first, traveledCell.decimalChars[0]);
										second = Math.max(second, traveledCell.decimalChars[1]);
									}
								}
							}
							o.globalDecimals = [first, second];							
						}
						if(o.span){
							if(shrinkRatio){
								align2 = "p{"+shrinkRatio+"\\linewidth}"
							}
							else{
								align2 = "c";
							}
						}
						else{
							align2 = "S";
							if(o.globalDecimals){
								align2 += "[table-format="+o.globalDecimals[0]+"."
									  +o.globalDecimals[1];
								if(shrinkRatio){
									align2+=",table-column-width="+shrinkRatio+"\\linewidth";
								}
								align2 += "]";
							}
							else if(shrinkRatio){
								align2 += "[table-column-width="+shrinkRatio+"\\linewidth]"
							}
						}
					}
					else if(shrinkRatio){
						var blockragged = _this.blacklistPackages["ragged2e"];
						if(align == "c"){
							if(_this.packages["ragged2e"]){
								before += "\\Centering"
							}
							else if(!after){
								before += "\\centering\\arraybackslash"
							}
							else{
								before += "\\centering"
							}
						}
						else if(align == "r"){
							if(blockragged){
								if(after){
									before += "\\raggedleft";
								}
								else{
									before += "\\raggedleft\\arraybackslash"
								}
							}
							else{
								_this.packages["ragged2e"] = true;
								before += "\\RaggedLeft"
							}
						}
						if(o.vcell){
							align2 = "p{"+shrinkRatio+"\\linewidth}";
						}
						else{
							align2 = "m{"+shrinkRatio+"\\linewidth}";
						}
					}
					if(rightBorder){
						rightColor = rightColor || "#000000";
						if(isPreambule && _this.packages["arydshln"] && !areSameColors(color, _this.actualMainColor) && areSameColors(_this.actualMainColor, rightColor)){
							_this.actualColor = color = rightColor;
							before += "\\arrayrulecolor"+getColor(rightColor);
						}
						else if(rightBorder == "dottedline" || rightBorder == "hdashline"){
							if(!areSameColors(rightColor, color)){
								if(_this.useTabu){
									_this.uniqueLog("Some vertical lines could not be colored correctly with 'tabu' package.", "warning");
								}
								else{
									preambule += "\\arrayrulecolor"+getColor(rightColor);
									color = rightColor;
									if(isPreambule){
										_this.actualColor = rightColor;
									}
								}
							}
						}
					}
					if(shrinkRatio){
						before += "\\hspace{0pt}";
					}
					if(before){
						preambule += ">{"+before+"}";
						_this.packages["array"] = true;
					}
					if(o.leftCorrection){
					//	preambule += "@{"+o.leftCorrection+"}"
					}
					preambule += align2;
					if(o.rightCorrection){
					//	preambule += "@{"+o.rightCorrection+"}"
					}
					if(rightBorder){
						preambule += _this.headerBorder(rightBorder, rightColor, color, isPreambule, ">", o.cellBackground)
					}
					return preambule;
				};

			}
			this.isDrawingBorder = false;
			this.microfixBorderCorrection = function(size, obj, color){
				if(size >= obj){
					return "";
				}
				var normal = "\\arrayrulewidth",
				toprule = "\\heavyrulewidth",
				double = "\\doublerulesep";
				function hspace(length){
					if(length.indexOf("+") >= 0 || length.indexOf("-") >= 0){
						length = "\\dimexpr "+length+"\\relax";
					}
					return "\\hspace*{"+length+"}";
				}
				if(size == 0){
					if(obj == 1){
						return hspace(normal);
					}
					else if(obj == 3){
						return hspace(toprule);
					}
					else if(obj == 4){
						return hspace("2"+normal) + hspace(double);
					}
				}
				else if(size == 1){
					if(obj == 3){
						// We need some calculation here
						return hspace(toprule+"-"+normal) // TODO : Not sure if it's good
					}
					else if(obj == 4){
						return hspace(double) + hspace(normal);
					}
				}
				else if(size == 3){
					if(obj == 4){
						// We need an even bigger calculation
						return hspace("2"+normal+"+"+double+"-"+toprule); // TODO : Not sure if it's good
					}
				}
				return "";
			}
			this.getComparableHeader = function(before, middle, after) {
				if (before) {
					before = before.cell || before.refCell.cell;
				}
				if (after) {
					after = after.cell || after.refCell.cell;
				}
				var align = middle.align,
					leftBorder = "",
					rightBorder = "",
					o = {
						"": "",
						"normal": "|",
						"double": "=",
						"toprule": "^",
						"midrule": "#",
						"bottomrule": "_",
						"hdashline": ":",
						"dottedline": ";"
					};
				middle = middle.cell || middle.refCell.cell;
				if (before) {
					leftBorder = "";
				} else {
					leftBorder = middle.getAttribute("data-border-left");
				}
				leftBorder = o[leftBorder || ""] || "";
				rightBorder = middle.getAttribute("data-border-right");
				if (after && !rightBorder) {
					rightBorder = after.getAttribute("data-border-left");
				}
				rightBorder = o[rightBorder || ""] || "";
				return leftBorder + align + rightBorder;
			}
			this.generate = function() {
				var start = +new Date()
				this.buildBlacklist();
				// Normalize the table
				this.Table.normalize();
				var format = $id("format-in")
					.value;
				this.log = "";
				if (format == "latex") {
					$id("c").value = this.generateLaTeX();
				} else {
					this.interpret(format);
				}
				sendGAEvent("Code", "generate2", format)
				this.message("Generated in " + ((+new Date()) - start) + "ms");
				$id("log")
					.innerHTML = "<strong>Log</strong> (" + ((new Date())
						.toLocaleTimeString()) + ")<hr>" + this.log;
				if(!campaignUsed && start>+campaign.start && start<+campaign.end){
					$("#campaignModal").modal("show");
					campaignUsed = true;
				}
				var c = $id("generate-button");
				scrollTo(0, (c.getBoundingClientRect().top - document.body.getBoundingClientRect().top) - $id("nav-latex").offsetHeight - 15);
			}
			this.campaignClicked = function(){
				campaignUsed = true;
				localStorage.setItem("campaign", campaign.year)
			}
			this.headers = function(matrix){
				matrix = matrix || this.matrix();
				var headers = [], colHeaders = [], widthArray = [], _this = this, table = this.element;
				if(this.shrink){
					this.element.style.width = "390pt";
					for(var i=0;i<table.rows.length;i++){
						var cells = table.rows[i].cells;
						for(var j=0;j<cells.length;j++){
							cells[j].style.wordBreak = "break-all";
						}
					}
					var fakeRow = document.createElement("tr");
					for(var i=0;i<matrix[0].length;i++){
						fakeRow.appendChild(document.createElement("td"));
					}
					table.appendChild(fakeRow);
					for(var i=0;i<fakeRow.childNodes.length;i++){
						widthArray.push(Math.round(fakeRow.childNodes[i].scrollWidth/table.scrollWidth*1000)/1000);
					}
					for(var i=0;i<table.rows.length;i++){
						var cells = table.rows[i].cells;
							for(var j=0;j<cells.length;j++){
							cells[j].style.wordBreak = "";
						}
					}
					table.removeChild(fakeRow);
					this.element.style.width = "";
				}

				var colLength = 0;
				for(var i=0;i<matrix.length;i++){
					colLength = Math.max(colLength, matrix[i].length);
				}
				var actualColor = this.actualColor;					
				for(var j=0;j<colLength;j++){
					actualColor = this.actualColor;
					var headernow = {},
					    colorArr = {},
					    cellsArrays = {}
					for(var i=0;i<matrix.length;i++){
						var cell = matrix[i][j];
						if((cell.refCell||cell).cell.colSpan > 1){
							if(!cell.refCell){
								if(this.shrink){
									var total = 0;
									for(var k=0;k<cell.cell.colSpan;k++){
										total += widthArray[cell.x+k];
									}
									cell.shrinkRatio = Math.floor(total*1000)/1000;
								}
							}
							continue;
						}
						if(cell && !cell.ignore){
							if(this.shrink && widthArray[cell.x]){
								cell.shrinkRatio = widthArray[cell.x];
							}
							var align = (cell.refCell||cell).getHeader(actualColor, true);
							colorArr[align] = this.actualColor;
							this.actualColor = actualColor;
							if(!headernow[align]){
								headernow[align] = 0;
							}
							if(!cellsArrays[align]){
								cellsArrays[align] = [];
							}
							headernow[align]++;
							if(cell.vcell){ // If we use `vcell`, the header will be counted twice because
									// a fake row is used
								headernow[align]++;
							}
							cellsArrays[align].push(cell);
						}
					}
					var max = 0, value = "l";
					for (var k in headernow) {
						if (headernow.hasOwnProperty(k)){
							if(headernow[k] > max) {
								max = headernow[k];
								value = k;
							}
							else if(headernow[k] == max && k.length>value.length){
								value = k;
							}
						}
					}
					var cellsArray = cellsArrays[value];
					for(var k=0;k<cellsArray.length;k++){
						cellsArray[k].isInPreambule = true;
					}
					colHeaders.push(value);
					this.actualColor = colorArr[value]
				}
				return colHeaders;
			}
			this.useTabu = false;
			this.togglePin = (function(){
				var isPinned = false;
				return function(){
					var nav = document.getElementsByTagName("nav")[0],
					height = nav.offsetHeight;
					if(isPinned){
						$(".hide-on-full").show();
						document.body.style.paddingTop = "";
						nav.style.position = "sticky";
					}
					else{
						$(".hide-on-full").hide();
						document.body.style.paddingTop = (height+20) + "px";
						nav.style.position = "fixed";
						nav.style.left = 0;
						nav.style.right = "300px";
						nav.style.top = 0;						
					}
					isPinned = !isPinned;
				}
			})();
			this.shouldUseTabu = function(){
				if(this.blacklistPackages["tabu"]){
					return false;
				}
				else if(this._id("opt-latex-tabu").checked){
					return true;
				}
				else if(this.blacklistPackages["arydshln"]){
					return this.hasBorderType("hdashline") || this.hasBorderType("dottedline");
				}
				else if(this._id("opt-latex-hhline").checked){
					return this.hasVBorderType("double") && this.hasHBorderType("double") &&
					(this.hasBorderType("hdashline") || this.hasBorderType("dottedline"));
				}
				else{
					return false
				}
			}
			this.hasHBorderType = function(type){
				return !!this.element.querySelector("td[data-border-bottom='"+type+"'],td[data-border-top='"+type+"']")
			}
			this.hasVBorderType = function(type){
				return !!this.element.querySelector("td[data-border-left='"+type+"'],td[data-border-right='"+type+"']")
			}
			this.hasBorderType = function(type){
				var el = this.element;
				for(var i = 0, rows = el.rows, l = rows.length;i<rows;i++){
					var row = rows[i];
					for(var j=0, cells = row.cells, ll = cells.length;j<l;j++){
						var cell = cells[j];
						if(cell.dataset){
							var data = cell.dataset;
							if(data.borderLeft == type || data.borderBottom == type || data.borderTop == type || data.borderRight == type){
								return true;
							}
						}
						else if(cell.getAttribute("data-border-left") == type ||
							   cell.getAttribute("data-border-bottom") == type ||
							   cell.getAttribute("data-border-top") == type ||
							   cell.getAttribute("data-border-right") == type){
							return true;	
						}
					}
				}
				return false;
				//return !!this.element.querySelector("td[data-border-left='"+type+"'],td[data-border-bottom='"+type+"'],td[data-border-top='"+type+"'],td[data-border-right='"+type+"']")
			}
			this.shrink = false;
			this.useBooktab = function(){
				return this.element.hasAttribute("data-booktabs") ||
				this.hasHBorderType("toprule") || this.hasHBorderType("midrule") ||
				this.hasHBorderType("bottomrule");
			}
			this.useBackgroundColor = function(matrix){
				if(matrix){
					for(var i=0;i<matrix.length;i++){
						var row = matrix[i];
						for(var j=0;j<row.length;j++){
							if(row[j].background){
								return true;
							}
						}
					}
				}
				return false;
			}
			this.tabuColor = function(color){
				if(typeof color == "string"){
					color = toRGBA(color);
				}
				var hex = "#" + ((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2]).toString(16).slice(1);
				color = [color[0],color[1],color[2]].map(function(n){
					return Math.floor((n/255)*1000)/1000
				});
				var sep = color.join(",");
				if(defaultColors[sep]){
					return defaultColors[sep];
				}
				else if(this.tabuColors[sep]){
					return this.tabuColors[sep].name
				}
				else{
					var prename = ntc.name(hex), name;
					if(!prename){return "black"}
					prename = prename[1];
					if(!prename){return "black"}
					prename = prename.replace(/[^a-zA-Z]/g, "");
					for(var i=0;true;i++){ // infinite loop
						name = prename
						if(i>0){
							name += i;
						}
						if(!this.tabuColorsDic[name]){
							break;
						}
					}
					this.tabuColorsDic[name] = sep;
					this.tabuColors[sep] = {
						name : name,
						rgb: color,
						hex : hex
					}
					this.useCustomColors = true;
					this.packages["color"] = true;
					return name;
				}
			}
			this.tabuColors = {
			}
			this.useCustomColors = false;
			this.tabuColorsDic = {};
			this.generateLaTeX = function(opt) {
				this.tabuColors = {};
				this.tabuColorsDic = {};
				this.packages = {};
				this.useCustomColors = false;
				this.actualMainColor = this.mainColor();
				this.actualColor = this.actualMainColor;
				this.useTabu = this.shouldUseTabu(); // Must we use "tabu" package ?
				if(this.useTabu){
					// we avoid \arrayrulecolor
					this.actualMainColor = this.actualColor = "#000000";
					this.message("Usage of <tt>tabu</tt> is <a href=\"https://github.com/tabu-issues-for-future-maintainer/tabu\">not recommanded</a> by the LaTeX3 Project Team.","warning");
				}
				if(!this.useTabu && (this.hasBorderType("hdashline") || this.hasBorderType("dottedline"))){
					this.packages["arydshln"] = true;
				}
				var table = this.element,
					fit = $id("opt-fit-table").value,
					scale = fit.indexOf("sc") >= 0,
					shrink = fit.indexOf("sh") >= 0,
					firstPart = "",
					float = this._id("opt-latex-float").checked,
					str = "",
					useLongtable = this._id("opt-latex-split").checked,
					rotateTable = this._id("opt-latex-landscape").checked;
				this.shrink = shrink;
				var caption = this.caption(),
					booktabs = table.hasAttribute("data-booktabs"),
					rg = this.matrix(),
					border,
					useTabu = this.useTabu, // Must we use "tabu" package ?
					asteriskMultirow = false;
				if(useLongtable){
					asteriskMultirow = true;
				}
				noColor = this.blacklistPackages["colortbl"];
				var colHeaders = this.headers(rg),
				borderNewLine = $id("opt-latex-border").checked,
				header = colHeaders.join(""),
				startingDshCommand = "",
				startingColor = this.actualMainColor;
				if(header.charAt(0) == "@"){
					header = header.replace(/^@\{(\\array[^\{]+\{[^\}]+\})\}/, function(full, command){
						startingDshCommand = command;
						command.replace(/\{(?:[\s,]*([\d.]+)[\s,]*([\d.]+)[\s,]*([\d.]+)[\s,]*|([^\}]+))\}/, function(full, r, g, b, name){
							if(name){
								startingColor = name;
							}
							else {
								startingColor = "rgb("+(+r*255)+","+(+g*255)+","+(+b*255)+")";
							}
						})
						return "";
					})
				}
				this.actualColor = startingColor;
				var booktabColor = false;
				if(this.useBooktab() && this.useBackgroundColor(rg)){
					booktabColor = "\\setlength{\\extrarowheight}{0pt}\n";
					booktabColor += "\\addtolength{\\extrarowheight}{\\aboverulesep}\n";
					booktabColor += "\\addtolength{\\extrarowheight}{\\belowrulesep}\n";
					booktabColor += "\\setlength{\\aboverulesep}{0pt}\n";
					booktabColor += "\\setlength{\\belowrulesep}{0pt}\n";
				}
				if(useLongtable){
					if(rotateTable){
						this.packages["pdflscape"] = true;
						firstPart += "\\begin{landscape}\n";
					}
					if(booktabColor){
						if(!rotateTable){
							firstPart += "{\n";
						}
						firstPart += booktabColor
					}
					if(!areSameColors(startingColor, "black")){
						firstPart += "\\arrayrulecolor" + getColor(startingColor) + "\n";
					}
					if (caption.label && !caption.caption) {
						firstPart += "\\refstepcounter{table}\n";
						firstPart += "\\label{" + caption.label + "}\n";
					}
					str += "\\begin{" + (useTabu ? "longtabu" : "longtable") + "}{" + header + "}";
					if (caption.caption) {
						if(caption.numbered){
							str += "\n\\caption*{"+ caption.caption;
						}
						else{
							str += "\n\\caption{"+ caption.caption;
						}
						if(caption.label){
							str += "\\label{"+caption.label+"}";
						}
						str += "}\\\\";
					}
					if(scale){
						this.message("'scale' option can't be used with longtable or longtabu.");
					}
				}
				else{
					if(!float && rotateTable){
						this.packages["adjustbox"] = true;
						var adjustargs = ["angle=90","nofloat=table"];
						if(caption.caption){
							adjustargs.push("caption={"+caption.caption+"}");
						}
						if(caption.label){
							adjustargs.push("label={"+caption.label+"}");
						}
						firstPart = "\\begin{adjustbox}{"+adjustargs.join(",")+"}\n";
						if(this._id("table-opt-center").checked){
							firstPart += "\\centering\n"
						}
						if(booktabColor){
							firstPart += booktabColor;
						}
					}
					else{ 
						if(float){
							firstPart = "\\begin{"+ (rotateTable ? "sidewaystable" : "table") +"}\n";
						}
						else{
							firstPart = "\\noindent\\begin{minipage}{\\linewidth}\n";
						}
						if(this._id("table-opt-center").checked){
							firstPart += "\\centering\n"
						}
						if(booktabColor){
							firstPart += booktabColor;
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
					}
					if(!areSameColors(startingColor, "black")){
						firstPart += "\\arrayrulecolor" + getColor(startingColor) + "\n";
					}
				}
				if(scale && !useLongtable){
					this.packages["graphicx"] = true;
					str += "\\resizebox{\\linewidth}{!}{%\n";
				}
				if(useTabu){
					this.packages["tabu"] = true;
				}
				if(!useLongtable){
					str += "\\begin{"+(useTabu ? "tabu" : "tabular")+"}{" + header + "}";
				}
				var rg2 = [],rowIndex = [],isVCell = [],
				multiRows = {},rowI=0;
				for(var i=0;i<rg.length;i++){
					var cells = rg[i];
					var row = [];
					var valign = false;
					//if(!this.blacklistPackages["vcell"]){
					//	valign = this.vcell(i,rg); // Vertical align
					//}
					for(var j=0;j<cells.length;j++){
						var cell = cells[j],
						header = colHeaders[j] || "l";
						if(cell.rowSpan > 1){
							for(var k=i;k<i+cell.rowSpan;k++){
								multiRows[k] = true;
							}
						}
						if(!cell || cell.ignore){
							row.push(false);
						}
						else{
							if(cell.switch){
								cell = rg[i+cell.rowSpan-1][j]
								cell.unswitch = true;
							}
							else if(cell.unswitch){
								cell = cell.refCell
							}
							var text = "";
							if(j == 0){
								// rowColor;
								text = this.rowColor(i, rg);
								if(text){ text += " " }
							}
							if(cell.vcell){
								valign = true;
							}
							text += cell.getFullContent(this.actualColor);
							row.push({
									text: text, 
									colSpan : cell.colSpan || (cell.refCell ? cell.refCell.colSpan : 1) || 1
								 })
						}
					}
					isVCell.push(false);
					rowIndex.push(rowI);
					rg2.push(row);
					if(valign){
						row = [];
						for(var j=0;j<cells.length;j++){
							var cell = cells[j],
							text = "";
							if(!cell || cell.ignore){
								row.push(false);
							}
							else{
								var text = "";
								if(j == 0){
									// rowColor;
									text = this.rowColor(i, rg);
									if(text){ text += " " }
								}
								cell.vcell = false;
								if((cell.refCell||cell).rowSpan == 1){
									text += cell.getVCellContent(this.actualColor);
								}
								else{
									var refCell = rg[(cell.refCell||cell).y+1][(cell.refCell||cell).x];											text += refCell.getVCellContent(this.actualColor);
								}
								row.push({
									text: text, 
									colSpan : cell.colSpan || (cell.refCell ? cell.refCell.colSpan : 1) || 1
								})
							}
						}
						rg2.push(row);
						rowIndex.push(rowI);
						isVCell.push(true);
					}
					rowI++;
				}
				var beautifyRows = this.beautifyRows(rg2);
				var foundFirst = false;
				for(var i=0;i<beautifyRows.length;i++){
					var row = beautifyRows[i];
					if (isVCell[i]){
						str += " \\\\";
						if(useLongtable){
							str += "*";
						}
						str += "[-\\rowheight]";
					}
					else{
						if (i === 0 && booktabs) {
							if(borderNewLine){
								border = " \n\\toprule";
							}
							else{
								border = " \\toprule";
							}
						} else {
							border = this.getBorder(rowIndex[i], rg);
							if(borderNewLine){
								border = border ? " \n" + border : ""
							}
							else{
								border = border ? " " + border : "";
							}
						}
						if (rowIndex[i] !== 0) {
							if(!foundFirst && useLongtable && !multiRows[rowIndex[i]]){
								str += " \\endfirsthead";
							}
							else{						
								str += " \\\\";
							}
							if(asteriskMultirow && multiRows[rowIndex[i]]){
								str+= "*";
							}
							else{foundFirst = true;}
							str += border
						} else {
							str += border;
						}
					}
					str += "\n" + row;
				}
				if (booktabs) {
					str += " \\\\"+ (borderNewLine ? "\n" : " ") +"\\bottomrule"
				} else {
					border = this.getBorder(rg.length, rg);
					if (border) {
						str += " \\\\"+ (borderNewLine ? "\n" : " ") + border;
					}
				}
				if(useLongtable){
					this.packages["longtable"] = true;
					str += "\n\\end{"+(useTabu ? "longtabu" : "longtable")+"}\n"
					if(booktabColor && !rotateTable){
						str += "}\n";
					}
				}
				else{
					str += "\n\\end{"+(useTabu ? "tabu" : "tabular")+"}\n"
					if(scale){
						str += "}\n";
					}
				}
				// Booktabs
				if (/\\(bottomrule)|(toprule)|(midrule)|(cmidrule)|(heavyrulewidth)|(lightrulewidth)/.test(str)) {
					this.packages["booktabs"] = true;
				}
				// arydshln
				if (/\\(cdashline|hdashline)/.test(str)) {
					this.packages["arydshln"] = true;
				}
				if(str.indexOf("\\hhline")>-1){
					this.packages["hhline"] = true;
				}
				if(str.indexOf("\\vcell")>-1){
					this.packages["vcell"] = true;
					this.uniqueLog("If you get an <kbd>File 'vcell.sty' not found</kbd> error, download the file <a href='https://ctan.org/pkg/vcell' target='_blank'>here</a> and install it in the same repertory as your table.","warning");
				}
				if(str.indexOf("\\arrayrulecolor") > -1 || firstPart.indexOf("\\arrayrulecolor") > -1 
				   || str.indexOf("\\doublerulesepcolor") > -1 || firstPart.indexOf("\\doublerulesepcolor") > -1){
					this.packages["colortbl"] = true;
					if(!areSameColors(this.actualColor, "#000000")){
						str += "\\arrayrulecolor"+getColor("#000000")+"\n";
					}
					if(!this.useTabu && this.packages["arydshln"]){
						firstPart += "\\ADLnullwidehline\n";
					}
					if(firstPart.indexOf("\\arrayrulecolor")<0){
						firstPart += "\\arrayrulecolor"+getColor("#000000")+"\n";
					}
				}
				else if(str.indexOf("\\cellcolor") > -1 || str.indexOf("\\rowcolor") > -1 || str.indexOf("\\columncolor") > -1){
					this.packages["colortbl"] = true;
				}
				if(this.useTabu || this.useCustomColors){
					// Let see if we have some colors from tabu that we have to declare
					var tabuColors = this.tabuColors;
					for(var i in tabuColors){
						if(tabuColors.hasOwnProperty(i)){
							var color = tabuColors[i];
							firstPart += "\\definecolor{"+color.name+"}{rgb}{"+color.rgb.join(",")+"}\n";
						}
					}
				}
				if(!useLongtable){
					if(float){
						if(rotateTable){
							this.packages["rotating"] = true;
						}
						str +="\\end{"+(rotateTable ? "sidewaystable" : "table")+"}";
					}
					else{
						if(rotateTable){
							str+= "\\end{adjustbox}";
						}
						else{
							str += "\\end{minipage}";
						}
					}
				}
				else if(rotateTable){
					str += "\\end{landscape}";
				}
				// Packages
				var packages = "";
				for (var i in this.packages) {
					if (this.packages.hasOwnProperty(i)) {
						if(i == "ulem"){
							packages += "% \\usepackage[normalem]{ulem}\n";
						}
						else if(i == "longtable" && useTabu){
							packages += "% \\usepackage{longtable}[=v4.13]\n";
						}
						else if(i == "multirow" && useLongtable){
							packages += "% \\usepackage[longtable]{multirow}\n";
						}
						else if(i != "arydshln" && !(i == "color" && this.packages["colortbl"])){
							packages += "% \\usepackage{" + i + "}\n";
						}
					}
				}
				if (!useTabu && this.packages["arydshln"]) {
					// Compatibility between packages
					packages += "% \\usepackage{arydshln}\n";
				}
				/* Show some message*/
				if (this.shrink && this.packages["multirow"]){
					this.message("The shrink algorithmn might not work with cells spanning multiple rows.","warning");
				}
				if (this.element.querySelector("td[data-two-diagonals]")) {
					this.message(
						"If you get an '! FP error: Logarithm of negative value!.' error, the content of the bottom part of one of your cells with two diagonals is too long.", "warning"
					)
				}
				/* Show some information about packages used */
				this.showPackagesInformation(this.packages);
				return (packages ? packages + "\n\n" : "") + firstPart + str;
			}
			this.showPackagesInformation = function(packages){

				var packs = [],
				packDatabase = {},
				hasSub = false;
				var _packinfo = function(pack, sub){
					if(packDatabase[pack]){
						return;
					}
					packDatabase[pack] = true;
					if(sub){hasSub = true;}
					packs.push("<span class='package'>"+pack+"</span>" + (sub ? "<sup>*</sup>" : ""));
					if(packagesDatabase[pack]){
						for(var j=0;j<packagesDatabase[pack].length;j++){
							_packinfo(packagesDatabase[pack][j], true);
						}
					}
				}
				for (var i in this.packages) {
					if (this.packages.hasOwnProperty(i)) {
						_packinfo(i, false);
					}
				}
				if(packs.length == 0){return false}
				if(packs.length == 1){
					this.message("This table will import one package : " + packs[0] + ".", "info");
				}
				else if(packs.length > 1){
					packs.sort();
					var last = packs[packs.length-1];
					packs.pop()
					this.message("This table will import "+ (packs.length+1) +" packages : "+ packs.join(", ") + ", and "+ last+"." +
					(hasSub ? "<br><small>* This package is imported by another package.</small>" : ""), "info");
				}
			}
			this.beautifyRows = function(rows, separator){
				separator = separator || "&";
				var rows2 = [], n = 0, start = [], max = [];
				if($id("opt-latex-whitespace").checked && arguments.length == 1){
					for(var i=0;i<rows.length;i++){
						rows2[i] = "";
						var cells = rows[i];
						for(var j=0;j<cells.length;j++){
							var cell = cells[j];
							if(cell){
								if(j!==0){
									rows2[i] += " & ";
								}
								rows2[i] += cell.text;
							}
						}
					}
					return rows2;
				}
				var intersectionPoints = [],
				rrows = [];

				// First transform into a table that take care of colSpan
				for(var i=0;i<rows.length;i++){
					var newrow = [];
					for(var j=0;j<rows[i].length;j++){
						var cell = rows[i][j];
						if(cell){
							for(var h=0;h<Math.max(1,cell.colSpan||1)-1;h++){
								newrow.push(false);
							}
							newrow.push(cell);
						}
					}
					rrows.push(newrow)
				}
				// Now we can handle that table to find where to put "&";
				rows = rrows;
				for(var j=0;j<rows[0].length;j++){
					for(var i=0;i<rows.length;i++){
						var cell = rows[i][j];
						if(cell){
							var colspan = Math.max(1,Math.abs(cell.colSpan||1));
							if(!intersectionPoints[j]){
								if(j-colspan+1 <= 0){
									intersectionPoints[j] = cell.text.length+1;
								}
								else{
									intersectionPoints[j] = (intersectionPoints[j-colspan]||0)+2+cell.text.length+1;
								}
							}
							else{
								intersectionPoints[j] = Math.max(intersectionPoints[j], (j === 0 ? 0 : (intersectionPoints[j-colspan]||0)+2)+cell.text.length+1);
							}
						}
					}
				}
				for(var i=0;i<rows.length;i++){
					var str = "";
					for(var j=0;j<rows[i].length;j++){
						var cell = rows[i][j],
						colspan = Math.max(1,Math.abs(cell.colSpan||1));
						if(cell){
							if(j-colspan+1 !== 0){
								str += separator+" ";
							}
							str += cell.text;
							for(var h=str.length;h<intersectionPoints[j];h++){
								str += " ";
							}
						}
					}
					rows2.push(str);
				}
				return rows2;
			}
			this.extract = (function() {
				function borderInfo(cell, o) {
					var style = cell.style,
						css = "",
						types = {
							"solid": ["normal", "1px solid "],
							"double": ["double", "2px solid "],
							"dashed": ["hdashline", "1px dashed "],
							"dotted": ["dottedline", "1px dotted "]
						},
						first = "";
					["Left", "Right", "Bottom", "Top"].forEach(function(val) {
						var type = style["border" + val + "Style"];
						if (type && type != "none") {
							var valLC = val.toLowerCase(),
								res = types[type] || ["normal", "1px solid "];
								res[1] += style["border" + val + "Color"] || "black";
							o.dataset["border" + val] = res[0];
							css += "border-" + valLC + ":" + res[1] + ";";
							if (!first) {
								first = res[1];
							}
						}
					});
					if (first && first == style.border) {
						return "border: " + first + ";";
					}

					return css;
				}
				function backgroundInfo(cell){
					var color = window.getComputedStyle(cell,null).getPropertyValue("background-color") || cell.style.backgroundColor;
					if(color == "transparent" || color == "white" || !color){return ""}
					var rgba = toRGBA(color);
					if(rgba[3] == 0){
						return "";
					}
					if(!rgba || !rgba.pop){return ""}
					rgba.pop();
					if(rgba.join(",") == "255,255,255"){
						return "";
					}
					return "background-color: "+color+";";
				}/*
				function getHTML(html) {
					html = html.replace(/<\s*\/?\s*([^>]+)>/gi, function(a, b) {
						if (!/^((em)|i)($|[^a-z])/i.test(b)) {
							return "";
						}
						return a;
					});
					var div = document.createElement("div");
					div.innerHTML = html;
					return div.innerHTML;
				}*/
				return function(div) {
					var table = div.querySelector("table");
					if (!table) {
						return;
					}
					var o = {
						autoBooktabs: false,
						cells: []
					}
					// Caption
					var wordCaption = div.querySelector(".MsoCaption") || table.caption;
					o.caption = {
						caption: wordCaption ? (wordCaption.innerText || wordCaption.textContent) : table.title || "",
						numbered: false,
						label: table.id || ""
					}
					for (var i = 0; i < table.rows.length; i++) {
						var cells = table.rows[i].cells;
						o.cells[i] = [];

						for (var j = 0; j < cells.length; j++) {
							var cell = cells[j],
								o2 = {
									dataset: {}
								};
							if ((cell.getAttribute("style") || cell.style.cssText)
								.indexOf("mso-diagonal") > -1) {
								o2.dataset.diagonal = "data-diagonal";
								o2.html = [this.getHTML(cell), ""]
							} else {
								o2.html = this.getHTML(cell);
							}
							// align
							var align = cell.getAttribute("align");
							if(cell.style.textAlign){
								align = cell.style.textAlign;
							}
							if(align == "right"){
								o2.dataset.align = "r";
							}
							else if(align == "center"){
								o2.dataset.align = "c";
							}
							o2.css = borderInfo(cell, o2) + backgroundInfo(cell);
							o2.rowSpan = cell.rowSpan;
							o2.colSpan = cell.colSpan;
							o.cells[i][j] = o2;
						}
					}
					this.importFromJSON(o);
				}
			})()
			this.HBorder = function(n, callback, matrix) {
				var row = matrix[Math.max(0, (n || 0) - 1)],
				types = {};
				if (!row) {
					return callback.call(this)
				}
				var border = [],
					hasColor = false,
					subBorder = {},
					complete = true,
					actualColor = this.actualColor;
				if (n == 0) {
					for (var i = 0; i < row.length; i++) {
						if (row[i].refCell) {
							continue;
						}
						var cell = row[i].cell,
							bd = cell.getAttribute("data-border-top"),
							color = cell.style.borderTopColor;
						if (bd) {
							var o = {
								type : bd,
								color : color,
								sameAsBefore : i===0,
								cellIndex : i
							}
							types[bd] = true;
							if(!types["trim"] && /^trim/.test(bd)){
								types["trim"] = true;
							}
							if(border[i-1]){
								var beforeBorder = border[i-1];
								if(areSameColors(beforeBorder.color, o.color)){
									if(o.type == beforeBorder.type){
										o.sameAsBefore = true;
									}
									else if((o.type == "trimright" || o.type == "trimfull")
										&& (beforeBorder.type == "trimfull" || beforeBorder.type == "trimleft")){
										o.sameAsBefore = true;
									}
								}
							}
							if(!o.sameAsBefore){
								complete = false;
							}
							if(!hasColor && !areSameColors(actualColor, o.color)){
								hasColor = true;
							}
							for (var j = 0; j < cell.colSpan; j++) {
								if(j === 0){
									border.push(o);
								}
								else{
									border.push({
										type : o.type,
										color : o.color,
										sameAsBefore : true,
										cellIndex : o.cellIndex
									});
								}
								i++;
							}
							i--;
						}
						else {
							if(border[i-1]){
								complete = false;
							}
							for (var j = 0; j < cell.colSpan; j++) {
								border.push(false);
								i++;
							}
							i--;
						}
					}
				} else {
					var row2 = matrix[n] || [];
					for (var i = 0; i < row.length; i++) {
						var cell = row[i];
						cell = cell.cell || cell.refCell.cell;
						if (cell.parentElement.rowIndex - 1 + cell.rowSpan != n) {
							if(border[i-1]){
								complete = false;
							}
							for (var j = 0; j < cell.colSpan; j++) {
								border.push(false);
								i++;
							}
							i--;
							continue;
						}
						var bd = cell.getAttribute("data-border-bottom"),
						color = cell.style.borderBottomColor;
						if (!bd && row2[i]) {
							var cell = row2[i];
							if (cell.cell || (cell.refCell.cell.parentElement.rowIndex - 1 == n + 1)) {
								bd = (cell.cell || cell.refCell.cell)
									.getAttribute("data-border-top"),
								color = (cell.cell || cell.refCell.cell).style.borderTopColor;
							}
						}
						if (bd) {
							var o = {
								type : bd,
								color : color,
								sameAsBefore : i===0,
								cellIndex : i
							}
							types[bd] = true;
							if(!types["trim"] && /^trim/.test(bd)){
								types["trim"] = true;
							}
							if(border[i-1]){
								var beforeBorder = border[i-1];
								if(areSameColors(beforeBorder.color, o.color)){
									if(o.type == beforeBorder.type && o.type != "trimboth"){
										o.sameAsBefore = true;
									}
									else if((o.type == "trimright" || o.type == "trimfull")
										&& (beforeBorder.type == "trimfull" || beforeBorder.type == "trimleft")){
										o.sameAsBefore = true;
									}
								}
							}
							if(!o.sameAsBefore){
								complete = false;
							}
							if(!hasColor && !areSameColors(actualColor, o.color)){
								hasColor = true;
							}
							for (var j = 0; j < cell.colSpan; j++) {
								if(j === 0){
									border.push(o);
								}
								else{
									border.push({
										type : o.type,
										color : o.color,
										sameAsBefore : true,
										cellIndex : o.cellIndex
									});
								}
								i++;
							}
							i--;
						} else {
							if(border[i-1]){
								complete = false;
							}
							for (var j = 0; j < cell.colSpan; j++) {
								border.push(false);
								i++;
							}
							i--;
						}
					}
				}
				var o = {
					complete: complete,
					color : hasColor,
					borders : border,
					types : types
				};
				return callback.call(this, o);
			}
			this.actualMainColor = "black";
			this.actualColor = "black";
			this.mainColor = function(){
				var rows = this.element.rows,
				colors = {};
				for(var i=0;i<rows.length;i++){
					var cells = rows[i].cells;
					for(var j=0;j<cells.length;j++){
						var cell = cells[j];
						["Top","Bottom","Right","Left"].forEach(function(Side){
							var side = Side.toLowerCase();
							if(cell.getAttribute("data-border-"+side)){
								var color = cell.style["border"+Side+"Color"];
								if(!colors[color]){colors[color]=0};
								colors[color]++;
							}
						});
					}
				}
				var max = 0, actual = "black";
				for(var i in colors){
					if(colors.hasOwnProperty(i)){
						if(colors[i]>max){
							max = colors[i];
							actual = i;
						}
					}
				}
				return actual;
			}
			this.prepareDownload = function() {
				var latex = this.generateLaTeX();
				latex = latex.replace(/^%\s*\\usepack/mg, "\\usepack");
				latex = "\\documentclass{article}\n" + latex;
				latex = latex.replace(/\\begin{tabl/, "\\begin{document}\n\\begin{tabl") + "\n\\end{document}";
				var blob = new Blob([latex],{type : 'application/x-tex'}); 
				var fileReader = new FileReader();
				fileReader.onload = function(e) {
				     $id("link-download").href = e.target.result;
				     $('#download').modal('show');
				};
				fileReader.readAsDataURL(blob);
				$id("link-download")
					.href = "";
			}
			this.prepareEmail = function(){
				var format = $id("format-in").value,
				result = "";
				if (format == "latex") {
					result = this.generateLaTeX();
				} else {
					result = this.interpreters[format].call(this)
				}
				this._id("link-email").href = "mailto:?subject=Table&body=" + encodeURIComponent(result);
				$('#email').modal('show');
			}
			this.vcell = function(n, matrix){
				matrix = matrix || this.matrix();
				var row = matrix[n];
				if(!row || !row.length){return;}
				var align = null,needVCell = false;
				for(var i=0;i<row.length;i++){
					var cell = row[i];
					if(cell.refCell){continue;}
					var cellalign = (cell.refCell||cell).cell.getAttribute("data-vertical-align") || "m";
					if(align && cellalign != align){
						needVCell = true;
					}
					else{
						align = cellalign;
					}
				}
				if(needVCell){
					for(var i=0;i<row.length;i++){
						var cell = row[i];
						if(cell.refCell){continue}
						(cell.refCell||cell).vcell = true;
					}
					return true;
				}
				return false;
			}
			this.rowColor = function (n, matrix){
				matrix = matrix || this.matrix();
				var row = matrix[n];
				if(!row){
					return "";
				}
				var results = {},
				max = 1,
				value = null;
				for(var i=0;i<row.length;i++){
					var cell = row[i],
					color = (cell.refCell||cell).cellBackground;
					if(!color){
						return "";
					}
					color = color.map(function(value){return Math.floor(value*1000)/1000});
					color.pop();
					color = color.join(",");
					if(!results[color]){
						results[color] = {
							value : color,
							i : 0,
							cells : []
						}
					}
					results[color].cells.push(cell);
					results[color].i++;
					i += (cell.refCell||cell).cell.colSpan-1;
				}
				for(var i in results){
					if(results.hasOwnProperty(i)){
						var result = results[i];
						if(result.i > max){
							value = result;
							max = result.i;
						}
					}
				}
				if(!value){
					return "";
				}
				var color = value.cells[0];
				color = (color.refCell||color).cellBackground;
				for(var i=0;i<value.cells.length;i++){
					var cell = value.cells[i]
					if((cell.refCell||cell).cell.rowSpan == 1){
						value.cells[i].background = null;
					}
				}
				return "\\rowcolor"+getColor(color);
			}
			this.requestDesktopSite = function(){
				this._id("meta-viewport").setAttribute("content","");
				document.getElementsByTagName("html")[0].classList.add("prevent-small");
			}
			this.mobileKey = function(n, elem){
				var ctrl = this._id("mobile-ctrl"),
				    shift = this._id("mobile-shift");
				if(arguments.length < 2){
					if(document.getElementsByTagName("html")[0].classList.contains("prevent-small")){
						return 0;
					}
					else if(shift.classList.contains("active")){
						return 2;
					}
					else if(ctrl.classList.contains("active")){
						return 1;
					}
					return 0;
				}
				var val = elem.classList.contains("active");
				ctrl.classList.remove("active");
				shift.classList.remove("active");
				if(!val){
					(n == 1 ? ctrl : shift).classList.add("active");
				}
			}
			this.getBorder = function(n, matrix) {
				return this.HBorder(n, function(o) {
					if (arguments.length == 0) {
						return ""
					}
					var complete = o.complete,
					hasColor = o.color,
					borders = o.borders,
					border = "",
					enhanceHhline = this._id("opt-latex-hhline").checked && (!this.packages["arydshln"] || this.useTabu),
					hashHhline = this._id("opt-latex-hhline-hash").checked && (!this.packages["arydshln"] || this.useTabu),
					insertInHhline = !this.blacklistPackages["colortbl"];

					if(borders[0].type == "double" && (enhanceHhline || hashHhline)){
						complete = false;
					}
					if(complete){
						if(!borders[0]){
							return "";
						}
						var firstBorder = borders[0];
						if(hasColor && !(this.useTabu && (firstBorder.type == "hdashline" || firstBorder.type == "dottedline"))){
							border += "\\arrayrulecolor"+getColor(firstBorder.color);
							this.actualColor = firstBorder.color;
						}
						if(this.useTabu && hasColor && (firstBorder.type == "hdashline" || firstBorder.type == "dottedline")){
							var colorname = this.tabuColor(firstBorder.color);
							if(firstBorder.type == "hdashline"){
								border += "\\tabucline["+colorname+" on 4pt off 4pt]{-}"
							}
							else{
								border += "\\tabucline["+colorname+" on 1pt off 1pt]{-}"
							}
						}
						else if(o.types.trim){
							// We check if there's a cell with a background
							var row = matrix[n] || matrix[n-1],
							hasBg = false;
							for(var i=0;i<row.length;i++){
								var cell = row[i];
								if((cell.refCell||cell).cellBackground){
									hasBg = true;
									break;
								}
							}
							if(hasBg){
								// If yes, we remove the gap
								border+="\\noalign{\\kern-\\cmidrulewidth}";
							}
							var lastBorder = borders[borders.length-1];
							border += "\\cmidrule("
							if(firstBorder.type == "trimleft" || firstBorder.type == "trimboth"){
								border += "l";
							}
							if(firstBorder.type == "trimright" || lastBorder.type == "trimright" || firstBorder.type == "trimboth"){
								border += "r"
							}
							border += "){1-"+borders.length+"}";
						}
						else{
							border += {
									normal: "\\hline",
									double: "\\hline\\hline",
									toprule: "\\toprule",
									midrule: "\\midrule",
									bottomrule: "\\bottomrule",
									hdashline: this.useTabu ? "\\tabucline[on 4pt off 4pt]{-}" : "\\hdashline",
									dottedline: this.useTabu ? "\\tabucline[on 1pt off 1pt]{-}" : "\\hdashline[1pt/1pt]"
							}[firstBorder.type]
						}
						return border;
					}
					var row = matrix[n] || matrix[n-1],
					toprow = matrix[n-1] || matrix[n-2] || [],
					useHHLine = false;
					for(var i=0;i<row.length;i++){
						var cell = row[i];
						if((cell.refCell||cell).cellBackground){
							useHHLine = true;
							break;
						}
					}
					var specificTrim = false;
					if(o.types.trim){
						specificTrim = true;
						for(var i in o.types){
							if(o.types.hasOwnProperty(i) && !/^trim/.test(i)){
								specificTrim = false;
								break;
							}
						}
					}
					if(specificTrim){
						// We use a special case when there is only trim borders;
						if(useHHLine){
							border = "\\noalign{\\kern-\\cmidrulewidth}";
						}
						for(var i=0;i<borders.length;i++){
							if(borders[i]){
								var type = borders[i].type,
								color = borders[i].color;
								if(type == "trimleft" || type == "trimright" || type == "trimboth" || type == "trimfull"){
									if(!areSameColors(this.actualColor, color)){
										this.actualColor = color;											border+= "\\arrayrulecolor"+getColor(color);
									}
									if(type == "trimboth"){
										border += "\\cmidrule(lr){"+(i+1)+"-"+(i+1)+"}";
									}
									else if(type == "trimright"){
										border += "\\cmidrule(r){"+(i+1)+"-"+(i+1)+"}";
									}
									else if(type == "trimleft" || type == "trimfull"){
										var hasLeft = type == "trimleft",
										    hasRight = false, end, start = i+1;
										while(true){
											i++;
											var borderN = borders[i];
											if(borderN && borderN.type == "trimright"){
												hasRight = true;
											}
											if(!borderN || !borderN.sameAsBefore){
												end = i;
												i--;
												break;
											}
										}
										border += "\\cmidrule";
										if(hasLeft || hasRight){
											border += "("+(hasLeft ? "l" : "")+(hasRight ? "r" : "")+")";
										}
										border += "{"+start+"-"+end+"}";
									}
								}
								else if(console && console.error){
									console.error("This shouldn't happen");
								}
							}
						}
						return border;
					}
					else if(!this.blacklistPackages["hhline"] && (useHHLine			// If there's a cell with background color
						|| (o.types.double && 						// or a double border but
						   !(o.types.toprule || o.types.midrule ||			// without booktab borders
							 o.types.bottomrule || o.types.trim))			// ...
						) && (!this.packages["arydshln"] || this.useTabu)		// And we don't use arydshln package
					){
						// oh oh... We must use a hhline
						var insideColor = this.actualColor,
						doublerulesepcolor = [255,255,255,1], // white
						metAry = false,
						metTrim = false,
						width = "0.4pt",
						widthKeys = {
							"toprule" : "\\heavyrulewidth",
							"bottomrule" : "\\heavyrulewidth",
							"midrule" : "\\cmidrulewidth",
							"normal" : "0.4pt",
							"double" : "0.4pt"
						}
						border = "\\hhline{";
						for(var i=0;i<borders.length;i++){
							if(i===0){
							// Must check for left border
								var borderLeft = (row[i].refCell||row[i]).leftBorder,
								    borderLeftColor = (row[i].refCell||row[i]).leftBorderColor,
								    borderLeftTop = ((toprow[i]||{}).refCell||toprow[i]||{}).leftBorder,
								    borderLeftTopColor = ((toprow[i]||{}).refCell||toprow[i]||{}).leftBorderColor;
								if(hashHhline && (borderLeft == "double" || borderLeftTop == "double")){
									if(borders[i].type == "double"){
										var borderLeftFColor = borderLeftColor || borderLeftTopColor;
										if(insertInHhline && !areSameColors(insideColor, borderLeftFColor)){
											insideColor = borderLeftFColor;
											border += ">{\\arrayrulecolor"+getColor(borderLeftFColor)+"}";
										}
										border += "#";
									}
								}
								else if(enhanceHhline && (borderLeft == "double" || borderLeftTop == "double")){
									var borderLeftFColor = borderLeftColor || borderLeftTopColor;
									if(insertInHhline && !areSameColors(insideColor, borderLeftFColor)){
										insideColor = borderLeftFColor;
										border += ">{\\arrayrulecolor"+getColor(borderLeftFColor)+"}";
									}
									border += "|";
									if(borderLeftTop != "double" || n == 0){
										border += "t";
									}
									else if(borderLeft != "double" || n>= matrix.length){
										border += "b";
									}
									if(borders[i].type == "double"){
										border += ":";
									}
									else{
										border += "|";
									}
								}
								else if(borderLeft == "normal" || borderLeft == "double"){
									if(insertInHhline && !areSameColors(insideColor, borderLeftColor)){
										insideColor = borderLeftColor;
										border += ">{\\arrayrulecolor"+getColor(borderLeftColor)+"}";
									}
									if(borderLeft == "normal"){
										border += "|";
									}
									else{
										border += "||";
									}
								}
							}
							// Now the horizontal border
							var type = borders[i].type,
							color = borders[i].color,
							background = (row[i].refCell||row[i]).cellBackground,
							thiswidth = widthKeys[type] || "0.4pt";
							if(type == "normal" || type == "toprule" || type == "bottomrule" || type == "midrule"){
								if(insertInHhline){
									var toadd = "";
									if(!areSameColors(insideColor, color)){
										insideColor = color;
										toadd += "\\arrayrulecolor"+getColor(color);
									}
									if(toadd){
										border+= ">{"+toadd+"}";
									}
								}
								border += "-";
							}
							else if(type == "double"){
								if(insertInHhline){
									var toadd="";
									background = background || [255,255,255,1];
									if(!areSameColors(insideColor, color)){
										insideColor = color;
										toadd += "\\arrayrulecolor"+getColor(color);
									}
									if(!areSameColors(doublerulesepcolor, [255,255,255,1])){
										doublerulesepcolor = "FFFFFF";
										toadd += "\\doublerulesepcolor"+getColor([255,255,255,1]);
									}
									if(toadd){
										border += ">{" + toadd + "}";
									}
								}
								border += "=";
							}
							else if(type == "dottedline" || type == "hdashline"){
								metAry = true;
								border += "~";
							}
							else if(type == "trimfull" || type == "trimboth" || type == "trimleft" || type == "trimright"){
								metTrim = true;	
								border += "~";
							}
							else if(background){
								if(insertInHhline){
									var toadd="";
									if(!areSameColors(insideColor, background)){
										insideColor = background;
										toadd += "\\arrayrulecolor"+getColor(background);
									}
									if(o.types.double){
										if(!areSameColors(doublerulesepcolor, background)){
											doublerulesepcolor = background;
											toadd += "\\doublerulesepcolor"+getColor(background);
										}
									}
									if(toadd){
										border += ">{" + toadd + "}";
									}
								}
								if(o.types.double){
									border += "=";
								}
								else{
									border += "-";
								}
							}
							else{
								border += "~";
							}
							// Check for right border;
							// We have to do special checks for \multicolumn and \hhline
							var borderRight = "",
							    borderRightColor = "",
							    borderRightTop = "",
							    borderRightTopColor = "";
							borderRight = borderRightColor = borderRightTop = borderRightTopColor = "";
							if(row[i].x == (row[i].refCell||row[i]).x + (row[i].refCell||row[i]).cell.colSpan-1){
								borderRight = (row[i].refCell||row[i]).rightBorder;
								borderRightColor = (row[i].refCell||row[i]).rightBorderColor;
							}
							if(toprow[i] && (toprow[i].x == (toprow[i].refCell||toprow[i]).x + (toprow[i].refCell||toprow[i]).cell.colSpan-1)){
								borderRightTop = ((toprow[i]||{}).refCell||toprow[i]||{}).rightBorder;
								borderRightTopColor = ((toprow[i]||{}).refCell||toprow[i]||{}).rightBorderColor;
							}
							if(hashHhline && (borderRight == "double" || borderRightTop == "double")){
								if(type == "double" || (borders[i+1] && borders[i+1].type == "double")){
									var borderRightFColor = borderRightColor || borderRightTopColor;
									if(insertInHhline){
										var toadd = "";
										if(!areSameColors(insideColor, borderRightFColor)){
											insideColor = borderRightFColor;
											toadd += "\\arrayrulecolor"+getColor(borderRightFColor);
										}
										if(!areSameColors(doublerulesepcolor, [255,255,255,1])){
											doublerulesepcolor = "FFFFFF";
											toadd += "\\doublerulesepcolor"+getColor([255,255,255,1]);
										}
										if(toadd){
											border += ">{"+toadd+"}";
										}
									}
									border += "#";				
								}
							}
							else if(enhanceHhline && (borderRight == "double" || borderRightTop == "double")){
								var borderRightFColor = borderRightColor || borderRightTopColor;
								if(insertInHhline){
									var toadd = "";
									if(!areSameColors(insideColor, borderRightFColor)){
										insideColor = borderRightFColor;
										toadd += "\\arrayrulecolor"+getColor(borderRightFColor);
									}
									if(!areSameColors(doublerulesepcolor, [255,255,255,1])){
										doublerulesepcolor = "FFFFFF";
										toadd += "\\doublerulesepcolor"+getColor([255,255,255,1]);
									}
									if(toadd){
										border += ">{"+toadd+"}";
									}
								}
								if(type == "double"){
									border += ":";
								}
								else{
									border += "|";
								}
								if(borderRightTop != "double" || n == 0){
									if(insertInHhline && !areSameColors(doublerulesepcolor, [255,255,255,1])){
										doublerulesepcolor = "FFFFFF";
										border += ">{\\doublerulesepcolor"+getColor([255,255,255,1])+"}";
									}
									border += "t";
								}
								else if(borderRight != "double" || n>= matrix.length){
									if(insertInHhline && !areSameColors(doublerulesepcolor, [255,255,255,1])){
										doublerulesepcolor = "FFFFFF";
										border += ">{\\doublerulesepcolor"+getColor([255,255,255,1])+"}";
									}
									border += "b";
								}
								if(i >= row.length-1){
									border += "|";
								}
								else{
									if(borders[i+1].type == "double"){
										if(insertInHhline && !areSameColors(doublerulesepcolor, [255,255,255,1])){
											doublerulesepcolor = "FFFFFF";
											border += ">{\\doublerulesepcolor"+getColor([255,255,255,1])+"}";
										}
										border += ":"
									}
									else{
										border += "|";
									}
								}
								
							}
							else if(enhanceHhline && borderRight == "normal"){
								if(!row[i+1]){
									if(insertInHhline && !areSameColors(insideColor, borderRightColor)){
										insideColor = borderRightColor;
										border += ">{\\arrayrulecolor"+getColor(borderRightColor)+"}";
									}
									if(borderRight == "normal"){
										border += "|";
									}
								}
							}
							else if(borderRight == "normal" || borderRight == "double"){
								if(insertInHhline){
									var toadd = "";
									if(!areSameColors(insideColor, borderRightColor)){
										insideColor = borderRightColor;
										toadd += "\\arrayrulecolor"+getColor(borderRightColor);
									}
									if(!areSameColors(doublerulesepcolor, [255,255,255,1])){
										doublerulesepcolor = "FFFFFF";
										toadd += "\\doublerulesepcolor"+getColor([255,255,255,1]);
									}
									if(toadd){
										border += ">{"+toadd+"}";
									}
								}
								if(borderRight == "normal"){
									border += "|";
								}
								else{
									border += "||";
								}
							}
						}
						border += "}";
						if(!areSameColors(doublerulesepcolor, [255,255,255,1])){
							doublerulesepcolor = "FFFFFF";
							border += "\\doublerulesepcolor"+getColor([255,255,255,1]);
						}
						// If the hhline was not a must, we use \hline\hline in the case of full double horizontal borders
						if(o.complete && !/[:\|#]/g.test(border) && borders[0].type == "double"){
							border = "\\hline\\hline";
							if(hasColor){
								border = "\\arrayrulecolor"+getColor(firstBorder.color)+border;
								this.actualColor = borders[0].color;
							}
							return border;
						}
						// Remove useless hhline. Faster this way.
						border = border.replace(/\\hhline{[^=-]*}$/, "");
						// We return the color
						this.actualColor = insideColor
						if(metAry || metTrim){
							if(metAry){
								border+= "\\noalign{\\kern-";
								if(o.types.double){
									border+="\\dimexpr\\doublerulesep+2\\arrayrulewith";
								}
								else{
									border+="\\arrayrulewidth";
								}
								border+= "}";
							}
							else if(metTrim && !border){
								border = "\\noalign{\\kern-\\cmidrulewidth}";
							}
							var firstAry = true;
							for(var i=0;i<borders.length;i++){
								if(borders[i]){
									var type = borders[i].type,
									color = borders[i].color;
									if(metTrim && (type == "trimleft" || type == "trimright" || type == "trimboth" || type == "trimfull")){
										if(!areSameColors(this.actualColor, color)){
											this.actualColor = color;
											border+= "\\arrayrulecolor"+getColor(color);
										}
										if(type == "trimboth"){
											border += "\\cmidrule(lr){"+(i+1)+"-"+(i+1)+"}";
										}
										else if(type == "trimright"){
											border += "\\cmidrule(r){"+(i+1)+"-"+(i+1)+"}";
										}
										else if(type == "trimleft" || type == "trimfull"){
											var hasLeft = type == "trimleft",
											    hasRight = false, end, start = i+1;
											while(true){
												i++;
												var borderN = borders[i];
												if(borderN && borderN.type == "trimright"){
													hasRight = true;
												}
												if(!borderN || !borderN.sameAsBefore){
													end = i;
													i--;
													break;
												}
											}
											border += "\\cmidrule";
											if(hasLeft || hasRight){
												border += "("+(hasLeft ? "l" : "")+(hasRight ? "r" : "")+")";
											}
											border += "{"+start+"-"+end+"}";
										}
									}
									if(metAry && (type == "hdashline" || type == "dottedline")){
										if(firstAry){	
											firstAry = false;
										}
										else{
											border += "\\noalign{\\kern-\\arrayrulewidth}";
										}
										var colorname = this.tabuColor(color);
										if(type == "hdashline"){
											border+="\\tabucline["+colorname+" on 4pt off 4pt]{"+(i+1);
										}
										else{
											border+="\\tabucline["+colorname+" on 1pt off 1pt]{"+(i+1);
										}
										while(true){	// We know what we are doing
											i++;
											var borderN = borders[i];
											if(!borderN || !borderN.sameAsBefore){
												border += "-" + i + "}";
												i--;
												break;
											}
										}
									}
								}
							}
						}
						return border;
					}
					else{
						var doubleBorder = false;
						for(var i=0;i<borders.length;i++){
							var borderO = borders[i];
							if(!borderO){
								continue;
							}
							var insideTabu = "";
							if(!areSameColors(this.actualColor, borderO.color)){
								if(this.useTabu){
									insideTabu = this.tabuColor(borderO.color)+" ";
								}
								else{
									this.actualColor = borderO.color;
									border+= "\\arrayrulecolor"+getColor(borderO.color);
								}
							}
							if(borderO.type == "trimboth"){
								border += "\\cmidrule(lr){"+(i+1)+"-"+(i+1)+"}";
							}
							else if(borderO.type == "trimright"){
								border += "\\cmidrule(r){"+(i+1)+"-"+(i+1)+"}";
							}
							else if(borderO.type == "trimleft" || borderO.type == "trimfull"){
								var hasLeft = borderO.type == "trimleft",
								    hasRight = false, end, start = i+1;
								while(true){
									i++;
									var borderN = borders[i];
									if(borderN && borderN.type == "trimright"){
										hasRight = true;
									}
									if(!borderN || !borderN.sameAsBefore){
										end = i;
										i--;
										break;
									}
								}
								border += "\\cmidrule";
								if(hasLeft || hasRight){
									border += "("+(hasLeft ? "l" : "")+(hasRight ? "r" : "")+")";
								}
								border += "{"+start+"-"+end+"}";
							}
							else{
								border += {
									normal: "\\cline",
									toprule: "\\cmidrule[\\heavyrulewidth]",
									midrule: "\\cmidrule",
									bottomrule: "\\cmidrule[\\heavyrulewidth]",
									hdashline: this.useTabu ? "\\tabucline["+insideTabu+"on 4pt off 4pt]" : "\\cdashline",
									dottedline: this.useTabu ? "\\tabucline["+insideTabu+"on 1pt off 1pt]" : "\\cdashline",
									double: "\\cmidrule"
								}[borderO.type] + "{" + (i+1);
								if(borderO.type == "double"){doubleBorder = true;}
								while(true){	// We know what we are doing
									i++;
									var borderN = borders[i];
									if(!borderN || !borderN.sameAsBefore){
										border += "-" + i + "}";
										i--;
										if(borderO.type == "dottedline" && !this.useTabu){
											border += "[1pt/1pt]";
										}
										break;
									}
								}
							}
						}
						if(doubleBorder){
							border += "\\morecmidrule";
						}
						for(var i=0;i<borders.length;i++){
							// We repeat the same process as before but only for double borders. Why not just copy the
							// "double border" part ? In case the double border has color and the actual color changed
							// after.
							var borderO = borders[i];
							if(!borderO || borderO.type != "double"){
								continue;
							}
							if(!areSameColors(this.actualColor, borderO.color)){
								this.actualColor = borderO.color;
								border+= "\\arrayrulecolor"+getColor(borderO.color);
							}
							border += "\\cmidrule{"+ (i+1);
							while(true){	// We know what we are doing
								i++;
								var borderN = borders[i];
								if(!borderN || !borderN.sameAsBefore){
									border += "-" + i + "}";
									i--;
									break;
								}
							}
						}
						return border;
				
					}
					return "";
				}, matrix);
			}
			this.borderCellDraw = function(initialX, initialY, pageX, pageY){
				var mode = -1, arg = null;
				var should = null,
					rectangle = {
						top : Math.min(initialY, pageY),
						bottom : Math.max(initialY, pageY),
						left : Math.min(initialX, pageX),
						right : Math.max(initialX, pageX)
					}
				// If we select one cell
				if(Math.sqrt((rectangle.bottom-rectangle.top)*(rectangle.bottom-rectangle.top)+(rectangle.bottom-rectangle.top)
				   + (rectangle.right-rectangle.left)*(rectangle.right-rectangle.left))<8){
					var matrix = table.Table.matrix(),row
					for(var i=0;i<matrix.length;i++){
						var row = matrix[i];
						for(var j=0;j<row.length;j++){
							var cell = row[j];
							if(cell.cell){
								cell = cell.cell;
								posCell = table._absolutePosition(cell);
								if(intersectRect(posCell, rectangle)){
									//we find cell up, down, before and after
									var objcells = {up:[],down:[],left:[],right:[]}, othercells=[];
									//up
									var subrow = matrix[i-1], subcell;
									if(subrow){
										for(var h=0;h<cell.colSpan;h++){
											subcell = subrow[j+h];
											if(subcell && (subcell.cell || subcell.x == subcell.refCell.x)){
												othercells.push((subcell.refCell||subcell).cell);
											}
										}
										objcells.up = othercells;
									}
									othercells = [];
									//down
									var subrow = matrix[i+1], subcell;
									if(subrow){
										for(var h=0;h<cell.colSpan;h++){
											subcell = subrow[j+h];
											if(subcell && (subcell.cell || subcell.x == subcell.refCell.x)){
												othercells.push((subcell.refCell||subcell).cell);
											}
										}
										objcells.down = othercells;
									}
									othercells = [];
									//left
									for(var h=0;h<cell.rowSpan;h++){
										var subrow = matrix[i+h];
										if(subrow){
											var subcell = subrow[j-1];
											if(subcell && (subcell.cell || subcell.y == subcell.refCell.y)){
												othercells.push((subcell.refCell||subcell).cell)
											}
										}
										objcells.left = othercells;
									}
									othercells = [];
									//right
									for(var h=0;h<cell.rowSpan;h++){
										var subrow = matrix[i+h];
										if(subrow){
											var subcell = subrow[j+1];
											if(subcell && (subcell.cell || subcell.y == subcell.refCell.y)){
												othercells.push((subcell.refCell||subcell).cell)
											}
										}
										objcells.right = othercells;
									}
									mode = 1;
									arg = [cell, pageX, pageY,objcells]
									// Force exit
									j = row.length;
									i = matrix.length;
									break;
								}
							}
						}
					}
				}
				// If we select cells in row
				else if(Math.abs(initialY-pageY)<=10){
					var matrix = table.Table.matrix(),row, listOfCalls=[];
					for(var i=0;i<matrix.length;i++){
						row = matrix[i];
						cellLoop: for(var j=0,cell,posCell;j<row.length;j++){
							cell = row[j];
							if(cell.refCell){continue cellLoop;}
							var actualY = (cell.refCell||cell).y
							cell = (cell.refCell||cell).cell;
							posCell = table._absolutePosition(cell);
							if(intersectRect(posCell, rectangle)){
								var where = (rectangle.top+(rectangle.bottom-rectangle.top)/2 > posCell.top+posCell.height/2) 
									    ? "bottom" : "top";
								if(should === null){
									should = !table.isBorderSet(cell, where);
								}
								// Now let's find the cell over or under;
								var othercells = [], othercell = null,
								subrow = matrix[where == "top" ? actualY-1 : actualY+cell.rowSpan];
								if(subrow){
									for(var h=0;h<cell.colSpan;h++){
										othercell = subrow[j+h];
										if(othercell && (othercell.cell || othercell.x == othercell.refCell.x)){
											othercells.push((othercell.refCell||othercell).cell);
										}
									}
								}
								listOfCalls.push([cell,where,should,null,othercells])
							}
						}
					}
					// Call all of the results
					// We need the index for trimmed borders
					for(var i=0;i<listOfCalls.length;i++){
						if(listOfCalls.length === 1){
							listOfCalls[i].push(-1);
						}
						else{
							listOfCalls[i].push(i/(listOfCalls.length-1));
						}
					}
					mode = 2;
					arg = listOfCalls;
				}
				// If we select cells in column
				else if(Math.abs(initialX-pageX) <= 10){
					var matrix = table.Table.matrix(),row,listOfCalls=[];
					for(var i=0;i<matrix.length;i++){
						row = matrix[i];
						cellLoop: for(var j=0,cell,posCell;j<row.length;j++){
							cell = row[j];
							if(cell.refCell){continue cellLoop;}
							cell = (cell.refCell||cell).cell;
							posCell = table._absolutePosition(cell);
							if(intersectRect(posCell, rectangle)){
								var where = (rectangle.left+(rectangle.right-rectangle.left)/2 > posCell.left+posCell.width/2)
									    ? "right" : "left";
								if(should === null){
									should = !table.isBorderSet(cell, where);
								}
								// Now let's find the cell over or under;
								var othercells = [];
								for(var h=0;h<cell.rowSpan;h++){
									var subrow = matrix[i+h];
									if(subrow){
										var subcell = where == "left" ? subrow[j-1] : subrow[j+cell.colSpan];
										if(subcell && (subcell.cell || subcell.y == subcell.refCell.y)){
											othercells.push((subcell.refCell||subcell).cell)
										}
									}
								}
								listOfCalls.push([cell,where,should, null, othercells])
							}
						}
					}
					// Call all of the results
					for(var i=0;i<listOfCalls.length;i++){
						if(listOfCalls.length === 1){
							listOfCalls[i].push(-1);
						}
						else{
							listOfCalls[i].push(i/(listOfCalls.length-1));
						}
					}
					mode = 3;
					arg = listOfCalls;
				}
				return {mode:mode, arg:arg}
			};
			this.setTouchEvents = function(table_element){
				var initialX = 0,
				initialY = 0,element, start = false,should=null;
				function calculate(x, y){
					if(document.body.hasAttribute("data-border-editor")){
						element.style.top = initialY + "px";
						element.style.left = initialX + "px";
						element.style.width = Math.sqrt((initialY-y)*(initialY-y)+(initialX-x)*(initialX-x))+"px";
						var angle = Math.atan2(x- initialX,- (y- initialY) )*(180/Math.PI)-90;
						element.style.transform = "rotate(" + angle + "deg)";
					}
				}
				window.addEventListener("selectstart", function(e){
					if(start){
						e.preventDefault();
						return false;
					}
				});
				function mousedown(x,y,target){
					if(!element){
						element = document.getElementById('line');
					}
					if(document.body.hasAttribute("data-border-editor") && element){
						var overElement = target;
						if(!overElement || (overElement.tagName != "TEXTAREA" && overElement.tagName != "INPUT"
								    && overElement.tagName != "BUTTON" && overElement.tagName != "SELECT")){
							element.style.display="block";
							initialX = x;
							initialY = y;
							calculate(initialX, initialY);
							start = true;
						}
					}
				}
				window.addEventListener("mousedown", function(e){
					mousedown(e.pageX,e.pageY, e.target)
				});
				table_element.addEventListener("touchstart", function(e){
					if(e.touches && e.touches.length == 1){
						if(document.body.hasAttribute("data-border-editor")){
							e.preventDefault();
							mousedown(e.touches[0].pageX,e.touches[0].pageY, e.target)
						}
					}
				});
				var allowed = true;
				function mousemove(x,y){
					if(start && allowed){
						allowed = false;
						setTimeout(function(){allowed=true},40);
						if(document.body.hasAttribute("data-border-editor") && element){
							calculate(x, y);
						}
						else{
							start = false;should = null;
						}
						var elementsToRemove = table.element.querySelectorAll("td[data-border-preview]");
						for(var i=0;i<elementsToRemove.length;i++){
							elementsToRemove[i].removeAttribute("data-border-preview");
						}
						var draw = table.borderCellDraw(initialX, initialY, x, y),
						mode = draw.mode;
						if(mode == 1){
						}
						else if(mode == 2 || mode == 3){
							for(var i=0;i<draw.arg.length;i++){
								var arg = draw.arg[i]
								arg[0].setAttribute("data-border-preview",(arg[0].getAttribute("data-border-preview")||"")+" "+arg[1]);
								var othercells = arg[4]
								for(var j=0;j<othercells.length;j++){
									var othercell = othercells[j];
									othercell.setAttribute("data-border-preview",(othercell.getAttribute("data-border-preview")||"")+" "+({
										top:"bottom",
										bottom:"top",
										right:"left",
										left:"right"
									}[arg[1]]));
								}
							}
						}
					}
				}
				var lastMove = []
				table_element.addEventListener("touchmove", function(e){
					if(e.touches && e.touches.length == 1){
						if(document.body.hasAttribute("data-border-editor")){
							e.preventDefault();
							lastMove = [e.touches[0].pageX,e.touches[0].pageY];
							mousemove(e.touches[0].pageX,e.touches[0].pageY)
						}
					}
				});
				window.addEventListener("mousemove", function(e){
					mousemove(e.pageX, e.pageY);
				});
				function mouseup(x,y){
					if(document.body.hasAttribute("data-border-editor") && element){
						table.isDrawingBorder = true;
						var rectangle = {
									top : Math.min(initialY, y),
									bottom : Math.max(initialY, y),
									left : Math.min(initialX, x),
									right : Math.max(initialX, x)
								},
						tableElement = table.element;
						element.style.display="none";
						var elementsToRemove = table.element.querySelectorAll("td[data-border-preview]");
						for(var i=0;i<elementsToRemove.length;i++){
							elementsToRemove[i].removeAttribute("data-border-preview");
						}
						var draw = table.borderCellDraw(initialX, initialY, x, y);
						if(draw.mode == 1){
							table.editBorder.apply(table, draw.arg);
						}
						else if(draw.mode == 2 || draw.mode == 3){
							for(var i=0;i<draw.arg.length;i++){
								table.setBorder.apply(table, draw.arg[i]);
							}
						}
						start = false;
						should = null;
						initialY = initialX = 0;
						allowed = true;
						table.isDrawingBorder = false;
					};
				}
			
				table_element.addEventListener("touchend", function(e){
					if(e.touches && document.body.hasAttribute("data-border-editor")){
						e.preventDefault();
						mouseup(lastMove[0],lastMove[1])
					}
				});
				window.addEventListener("mouseup", function(e){
					mouseup(e.pageX, e.pageY);		
				});
			}
			this.copyToClipboard = function(){
				var element = this._id("c");
				element.select();
  				navigator.clipboard.writeText(element.value);
			}
		})()
	window.table = table;
})();
window.addEventListener("beforeunload", function() {
	if (window.table) {
		localStorage.setItem("table", JSON.stringify(table.exportToJSON()));
		if ($id("format-in")) {
			localStorage.setItem("table_format", $id("format-in")
				.value);
		}
	}
}, false);
