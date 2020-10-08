(function(){
	var getWikiByCell = function(cell){
		var html, prop = {}, div = document.createElement("div");
		div.style.cssText = cell.style.cssText.replace(/border[-a-z]*\s*:[^;]+;/gi,"");
		if(cell.rowSpan !== 1){
			prop.rowspan=cell.rowSpan;
		}
		if(cell.colSpan !== 1){
			prop.colspan=cell.colSpan;
		}
		if(cell.getAttribute("data-align")=="c"){
			div.style.textAlign = "center";
		}
		else if(cell.getAttribute("data-align") == "r"){
			div.style.textAlign = "right";
		}
		if(cell.getAttribute("data-vertical-align")=="t"){
			div.style.verticalAlign = "top";
		}
		else if(cell.getAttribute("data-vertical-align") == "b"){
			div.style.verticalAlign = "bottom";
		}
		if(cell.hasAttribute("data-diagonal")){
			 html = "{{diagonal split header|"+
				wikicode.call(this,this.getHTML(cell,1))+"|"+
				wikicode.call(this,this.getHTML(cell,0))+"}}";
		}
		else{
			html = wikicode.call(this,this.getHTML(cell,0));
		}
		prop.style = div.style.cssText;
		
		var proptext = "";
		for(var i in prop){
			if(prop.hasOwnProperty(i) && prop[i]){
				proptext+= i+'="'+prop[i]+'" ';
			}
		}
		proptext = proptext.trim();
		return proptext + (proptext?"|":"") + html;
	},
	wikicode = function(html){
		var div = document.createElement("div");
		div.innerHTML = html;
		var footnote = div.querySelectorAll("span.tb-footnote[title]");
		for(var i=0;i<footnote.length;i++){
			var ref = document.createElement("ref");
			ref.innerText = footnote[i].title;
			footnote[i].parentElement.replaceChild(ref,footnote[i]);
		}
		html = div.innerHTML;
		return html.replace(/[|]+/g,"<nowiki>$&</nowiki>").replace(/<\s*\/?\s*(b|i)\s*>/gi,function(full,tag){
			if(tag.toLowerCase() == "b"){
				return "'''";
			}
			else{
				return "''";
			}
		}).replace(/<\s*font\s+color="?\s*([^"\s>]+)[^>]*>/gi, function(full, color){
			color = toRGBA(color) || [0,0,0,1];
			color = "#" + ((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2]).toString(16).slice(1);
			return "{{font color|"+color+"|";
		}).replace(/<\s*\/\s*font\s*>/gi, "}}").replace(/<\s*(\/?\s*(?:ul|wbr)|\/\s*li)[^>]*>/gi,"").replace(/<\s*li[^>]*>/gi,"\n* ");
	}
	table.createInterpreter("wikicode", function(){
		var element = this.element,
		caption = this.caption(),
		str = "{| class=\"wikitable\"";
		if(caption.caption){
			str+= "\n{+ "+caption.caption.replace(/[|]+/g,"<nowiki>$&</nowiki>");
		}
		for(var i=(this.Table.shadowFirstRow?1:0);i<element.rows.length;i++){
			str += "\n|-";
			var cells = element.rows[i].cells;
			for(var j=0;j<cells.length;j++){
				var cell = cells[j];
				str += "\n|";
				str+= getWikiByCell.call(this,cell);
			}
		}
		str += "\n|}";
		return str;
	})
})();