dt = ['07-2016','08-2016','09-2016','10-2016','11-2016','12-2016','01-2017','02-2017','03-2017','04-2017','05-2017','06-2017'];
vals = [96,60,35,9,4,16,9,0,6,20,27,92];
avg = [96,78,55,32,24,20,14,14,20,46,46,95];

var month = function(str){
  var mm = [];
  var full = ['January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December'];
  for (var i = 0; i < str.length; ++i) {
    s = parseFloat(str[i].split("-")[0]) - 1;
    mm.push(full[s]);
  }  
  return mm
}

var month_color = function(m){
	var s = parseFloat(m.split("-")[0]) - 1;
	var c = ['#E16A86','#D47851','#BD8700','#9C9500','#6CA000','#00A849','#00AD7F','#00ACAA','#00A5CC','#3896E1','#9881E6','#C86DD7'];
	return c[s]
}

var make_trace = function(x){
  var names = month(x);
  var Bar = [];
  for (var i = 0; i < x.length; ++i) {
    var y_vals = Array(x.length).fill('NaN');
    for (var ii = i; ii < x.length; ++ii) {
      y_vals[ii] = vals[i];
    };
    var b = {
		  name: names[i],
		  text: names[i],
		  x:x,
		  y:y_vals,  
		  type: 'bar',
		  marker: {
			color: month_color(x[i]),
			opacity: 0.5,
			line: {
			  color: 'black',
			  width: 1
			}
		  },
		  hoverinfo: 'y+text',
		  showlegend: (i > 11) ? false : true
    }
    Bar.push(b);
  }
  return Bar
};

chartDiv = document.getElementById('plotly-div');
hoverData = document.getElementById('hover-data');

var cumul = [];
avg.reduce(function(a,b,i) { return cumul[i] = a+b; },0);

cumAvg = {
  x: dt, 
  y: cumul,  
  line: {
    color: 'rgba(0, 0, 0, 1)', 
    dash: 'solid', 
    shape: 'linear', 
    width: 1.5
  }, 
  name: 'Cumulative long-term average', 
  type: 'scatter', 
  hoverinfo: 'y'
};

tot = make_trace(dt);
tot.push(cumAvg);

layout = {
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

var data_months = ['07-2016','08-2016'];
chartDiv.on('plotly_hover', function(data){
    var point = data.points[0];
	var cumVals = [];
	vals.reduce(function(a,b,i) { return cumVals[i] = a+b; },0);
	var z = [];  for (var n = 0; n < vals.length; ++n) z.push(cumVals[n] - cumul[n])
	var tx = (z[point.pointNumber] < 0) ? "deficit ":"surplus ";  
    var text = 'Precipitation ' + tx + ' cumulated from ' + dt[0] + ' until ' + point.x +': ' + z[point.pointNumber] + ' mm';
    hoverData.innerHTML = text;
});

chartDiv.on('plotly_unhover', function(data){
   hoverData.innerHTML = ''; 
});
