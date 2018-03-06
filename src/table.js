(function(){
"use strict"
var ensureArray = function(array){
	if(!array){return []}
	if(typeof array == "string"){
		return [array]
	}
	return Array.prototype.slice.call(array);
},
insideArray = function(arr, elem){
	for(var i=0;i<arr.length;i++){
		if(arr[i] == elem){
			return true;
		}
	}
	return false;
},
travelThruTable = function(cell, matrix, str){
	var results = [],
	x = cell.x,
	y = cell.y,
	actualCell = cell,
	lastOperator=">";
	for(var i=0, c,sb,pat;i<str.length;i++){
		c = str.charAt(i),
		sb = str.substr(i);
		if(/^[><+\\-]$/.test(c)){
			lastOperator = c;
			if(c==">"){
				x+=actualCell.cell.colSpan;
			}
			else if(c=="<"){
				x--;
			}
			else if(c=="+"){
				y--;
			}
			else if(c=="-"){
				y+=actualCell.cell.rowSpan;
			}
			else if(c=="\\"){
				y+=actualCell.cell.rowSpan;
				x+=actualCell.cell.colSpan;
			}
			if(y<0 || y>= matrix.length || x<0 || x>=matrix[y].length){
				return [];
			}
			actualCell = matrix[y][x];
			if(actualCell.refCell){actualCell=actualCell.cell}
			x = actualCell.x; y=actualCell.y;
		}
		else if(pat=/^\d+[:a-z]*/i.exec(sb)){
			var nb = parseInt(/^\d/.exec(sb)[0],10);
			if(nb===0 && i===0){results.push(actualCell);i+=pat[0].length-1;continue;}
			for(var j=0;j<nb;j++){
				if(j>0){
					var c = lastOperator;
					if(c==">"){
					x+=actualCell.cell.colSpan;
					}
					else if(c=="<"){
						x--;
					}
					else if(c=="+"){
						y--;
					}
					else if(c=="-"){
						y+=actualCell.cell.rowSpan;
					}
					else if(c=="\\"){
						y+=actualCell.cell.rowSpan;
						x+=actualCell.cell.colSpan;
					}
					if(y<0 || y>= matrix.length || x<0 || x>=matrix[y].length){
						return [];
					}
					actualCell = matrix[y][x];
					if(actualCell.refCell){actualCell=actualCell.cell}
					x = actualCell.x; y=actualCell.y;
				}
				results.push(actualCell);
			}
		}
		else if(/[.]{3}\s*$/.test(sb)){
			return results.concat(travelThruTable(actualCell, matrix, str))
		}

	}
	return results;
},
matchCell = function(){
	return true;
},
sortCellsByOrder = function(cellObjects){
	var obj = {}, arr = [], arr2=[];
	for(var i=0, cell;i<cellObjects.length;i++){
		cell = cellObjects[i];
		obj[cell.y*1e9+cell.x] = cell.cell;
	}
	for(var i in obj){
		if(obj.hasOwnProperty(i)){
			arr.push({order:i, cell:obj[i]});
		}
	}
	arr.sort(function (a, b) {  return a.order - b.order;  });
	for(var i =0;i<arr.length;i++){
		arr2.push(arr[i].cell);
	}
	return arr2;
},
Table = function(table){
		var cache = {};
		this.element = table;
		this.isAChildCell = function(cell){
			if(!Table.isACell(cell)){
				return false;
			}
			while(cell = cell.parentElement){
				if(cell == this.element){
					return true;
				}
				else if(Table.isACell(cell)){
					return false;
				}
			}
			return false;
		}
		this.normalize = function(matrix){
			matrix = matrix || this.matrix();
			// First, we adjust rowspan attribute
			var change = false;
			rowLoop: for(var i=0, row;i<matrix.length;i++){
				row = matrix[i];
				for(var j=0, cell;j<row.length;j++){
					cell = row[j];
					if(!cell.refCell){
						continue rowLoop;
					}
				}
				change = true;
				for(var j=0, cell;j<row.length;j++){
					cell = row[j];
					cell.refCell.cell.rowSpan -= 1;
					j += cell.refCell.cell.colSpan-1;
				}
			}
			// We calculate the max column
			var colLength = 0;
			for(var i=0;i<matrix.length;i++){
				colLength = Math.max(colLength, matrix[i].length);
			}
			// Then, we adjust colspan attribute
			colLoop: for(var j=0;j<colLength;j++){
				for(var i=0, cell;i<matrix.length;i++){
					cell = matrix[i][j];
					if(cell && !cell.refCell){
						continue colLoop;
					}
				}
				change = true;
				for(var i=0, cell;i<matrix.length;i++){
					cell = matrix[i][j];
					if(cell){
						cell.refCell.cell.colSpan -= 1;
						i += cell.refCell.cell.rowSpan - 1;
					}
				}
			}
			var rows = table.rows;
			// Then, we remove all empty rows
			for(var i=0, row;i<rows.length;i++){
				row = rows[i];
				if(row && row.cells.length <= 0){
					// Remove empty row
					row.parentNode.removeChild(row);
					i--;
					change = true
				}
			}
			// We might refresh the matrix and the max length of rows
			// TODO : Improve speed (maybe adjust the matrix on the fly?)
			if(change){
				colLength = 0;
				matrix = this.matrix()
				for(var i=0;i<matrix.length;i++){
					colLength = Math.max(colLength, matrix[i].length);
				}
			}
			// Then, we expand the colspan of cells if there are empty cells
			for(var i=0, cells;i<matrix.length;i++){
				if(rows[i]){
					cells = rows[i].cells;
					if(matrix[i].length < colLength && cells && cells[0]){
						cells[cells.length-1].colSpan += colLength-cells.length;
						change = true;
					}
				}
			}
			return true;
		}
		this.clearCache = function(){
			cache = {};
		}
		this.removeCol = function(nb){
			if(!nb && nb!==0 && nb!=="0"){
				nb=-1;
			}
			var table = this.element,
			matrix = this.matrix();
			for(var i=0;i<matrix.length;i++){
				var nb2, row=matrix[i];
				if(nb<0){
					nb2 = row.length+nb;
					if(nb2<0){
						nb2=0
					}
				}
				else if(nb>=row.length){
					nb2 = row.length-1;
				}
				else{
					nb2=nb;
				}
				var cell = row[nb2];
				if(cell){
					i+=(cell.refCell||cell).cell.rowSpan-1;
					if(cell.refCell){
						cell.refCell.cell.colSpan-=1;
					}
					else{
						if(cell.cell.colSpan > 1){
							cell.cell.colSpan-=1;
						}
						else{
							cell.cell.parentElement.removeChild(cell.cell);
						}
					}
				}
			}
		}
		this.removeRow = function(nb){
			if(!nb && nb!==0 && nb!=="0"){
				nb=-1;
			}
			var table = this.element,
			matrix = this.matrix();
			if(nb<0){
				nb=matrix.length+nb;
				if(nb<0){nb=0}
			}
			else if(nb>=matrix.length){
				nb=matrix.length-1;
			}
			var row = matrix[nb], nextrow = matrix[nb+1];
			for(var i=0;i<row.length;i++){
				var cell = row[i];
				if(cell.refCell){
					if(cell.refCell.cell.rowSpan>1){
						cell.refCell.cell.rowSpan-=1;
					}
				}
				else if(cell.cell.rowSpan > 1 && nextrow){
					if(cell.cell.rowSpan!==0){
						cell.cell.rowSpan-=1;
					}
					var before = nextrow[i];
					for(var j=i;j<nextrow.length;j++){
						if(nextrow[j].cell){
							before=nextrow[j].cell;
							j=nextrow.length;
						}
					}
					table.rows[nb+1].insertBefore(cell.cell, before);					
				}
				i+=(cell.refCell||cell).cell.colSpan-1;
			}
			table.rows[nb].parentElement.removeChild(table.rows[nb]);
		}
		this.insertCol = function(nb, callback){
			if(!nb && nb!==0 && nb!=="0"){
				nb=-1;
			}
			var table = this.element,
			td,
			matrix = this.matrix();
			for(var i=0;i<matrix.length;i++){
				var nb2, row=matrix[i];
				if(nb<0){
					nb2 = row.length+nb+1;
					if(nb2<0){
						nb2=0
					}
				}
				else if(nb>row.length){
					nb2 = row.length;
				}
				else{
					nb2=nb;
				}
				var copycell, cell;
				if(nb2===0){
					copycell = matrix[i][nb2]
				}
				else{
					copycell = matrix[i][nb2-1]
				}
				var actualCell = matrix[i][nb2-1];
				if(actualCell && (actualCell.refCell||actualCell.cell.colSpan != 1)){
					(actualCell.refCell||actualCell).cell.colSpan+=1
					i+=(actualCell.refCell||actualCell).cell.rowSpan-1;
				}
				else{
					actualCell = matrix[i][nb2]
					var i2 = i;
					if(copycell){
						copycell = (copycell.cell||copycell.refCell)
						cell = document.createElement(copycell.tagName);
						cell.rowSpan = copycell.rowSpan;
						i+=copycell.rowSpan-1;
					}
					else{
						cell = document.createElement("TD");
					}
					if(callback){
						callback.call(this, cell);
					}
					table.rows[i2].insertBefore(cell, actualCell ? actualCell.cell : null);
				}	
			}
		}
		this.insertRow = function(nb, callback){
			if(!nb && nb!==0 && nb!=="0"){
				nb=-1;
			}
			var table = this.element,
			tr = document.createElement("tr"),
			matrix = this.matrix();
			if(nb<0){
				nb = matrix.length+nb+1;
				if(nb<0){nb=0}
			}
			else if(nb>matrix.length){
				nb = matrix.length;
			}
			var copyrow, actualRow = matrix[nb];
			if(nb==0){
				copyrow=matrix[nb]
			}
			else{
				copyrow = matrix[nb-1]
			}
			if(copyrow){
				for(var i=0;i<copyrow.length;i++){
					var copycell = copyrow[i],
					actualCell = (actualRow||[])[i],
					cell;
					if(copycell && (copycell.refCell || copycell.cell.rowSpan != 1)){
						(copycell.refCell||copycell).cell.rowSpan+=1;
						i+=(copycell.refCell||copycell).cell.colSpan-1;
					}
					else{
						copycell = copycell.cell||copycell.refCell
						cell = document.createElement(copycell.tagName);
						cell.colSpan = copycell.colSpan;
						i+= copycell.colSpan-1;
						if(callback){callback.call(this,cell)}
						tr.appendChild(cell);
					}
				}
			}
			else{
				var cell = document.createElement("td");
				if(callback){callback.call(this,cell)}
				tr.appendChild(cell);
			}
			((table.rows[0]||{}).parentElement||table).insertBefore(tr,table.rows[nb]);
			
		}
		this.split = function(cells, callback){
			if(cells.tagName){
				cells = [cells];
			}
			cells = Array.prototype.slice.call(cells);
			for(var i=0;i<cells.length;i++){
				var cell = cells[i];
				if(cell.rowSpan <= 1 && cell.colSpan <= 1){
					continue;
				}
				var matrix = this.matrix(),
				    pos = this.position(cell, matrix),
				    rows = Array(cell.rowSpan);
				for(i=0;i<cell.rowSpan;i++){
					rows[i] = document.createDocumentFragment();
					for(var j=0;j<cell.colSpan;j++){
						if(!(i===0 && j===0)){
							var ncell = document.createElement(cell.tagName);
							if(callback){
								callback.call(this, ncell);
							}
							rows[i].appendChild(ncell);
						}
					}
				}
				cell.rowSpan = cell.colSpan = 1;
				for(var i=0;i<rows.length;i++){
					var row = matrix[pos.y+i], before = null;
					for(var j = pos.x + (i===0 ? 1 : 0); j<row.length;j++){
						if(row[j].cell){
							before = row[j].cell;
							j = row.length;
						}
					}
					table.rows[pos.y+i].insertBefore(rows[i], before);
				}
				
			}
		}
		this.mergeVertical = function(cells, callback){
			var returnValue = false;
			for(var i=0;i<Table.maxIteration;i++){
				if(this._mergeVertical(cells,callback)){
					returnValue = true;
				}
				else{
					break;
				}
			}
			return returnValue;
		}
		this.mergeHorizontal = function(cells, callback){
			var returnValue = false;
			for(var i=0;i<Table.maxIteration;i++){
				if(this._mergeHorizontal(cells,callback)){
					returnValue = true;
				}
				else{
					break;
				}
			}
			return returnValue;
		}
		this.first = function(){
			var rows = this.element.rows;
			for(var i=0;i<rows.length;i++){
				var cells = rows[i].cells;
				for(var j=0;j<cells.length;j++){
					return cells[j];
				}
			}
			return null;
		}
		this.last = function(){
			var rows = this.element.rows;
			for(var i=rows.length-1;i>=0;i--){
				var cells = rows[i].cells;
				for(var j=cells.length-1;j>=0;j--){
					return cells[j];
				}
			}
			return null;
		}
		this.cells = function(origin, selector){
			if(arguments < 1){return []}
			else if(arguments == 1){
				selector = origin;
				origin = this.first();
			}
			else if(Object.prototype.toString.call(origin) === '[object Array]'){
				origin = this.cell.apply(this, origin);
			}
			if(!this.isAChildCell(origin)){
				return [];
			}
			var group = [];
			if(!this.isAChildCell(origin)){
				return group;
			}
			var comp = selector.split(/,+/g), 
			    results=[],
			    matrix = this.matrix(),
			    pos = this.position(origin, matrix);
			for(var i=0;i<comp.length;i++){
				results = results.concat(travelThruTable(matrix[pos.y][pos.x],matrix,comp[i]))
			}
			return sortCellsByOrder(results);
		}
		this.cell = function(x, y, matrix){
			matrix = matrix || this.matrix();
			if(y<0){
				y = matrix.length+y;
			}
			if(y<0 || y>= matrix.length){
				return null;
			}
			var row = matrix[y];
			if(x<0){
				x = row.length+x;
			}
			if(x<0 || x>= row.length){
				return null
			}
			var cell = row[x];
			return cell.cell || cell.refCell.cell;
		}
		this.merge = function(cells, callback){
			var h,v,returnValue = false;
			for(var i=0;i<Table.maxIteration;i++){
				v = this._mergeVertical(cells,callback);
				h = this._mergeHorizontal(cells,callback);
				if(v || h){
					returnValue = true;
				}
				else if(!v && !h){
					break;
				}
			}
			return returnValue;
		}
		this._mergeVertical = function(cells, callback){
			cells = ensureArray(cells);
			if(cells.length<=1){
				return false;
			}
			var matrix = this.matrix(), returnValue = false;
			for(var i=0, l = cells.length;i<l;i++){
				// Build group
				var cell = cells[i],
				group = [],
				length = cell.colSpan,
				finalRowSpan = cell.rowSpan;
				if(this.isAChildCell(cell)){
					var pos = this.position(cell, matrix);
					if(!pos){continue;}
					for(var j=pos.y+cell.rowSpan;j<matrix.length;j++){
						var nextgroup = [], subheight=0,subrow=matrix[j], sublength=0;
						for(var h=pos.x;h<subrow.length;h++){
							var subcell = subrow[h].cell;
							sublength+=(subcell||{}).colSpan||1;
							subheight = subheight===0 ? (subcell||{}).rowSpan : subheight
							if(subcell && insideArray(cells,subcell) && sublength <= length && subcell.rowSpan == subheight){
								nextgroup.push(subcell);
								if(length === sublength){
									group = group.concat(nextgroup);
									finalRowSpan += subheight;
									h=subrow.length; // Get out of the loop
								}
								h+=subcell.colSpan-1;
								j+=subcell.rowSpan-1;
							}
							else{
								// End of the group. We have to get out of two loops
								h = subrow.length;
								j = matrix.length;
							}
							
						}
					}
				}
				if(group.length>0){
					if(callback){
						callback.call(	this,
								length,		// colSpan
								finalRowSpan,	// rowSpan
								cell,		// Cell that will be kept
								group		// An array that will be removed
						)
					}
					for(var j=0;j<group.length;j++){
						group[j].parentElement.removeChild(group[j]);
					}
					cell.rowSpan = finalRowSpan;
					cell.colSpan = length;
					returnValue = true;
				}
			}
			return returnValue;
		}
		this._mergeHorizontal = function(cells, callback){
			cells = ensureArray(cells);
			if(cells.length<=1){
				return false;
			}
			var matrix = this.matrix(), returnValue = false;
			for(var i=0, l = cells.length;i<l;i++){
				// Build group
				// Start for horizontal line
				var cell = cells[i],
				group = [],
				height = cell.rowSpan,
				finalColSpan = cell.colSpan;
				if(this.isAChildCell(cell)){
					var pos = this.position(cell, matrix);
					if(!pos){continue;}
					var subrow=matrix[pos.y]
					for(var j=pos.x+cell.colSpan, l2=subrow.length;j<l2;j++){
						var nextgroup = [], sublength=0, subheight=0;
						for(var h=pos.y;h<matrix.length;h++){
							var subcell = matrix[h][j].cell;
							subheight+=(subcell||{}).rowSpan||1;
							sublength = sublength===0 ? (subcell||{}).colSpan : sublength
							if(subcell && insideArray(cells,subcell) && subheight <= height && subcell.colSpan == sublength){
								nextgroup.push(subcell);
								if(height === subheight){
									group = group.concat(nextgroup);
									finalColSpan += sublength;
									h=matrix.length; // Get out of the loop
								}
								h+=subcell.rowSpan-1;
								j+=subcell.colSpan-1;
							}
							else{
								// End of the group. We have to get out of two loops
								h = matrix.length;
								j = l2;
							}
							
						}
					}
				}
				if(group.length>0){
					if(callback){
						callback.call(	this,
								finalColSpan,	// colSpan
								height,		// rowSpan
								cell,		// Cell that will be kept
								group		// An array that will be removed
						)
					}
					for(var j=0;j<group.length;j++){
						group[j].parentElement.removeChild(group[j]);
					}
					cell.rowSpan = height;
					cell.colSpan = finalColSpan;
					returnValue = true;
				}
			}
			return returnValue;
		}
		this.position = function(cell, matrix){
			matrix = matrix || this.matrix();
			for(var i=0, row;i<matrix.length;i++){
				row = matrix[i];
				for(var j=0, cellO;j<row.length;j++){
					cellO = row[j]
					if(cellO && cellO.cell == cell){
						return {x:cellO.x,y:cellO.y}
					}
				}
			}
			return null;
		}
		this.matrix = function(alwaysInterpretZeroRowSpan){
			var table = this.element,
			    rg = [],
			    expandCells = [],
			    rows = table.rows,
			    html = table.innerHTML;
			if(Table.cache && cache[html]){
				return cache[html]
			}
			this.clearCache();
			for(var i=0;i<rows.length;i++){
				rg.push([]);
			}
			for(var i=0;i<rows.length;i++){
				var row = rows[i],
				    realCol = 0;
				for(var j=0;j<row.cells.length;j++){
					var cell = row.cells[j];
					if(typeof rg[i][realCol] != "object" && rg[i][realCol]!==false){
						var rowSpan = alwaysInterpretZeroRowSpan ? parseInt(cell.getAttribute("rowSpan"),10) : cell.rowSpan;
						rowSpan = Math.floor(Math.abs(isNaN(rowSpan) ? 1 : rowSpan));
						if(rowSpan === 0 && !alwaysInterpretZeroRowSpan && cell.ownerDocument && cell.ownerDocument.compatMode == "BackCompat"){
							rowSpan = 1;
						}
						if(rowSpan==1){
							if(!cell.colSpan || cell.colSpan <2){
								rg[i][realCol]={ cell:cell, x:realCol, y:i }
							}
							else{
								var o = rg[i][realCol]={ cell:cell, x:realCol, y:i };
								for(var k=1;k<cell.colSpan;k++){
									rg[i][realCol+k]={refCell:o, x:realCol+k, y:i};
								}
							}
						}
						else{
							var o = rg[i][realCol]={ cell:cell, x:realCol, y:i };
							if(rowSpan === 0){
								expandCells.push(o);
							}
							for(var k=0, kl=Math.max(rowSpan,1);k<kl;k++){
								for(var l=0;l<cell.colSpan;l++){
									// I hate four-level loops
									if(!(k===0 && l===0)){
										var o2 = rg[i+k][realCol+l]={refCell:o, x:realCol+l, y:i+k}
										if(rowSpan === 0){
											expandCells.push(o2);
										}
									}
								}
							}
						}
					}
					else{
						j--;
					}
					realCol++;
				}
			}
			if(expandCells.length){
				for(var i=0;i<expandCells.length;i++){
					var expandCell = expandCells[i],
					x = expandCell.x,
					y = expandCell.y;
					for(var j=y+1;j<rg.length;j++){
						rg[j].splice(x,0,{x:x,y:j,refCell:(expandCell.refCell||expandCell)});
						for(var h=x+1;h<rg[j].length;h++){
							rg[j][h].x += 1;
						}
					}
				}
			}
			if(Table.cache){
				cache[html] = rg;
			}
			return rg;
		}
		this.getCellPosition = function(_cell){
			var table = this.element,
			occupied = [],
			rows = table.rows;
			for(var i=0;i<rows.length;i++){
				occupied.push([]);
			}
			for(var i=0;i<rows.length;i++){
				var cols = rows[i].cells,
				realcount = 0;
				for(var j=0;j<cols.length;j++){
					var cell = cols[j];
					if(occupied[i][realcount]){
						j--;realcount++;continue;
					}
					if(cell == _cell){
						return {x:i,y:realcount}
					}
					for(var h=1;h<cell.rowSpan;h++){
						for(var g=0;g<cell.colSpan;g++){
							occupied[i+h][realcount+g]=true;
						}
					}
					realcount+=cell.colSpan;
				}
			}
			
		}
		this.rel = function(x,y){
			var row = this.element.rows[y];
			if(row){
				return row.cells[x];
			}
		}
		this.getCellByPosition = function(x, y) {
			var table = this.element,
			occupied = [],
			rows = table.rows;
			if(x>=rows.length){return null;}
			for(var i=0;i<rows.length;i++){
				occupied.push([]);
			}
			for(var i=0, l=Math.min(rows.length,x+1);i<l;i++){
				var cols = rows[i].cells,
				realcount = 0;
				for(var j=0;j<cols.length;j++){
					var cell = cols[j];
					if(occupied[i][realcount]){
						j--;realcount++;continue;
					}
					if(i==x && realcount==y){
						return cell;
					}
					for(var h=1;h<cell.rowSpan;h++){
						for(var g=0;g<cell.colSpan;g++){
							occupied[i+h][realcount+g]=true;
						}
					}
					realcount+=cell.colSpan;
				}
			}			
		};
}
Table.isACell = function(cell){
	return cell && (cell.tagName == "TD" || cell.tagName == "TH");
}
Table.rowSpan = function(cell){
	if(Table.isACell(cell)){
		if(cell.rowSpan === 0){
			if(cell.cellIndex == -1){
				return 1;
			}
			else {
				var tr = cell.parentElement, rowSpan = 1;
				if(!tr || tr.tagName!="TR"){
					return -1;
				}
				while(tr = tr.nextSibling){
					if(tr.tagName == "TR"){
						rowSpan++;
					}
				}
				return rowSpan;
			}
		}
		else {
			return cell.rowSpan;
		}
	}
	return null;
}
Table.maxIteration = 50;
Table.cache = true;
Table.build = 5;
Table.version = "0.2"
Table.stable = true;
window.Table = Table;
})();