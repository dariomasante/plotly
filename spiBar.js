
//gradient = ['#7C0607','#801314','#841D1E','#882526','#8C2D2D','#903435','#943B3C','#984243','#9D494A','#A15151','#A55858','#A95F5F','#AE6667','#B26E6E','#B67676','#BB7E7E','#BF8686','#C48F8F','#C99898','#CDA2A2','#D2ACAC','#D8B7B7','#DDC3C3','#E3D0D0','#EBE2E2','#E3E3EA','#D3D4E2','#C7C7DB','#BCBCD6','#B2B3D1','#A9AACC','#A0A1C7','#9899C3','#9091BF','#888ABB','#8183B7','#7A7CB4','#7375B1','#6D6EAD','#6668AB','#6062A8','#595CA5','#5356A3','#4D50A1','#464A9F','#40449E','#393D9E','#32379E','#29309F','#1F28A2'];
//sapply(list( c(255,0,0), c(255,170,0), c(255,255,0), c(255,255,255), c(233,204,249), c(131,51,147),c(0,0,255)),function(x){rgb(x[1],x[2],x[3],  maxColorValue=255)})
//cat(colorRampPalette(s)(50), sep="','")
gradient = ['#FF0000','#FF1400','#FF2900','#FF3E00','#FF5300','#FF6800','#FF7C00','#FF9100','#FFA600','#FFB200','#FFBD00','#FFC700','#FFD100','#FFDC00','#FFE600','#FFF100','#FFFB00','#FFFF14','#FFFF34','#FFFF53','#FFFF72','#FFFF91','#FFFFB0','#FFFFD0','#FFFFEF','#FDFBFE','#FAF5FD','#F8EFFD','#F5E9FC','#F2E2FB','#F0DCFA','#EDD6FA','#EAD0F9','#E4C5F4','#D8B3E8','#CBA0DB','#BF8DCF','#B27AC2','#A668B6','#9955A9','#8D429D','#803195','#702BA2','#6025AF','#501FBC','#4018CA','#3012D7','#200CE4','#1006F1','#0000FF'];
var intervals = []; for (var i = 0; i < gradient.length; ++i) intervals.push((6 / gradient.length) * i - 3)
var grad = function (vals) {
  var colors = [];
  for (var ii = 0; ii < vals.length; ++ii) {
    var diff = 1000;
    for (var val = 0; val < intervals.length; val++) {
      var newdiff = Math.abs (vals[ii] - intervals[val]);
      if (newdiff < diff) {
          diff = newdiff;
		  sel_col = gradient[val];
      };
    };
	colors.push(sel_col);
  };
  return colors;
};

var sc = []; for (var i = 0; i < gradient.length; ++i) sc.push(intervals[i] * 2)
var out_scale = function(val) {
  var out = [];
  for (var i = 0; i < val.length; ++i) {
    v = ''
    if(val[i] < -3.5 | val[i] > 3.5){
      v = val[i].toFixed(2);
    }
    out.push(v);
  }
  return(out)
}

/*var col_scale = []; 
rgb_grad = ["rgb(2, 63, 165)","rgb(108, 121, 181)","rgb(165, 171, 206)","rgb(210, 212, 226)","rgb(237, 237, 237)","rgb(230, 215, 217)","rgb(212, 170, 177)","rgb(186, 111, 127)","rgb(142, 6, 59)"];
var values = [0,0.222222222222222,0.333333333333333,0.444444444444444,0.555555555555556,0.666666666666667,0.777777777777778,0.888888888888889,1];
for (var i = 0; i < rgb_grad.length; ++i) col_scale.push(Array(values[i], rgb_grad[i]))*/

var xvals = []; for (var i = 0; i < gradient.length; ++i) xvals.push(i);
traceBar = {
  x: xvals, 
  y: intervals, 
  name: 'SPI', 
  opacity: 1, 
  type: 'bar',
  text: out_scale(sc),
  textposition: 'auto',
  textfont: {
    color: "white",
    size: 12
  },
  marker: {
	color: grad(intervals), 
	showscale: true,
	//colorscale: [[0, 'rgb(124, 6, 7)'], [0.5, 'rgb(235, 226, 226)'], [1,'rgb(31, 40, 162)']],
	colorscale: [[0, 'rgb(255,0,0)'], [0.25, 'rgb(255,170,0)'], [0.375, 'rgb(255,255,0)'], [0.5, 'rgb(255,255,255)'], [0.625, 'rgb(233,204,249)'], [0.75, 'rgb(131,51,147)'], [1,'rgb(0,0,255)']],
    cmax:3,
	cmin:-3,
    colorbar  :{
		//title      : "SPI",
		ticktext   : ["Extremely dry","Very dry","Dry","Normal","Wet","Very wet","Extremely wet"],
		tickvals   : [-3,-2,-1,0,1,2,3],
		thickness: 12,
		len: 0.9,
    }
  },
  hoverinfo:'y'
};


data = [traceBar];

layout = {
  autosize: true, 
  hovermode: 'closest', 
  		   hoverlabel: {
	         bgcolor: 'white',
			 font: {color: 'black'}
		   },
  showlegend: false, 
  xaxis: {
	//tickformat: '%m-%Y'
    ticks: 'outside',
    autorange: true, 
    //showline: false,
    type: 'category'	
  }, 
  yaxis: {
   //autotick: false,
   dtick: 0.5,
   range: [-3.6, 3.6], 
   title: 'SPI', 
   type: 'linear'
  }
};

Plotly.plot('plotly-div', {
  data: data,
  layout: layout
});
