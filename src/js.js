function $id(id) {
	return document.getElementById(id);
}
(function() {
	"use strict"
	var sameHeader = function(cellHeader, colHeader, rowN) {
			if (rowN !== 0) {
				colHeader = (/[a-z].*/i.exec(colHeader) || ["l"])[0];
			}
			return cellHeader == colHeader
		},
		table = new(function() {
			this.create = function(cols, rows) {
				rows = parseInt(rows, 10);
				cols = parseInt(cols, 10);
				var fr = document.createDocumentFragment();
				for (var i = 0; i < rows; i++) {
					fr.appendChild(this.createRow(cols));
				}
				this.element.innerHTML = "";
				this.element.appendChild(fr);
			};
			this.import = function(content, format){
				content = content || $id("import_value").value;
				format = (format || $id("import_format").value).toLowerCase();
				if(format == "auto"){
					var json;
					try{
						json = JSON.parse(content);
					}
					catch(e){
						try{
							json = this.latex.importTable(content);
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
					table.importFromJSON(json);
				}
				else if(format == "json"){
					table.importFromJSON(JSON.parse(content));
				}
				else if(format == "latex"){
					table.importFromJSON(table.latex.importTable(content));
				}
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
					if (fn(allCells[i], i) === false) {
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
				} else if (hm == 1) {
					$id("info_diag_one")
						.classList.add("active");
					this.diagonal();
				} else {
					$id("info_diag_zero")
						.classList.add("active");
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
			this.insertRowUnder = function(cell) {
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
			this.diagonal = function() {
				this.updateLaTeXInfoCell();
				this.forEachSelectedCell(function(cell) {
					if (!cell.hasAttribute("data-diagonal")) {
						if (cell.hasAttribute("data-two-diagonals")) {
							var toDel = cell.querySelector("div[contenteditable]");
							cell.setAttribute("data-two-diagonals-data", toDel.innerHTML);
							toDel.parentElement.removeChild(toDel);
							cell.removeAttribute("data-two-diagonals");
						} else {
							cell.querySelector(".outer")
								.innerHTML += "<div contenteditable>" + (cell.getAttribute("data-diagonal-data") || "[TEXT UNDER]") +
								"</div>";
						}
						cell.setAttribute("data-diagonal", "data-diagonal")
					}
				});
			}
			this.twoDiagonals = function() {
				this.updateLaTeXInfoCell();
				this.forEachSelectedCell(function(cell) {
					if (!cell.hasAttribute("data-two-diagonals")) {
						var div = cell.querySelector(".outer");
						if (cell.hasAttribute("data-diagonal")) {
							cell.removeAttribute("data-diagonal");
							div.innerHTML = "<div contenteditable>" + (cell.getAttribute("data-two-diagonals-data") || "[1]") +
								"</div>" + div.innerHTML;
						} else {
							div.innerHTML = "<div contenteditable>" + (cell.getAttribute("data-two-diagonals-data") || "[1]") +
								"</div>" + div.innerHTML + "<div contenteditable>" + (cell.getAttribute("data-diagonal-data") ||
									"[3]") + "</div>";
						}
						cell.setAttribute("data-two-diagonals", "data-two-diagonals");
					}
				});
			}
			this.rotate = function(state) {
				this.forEachSelectedCell(function(cell) {
					if (state) {
						cell.setAttribute("data-rotated", "data-rotated");
					} else {
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
			this.merge = function() {
				var _this = this;
				this.Table.merge(document.querySelectorAll("#table td[data-selected]"), function(colspan, rowspan, keep, removed) {
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
			this.setAlign = function(value) {
				if (value != "l" && value != "r" && value != "c") {
					value = "l";
				}
				$id("info_align_left")
					.classList.remove("active");
				$id("info_align_center")
					.classList.remove("active");
				$id("info_align_right")
					.classList.remove("active");
				this.forEachSelectedCell(function(cell) {
					cell.setAttribute("data-align", value);
				});
				$id({
						"l": "info_align_left",
						"c": "info_align_center",
						"r": "info_align_right"
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
			this.getHTML = function(cell) {
				return cell.querySelector("div[contenteditable]")
					.innerHTML;
			}
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
			this.selectCell = function(element, CTRL, SHIFT) {
				if (!CTRL) {
					this.removeAllSelection();
					this.showInfo(element);
					this.selectedCell = element;
				}
				if (SHIFT && false) { //TODO
					var actualSelected = document.querySelector("#table td[data-selected]");
				} else {
					if (CTRL && element.hasAttribute("data-selected")) {
						element.removeAttribute("data-selected");
					} else {
						element.setAttribute("data-selected", "data-selected");
					}
				}
			}
			this._id = function(id) {
				return document.getElementById(id)
			}
			this.showInfo = function(element) {
				document.querySelector("#latex_content")
					.value = this.generateForCell(element);

				$id("info_diag_zero")
					.classList.remove("active");
				$id("info_diag_one")
					.classList.remove("active");
				$id("info_diag_two")
					.classList.remove("active");
				if (element.hasAttribute("data-two-diagonals")) {
					$id("info_diag_two")
						.classList.add("active");
				} else if (element.hasAttribute("data-diagonal")) {
					$id("info_diag_one")
						.classList.add("active");
				} else {
					$id("info_diag_zero")
						.classList.add("active");
				}
				this._id("info_align_left")
					.classList.remove("active");
				this._id("info_align_center")
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
				} else {
					this._id("info_align_left")
						.classList.add("active");
				}
				if(element.hasAttribute("data-rotated")){
					this._id("info-rotated")
					.classList.add("active");
					this._id("info-unrotated").classList.remove("active")
				}
				else{
					this._id("info-unrotated").classList.add("active");
					this._id("info-rotated").classList.remove("active")
				}
			}
			this.applyToCell = function(td) {

				var div1 = document.createElement("div");
				div1.className = "outer";
				var div2 = document.createElement("div");
				div2.contentEditable = true;
				div2.innerHTML = "";
				div1.appendChild(div2);
				td.appendChild(div1);
				td.addEventListener("click", this._clickCellManager, false);
				return td;
			}
			this.split = function() {
				this.Table.split(document.querySelector("#table td[data-selected]"), this.applyToCell);
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
			this.undo = function() {
				// A better undo manager is on the way;
				if (document.queryCommandEnabled("undo")) {
					document.execCommand("undo");
				}
			}
			this.selectionAllowed = true;
			this.hasShownBorderEditorInfo = false;
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
					$id("button-mode-edit")
						.classList.remove("active");
					$id("button-mode-border")
						.classList.remove("active");
					$id("button-mode-view")
						.classList.remove("active");
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
								.classList.add("active");
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
						$id("button-mode-edit")
							.classList.add("active");
					}
				}
			}
			this.log = "";
			this.message = function(text, type) {
				this.log += text + "\n---------------\n";
			}
			this.importFromJSON = function(o) {
				if (o.autoBooktabs) {
					document.body.setAttribute("data-booktabs", "data-booktabs");
					$id("button-booktabs")
						.classList.add("active");
				} else {
					document.body.removeAttribute("data-booktabs");
					$id("button-booktabs")
						.classList.remove("active");
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
				var table = document.createDocumentFragment();
				for (var i = 0; i < o.cells.length; i++) {
					var row = o.cells[i],
						elem = document.createElement("tr");
					for (var j = 0; j < row.length; j++) {
						var cellO = row[j];
						var cell = document.createElement("td");
						cell = this.applyToCell(cell);
						if (cellO.dataset.diagonal) {
							cell.querySelector(".outer")
								.innerHTML += "<div contenteditable>" + cellO.html[1] +
								"</div>";
							this.setHTML(cell, cellO.html[0]);
						} else {
							this.setHTML(cell, cellO.html);
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
			}
			this.exportToJSON = function() {
				var o = {},
					table = this.element;
				o.autoBooktabs = table.hasAttribute("data-booktabs");
				o.caption = this.caption();
				o.cells = []
				for (var i = 0; i < table.rows.length; i++) {
					var cells = table.rows[i].cells;
					o.cells.push([]);
					for (var j = 0; j < cells.length; j++) {
						var cell = cells[j],
							cellO = {};
						cellO.dataset = cell.dataset;
						if (cell.dataset.diagonal) {
							cellO.html = [this.getHTML(cell), cell.querySelectorAll("div[contenteditable]")[1].innerHTML]
						} else {
							cellO.html = this.getHTML(cell);
						}
						if (cellO.dataset.selected) {
							delete cellO.dataset.selected;
						}
						cellO.css = cell.style.cssText;
						cellO.rowSpan = cell.rowSpan;
						cellO.colSpan = cell.colSpan;
						o.cells[o.cells.length - 1].push(cellO);
					}
				}
				return o;
			}
			this.insertEquation = function() {
				if (window.getSelection) {
					var sel = window.getSelection();
					if (sel.rangeCount) {
						var range = sel.getRangeAt(0);
						if (range) {
							var eq = document.createElement("span");
							eq.className = "latex-equation";
							eq.appendChild(range.extractContents())
							range.insertNode(eq);
							range.selectNodeContents(eq);
						}
					}
				}
			}
			this.saveToJSON = function() {
				var o = this.exportToJSON();
				document.getElementById('c')
					.value = JSON.stringify(o, null, "    ");
			}
			this.autoBooktabs = function() {
				var table = this.element;
				if (table.hasAttribute("data-booktabs")) {
					table.removeAttribute("data-booktabs");
					$id('button-booktabs')
						.className = "btn btn-default";
				} else {
					table.setAttribute("data-booktabs", "data-booktabs");
					$id('button-booktabs')
						.className = "btn btn-default active";
				}
			}
			this._clickCellManager = function(event) {
				if (table.selectionAllowed) {
					table.selectCell(this, event.ctrlKey, event.shiftKey);
				} else if (document.body.hasAttribute("data-border-editor")) {
					table.editBorder(this, event.pageX || event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
						event.pageY || event.clientY + document.body.scrollTop + document.documentElement.scrollTop);
				}
			}
			this.setBorder = function(element, pos, border, css) {
				var pos2 = pos.toLowerCase();
				if (element.getAttribute("data-border-" + pos2) == border) {
					element.removeAttribute("data-border-" + pos2);
					element.style["border" + pos] = "";
				} else {
					element.setAttribute("data-border-" + pos2, border);
					element.style["border" + pos] = css;
				}
			}
			this.setAllBorders = function() {
				var borderType = document.getElementById('border')
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
				this.forEachSelectedCell(function(cell) {
					var style = cell.style;
					style.borderTop = style.borderLeft = style.borderRight = style.borderBottom = "";
					cell.removeAttribute("data-border-top");
					cell.removeAttribute("data-border-left");
					cell.removeAttribute("data-border-right");
					cell.removeAttribute("data-border-bottom");
				});
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
			this.editBorder = function(element, x, y) {
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
					this.setBorder(element, "Top", borderType, border);
				} else if (pos.bottom - y < 4) {
					this.setBorder(element, "Bottom", borderType, border);
				} else if (x - pos.left < 4) {
					this.setBorder(element, "Left", borderType, border);
				} else if (pos.right - x < 4) {
					this.setBorder(element, "Right", borderType, border);
				}
			}
			this.loaded = false;
			this.element = null;
			this.load = function(table) {
				this.loaded = true;
				this.element = table;
				var _this = this;
				table.addEventListener("input", function(e) {
					var target = e.target || e.srcElement;
					target = target.nodeType == 3 ? target.parentElement : target;
					if (_this.selectedCell === (target.parentElement || {})
						.parentElement) {
						_this.updateLaTeXInfoCell();
					}
				}, false);
				table.addEventListener("click", function(e) {
					var target = e.currentTarget;
					if (target.tagName == "TD" || target.tagName == "TH") {
						_this._clickCellManager.apply(this, arguments);
					}
				}, false);



				document.execCommand("styleWithCSS", false, false);
				document.execCommand("insertBrOnReturn", false, false);
				this.Table = new Table(table);
			}
			this.generateFromHTML = function(html, ignoreMultiline) {
				var div = document.createElement("div");
				div.innerHTML = html;
				var el = div.querySelectorAll("span.latex-equation");
				var eq = []
				for (var i = 0; i < el.length; i++) {
					var kbd = document.createElement("kbd");
					eq.push(document.createTextNode("$" + (el[i].innerText || el[i].textContent) + "$"));
					el[i].parentNode.replaceChild(kbd, el[i]);
				}
				html = div.innerHTML;
				//ToDo : improve backslash
				html = html.replace(/\\/g, "\\textbackslash ")
					.replace(/(\$|\%|\{|\|\#)/ig, "\\$1").replace(/~/g, "\\textasciitilde");
				var hasMultiline = false;
				html = html.replace(/&nbsp;/g, "~")
					.replace(/\&/g, "\\&")
					.replace(/<br[/\s]*>/ig, function() {
						hasMultiline = true;
						return " \\\\ "
					});
				html = html.replace(/<(b|(strong))((\s+[^>]*)|)>/ig, "\\textbf{")
					.replace(/<(i|(em))[^>]*>/ig, "\\textit{")
					.replace(/<\s*\/\s*(b|(strong)|(em)|i)[^>]*>/ig, "}");
				html = html.replace(/(<((div)|p))/ig, function(a, b) {
						hasMultiline = true;
						return " \\\\ " + b
					})
					.replace(/(\[|\])/ig, "{$1}");
				div.innerHTML = html
				el = div.getElementsByTagName("kbd");
				for (var i = 0; i < el.length; i++) {
					el[i].parentNode.replaceChild(eq[i], el[i]);
				}
				var text = div.innerText || div.textContent;
				text = text.replace(/[ ]{2,}/g, " ")
					.replace(/[\n\r]+/g, "");
				if (hasMultiline && !ignoreMultiline) {
					text = "\\begin{tabular}[c]{@{}l@{}}" + text + "\\end{tabular}";
				}
				return text
			};

			this.generateForCell = function(cell) {
				var text = "";
				if (cell.hasAttribute("data-two-diagonals")) {
					var ce = cell.querySelectorAll("div[contenteditable]");
					this.packages["diagbox"] = true;
					text = "\\diagbox{" + this.generateFromHTML(ce[2].innerHTML) + "}{" + this.generateFromHTML(ce[0].innerHTML) + "}{" +
						this.generateFromHTML(ce[1].innerHTML) + "}"
				} else if (cell.hasAttribute("data-diagonal")) {
					var ce = cell.querySelectorAll("div[contenteditable]");
					if (this.blacklistPackages["diagbox"]) {
						this.packages["slashbox"] = true;
					} else {
						this.packages["diagbox"] = true;
					}
					text = "\\backslashbox{" + this.generateFromHTML(ce[0].innerHTML) + "}{" + this.generateFromHTML(ce[1].innerHTML) + "}";
				} else if (cell.hasAttribute("data-rotated")) {
					if (cell.rowSpan > 1) {
						if (this.blacklistPackages["makecell"]) {
							var inside = this.generateFromHTML(cell.querySelector("div[contenteditable]")
								.innerHTML, true)
							if (this.blacklistPackages["tabularx"]) {
								this.message("You may have to adjust the following value in one of your rotated cell : \"" + (cell.rowSpan - 0.2) + "\\normalbaselineskip\"");
								text = "\\begin{sideways}\\begin{tabular}{@{}p{" + (cell.rowSpan - 0.2) + "\\normalbaselineskip}@{}}" +
									inside + "\\end{tabular}\\end{sideways}";
								this.packages["rotating"] = true;
							} else {
								this.message("You may have to adjust the following value in one of your rotated cell : \"" + (cell.rowSpan) + "\\normalbaselineskip\"");
								text = "\\begin{sideways}\\begin{tabularx}{" + cell.rowSpan + "\\normalbaselineskip}{X}" + inside +
									"\\end{tabularx}\\end{sideways}";
								this.packages["rotating"] = this.packages["tabularx"] = true;
							}
						} else {
							text = "\\rotcell{" + this.generateFromHTML(cell.querySelector("div[contenteditable]")
								.innerHTML) + "}"
							this.packages["makecell"] = true;
						}
					} else {
						if (this.blacklistPackages["rotating"]) {
							text = "\\rotcell{" + this.generateFromHTML(cell.querySelector("div[contenteditable]")
								.innerHTML) + "}"
							this.packages["makecell"] = true;
						} else {
							text = "\\begin{sideways}" + this.generateFromHTML(cell.querySelector("div[contenteditable]")
								.innerHTML) + "\\end{sideways}"
							this.packages["rotating"] = true;
						}
					}
				} else if (cell.rowSpan > 1 && !this.blacklistPackages["makecell"] && !this.blacklistPackages["multirow"]) {
					text = "\\makecell{" + this.generateFromHTML(cell.querySelector("div[contenteditable]")
						.innerHTML, true) + "}";
					this.packages["makecell"] = true;
				} else {
					text = this.generateFromHTML(cell.querySelector("div[contenteditable]")
						.innerHTML);
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
			this.convertToHeader = function(simili) {
				var _this = this;
				return simili.replace(/[|=\^\#_;:]+/g, function(a) {
					var c = a.charAt(0);
					if (c == ":" || c == ";") {
						_this.packages["arydshln"] = true;
					}
					return {
						"|": "|",
						"^": "!{\\vrule width \\heavyrulewidth}",
						"=": "||",
						"#": "!{\\vrule width \\heavyrulewidth}",
						"_": "!{\\vrule width \\lightrulewidth}",
						":": ":",
						";": ";{1pt/1pt}"
					}[c] || ""
				});
			}
			this.createCellObject = function(before, cell, after) {
				if (arguments.length == 2) {
					var content = before,
						o = {
							refCell: cell
						};
					if (content === false) {
						o.ignore = true;
					} else {
						o.content = o.fullContent = content;
					}
					return o;
				}
				var o = {
					cell: cell,
					ignore: false,
					before: before,
					after: after,
					leftBorder: cell.getAttribute("data-border-left") || "",
					rightBorder: cell.getAttribute("data-border-right") || "",
					content: this.generateForCell(cell),
					header: this.getHeaderForCell(cell),
					align: cell.getAttribute("data-align") || "l"
				}
				o.fullContent = before + "" + o.content + "" + after;
				return o;
			}
			this.createCellO = function(o, row){
				var before = row[o.x-1],
				    after = row[o.x+1],
				    cell = o.cell,
				    blockMultirow = this.blacklistPackages["multirow"];
				o.align = cell.getAttribute("data-align") || "l"
				o.content = this.generateForCell(cell);
				o.fullHeader = this.convertToHeader(this.getContextualHeader(before, o, after));
				o.header = this.convertToHeader(this.getComparableHeader(before, o, after));
				o.span = (cell.rowSpan != 1 || cell.colSpan != 1);
				o.static = false;
				o.leftBorder = cell.getAttribute("data-border-left") || "";
				if(!o.leftBorder && before){
					o.leftBorder = (before.refCell||before).cell.getAttribute("data-border-right") || ""
				}
				o.rightBorder = cell.getAttribute("data-border-right") || "";
				if(!o.rightBorder && after){
					o.rightBorder = (after.refCell||after).cell.getAttribute("data-border-left") || ""
				}
				o.fullContent = o.content;
				if(o.span){
					if(cell.rowSpan != 1){
						this.packages["multirow"] = true;
						if(cell.colSpan != 1){
							if(blockMultirow){
								o.fullContent = this.multicolumn(cell.colSpan, o.header, o.content);
							}
							else{
								o.fullContent = this.multicolumn(cell.colSpan, o.header, 
												this.multirow(cell.rowSpan, o.content)
												);
								o.static = true;
							}
						}
						else{
							if(blockMultirow){
								o.fullContent = o.content;
							}
							else{
								o.fullContent = this.multirow(cell.rowSpan, o.content);
							}
						}
					}
					else{
							o.fullContent = this.multicolumn(cell.colSpan, o.header, o.content);
							o.static = true;
					}
				}
			}
			this.multicolumn = function(span, header, content){
				return "\\multicolumn{"+span+"}{" + header + "}{" + content + "}";
			}
			this.multirow = function(span, content){
				return "\\multirow{"+span+"}{*}{"+content+"}";
			}
			this.matrix = function(){
				var table = this.element,
				    result = this.Table.matrix();
				for(var i=0;i<result.length;i++){
					var row = result[i];
					for(var j=0;j<row.length;j++){
						var cell = row[j];
						if(!cell.refCell){
							this.createCellO(cell, row);
						}
						else if(cell.refCell.x == cell.x){
							// ROWSPAN
							var refCell = cell.refCell;
							cell.ignore = false;
							cell.header = refCell.header;
							cell.fullHeader = refCell.fullHeader;
							if(refCell.cell.colSpan != 1){
								cell.fullContent = "\\multicolumn{" + refCell.colSpan + "}{" + refCell.header + "}{}";
								cell.static = true;
							}
							else{
								cell.fullContent = "";
								cell.static = false;
							}
						}
						else{
							// COLSPAN
							cell.ignore = true;
						}
					}
				}
				return result;
			}
			this.getMatrixOfCells = function() {

				var table = this.element,
					rg = [],
					maxCols = 0,
					rows = table.rows;
				for (var i = 0; i < rows.length; i++) {
					rg.push([]);
				}
				for (var i = 0; i < rows.length; i++) {
					var row = rows[i],
						realCol = 0;
					for (var j = 0; j < row.cells.length; j++) {
						var cell = row.cells[j],
							cellHeader = this.getHeaderForCell(cell);
						if (typeof rg[i][realCol] != "object" && rg[i][realCol] !== false) {
							if (!cell.rowSpan || cell.rowSpan < 2) {
								if (!cell.colSpan || cell.colSpan < 2) {
									rg[i][realCol] = this.createCellObject("", cell, "");
								} else {
									var o = rg[i][realCol] = this.createCellObject("\\multicolumn{" + cell.colSpan + "}{" + cellHeader +
										"}{", cell, "}");
									for (var k = 1; k < cell.colSpan; k++) {
										rg[i][realCol + k] = this.createCellObject(false, o);
									}
								}
							} else {
								this.packages["multirow"] = true;
								var o;
								if (!cell.colSpan || cell.colSpan < 2) {
									o = rg[i][realCol] = this.createCellObject("\\multirow{" + cell.rowSpan + "}{*}{", cell, "}");
								} else {
									o = rg[i][realCol] = this.createCellObject("\\multicolumn{" + cell.colSpan + "}{" + cellHeader +
										"}{\\multirow{" + cell.rowSpan + "}{*}{", cell, "}}");
								}
								for (var k = 0; k < cell.rowSpan; k++) {
									for (var l = 0; l < cell.colSpan; l++) {
										// I hate four-level loops
										if (l == 0 && k != 0) {
											if (cell.colSpan > 1) {
												rg[i + k][realCol] = this.createCellObject("\\multicolumn{" + cell.colSpan + "}{" +
													cellHeader + "}{}", o);
											} else {
												rg[i + k][realCol] = this.createCellObject("", o)
											}
										} else if (l != 0 || k != 0) {
											rg[i + k][realCol + l] = this.createCellObject(false, o);
										}
									}
								}
							}
						} else {
							j--;
						}
						realCol++;
					}
				}
				return rg;
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
				if (this.selectedCell) {
					this.Table.removeRow(this.selectedCell.parentElement.rowIndex);
				}
			}
			this.removeCol = function() {
				if (this.selectedCell) {
					this.Table.removeCol(this.Table.position(this.selectedCell)
						.x);
				}
			}
			this.getContextualHeader = function(before, middle, after) {
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
					leftBorder = before.getAttribute("data-border-right");
				}
				leftBorder = o[leftBorder || (middle.getAttribute("data-border-left") || "")] || "";
				rightBorder = middle.getAttribute("data-border-right");
				if (after && !rightBorder) {
					rightBorder = after.getAttribute("data-border-left");
				}
				rightBorder = o[rightBorder || ""] || "";
				return leftBorder + align + rightBorder;
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
				var format = $id("format")
					.value;
				this.log = "";
				if (format == "latex") {
					$id("c")
						.value = this.generateLaTeX();
				} else {
					this.interpret(format);
				}
				this.message("Generated in " + ((+new Date()) - start) + "ms");
				$id("log")
					.value = "Log (" + ((new Date())
						.toLocaleTimeString()) + ")\n=========\n" + this.log;
			}
			this.headers = function(matrix){
				matrix = matrix || this.matrix();
				var headers = [], colHeaders = [];
				for(var i=0;i<matrix.length;i++){
					var row = matrix[i];
					for(var j=0;j<row.length;j++){
						var cell = row[j];
						if(cell && !cell.ignore){
							var align = (cell.refCell||cell).header;
							if (!headers[j]) {
								headers[j] = {}
							}
							var headernow = headers[j];
							if(!headernow[align]){
								headernow[align] = 0;
							}
							headernow[align]++;
						}
					}
				}
				for (var i = 0; i < headers.length; i++) {
					var max = 0,
						value = "",
						headernow = headers[i];
					for (var j in headernow) {
						if (headernow.hasOwnProperty(j) && headernow[j] > max) {
							max = headernow[j];
							value = j;
						}
					}
					colHeaders.push(value);
				}
				return colHeaders;
			}
			this.generateLaTeX = function(opt) {
				this.packages = {}
				var table = this.element,
					caption = this.caption(),
					booktabs = table.hasAttribute("data-booktabs"),
					rg = this.matrix(),
					border;
				// Determine header
				var colHeaders = this.headers(),
				header = colHeaders.join("");
				var str = "\\begin{table}[]\n";
				if(this._id("table-opt-center").checked){
					str += "\\centering\n"
				}
				if (caption.caption) {
					str += "\\caption" + (caption.numbered ? "*" : "") + "{" + caption.caption + "}\n";
				}
				if (!caption.numbered && caption.label) {
					str += "\\label{" + caption.label + "}\n";
				}
				str += "\\begin{tabular}{" + header + "}";
				for (var i = 0; i < rg.length; i++) {
					var cells = rg[i];
					if (i === 0 && booktabs) {
						border = " \n\\toprule";
					} else {
						border = this.getBorder(i, rg);
						border = border ? " \n" + border : ""
					}
					if (i !== 0) {
						str += " \\\\" + border
					} else {
						str += border;
					}
					str += "\n"
					for (var j = 0; j < cells.length; j++) {
						header = colHeaders[j] || "l";
						var cell = cells[j];
						if (j !== 0 && cell !== false && !cell.ignore) {
							str += " & ";
						}
						if (cell !== false && !cell.ignore) {
							if(!cell.static && cell.header != header){
								str += this.multicolumn(1, cell.header, cell.fullContent);
							}
							else{
								str += cell.fullContent;
							}
						}
					}
				}
				if (booktabs) {
					str += "\\\\\n\\bottomrule"
				} else {
					border = this.getBorder(rg.length, rg);
					if (border) {
						str += "\\\\\n" + border;
					}
				}
				str += "\n\\end{tabular}\n\\end{table}";
				// Booktabs
				if (/\\(bottomrule)|(toprule)|(midrule)|(cmidrule)|(heavyrulewidth)|(lightrulewidth)/.test(str)) {
					this.packages["booktabs"] = true;
				}
				// arydshln
				if (/\\(cdashline|hdashline)/.test(str)) {
					this.packages["arydshln"] = true;
				}
				// Packages
				var packages = "";
				for (var i in this.packages) {
					if (this.packages.hasOwnProperty(i) && i != "arydshln") {
						packages += "% \\usepackage{" + i + "}\n";
					}
				}
				if (this.packages["arydshln"]) {
					// Compatibility between packages
					packages += "% \\usepackage{arydshln}\n";
				}
				/* Show some message*/
				if (this.element.querySelector("td[data-two-diagonals]")) {
					this.message(
						"If you get an '! FP error: Logarithm of negative value!.' error, the content of the bottom part of one of your cells with two diagonals is too long."
					)
				}
				return (packages ? packages + "\n\n" : "") + str;
			}
			this.extract = (function() {
				function borderInfo(cell, o) {
					var style = cell.style,
						css = "",
						types = {
							"solid": ["normal", "1px solid black"],
							"double": ["double", "2px solid black"],
							"dashed": ["hdashline", "1px dashed black"],
							"dotted": ["dottedline", "1px dotted black"]
						},
						first = "";
					["Left", "Right", "Bottom", "Top"].forEach(function(val) {
						var type = style["border" + val + "Style"];
						if (type && type != "none") {
							var valLC = val.toLowerCase(),
								res = types[type] || ["normal", "1px solid black"];
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
				}
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
								o2.html = [getHTML(cell.innerHTML), ""]
							} else {
								o2.html = getHTML(cell.innerHTML);
							}
							o2.css = borderInfo(cell, o2);
							o2.rowSpan = cell.rowSpan;
							o2.colSpan = cell.colSpan;
							o.cells[i][j] = o2;
						}
					}
					this.importFromJSON(o);
				}
			})()
			this.hBorder = function(n, callback, matrix) {
				var row = matrix[Math.max(0, (n || 0) - 1)];
				if (!row) {
					return callback.call(this)
				}
				var border = "",
					subBorder = {},
					always = true;
				if (n == 0) {
					for (var i = 0; i < row.length; i++) {
						if (row[i].refCell) {
							always = false;
							continue;
						}
						var cell = row[i].cell,
							bd = cell.getAttribute("data-border-top");
						if (bd) {
							if (!subBorder[bd]) {
								subBorder[bd] = []
							}
							for (var j = 0; j < cell.colSpan; j++) {
								subBorder[bd].push(i);
								i++;
							}
							i--;
							if (border == "") {
								border = bd;
							} else if (border != bd) {
								always = false;
							}
						} else {
							always = false;
						}
					}
				} else {
					var row2 = matrix[n] || [];
					for (var i = 0; i < row.length; i++) {
						var cell = row[i];
						cell = cell.cell || cell.refCell.cell;
						if (cell.parentElement.rowIndex + cell.rowSpan != n) {
							always = false;
							continue;
						}
						var bd = cell.getAttribute("data-border-bottom");
						if (!bd && row2[i]) {
							var cell = row2[i];
							if (cell.cell || (cell.refCell.cell.rowIndex == n + 1)) {
								bd = (cell.cell || cell.refCell.cell)
									.getAttribute("data-border-top");
							}
						}
						if (bd) {
							if (!subBorder[bd]) {
								subBorder[bd] = []
							}
							subBorder[bd].push(i);
							if (border == "") {
								border = bd;
							} else if (border != bd) {
								always = false;
							}
						} else {
							always = false;
						}
					}
				}
				return callback.call(this, always, border, subBorder);
			}
			this.prepareDownload = function() {
				var latex = this.generateLaTeX();
				latex = latex.replace(/^%\s*usePack/mg, "usePack");
				latex = "\\documentclass{article}\n" + latex;
				latex = latex.replace(/\\begin{tabl/, "\\begin{document}\n\\begin{tabl") + "\n\\end{document}";
				var link = "data:application/x-tex;base64," + btoa(latex);
				$id("link-download")
					.href = link;
				$('#download')
					.modal('show');
			}
			this.getBorder = function(n, matrix) {
				return this.hBorder(n, function(always, border, subBorder) {
					if (arguments.length == 0) {
						return ""
					}
					if (always) {
						return {
							normal: "\\hline",
							double: "\\hline\\hline",
							toprule: "\\toprule",
							midrule: "\\midrule",
							bottomrule: "\\bottomrule",
							hdashline: "\\hdashline",
							dottedline: "\\hdashline[1pt/1pt]"
						}[border];
					} else {
						border = ""
						var o = {
							normal: "\\cline",
							toprule: "\\cmidrule[\\heavyrulewidth]",
							midrule: "\\cmidrule",
							bottomrule: "\\cmidrule[\\heavyrulewidth]",
							hdashline: "\\cdashline",
							dottedline: "\\cdashline"
						}
						if (!subBorder["double"] || subBorder.toprule || subBorder.midrule || subBorder.bottomrule) {
							for (var i in subBorder) {
								if (subBorder.hasOwnProperty(i)) {
									var bd = subBorder[i],
										actu = -2,
										start = -2;
									for (var j = 0; j < bd.length + 1; j++) {
										var nb = (j < bd.length) ? bd[j] : -7;
										if (actu + 1 != nb) {
											if (start >= 0) {
												if (i == "double") {
													// Rare case
													var part = "\\cmidrule{" + (start + 1) + "-" + (actu + 1) + "}";
													border += part + "\\morecmidrule" + part;
												} else {
													border += o[i] + "{" + (start + 1) + "-" + (actu + 1) + "}";
													if (i == "dottedline") {
														border += "[1pt/1pt]";
													}
												}
											}
											start = nb;
										}
										actu = nb
									}
								}
							}
						} else {
							// Another rare case when there's Double subrules. We'll use hhline for this.
							// TODO
							var length = matrix[n].length;
							var arrBorder = [];
							var row = matrix[n-1] || matrix[n]
							for(var i in subBorder){
								if(subBorder.hasOwnProperty(i)){
									var sb = subBorder[i];
									for(var j=0;j<sb.length;j++){
										arrBorder[+sb[j]] = i;
									}
								}
							}
							this.packages["hhline"] = true;
							border = "\\hhline{";
							for(var i=0;i<length;i++){
								sb = arrBorder[i];
								if(i == 0){
									var borderLeft = (row[i].refCell||row[i]).leftBorder;
									if(borderLeft == "normal"){
										border += "|";
									}
									else if(borderLeft == "double"){
										border += "||";
									}
								}
								if(!sb){
									border += "~";
								}
								else if(sb == "double"){
									border+="="; 
								}
								else{
									border += "-";
								}
								var borderRight = (row[i].refCell||row[i]).rightBorder;
								if(borderRight == "normal"){
									border += "|";
								}
								else if(borderRight == "double"){
									border += "||";
								}
							}
							border += "}";
						}
					}
					return border;
				}, matrix);
			}
		})()
	window.table = table;
})();
window.addEventListener("beforeunload", function() {
	if (window.table) {
		localStorage.setItem("table", JSON.stringify(table.exportToJSON()));
		if ($id("format")) {
			localStorage.setItem("table_format", $id("format")
				.value);
		}
	}
}, false);