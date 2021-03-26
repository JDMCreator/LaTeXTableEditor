(function(){
	function getBBCodeByCell(cell){
		var html = this.getHTML(cell);
		html = html.replace(/[\n\r]+/g, "");
		html = html.replace(/<\s*br\s*\/?\s*>/gi, "\n");
		html = html.replace(/<\s*(\/?)\s*([a-z]+)([^>]*)>/gi,function(full,close,name,content){
			name = name.toLowerCase();
			if(name == "b"){
				if(close){
					return "[/b]"
				}
				else{
					return "[b]";
				}
			}
			else if(name == "i"){
				if(close){
					return "[/i]"
				}
				else{
					return "[i]";
				}
			}
			else if(name == "u"){
				if(close){
					return "[/u]"
				}
				else{
					return "[u]";
				}
			}
			else if(name == "strike"){
				if(close){
					return "[/s]"
				}
				else{
					return "[s]";
				}
			}
			else if(name == "font"){
				if(close){
					return "[/color]"
				}
				else{
					var color = /\#[a-z0-9]{6}/i.exec(content);
					if(color){
						return "[color="+color+"]";
					}
					else{
						return "[color=#000000]";
					}
				}
			}
			else {
				return "";
			}
		});
		var align = cell.getAttribute("data-align");
		if(align == "c"){
			html = "[center]" + html + "[/center]";
		}
		else if(align == "r"){
			html = "[right]" + html + "[/right]";
		}
		return html;
	}
	table.createInterpreter("bbcode", function(){
		var element = this.element,
		headerN = parseInt(this._id("opt-bbcode-header").value,10)||0,
		str = "[table]";
		if(headerN > element.rows.length){
			this.message("The number of header rows requested is too high. Set to 0 by default.", "warning");
			headerN = 0;
		}
		for(var i=(this.Table.shadowFirstRow?1:0);i<element.rows.length;i++){
			str += "\n[tr]";
			var cells = element.rows[i].cells;
			for(var j=0;j<cells.length;j++){
				var cell = cells[j];
				str += "\n";
				if(i<headerN){
					str+= "[th]";
				}
				else{
					str+= "[td]";
				}
				str+= getBBCodeByCell.call(this, cell);
				if(i<headerN){
					str+= "[/th]";
				}
				else{
					str+= "[/td]";
				}
			}
			str += "\n[/tr]";
		}
		str += "\n[/table]";
		return str;
	})
})();