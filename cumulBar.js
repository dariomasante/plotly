dt = ['07-2016','08-2016','09-2016','10-2016','11-2016','12-2016','01-2017','02-2017','03-2017','04-2017','05-2017','06-2017']; // String of months
avg = [96,78,55,32,24,20,14,14,20,46,46,95]; // Values of long-term average precipitation (monthly)
vals = [96,60,35,9,4,16,9,0,6,20,27,92]; // Values of monthly precipitation
std = [40,30,32,24,18,16,16,12,18,29,40,40]; // Values of standard deviations for the long-term monthly average

var make_trace = function(x){ // Function to make the cumulative stacked bars
  var bars = [];
  for (var i = 0; i < x.length; ++i) {
    var y_vals = Array(x.length).fill('NaN');
    for (var ii = i; ii < x.length; ++ii) { y_vals[ii] = vals[i] }
    var b = {
		  x:x,
		  y:y_vals,  
		  type: 'bar',
		  marker: {
			color: 'rgba(255,255,255,0)',
			line: {
			  color: 'black',
			  width: 1
			}
		  },
		  hoverinfo: 'none',
		  showlegend: false
    }
    bars.push(b);
  }
  return bars
};

var avg_cumul = []; avg.reduce(function(a,b,i) { return avg_cumul[i] = a+b; },0); // Calculate cumulative long-term average
var avg_text = []; for(var i = 0; i < avg_cumul.length; ++i) avg_text[i] = avg_cumul[i] + ' mm'; // Builds label for tooltip

var err_bar = function(avg,err) { // SAME FUNCTION AS FOR PRECIPITATION!!
  var out = [];
  for (var i = 0; i < avg.length; ++i) {
    var d = avg[i] - err[i];
    if(d < 0){
      err[i] = avg[i];
    }
	out.push(err[i]);
  }
  return out
}

var cumulStd = function(st_devs) { // Function to calculate the cumulative st. dev. (i.e. sqrt of cumulative monthly variances)
  var variance = [];
  for(var i = 0; i < st_devs.length; ++i) {
    variance.push(st_devs[i] * st_devs[i])
  }
  var cumul_std = [];
  variance.reduce(function(a,b,i) { return cumul_std[i] = a+b; },0);
  for(var ii = 0; ii < cumul_std.length; ++ii) {
    cumul_std[ii] = Math.sqrt(cumul_std[ii]);
  }
  return cumul_std
}

var c_std = cumulStd(std); // cumulative st. deviations of long term averages

cumAvg = { // Line of long term averages, plus error bar of cumulative st. dev.
  x: dt, 
  y: avg_cumul,
  error_y: {
    symmetric: false,
    array: c_std,
	arrayminus: err_bar(avg_cumul,c_std),
	color: 'black',
  },   
  line: {
    color: 'rgba(0, 0, 0, 1)', 
    dash: 'solid', 
    shape: 'linear', 
    width: 1.5
  }, 
  name: 'Cumulative long-term average', 
  type: 'scatter',
  text: avg_text,
  hoverinfo: 'text'
}

var vals_cumul = []; vals.reduce(function(a,b,i) { return vals_cumul[i] = a+b; },0); // Calculate cumulative monthly precipitation for period of interest
var delta = [];  for (var n = 0; n < vals_cumul.length; ++n) delta.push(vals_cumul[n] - avg_cumul[n]); // Calculate cumulative differences from long-term average (cumulative deficit surplis)

var grad_zero = function (vs) { // Function to associate colorscale colors to deficit/surplus values
  var vs_lt = vs.filter(function(v){return v < 0});
  vs_lt[vs_lt.indexOf(Math.max(...vs_lt))] = 0;
  var vs_gt = vs.filter(function(v){return v >= 0});
  vs_gt[vs_gt.indexOf(Math.min(...vs_gt))] = 0;
  var gradient_lt = ['#7C0607','#801314','#841D1E','#882526','#8C2D2D','#903435','#943B3C','#984243','#9D494A','#A15151','#A55858','#A95F5F','#AE6667','#B26E6E','#B67676','#BB7E7E','#BF8686','#C48F8F','#C99898','#CDA2A2','#D2ACAC','#D8B7B7','#DDC3C3','#E3D0D0','#EBE2E2','#FFFFFF'];
  var gradient_gt = ['#FFFFFF','#E3E3EA','#D3D4E2','#C7C7DB','#BCBCD6','#B2B3D1','#A9AACC','#A0A1C7','#9899C3','#9091BF','#888ABB','#8183B7','#7A7CB4','#7375B1','#6D6EAD','#6668AB','#6062A8','#595CA5','#5356A3','#4D50A1','#464A9F','#40449E','#393D9E','#32379E','#29309F','#1F28A2'];
  var gradient = [...gradient_lt,  ...gradient_gt];
  var intervals_lt = [Math.min(...vs_lt)]; for (var i = 0; i < (gradient_lt.length-1); ++i) intervals_lt.push(((Math.max(...vs_lt) - Math.min(...vs_lt)) / (gradient_lt.length-1) * (i+1) + Math.min(...vs_lt)));
  var intervals_gt = [Math.min(...vs_gt)]; for (var i = 0; i < (gradient_gt.length-1); ++i) intervals_gt.push(((Math.max(...vs_gt) - Math.min(...vs_gt)) / (gradient_gt.length-1) * (i+1) + Math.min(...vs_gt)));
  var intervals = [...intervals_lt, ...intervals_gt];
  var colors = [];
  for (var ii = 0; ii < vs.length; ++ii) {
    var diff = 100000;
    for (var val = 0; val < intervals.length; val++) {
      var newdiff = Math.abs (vs[ii] - intervals[val]);
      if (newdiff < diff) {
          diff = newdiff;
		  sel_col = gradient[val];
      }
    }
	colors.push(sel_col);
  }
  return colors
}

