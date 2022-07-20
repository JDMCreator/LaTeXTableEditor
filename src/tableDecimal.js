 (function() {
 	"use strict";
 	// This function returns a matrix of cells from a table
 	// to handle colspan and rowspan
 	// It was already used in my latex-table project
 	// https://gist.github.com/JDMCreator/840c2ad3de2506522a8748a36979ecf8

 	function getMatrixOfCells(table, alwaysInterpretZeroRowSpan) {
 		var rg = [],
 			expandCells = [],
 			rows = table.rows;
 		for (var i = 0; i < rows.length; i++) {
 			rg.push([]);
 		}
 		for (var i = 0; i < rows.length; i++) {
 			var row = rows[i],
 				realCol = 0;
 			for (var j = 0; j < row.cells.length; j++) {
 				var cell = row.cells[j];
 				if (typeof rg[i][realCol] != "object" && rg[i][realCol] !== false) {
 					var rowSpan = alwaysInterpretZeroRowSpan ? parseInt(cell.getAttribute("rowSpan"), 10) : cell.rowSpan;
 					rowSpan = Math.floor(Math.abs(isNaN(rowSpan) ? 1 : rowSpan));
 					if (rowSpan === 0 && !alwaysInterpretZeroRowSpan && cell.ownerDocument &&
 						cell.ownerDocument.compatMode == "BackCompat") {
 						rowSpan = 1;
 					}
 					if (rowSpan == 1) {
 						if (!cell.colSpan || cell.colSpan < 2) {
 							rg[i][realCol] = {
 								cell: cell,
 								x: realCol,
 								y: i
 							}
 						} else {
 							var o = rg[i][realCol] = {
 								cell: cell,
 								x: realCol,
 								y: i
 							};
 							for (var k = 1; k < cell.colSpan; k++) {
 								rg[i][realCol + k] = {
 									refCell: o,
 									x: realCol + k,
 									y: i
 								};
 							}
 						}
 					} else {
 						var o = rg[i][realCol] = {
 							cell: cell,
 							x: realCol,
 							y: i
 						};
 						if (rowSpan === 0) {
 							expandCells.push(o);
 						}
 						for (var k = 0, kl = Math.max(rowSpan, 1); k < kl; k++) {
 							for (var l = 0; l < cell.colSpan; l++) {
 								// I hate four-level loops
 								if (!(k === 0 && l === 0)) {
 									o = rg[i + k][realCol + l] = {
 										refCell: o,
 										x: realCol + l,
 										y: i + k
 									}
 									if (rowSpan === 0) {
 										expandCells.push(o);
 									}
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
 		if (expandCells.length) {
 			for (var i = 0; i < expandCells.length; i++) {
 				var expandCell = expandCells[i],
 					x = expandCell.x,
 					y = expandCell.y;
 				for (var j = y + 1; j < rg.length; j++) {
 					rg[j].splice(x, 0, {
 						x: x,
 						y: j,
 						refCell: (expandCell.refCell || expandCell)
 					});
 					for (var h = x + 1; h < rg[j].length; h++) {
 						rg[j][h].x += 1;
 					}
 				}
 			}
 		}
 		return rg;
 	}

 	function getDecimalOffset(element, chars, left) {
 		var text = element.innerText;
 		var found = false;
 		for (var i = 0; i < chars.length; i++) {
 			if (text.indexOf(chars[i]) > -1) {
 				found = true;
 				break;
 			}
 		}
 		if (!found) {
 			if (!left) {
 				return -1;
 			} else {
 				var range = document.createRange();
 				range.selectNodeContents(element);
 				return [range.getBoundingClientRect().width, 0]
 			}
 		}
 		var treeWalker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
 		treeWalker.nextNode();
 		var currentNode = treeWalker.currentNode;
 		var charPos = -1;
 		treeWalkerLoop: while (currentNode) {
 			var found = false;
 			for (var i = 0; i < chars.length; i++) {
 				if ((charPos = currentNode.nodeValue.indexOf(chars[i])) > -1) {
 					found = true;
 					break treeWalkerLoop;
 				}
 			}
 			currentNode = treeWalker.nextNode();
 		}
 		if (!found) {
 			// Shouldn't happen;
 			return -1;
 		}

 		// We now apply a range to get the bounding client rect

 		var range = document.createRange();
 		range.selectNodeContents(currentNode);
 		if (left) {
 			range.setEnd(currentNode, charPos);
 		} else {
 			range.setStart(currentNode, charPos);
 		}
 		var rect = range.getBoundingClientRect();
 		return [rect.width, rect.width];
 	}
 	var tableDecimal = function tableDecimal(element, opt) {
 		this.element = typeof element == "string" ? document.querySelector(element) : element;
 		this.opt = opt;
 		this.opt.attributeChar = this.opt.attributeChar || "data-char";
 		this.opt.textAlign = this.opt.textAlign == "left" ? "left" : "right";
 		this.opt.ignore = this.opt.ignore || "";
 		this.paused = false;
 		this.observer = false;
 		this.pause = function() {
 			this.paused = true;
 		}
 		this.apply = function() {
 			var perf = performance.now();
 			var cols = [];
 			var matrix = getMatrixOfCells(this.element);
 			for (var i = 0; i < matrix.length; i++) {
 				var row = matrix[i];
 				cellLoop: for (var j = 0; j < row.length; j++) {
 					var cell = row[j];
 					if (cell.refCell || (this.opt.ignore && cell.cell.matches(this.opt.ignore))) {
 						continue cellLoop;
 					}
 					var cellNode = cell.cell;
 					var attr = cellNode.getAttribute(this.opt.attributeChar) ||
 						cellNode.parentElement.getAttribute(this.opt.attributeChar);
 					if (attr && (!this.opt.attributeCharValue || (attr == this.opt.attributeCharValue))) {
 						if (!cols[cell.x]) {
 							cols[cell.x] = []
 						}
 						cols[cell.x].push({
 							element: cellNode,
 							decimal: getDecimalOffset(cellNode, this.opt.char || attr, this.opt.textAlign == "left")
 						});
 					}
 				}
 			}
 			for (var i = 0; i < cols.length; i++) {
 				var max = 0;
 				var col = cols[i];
				if(!col){continue;}
 				for (var j = 0; j < col.length; j++) {
 					if (col[j].decimal != -1) {
 						max = Math.max(max, col[j].decimal[0]);
 					}
 				}
 				for (var j = 0; j < col.length; j++) {
 					var decimal = col[j].decimal[0] || 0;
 					var paddingElement = col[j].element;
 					if (this.opt.paddingElement) {
 						paddingElement = paddingElement.querySelector(this.opt.paddingElement);
 					}
 					if (!paddingElement) {
 						continue;
 					}
 					if (this.opt.textAlign == "left") {
 						paddingElement.style.paddingLeft = (max - decimal) + "px";
 						paddingElement.style.textAlign = "left";
 					} else {
 						paddingElement.style.paddingRight = (max - decimal) + "px";
 						paddingElement.style.textAlign = "right";
 					}
 				}
 			}
 		}
 		this.load = function() {
 			this.apply();
 			if (this.opt.observe) {
 				var _this = this;
 				this.observer = new MutationObserver(function(mutationList) {
					var shouldApply = false;
 					mutationList.forEach(function(mutation) {
 						if (mutation.type == "attributes") {
 							if (!mutation.target.hasAttribute(_this.opt.attributeChar) ||
 								(_this.opt.attributeCharValue && mutation.target.getAttribute(_this.opt.attributeChar) != _this.opt.attributeCharValue)) {
 								// Kill
 								var paddingElement = mutation.target;
								shouldApply = true;
 								if (_this.opt.paddingElement) {
 									paddingElement = paddingElement.querySelector(_this.opt.paddingElement);
 								}
 								if (paddingElement) {
 									paddingElement.style.textAlign = "";
 									if (_this.opt.textAlign == "left") {
 										paddingElement.style.paddingLeft = "";
 									} else {
 										paddingElement.style.paddingRight = ""
 									}
 								}
 							}
 						}
 					});
					if(shouldApply || !_this.opt.observeFilter || _this.opt.observeFilter.call(_this, mutationList)){
 						_this.apply();
					}
 				});

 				this.observer.observe(this.element, {
 					subtree: true,
 					characterData: true,
 					attributes: true,
					childList: true,
 					attributeFilter: [this.opt.attributeChar]
 				});
 			}
 		}
 		if (!this.element.offsetTop && !this.element.offsetWidth) {
 			// this element is not part of the DOM
 			// We'll have to delay the process
 			// using CSS animations to detect when it is added to the DOM
 		} else {
 			this.load();
 		}
 	};
 	window.tableDecimal = function(element, opt) {
 		return new tableDecimal(element, opt || {});
 	}

 })();