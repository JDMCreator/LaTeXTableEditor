(function(){

// Declaration of names
var BASICS = {
	"black" : [0,0,0],
	"blue" : [0,0,255],
	"brown" : [191, 128, 64],
	"cyan" : [0, 174, 239],
	"darkgray" : [64, 64, 64],
	"gray" : [128, 128, 128],
	"green" : [0, 255, 0],
	"lightgray" : [191, 191, 191],
	"lime" : [191, 255, 0],
	"magenta" : [237, 2, 140],
	"olive" : [150, 141, 0],
	"orange" : [255, 128, 0],
	"pink" : [255, 191, 191],
	"purple" : [191, 0, 64],
	"red" : [255, 0, 0],
	"teal" : [0, 128, 128],
	"violet" : [128, 0, 128],
	"white" : [255, 255, 255],
	"yellow" : [255, 241, 1]
}

var SVGNAMES = {"AliceBlue":[240,248,255],"AntiqueWhite":[250,235,215],"Aqua":[0,255,255],"Aquamarine":[127,255,212],"Azure":[240,255,255],"Beige":[245,245,220],"Bisque":[255,228,196],"Black":[0,0,0],"BlanchedAlmond":[255,235,205],"Blue":[0,0,255],"BlueViolet":[138,43,226],"Brown":[165,42,42],"BurlyWood":[222,184,135],"CadetBlue":[95,158,160],"Chartreuse":[127,255,0],"Chocolate":[210,105,30],"Coral":[255,127,80],"CornflowerBlue":[100,149,237],"Cornsilk":[255,248,220],"Crimson":[220,20,60],"Cyan":[0,255,255],"DarkBlue":[0,0,139],"DarkCyan":[0,139,139],"DarkGoldenrod":[184,134,11],"DarkGray":[169,169,169],"DarkGreen":[0,100,0],"DarkGrey":[169,169,169],"DarkKhaki":[189,183,107],"DarkMagenta":[139,0,139],"DarkOliveGreen":[85,107,47],"DarkOrange":[255,140,0],"DarkOrchid":[153,50,204],"DarkRed":[139,0,0],"DarkSalmon":[233,150,122],"DarkSeaGreen":[143,188,143],"DarkSlateBlue":[72,61,139],"DarkSlateGray":[47,79,79],"DarkSlateGrey":[47,79,79],"DarkTurquoise":[0,206,209],"DarkViolet":[148,0,211],"DeepPink":[255,20,147],"DeepSkyBlue":[0,191,255],"DimGray":[105,105,105],"DimGrey":[105,105,105],"DodgerBlue":[30,144,255],"FireBrick":[178,34,34],"FloralWhite":[255,250,240],"ForestGreen":[34,139,34],"Fuchsia":[255,0,255],"Gainsboro":[220,220,220],"GhostWhite":[248,248,255],"Gold":[255,215,0],"Goldenrod":[218,165,32],"Gray":[128,128,128],"Grey":[128,128,128],"Green":[0,128,0],"GreenYellow":[173,255,47],"Honeydew":[240,255,240],"HotPink":[255,105,180],"IndianRed":[205,92,92],"Indigo":[75,0,130],"Ivory":[255,255,240],"Khaki":[240,230,140],"Lavender":[230,230,250],"LavenderBlush":[255,240,245],"LawnGreen":[124,252,0],"LemonChiffon":[255,250,205],"LightBlue":[173,216,230],"LightCoral":[240,128,128],"LightCyan":[224,255,255],"LightGoldenrodYellow":[250,250,210],"LightGray":[211,211,211],"LightGreen":[144,238,144],"LightGrey":[211,211,211],"LightPink":[255,182,193],"LightSalmon":[255,160,122],"LightSeaGreen":[32,178,170],"LightSkyBlue":[135,206,250],"LightSlateGray":[119,136,153],"LightSlateGrey":[119,136,153],"LightSteelBlue":[176,196,222],"LightYellow":[255,255,224],"Lime":[0,255,0],"LimeGreen":[50,205,50],"Linen":[250,240,230],"Magenta":[255,0,255],"Maroon":[128,0,0],"MediumAquamarine":[102,205,170],"MediumBlue":[0,0,205],"MediumOrchid":[186,85,211],"MediumPurple":[147,112,219],"MediumSeaGreen":[60,179,113],"MediumSlateBlue":[123,104,238],"MediumSpringGreen":[0,250,154],"MediumTurquoise":[72,209,204],"MediumVioletRed":[199,21,133],"MidnightBlue":[25,25,112],"MintCream":[245,255,250],"MistyRose":[255,228,225],"Moccasin":[255,228,181],"NavajoWhite":[255,222,173],"Navy":[0,0,128],"OldLace":[253,245,230],"Olive":[128,128,0],"OliveDrab":[107,142,35],"Orange":[255,165,0],"OrangeRed":[255,69,0],"Orchid":[218,112,214],"PaleGoldenrod":[238,232,170],"PaleGreen":[152,251,152],"PaleTurquoise":[175,238,238],"PaleVioletRed":[219,112,147],"PapayaWhip":[255,239,213],"PeachPuff":[255,218,185],"Peru":[205,133,63],"Pink":[255,192,203],"Plum":[221,160,221],"PowderBlue":[176,224,230],"Purple":[128,0,128],"Red":[255,0,0],"RosyBrown":[188,143,143],"RoyalBlue":[65,105,225],"SaddleBrown":[139,69,19],"Salmon":[250,128,114],"SandyBrown":[244,164,96],"SeaGreen":[46,139,87],"Seashell":[255,245,238],"Sienna":[160,82,45],"Silver":[192,192,192],"SkyBlue":[135,206,235],"SlateBlue":[106,90,205],"SlateGray":[112,128,144],"SlateGrey":[112,128,144],"Snow":[255,250,250],"SpringGreen":[0,255,127],"SteelBlue":[70,130,180],"Tan":[210,180,140],"Teal":[0,128,128],"Thistle":[216,191,216],"Tomato":[255,99,71],"Turquoise":[64,224,208],"Violet":[238,130,238],"Wheat":[245,222,179],"White":[255,255,255],"WhiteSmoke":[245,245,245],"Yellow":[255,255,0],"YellowGreen":[154,205,50]}

var DVIPSNAMES = {"GreenYellow":[217,255,79],"Yellow":[255,255,0],"Goldenrod":[255,230,41],"Dandelion":[255,181,41],"Apricot":[255,173,122],"Peach":[255,128,77],"Melon":[255,138,128],"YellowOrange":[255,148,0],"Orange":[255,99,33],"BurntOrange":[255,125,0],"Bittersweet":[194,48,0],"RedOrange":[255,59,33],"Mahogany":[166,25,22],"Maroon":[173,23,55],"BrickRed":[184,20,11],"Red":[255,0,0],"OrangeRed":[255,0,128],"RubineRed":[255,0,222],"WildStrawberry":[255,10,156],"Salmon":[255,120,158],"CarnationPink":[255,94,255],"Magenta":[255,0,255],"VioletRed":[255,48,255],"Rhodamine":[255,46,255],"Mulberry":[165,25,250],"RedViolet":[157,17,168],"Fuchsia":[124,21,235],"Lavender":[255,133,255],"Thistle":[224,105,255],"Orchid":[173,92,255],"DarkOrchid":[153,51,204],"Purple":[140,36,255],"Plum":[128,0,255],"Violet":[54,31,255],"RoyalPurple":[64,25,255],"BlueViolet":[34,22,245],"Periwinkle":[110,115,255],"CadetBlue":[97,110,196],"CornflowerBlue":[89,222,255],"MidnightBlue":[3,126,145],"NavyBlue":[15,117,255],"RoyalBlue":[0,128,255],"Blue":[0,0,255],"Cerulean":[15,227,255],"Cyan":[0,255,255],"ProcessBlue":[10,255,255],"SkyBlue":[97,255,224],"Turquoise":[38,255,204],"TealBlue":[35,250,165],"Aquamarine":[46,255,179],"BlueGreen":[38,255,171],"Emerald":[0,255,128],"JungleGreen":[3,255,122],"SeaGreen":[79,255,128],"Green":[0,255,0],"ForestGreen":[20,224,27],"PineGreen":[15,191,78],"LimeGreen":[128,255,0],"YellowGreen":[143,255,66],"SpringGreen":[189,255,61],"OliveGreen":[55,153,8],"RawSienna":[140,39,0],"Sepia":[77,13,0],"Brown":[102,19,0],"Tan":[219,148,112],"Gray":[128,128,128],"Black":[0,0,0],"White":[255,255,255]}

var X11COLORS = {"Snow1":[0,255,250],"Snow2":[0,238,233],"Snow3":[0,205,201],"Snow4":[0,139,137],"Seashell1":[0,255,245],"Seashell2":[0,238,229],"Seashell3":[0,205,197],"Seashell4":[0,139,134],"AntiqueWhite1":[0,255,239],"AntiqueWhite2":[0,238,223],"AntiqueWhite3":[0,205,192],"AntiqueWhite4":[0,139,131],"Bisque1":[0,255,228],"Bisque2":[0,238,213],"Bisque3":[0,205,183],"Bisque4":[0,139,125],"PeachPuff1":[0,255,218],"PeachPuff2":[0,238,203],"PeachPuff3":[0,205,175],"PeachPuff4":[0,139,119],"NavajoWhite1":[0,255,222],"NavajoWhite2":[0,238,207],"NavajoWhite3":[0,205,179],"NavajoWhite4":[0,139,121],"LemonChiffon1":[0,255,250],"LemonChiffon2":[0,238,233],"LemonChiffon3":[0,205,201],"LemonChiffon4":[0,139,137],"Cornsilk1":[0,255,248],"Cornsilk2":[0,238,232],"Cornsilk3":[0,205,200],"Cornsilk4":[0,139,136],"Ivory1":[0,255,255],"Ivory2":[0,238,238],"Ivory3":[0,205,205],"Ivory4":[0,139,139],"Honeydew1":[0,240,255],"Honeydew2":[0,224,238],"Honeydew3":[0,193,205],"Honeydew4":[0,131,139],"LavenderBlush1":[0,255,240],"LavenderBlush2":[0,238,224],"LavenderBlush3":[0,205,193],"LavenderBlush4":[0,139,131],"MistyRose1":[0,255,228],"MistyRose2":[0,238,213],"MistyRose3":[0,205,183],"MistyRose4":[0,139,125],"Azure1":[0,240,255],"Azure2":[0,224,238],"Azure3":[0,193,205],"Azure4":[0,131,139],"SlateBlue1":[0,131,111],"SlateBlue2":[0,122,103],"SlateBlue3":[0,105,89],"SlateBlue4":[0,71,60],"RoyalBlue1":[0,72,118],"RoyalBlue2":[0,67,110],"RoyalBlue3":[0,58,95],"RoyalBlue4":[0,39,64],"Blue1":[0,0,0],"Blue2":[0,0,0],"Blue3":[0,0,0],"Blue4":[0,0,0],"DodgerBlue1":[0,30,144],"DodgerBlue2":[0,28,134],"DodgerBlue3":[0,24,116],"DodgerBlue4":[0,16,78],"SteelBlue1":[0,99,184],"SteelBlue2":[0,92,172],"SteelBlue3":[0,79,148],"SteelBlue4":[0,54,100],"DeepSkyBlue1":[0,0,191],"DeepSkyBlue2":[0,0,178],"DeepSkyBlue3":[0,0,154],"DeepSkyBlue4":[0,0,104],"SkyBlue1":[0,135,206],"SkyBlue2":[0,126,192],"SkyBlue3":[0,108,166],"SkyBlue4":[0,74,112],"LightSkyBlue1":[0,176,226],"LightSkyBlue2":[0,164,211],"LightSkyBlue3":[0,141,182],"LightSkyBlue4":[0,96,123],"SlateGray1":[0,198,226],"SlateGray2":[0,185,211],"SlateGray3":[0,159,182],"SlateGray4":[0,108,123],"LightSteelBlue1":[0,202,225],"LightSteelBlue2":[0,188,210],"LightSteelBlue3":[0,162,181],"LightSteelBlue4":[0,110,123],"LightBlue1":[0,191,239],"LightBlue2":[0,178,223],"LightBlue3":[0,154,192],"LightBlue4":[0,104,131],"LightCyan1":[0,224,255],"LightCyan2":[0,209,238],"LightCyan3":[0,180,205],"LightCyan4":[0,122,139],"PaleTurquoise1":[0,187,255],"PaleTurquoise2":[0,174,238],"PaleTurquoise3":[0,150,205],"PaleTurquoise4":[0,102,139],"CadetBlue1":[0,152,245],"CadetBlue2":[0,142,229],"CadetBlue3":[0,122,197],"CadetBlue4":[0,83,134],"Turquoise1":[0,0,245],"Turquoise2":[0,0,229],"Turquoise3":[0,0,197],"Turquoise4":[0,0,134],"Cyan1":[0,0,255],"Cyan2":[0,0,238],"Cyan3":[0,0,205],"Cyan4":[0,0,139],"DarkSlateGray1":[0,151,255],"DarkSlateGray2":[0,141,238],"DarkSlateGray3":[0,121,205],"DarkSlateGray4":[0,82,139],"Aquamarine1":[0,127,255],"Aquamarine2":[0,118,238],"Aquamarine3":[0,102,205],"Aquamarine4":[0,69,139],"DarkSeaGreen1":[0,193,255],"DarkSeaGreen2":[0,180,238],"DarkSeaGreen3":[0,155,205],"DarkSeaGreen4":[0,105,139],"SeaGreen1":[0,84,255],"SeaGreen2":[0,78,238],"SeaGreen3":[0,67,205],"SeaGreen4":[0,46,139],"PaleGreen1":[0,154,255],"PaleGreen2":[0,144,238],"PaleGreen3":[0,124,205],"PaleGreen4":[0,84,139],"SpringGreen1":[0,0,255],"SpringGreen2":[0,0,238],"SpringGreen3":[0,0,205],"SpringGreen4":[0,0,139],"Green1":[0,0,255],"Green2":[0,0,238],"Green3":[0,0,205],"Green4":[0,0,139],"Chartreuse1":[0,127,255],"Chartreuse2":[0,118,238],"Chartreuse3":[0,102,205],"Chartreuse4":[0,69,139],"OliveDrab1":[0,192,255],"OliveDrab2":[0,179,238],"OliveDrab3":[0,154,205],"OliveDrab4":[0,105,139],"DarkOliveGreen1":[0,202,255],"DarkOliveGreen2":[0,188,238],"DarkOliveGreen3":[0,162,205],"DarkOliveGreen4":[0,110,139],"Khaki1":[0,255,246],"Khaki2":[0,238,230],"Khaki3":[0,205,198],"Khaki4":[0,139,134],"LightGoldenrod1":[0,255,236],"LightGoldenrod2":[0,238,220],"LightGoldenrod3":[0,205,190],"LightGoldenrod4":[0,139,129],"LightYellow1":[0,255,255],"LightYellow2":[0,238,238],"LightYellow3":[0,205,205],"LightYellow4":[0,139,139],"Yellow1":[0,255,255],"Yellow2":[0,238,238],"Yellow3":[0,205,205],"Yellow4":[0,139,139],"Gold1":[0,255,215],"Gold2":[0,238,201],"Gold3":[0,205,173],"Gold4":[0,139,117],"Goldenrod1":[0,255,193],"Goldenrod2":[0,238,180],"Goldenrod3":[0,205,155],"Goldenrod4":[0,139,105],"DarkGoldenrod1":[0,255,185],"DarkGoldenrod2":[0,238,173],"DarkGoldenrod3":[0,205,149],"DarkGoldenrod4":[0,139,101],"RosyBrown1":[0,255,193],"RosyBrown2":[0,238,180],"RosyBrown3":[0,205,155],"RosyBrown4":[0,139,105],"IndianRed1":[0,255,106],"IndianRed2":[0,238,99],"IndianRed3":[0,205,85],"IndianRed4":[0,139,58],"Sienna1":[0,255,130],"Sienna2":[0,238,121],"Sienna3":[0,205,104],"Sienna4":[0,139,71],"Burlywood1":[0,255,211],"Burlywood2":[0,238,197],"Burlywood3":[0,205,170],"Burlywood4":[0,139,115],"Wheat1":[0,255,231],"Wheat2":[0,238,216],"Wheat3":[0,205,186],"Wheat4":[0,139,126],"Tan1":[0,255,165],"Tan2":[0,238,154],"Tan3":[0,205,133],"Tan4":[0,139,90],"Chocolate1":[0,255,127],"Chocolate2":[0,238,118],"Chocolate3":[0,205,102],"Chocolate4":[0,139,69],"Firebrick1":[0,255,48],"Firebrick2":[0,238,44],"Firebrick3":[0,205,38],"Firebrick4":[0,139,26],"Brown1":[0,255,64],"Brown2":[0,238,59],"Brown3":[0,205,51],"Brown4":[0,139,35],"Salmon1":[0,255,140],"Salmon2":[0,238,130],"Salmon3":[0,205,112],"Salmon4":[0,139,76],"LightSalmon1":[0,255,160],"LightSalmon2":[0,238,149],"LightSalmon3":[0,205,129],"LightSalmon4":[0,139,87],"Orange1":[0,255,165],"Orange2":[0,238,154],"Orange3":[0,205,133],"Orange4":[0,139,90],"DarkOrange1":[0,255,127],"DarkOrange2":[0,238,118],"DarkOrange3":[0,205,102],"DarkOrange4":[0,139,69],"Coral1":[0,255,114],"Coral2":[0,238,106],"Coral3":[0,205,91],"Coral4":[0,139,62],"Tomato1":[0,255,99],"Tomato2":[0,238,92],"Tomato3":[0,205,79],"Tomato4":[0,139,54],"OrangeRed1":[0,255,69],"OrangeRed2":[0,238,64],"OrangeRed3":[0,205,55],"OrangeRed4":[0,139,37],"Red1":[0,255,0],"Red2":[0,238,0],"Red3":[0,205,0],"Red4":[0,139,0],"DeepPink1":[0,255,20],"DeepPink2":[0,238,18],"DeepPink3":[0,205,16],"DeepPink4":[0,139,10],"HotPink1":[0,255,110],"HotPink2":[0,238,106],"HotPink3":[0,205,96],"HotPink4":[0,139,58],"Pink1":[0,255,181],"Pink2":[0,238,169],"Pink3":[0,205,145],"Pink4":[0,139,99],"LightPink1":[0,255,174],"LightPink2":[0,238,162],"LightPink3":[0,205,140],"LightPink4":[0,139,95],"PaleVioletRed1":[0,255,130],"PaleVioletRed2":[0,238,121],"PaleVioletRed3":[0,205,104],"PaleVioletRed4":[0,139,71],"Maroon1":[0,255,52],"Maroon2":[0,238,48],"Maroon3":[0,205,41],"Maroon4":[0,139,28],"VioletRed1":[0,255,62],"VioletRed2":[0,238,58],"VioletRed3":[0,205,50],"VioletRed4":[0,139,34],"Magenta1":[0,255,0],"Magenta2":[0,238,0],"Magenta3":[0,205,0],"Magenta4":[0,139,0],"Orchid1":[0,255,131],"Orchid2":[0,238,122],"Orchid3":[0,205,105],"Orchid4":[0,139,71],"Plum1":[0,255,187],"Plum2":[0,238,174],"Plum3":[0,205,150],"Plum4":[0,139,102],"MediumOrchid1":[0,224,102],"MediumOrchid2":[0,209,95],"MediumOrchid3":[0,180,82],"MediumOrchid4":[0,122,55],"DarkOrchid1":[0,191,62],"DarkOrchid2":[0,178,58],"DarkOrchid3":[0,154,50],"DarkOrchid4":[0,104,34],"Purple1":[0,155,48],"Purple2":[0,145,44],"Purple3":[0,125,38],"Purple4":[0,85,26],"MediumPurple1":[0,171,130],"MediumPurple2":[0,159,121],"MediumPurple3":[0,137,104],"MediumPurple4":[0,93,71],"Thistle1":[0,255,225],"Thistle2":[0,238,210],"Thistle3":[0,205,181],"Thistle4":[0,139,123],
"Gray0":[190,190,190], "Grey0":[190,190,190], "Green0" : [0,255,0], "Maroon0":[176,48,96], "Purple0": [160,32,240]};

var LOCALS = {};

// Order : Dvipsnames, then svgnames, then x11colors
function HEX2RGB(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [parseInt(result[1], 16) || 0, parseInt(result[2], 16) || 0, parseInt(result[3], 16) || 0];
}

// From here : https://stackoverflow.com/a/5624139/8022172
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function blendColors(rgb1, rgb2, perc){
	perc /= 100;
	// There are more complexe blending functions out there. However, this is the simple one 'xcolor' uses.
	return [rgb1[0]*perc+rgb2[0]*(1-perc),
		rgb1[1]*perc+rgb2[1]*(1-perc),
		rgb1[2]*perc+rgb2[2]*(1-perc)];
}
var invert = function(rgb){
	return [255 - rgb[0], 255 - rgb[1], 255 - rgb[2]];
}
var xcolor = function xcolor(value, model, dvips){
	value = value.trim();
	// First remove all leading +
	value = value.replace(/^[+]+/g, "");

	// Then, remove all nonnecessary leading '-'
	value = value.replace(/^\-+/g, function(full){
		if(full.length%2 == 1){
			return "-";
		}
		return "";
	});

	// Convert if there's a leading '-'
	if(value.charAt(0) == "-"){
		return invert(xcolor.apply(this, [value.substring(1), model, dvips]))
	}

	// Clean postfix because we can't handle that
	value = value.replace(/!![+]*(\[[0-9]*\]|)$/, "");

	// Now look for blending
	if(value.indexOf("!") >= 0){
		value = value.split(/!/);
		if(value.length % 2 === 0){
			value.push("white");
		}
		var actualColor = xcolor(value[0], model, dvips);
		for(var i=2;i<value.length;i+=2){
			var perc = parseFloat(value[i-1].trim())
			var color2 = xcolor(value[i], model, dvips);
			actualColor = blendColors(actualColor, color2, perc);
		}
		return actualColor.map(function(t){
			return Math.round(t);
		});
	}
	

	// Supported model for now : rgb, RGB, HTML, cmy, cmyk, hsb, Hsb, HSB, gray, Gray and wave
	if(model){

		// xcolor support conversion in their model optional argument
		if(model.indexOf(":")>=0){
			model = model.substring(model.lastIndexOf(":")+1);
			console.log(model);
		}

		if(model == "rgb"){
			return value.split(/[\s,]+/).map(function(val){
				return parseFloat(val)*255;
			});
		}
		else if(model == "RGB"){
			return value.split(/[\s,]+/).map(function(val){
				return parseInt(val,10);
			});
		}
		else if(model == "cmy" || model == "cmyk"){
			value = value.split(/[\s,]+/).map(function(val){
				return parseFloat(val);
			});

			// First convert cmyk
			if(model == "cmyk"){
				var black = value[3];
				value = [
					Math.min(1, value[0] + black),
					Math.min(1, value[1] + black),
					Math.min(1, value[2] + black)
				]
			}

			return [255 - value[0] * 255, 255 - value[1] * 255, 255 - value[2] * 255];
		}
		else if(model == "HTML"){
			return HEX2RGB(value);
		}
		else if(model == "gray" || model == "Gray"){
			if(model == "Gray"){
				value = parseInt(value, 10) / 15;
			}
			value = parseFloat(value)*255;
			return [value, value, value];			
		}
		else if(model == "hsb" || model == "Hsb" || model == "HSB"){
			value = value.split(/[\s,]+/).map(function(val){
				return parseFloat(val);
			});

			// First we convert other models to 'hsb'
			if(model == "Hsb"){
				value[0] = value[0]/360;
			}
			else if(model == "HSB"){
				value = value.map(function(v){
					return parseInt(v,10)/240
				});
			}

			// Then we treat hsb
			var indicator = Math.floor(6*value[0]),
			factor = 6*value[0]-indicator,
			vector = [0,1,1];

			if(indicator === 0){ vector = [0,1-factor,1]}
			else if(indicator === 1){ vector = [factor, 0, 1] }
			else if(indicator === 2){ vector = [1, 0, 1-factor]}
			else if(indicator === 3){ vector = [1, factor, 0]}
			else if(indicator === 4){ vector = [1-factor, 1, 0]}
			else if(indicator === 5){ vector = [0, 1, factor]};

			return vector.map(function(val){
				return Math.round((1 - val * value[1]) * value[2] * 255);
			}); 
			
		}
		else if(model == "wave"){
			// Who encode their color in 'wave' ? Whatever...
			value = parseFloat(value);
			var rgb = [1,0,0], factor = 1;
			if(value < 380 || value > 780){
				return [0,0,0];
			}

			// RGB in [0,1]
			if(value >= 380 && value < 440){
				rgb = [(440-value)/(440-380),0,1]
			}
			else if(value >= 440 && value < 490){
				rgb = [0,(value-440)/(490-440),1]
			}
			else if(value >= 490 && value < 510){
				rgb = [0,1,(value-510)/(510-490)]
			}
			else if(value >= 510 && value < 580){
				rgb = [(value-510)/(580-510),1,0]
			}
			else if(value >= 580 && value < 645){
				rgb = [1,(645-value)/(645-580),0]
			}

			// Factor
			if(value < 420){
				factor = 0.3 + 0.7 * (value-380)/(420-380)
			}
			else if(value > 700){
				factor = 0.3 + 0.7 * (780-value)/(780-700)
			}

			return rgb.map(function(e){
				return Math.round(e*factor*255);
			});
		}
		else{
			return [0, 0, 0];
		}
	}
	else{
		if(/^[a-z][a-z0-9]*$/i.test(value)){
			if(LOCALS.hasOwnProperty(value)){
				return LOCALS[value];
			}
			else if(BASICS.hasOwnProperty(value)){
				return BASICS[value];
			}
			else if(X11COLORS.hasOwnProperty(value)){
				return X11COLORS[value];
			}
			else if(dvips){
				if(DVIPSNAMES.hasOwnProperty(value)){
					return DVIPSNAMES[value];
				}
				else if(SVGNAMES.hasOwnProperty(value)){
					return SVGNAMES[value];
				}
			}
			else{
				if(SVGNAMES.hasOwnProperty(value)){
					return SVGNAMES[value];
				}
				else if(DVIPSNAMES.hasOwnProperty(value)){
					return DVIPSNAMES[value];
				}
			}
		}
	}
	return [0,0,0]
}
xcolor.register = function(name, r, g, b){
	if(arguments.length < 4){
		g = r[1];
		b = r[2];
		r = r[0];
	}
	var rgb = [r, g, b];
	LOCALS[name] = rgb;
	return rgb;
}
xcolor.remove = function(name){
	var have = !!LOCALS[name];
	delete LOCALS[name];
	return have;
}
xcolor.extract = function(code){
	// We strip comments
	code = code.replace(/\\(.)/g, function(a,b){
		if(b == "%"){
			return "\\{";
		}
		return a;
	}).replace(/%[^\n\r]*[\n\r]*/g,"\n");
	var reg = /\\(definecolor|colorlet|providecolor)(?:\[([^\]]*)\]|)\{/g,
	result = null;
	while ((result = reg.exec(code)) !== null) {
		var fn = result[1], opt = result[2], arg = [], actualarg = "", substr = code.substring(result.index + result[0].length - 1);
		var counter = 0;
		subLoop: for(var i=0;i<substr.length;i++){
			var c = substr.charAt(i);
			if(c == "{"){
				counter++;
				if(counter > 1){
					actu += c;
				}
			}
			else if(c == "\\"){
				actualarg = c + substr.charAt(i+1);
				i++;
			}
			else if(c == "}"){
				counter--;
				if(counter === 0){
					arg.push(actualarg);
					actualarg = "";
					if(arg.length === 3 || (fn == "colorlet" && arg.length == 2)){
						break subLoop;
					}
				}
				else{
					actualarg += c;
				}
			}
			else{
				actualarg += c;
			}
		}
		if(arg.length === 3 || (fn == "colorlet" && arg.length == 2)){
			if(fn == "definecolor"){
				xcolor.register(arg[0], xcolor(arg[2], arg[1]));
			}
			else if(fn == "providecolor"){
				var value = arg[0]
				if(!LOCALS.hasOwnProperty(value) && !BASICS.hasOwnProperty(value)
				   && !X11COLORS.hasOwnProperty(value) && !SVGNAMES.hasOwnProperty(value)
				   && !DVIPSNAMES.hasOwnProperty(value)){
					xcolor.register(arg[0], xcolor(arg[2], arg[1]));
				}
			}
			else if(fn == "colorlet"){
				xcolor.register(arg[0], xcolor(arg[1]));
			}
		}
	}
}
xcolor.erase = function(){
	LOCALS = {};
	return true;
}
window.xcolor = xcolor;
})();