function cs_scale(x) { // Function to calibrate the colorbar based on the deficit/surplus values
  var range = [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1]; 
  var diff = Math.abs(Math.max(...x) - Math.min(...x));
  var dx = [];  for (var i = 0; i < range.length; ++i) dx.push(range[i] * diff + Math.min(...x));
  var cs_hex = grad_zero(dx);
  var out = [];  for (var ii = 0; ii < cs_hex.length; ++ii) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cs_hex[ii]);
    out.push([range[ii],"rgb(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + ")"]);
  }
  return out
}

month = function(str){ // Function to get the month name from number
  var full = ['January', 'February', 'March', 'April', 'May', 'June','July', 'August', 'September', 'October', 'November', 'December'];
  var mm = []; for (var i = 0; i < str.length; ++i) {
    mm[i] = full[parseFloat((str[i]).split("-")[0]) - 1];
  }
  return mm
}

hover_text = function(dt){ // Function to build the text box shown on hovering over the bars
  var dtx = [];
  mnt = month(dt);
  for (var d = 0; d < dt.length; d++) {
    var add = []; for (var dd = 0; dd <= d; dd++) {
	  add.unshift('<i>' + mnt[dd] + ': ' + vals[dd] + ' mm<i\><br\>');
	  if(dd >= 6){ // Show only last 6 months on hover
        add.splice(6, 1);
		add[6] = '[...]';
	  }
    }
    add.unshift('<B>' + vals_cumul[d] + ' mm</B> - Total precipitation<br\>from ' + dt[0] + ' to ' + dt[d] + '<br\><br\>');
    dtx[d] = add.join('');
  };
  return dtx
}

var cs = grad_zero(delta); // Bars colors
fullBar = { // Full color bars representing total cumulative precipitation, overlapping the stacked ones
  x: dt, 
  y: vals_cumul, 
  name: '',  
  type: 'bar',
  text: hover_text(dt),
  hoverinfo:'text',
  base: dt, // This allows overlapping bars
  marker: {
	showscale: true,
	color: cs,
	colorscale: cs_scale(delta),//[[0, 'rgb(124, 6, 7)'], [0.5, 'rgb(235, 226, 226)'], [1,'rgb(31, 40, 162)']],//
	cmax:Math.max(...delta),//(Math.max(...delta) < 0) ? 0:Math.max(...delta),
	cmin:Math.min(...delta),//(Math.min(...delta) > 0) ? 0:Math.min(...delta),
	colorbar  :{
		tickvals   : [Math.min(...delta),Math.max(...delta)],
		thickness: 12,
		len: 0.7,
		title: 'Cumulative<br\>deficit / surplus<br\>(mm)'
    }
  },
  showlegend: false,
};

tot = make_trace(dt); // Stacked cumulative bars, shown as transparent boxes
tot.push(cumAvg); // Add the long-term cumulative average (see above)
tot.unshift(fullBar); // Add the color bars (see above)

layout = { // General plot layout
  autosize: true, 
  barmode: 'stack',
  hoverlabel: {
    bgcolor: 'white',
    font: {color: 'black'}
  },
  legend: {bgcolor: '#fff',
    xanchor:"center",
    yanchor:"top",
	orientation: "h",
    y:-0.2,
    x:0.5   
  },
  showlegend: true, 
  xaxis: {
    autorange: true, 
    showline: false, 
    tickmode: 'auto'
  }, 
  yaxis: {
    autorange: true, 
    title: 'Monthly cumulative (mm)', 
    type: 'linear'
  }
};

Plotly.plot('plotly-div', {
  data: tot,
  layout: layout
});

// Below a new div is built to show dynamically the values of deficit/precipitation
chartDiv = document.getElementById('plotly-div');
hoverData = document.getElementById('hover-data');
chartDiv.on('plotly_hover', function(data){
    var point = data.points[0];
	var tx = (delta[point.pointNumber] < 0) ? "deficit ":"surplus ";  
    var text = 'Precipitation ' + tx + ' cumulated from ' + dt[0] + ' until ' + point.x +': ' + delta[point.pointNumber] + ' mm';
    hoverData.innerHTML = text;
});

chartDiv.on('plotly_unhover', function(data){
   hoverData.innerHTML = ''; 
});
