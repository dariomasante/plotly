// TODO: 
/* 
- ?Add categorical timeseries for RDrI clicked cell (single horizontal bar)
*/
function pltModebar () { // Sets mode/action bar icons available on plotly plots
	 return {displaylogo: false, modeBarButtonsToRemove: ['sendDataToCloud','toggleSpikelines','resetViews','zoomIn2d','zoomOut2d','resetScale2d']}
}
function plotLdiBar (data,dest) { // Function to generate the LDI bar plot
		     var i,k;
         var destElemId,elDest;
         var pltlyTraces = {};
         var pltlyLayout;
         switch (typeof(dest)) {
           case "string":
                destElemId = dest;
                elDest = document.getElementById(destElemId);
                break;
           default:
                break;
         }
         try { // resetting all plotly charts..
             elDest.innerHTML = "";
             Plotly.purge(destElemId);
             i = 0;
             for (k in data) {
                 Plotly.deleteTraces(destElemId, i);
                 i++;
             }
         }   catch (e) {}
		 // Make three traces, one for each LDI class
         pltlyTraces['low'] = {x: data.refDate
                              ,y: data.low
                              ,name: 'Low'
                              ,opacity: 1
                              ,type: 'bar'
                              ,marker: {color: 'yellow'}
							  ,hoverinfo: 'y'
                              };
         pltlyTraces['medium'] = {x: data.refDate
                                 ,y: data.medium
                                 ,name: 'Medium'
                                 ,opacity: 1
                                 ,type: 'bar'
                                 ,marker: {color: 'orange'}
								 ,hoverinfo: 'y'
                                 };
         pltlyTraces['high'] = {x: data.refDate
                               ,y: data.high
                               ,name: 'High'
                               ,opacity: 1
                               ,type: 'bar'       
                               ,marker: {color: 'red'}
								 ,hoverinfo: 'y'
                               };
         pltlyLayout = {autosize: true
                       ,barmode: 'stack'
                       ,showlegend: true
                       ,xaxis: {type: 'date'}
                       ,yaxis: {autorange: true
                               ,fixedrange: true
                               ,title: '% of the<br>whole region'
                               ,type: 'linear'
                               }
						,height: 200
                       ,margin: {t: 20
                                ,b: 30
                                }
					   /*,images: [
    {
      x: 1.15,
      y: -0.1,
      sizex: 0.5,
      sizey: 0.5,
      source: "https://upload.wikimedia.org/wikipedia/commons/8/84/European_Commission.svg",
      xanchor: "right",
      xref: "paper",
      yanchor: "bottom",
      yref: "paper"
    }
  ]*/
                       };
         Plotly.newPlot(destElemId
                       ,[pltlyTraces['high'],pltlyTraces['medium'],pltlyTraces['low']]
					   ,pltlyLayout
					   ,pltModebar()
                       );
}
function plotCumulBar (data,dest) {  // Function to generate cumulative precip. barplot
         var i,k;
         var idDest,elDest;
         var nMaxMonths = 36; // Max number of months for the full stack and std.dev. bars to be shown
         var pltlyTraces = (data.months.length < nMaxMonths) 
	                         ? make_trace(data.months, data.qnts)		
	                         : []; // Make traces for stacked monthly boxes
         var pltlyLayout;
         var avg_cumul = []; data.avgs.reduce(function(a,b,i) { return avg_cumul[i] = a+b; },0); // Calculate cumulative long-term average
         var avg_text = avg_cumul.map(function (num) {return num + ' mm';}); // Builds label for tooltip
         var c_std = cumulStd(data.stds); // cumulative st. deviations of long term averages
         var vals_cumul = []; data.qnts.reduce(function(a,b,i) { return vals_cumul[i] = a+b; },0); // Calculate cumulative monthly precipitation for period of interest
         var delta = [];  for (var n = 0; n < vals_cumul.length; ++n) delta.push(vals_cumul[n] - avg_cumul[n]); // Calculate cumulative differences from long-term average (cumulative deficit surplis)
         // for old browser compatibility, instead of: Math.min(...delta);
         M = Math.max.apply(null,delta); // This is used several times, so create in the root
         m = Math.min.apply(null,delta); // This is used several times, so create in the root
		 var heightColorbar = 0.7;
		 var tickLimit = heightColorbar / 3;
         var ticksColorbar = [m, (Math.abs(m*(heightColorbar / (M + m))) > tickLimit) ? Math.round(m / 2) : '', 0, (Math.abs(M*(heightColorbar / (M + m))) > tickLimit) ? Math.round(M / 2) : '', M];
         var cs = grad_zero(delta); // Bars colors
         var dtx = []; // The text box shown on hovering over the bars
         var full = ['January', 'February', 'March', 'April', 'May', 'June','July', 'August', 'September', 'October', 'November', 'December'];
		 var stdVars = stdAreaLine (data.months, avg_cumul, c_std, nMaxMonths);
         switch (typeof(dest)) {
           case "string":
                idDest = dest;
                elDest = document.getElementById(idDest);
                break;
           default:
                break;
         }
         try { // resetting..
             elDest.innerHTML = "";
             Plotly.purge(idDest);
             i = 0;
             for (k in data) {
                 Plotly.deleteTraces(idDest, i);
                 i++;
             }
         }   catch (e) {}
		 // Loop through months to make the info hovering box with the last six
         for (var d = 0; d < data.months.length; d++) {
             var add = [];
             for (var dd = 0; dd <= d; dd++) { // Find which months to show
                 add.unshift('<i>' + full[parseFloat((data.months[dd]).split("-")[1]) - 1] + ': ' + data.qnts[dd] + ' mm<i\><br\>');
                 if (dd >= 4){ // Show only last 4 months on hover
                    add.splice(4, 1);
                    add[4] = '[...]';
                 }
             }
			 // Dynamically bind with a meaningful text
             var tx = (delta[d] < 0) ? "deficit: ":"surplus: ";
             add.unshift(vals_cumul[d] + ' mm - Cumulative precipitation<br\>from '
                         + data.months[0] + ' to ' + data.months[d] + '.<br\><br\><B>' 
						 + Math.round(vals_cumul[d] / (vals_cumul[d] - delta[d]) * 100) + '% of normal</B> for the period.' 
                         + '<br\>' + '<B>Cumulated ' + tx + delta[d] + ' mm</B><br\><br\>');
             dtx[d] = add.join('');
         }
         pltlyTraces.unshift({ // Full color bars representing total cumulative precipitation, overlapping the stacked ones
                              x: data.months, 
                              y: vals_cumul, 
                              name: '',  
                              type: 'bar',
                              text: dtx,
                              hoverinfo:'text',
                              base: data.months, // This allows bars overlap
                              marker: {
                                showscale: true,
                                color: cs,
                                colorscale: cs_scale(), // Watch out, uses m and M generated in the root
                                cmax: M,
                                cmin: m,
                                colorbar  : {
                                  tickvals   : ticksColorbar,
								  //ticktext : ticksColorbar.map(function (num) {return Math.round(num)}), // Round to integer mm
								  ticklen: 2,
                                  thickness: 12,
                                  len: heightColorbar,
                                  title: 'Cumulative<br\>deficit / surplus<br\>(mm)'
                                }
                              },
                              showlegend: false
                             }
                            );
         pltlyTraces.push({  // Line of long term averages, plus error bar of cumulative st. dev.
                          x: data.months, 
                          y: avg_cumul,
                          error_y: stdVars[0]
                          ,line: {
                            color: 'rgba(0, 0, 0, 0.5)', 
                            dash: 'solid', 
                            shape: 'linear', 
                            width: 2
                          } 
                          ,name: 'Cumulative long-term average (1981-2010), with cumulative st. dev.'
                          ,type: 'scatter'
                          ,text: avg_text
                          ,hoverinfo: 'text'
						              ,legendgroup: 'longTermStats'
                          });
		 pltlyTraces.push.apply(pltlyTraces,stdVars[1]);
         pltlyLayout = {autosize: true
                       ,barmode: 'stack'
                       ,hoverlabel: {bgcolor: 'white'
                                    ,font: {color: 'black'}
                                    }
                       //,hovermode: 'closest'
                       ,legend: {bgcolor: '#fff'
                                ,xanchor:"center"
                                ,yanchor:"top"
                                ,orientation: "h"
                                ,y:-0.2
                                ,x:0.5   
                              }
					             ,margin: {b: 70
                                ,t: 10
                                }
                       ,showlegend: true
                       ,xaxis: {autorange: true
							   ,showline: true
                               ,tickmode: 'auto'
							                 ,showline: false
                               ,type:'category'
                               }
                       ,yaxis: {autorange: true
							   ,rangemode: 'nonnegative'
							   ,fixedrange: true
                               ,title: 'Monthly cumulative (mm)'
                               ,type: 'linear'
                               } 
                       };
         Plotly.plot(idDest
                    ,pltlyTraces
                     ,pltlyLayout
                     ,pltModebar()
                    );
}
function plotSPI (data,dest) { // Function to generate SPI barplots
         var i,k;
         var idDest,elDest;
         var pltlyTraces = {};
         var pltlyLayout;
         switch (typeof(dest)) {
           case "string":
                idDest = dest;
                elDest = document.getElementById(idDest);
                break;
           default:
                
                break;
         }
         try { // resetting..
             elDest.innerHTML = "";
             Plotly.purge(idDest);
             i = 0;
             for (k in data) {
                 Plotly.deleteTraces(idDest, i);
                 i++;
             }
         }   catch (e) {}
         pltlyTraces['spi'] = {x: data.months
                              ,y: data.spis
                              ,name: 'SPI'
                              ,marker: {//,color: grad(steps())
								                       color: grad(data.spis)
                                       ,showscale: true
								                       //,colorscale: [[0, 'rgb(255,0,0)'], [0.25, 'rgb(255,170,0)'], [0.375, 'rgb(255,255,0)'], [0.5, 'rgb(255,255,255)'], [0.625, 'rgb(233,204,249)'], [0.75, 'rgb(131,51,147)'], [1,'rgb(0,0,255)']]
										,colorscale: [[0, 'rgb(255,0,0)'], [0.25, 'rgb(255,170,0)'], [0.375, 'rgb(255,255,0)'], [0.5, 'rgb(255,255,255)'], [0.625, 'rgb(233,204,249)'], [0.75, 'rgb(176,81,195)'], [1,'rgb(122,0,122)']]
                                       ,cmax:3
                                       ,cmin:-3
                                       ,colorbar: {//title      : "SPI"
                                                  ticktext   : ["Extremely dry","Very dry","Dry","Normal","Wet","Very wet","Extremely wet"]
                                                  ,tickvals   : [-3,-2,-1,0,1,2,3]
												                          ,ticklen: 2
                                                  ,thickness: 12
                                                  ,len: 0.9
                                                  }
                                       }
                                       ,type: 'bar'
                                       ,text: data.months
                                       ,hoverinfo: 'y+text'
                              };
		// Add a trace to cope with missing values, by adding a grey column.
		 pltlyTraces['nan'] = greyNaN(data.months, data.spis);
         pltlyLayout = {autosize: true
                       ,margin: {b: 70
                                ,t: 10
                                }
					   ,barmode: 'stack'
                       ,hoverlabel: {bgcolor: 'white'
                                    ,font: {color: 'black'}
                                    }
                       ,showlegend: false
                       ,xaxis: {autorange: true
							   ,ticks: 'outside'
                               ,type: 'category'
                               }
                       ,yaxis: {autorange: true
                               //,range: [-3.6, 3.6]
                               ,fixedrange: true
							                 ,dtick: 0.5
                               //,title: 'SPI'
                               ,title: 'SPI ' + idDest.slice(-2)
                               ,type: 'linear'
                               }
                       };
         Plotly.plot(idDest
                    ,[pltlyTraces['spi'], pltlyTraces['nan']]
                     ,pltlyLayout
                     ,pltModebar()
                    );
}
function plotPrecipitation (data,dest) { // Function to generate precipitation barplot
         var i,k;
         var destElemId,elDest;
         var pltlyTraces = [];
         var pltlyLayout;
         var nMaxMonths = 36; // Max number of months for std.dev. to be shown as bars, not shade
         var stdVars = stdAreaLine (data.months, data.avgs, data.stds, nMaxMonths);
         var labelPerc = []; for (i = 0; i < data.qnts.length; i++) {labelPerc[i] = data.qnts[i] + ' mm<br\>' + Math.round(data.qnts[i] / data.avgs[i] * 100) + '% of normal'};
         switch (typeof(dest)) {
           case "string":
                destElemId = dest;
                elDest = document.getElementById(destElemId);
                break;
           default:
                
                break;
         }
         try { // resetting..
             elDest.innerHTML = "";
             Plotly.purge(destElemId);
             i = 0;
             for (k in data) {
                 Plotly.deleteTraces(destElemId, i);
                 i++;
             }
         }   catch (e) {}
         pltlyTraces.push({x: data.months
                          ,y: data.qnts
                          ,name: 'Monthly precipitation'
                          ,opacity: 1
                          ,type: 'bar'
                          ,text: labelPerc 
                          ,hoverinfo: 'text'
                          });
         pltlyTraces.push({x: data.months
                          ,y: data.avgs
                          ,error_y: stdVars[0]
                          //,error_y: stdevSwitch
                          ,line: {color: 'rgba(0, 0, 0, 0.5)'
                                 ,dash: 'solid'
                                 ,shape: 'linear'
                                 ,width: 2
                                 }
                          ,name: 'Long-term average (1981-2010), with st. dev.'
                          ,type: 'scatter'
                          ,hoverinfo:'y'

                          ,legendgroup: 'longTermStats'
                          });
		 pltlyTraces.push.apply(pltlyTraces,stdVars[1]); // Show different look if more than n months are shown
         pltlyLayout = {autosize: true
                       ,margin: {r: 150 //NOTE exporting to png leaves wide right margin
                                ,b: 70
                                ,t: 10
                                }
					   ,barmode: 'stack'
                       //,hovermode: 'closest'
                       ,hoverlabel: {bgcolor: 'white'
                                    ,font: {color: 'black'}
                                    }
                       ,legend: {bgcolor: '#fff'
                                ,xanchor:"center"
                                ,yanchor:"top"
                                ,orientation: "h"
                                ,y:-0.2
                                ,x:0.5
		                            }
                       ,paper_bgcolor: '#fff'
                       ,showlegend: true
                       ,xaxis: {autorange: true
							   ,type: 'category'
                               }
                       ,yaxis: {autorange: true
                       ,fixedrange: true
							   ,rangemode: 'nonnegative'
                               ,title: 'Precipitation (mm)'
                               ,type: 'linear'
                               }
                       };
         Plotly.newPlot(destElemId
                    ,pltlyTraces
                     ,pltlyLayout
                    ,pltModebar()
                    );
}
function grad (vals) { // Function to assign color to columns in barplots
		     var intervals = []; for (var i = 0; i < 50; ++i) intervals.push((6 / 50) * i - 3); // Range of SPI colors between 3 and -3, by 50 steps of color (calculated off line with R) 
		     //var gradient = ['#FF0000','#FF1400','#FF2900','#FF3E00','#FF5300','#FF6800','#FF7C00','#FF9100','#FFA600','#FFB200','#FFBD00','#FFC700','#FFD100','#FFDC00','#FFE600','#FFF100','#FFFB00','#FFFF14','#FFFF34','#FFFF53','#FFFF72','#FFFF91','#FFFFB0','#FFFFD0','#FFFFEF','#FDFBFE','#FAF5FD','#F8EFFD','#F5E9FC','#F2E2FB','#F0DCFA','#EDD6FA','#EAD0F9','#E4C5F4','#D8B3E8','#CBA0DB','#BF8DCF','#B27AC2','#A668B6','#9955A9','#8D429D','#803195','#702BA2','#6025AF','#501FBC','#4018CA','#3012D7','#200CE4','#1006F1','#0000FF'];
		 var gradient = 
			['#FF0000','#FF1400','#FF2900','#FF3E00','#FF5300','#FF6800','#FF7C00','#FF9100','#FFA600','#FFB200','#FFBD00','#FFC700','#FFD100','#FFDC00','#FFE600','#FFF100','#FFFB00','#FFFF14','#FFFF34','#FFFF53','#FFFF72','#FFFF91','#FFFFB0','#FFFFD0','#FFFFEF','#FDFBFE','#FAF5FD','#F8EFFD','#F5E9FC','#F2E2FB','#F0DCFA','#EDD6FA','#EAD0F9','#E6C6F6','#DFB7F0','#D8A8E9','#D199E2','#CA8ADC','#C37BD5','#BC6CCF','#B55DC8','#AE4FC1','#A845B8','#A13BAF','#9B31A6','#94279D','#8D1D94','#87138B','#800982','#7A007A'];
         var i,val,newdiff;
			   var colors = [];
         for (i = 0; i < vals.length; ++i) {
             var diff = 10000; // Just to generate the variable
             for (val = 0; val < intervals.length; val++) { // Assign color (weird but more efficient way for interval matching)
                 newdiff = Math.abs (vals[i] - intervals[val]);
                 if (newdiff < diff) { // Tune the color range on values range
                    diff = newdiff;
                    var sel_col = gradient[val];
                 };
             };
             colors.push(sel_col);
         }
			   return colors;
}

function make_trace (x, vals){ // Function to make the cumulative stacked bars
         var bars = [];
         var k,i,ii;
         for (i = 0; i < x.length; ++i) {
            //var y_vals = Array(x.length).fill('NaN');
            var y_vals = Array(x.length);
            for (ii = i; ii < x.length; ++ii) { y_vals[ii] = 'NaN';}
            for (ii = i; ii < x.length; ++ii) { y_vals[ii] = vals[i];}
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
            };
            bars.push(b);
         }
         return bars;
};
function grad_zero (vs) { // Function to associate colorscale colors to deficit/surplus values.  Watch out, uses m and M generated in the root
  // Colorscale for deficit values
  var gradient_lt = ['#7C0607','#801314','#841D1E','#882526','#8C2D2D','#903435','#943B3C','#984243','#9D494A','#A15151','#A55858','#A95F5F','#AE6667','#B26E6E','#B67676','#BB7E7E','#BF8686','#C48F8F','#C99898','#CDA2A2','#D2ACAC','#D8B7B7','#DDC3C3','#E3D0D0','#EBE2E2','#FFFFFF'];
  // Colorscale for surplus values
  var gradient_gt = ['#FFFFFF','#E3E3EA','#D3D4E2','#C7C7DB','#BCBCD6','#B2B3D1','#A9AACC','#A0A1C7','#9899C3','#9091BF','#888ABB','#8183B7','#7A7CB4','#7375B1','#6D6EAD','#6668AB','#6062A8','#595CA5','#5356A3','#4D50A1','#464A9F','#40449E','#393D9E','#32379E','#29309F','#1F28A2'];
  var gradient = new Array(); gradient.push.apply(gradient,gradient_lt); gradient.push.apply(gradient,gradient_gt);
  var maxDark = Math.abs(m) > Math.abs(M) ? m : -M; // Get maximum deficit/surplus to calibrate color 
  var int_lt = Math.abs(maxDark) / (gradient_lt.length-1); // Calc. interval size for values below zero
  var intervals_lt = [maxDark]; for (var i = 0; i < (gradient_lt.length-1); ++i) intervals_lt.push(( int_lt * (i+1) + maxDark)); // Make interval sequence
  var int_gt = Math.abs(maxDark) / (gradient_gt.length-1); // Calc. interval size for values above equal zero
  var intervals_gt = [0]; for (var i = 0; i < (gradient_gt.length-1); ++i) intervals_gt.push(int_gt * (i+1)); // Make interval sequence
  var intervals = new Array(); intervals.push.apply(intervals,intervals_lt); intervals.push.apply(intervals,intervals_gt);
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
  return colors;
}
function cumulStd (st_devs) { // Function to calculate the cumulative st. dev. (i.e. sqrt of cumulative monthly variances)
  var variance = [];
  for(var i = 0; i < st_devs.length; ++i) {
    variance.push(st_devs[i] * st_devs[i]);
  }
  var cumul_std = [];
  variance.reduce(function(a,b,i) { return cumul_std[i] = a+b; },0);
  for(var ii = 0; ii < cumul_std.length; ++ii) {
    cumul_std[ii] = Math.sqrt(cumul_std[ii]);
  }
  return cumul_std;
}
function cs_scale () { // Function to calibrate the colorbar based on the deficit/surplus values (50 colors). Watch out, uses m and M generated in the root
  var range = [0,0.02,0.04,0.06,0.08,0.1,0.12,0.14,0.16,0.18,0.2,0.22,0.24,0.26,0.28,0.3,0.32,0.34,0.36,0.38,0.4,0.42,0.44,0.46,0.48,0.5,0.52,0.54,0.56,0.58,0.6,0.62,0.64,0.66,0.68,0.7,0.72,0.74,0.76,0.78,0.8,0.82,0.84,0.86,0.88,0.9,0.92,0.94,0.96,0.98,1]; 
  var diff = Math.abs(M - m);  
  var dx = [];  for (var i = 0; i < range.length; ++i) dx.push(range[i] * diff + m);
  var cs_hex = grad_zero(dx);
  var out = [];  for (var ii = 0; ii < cs_hex.length; ++ii) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cs_hex[ii]); // This translates color values from hexadecimals to RGB 
    out.push([range[ii],"rgb(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + ")"]);
  }
  return out;
}

function stdAreaLine (months, avg, std, nMonthsArea){ // Function to generate cumulative barplots for less than n months
  //var stdMinus = err_bar(avg,std);
  if(months.length < nMonthsArea){
    		var stdevSwitch = {//symmetric: false
                           array: std
                           //,arrayminus: stdMinus 
                           ,color: 'rgb(0, 0, 0)'
                           ,width: 3
                           ,thickness: 1
                        };
			var stdArea = [];
		 } else { 
			var stdevSwitch = {};
			var dplus = avg.map(function (num, idx) {return num + std[idx];});
			var dminus = avg.map(function (num, idx) {return num - std[idx];});
			var stdArea = [{x: months
							,y: dplus
							,type: 'scatter'                   // set the chart type
							,mode: 'lines'
							,line: {dash: 'dot', color: "black", width: 1}
					        ,showlegend: false
							,hoverinfo: 'none'
							,legendgroup: 'longTermStats'},
							{x: months
							,y: dminus
							,type: 'scatter'                    // set the chart type
							,mode: 'lines'
							,line: {dash: 'dot', color: "black", width: 1}
					        ,showlegend: false
							,hoverinfo: 'none'
							,legendgroup: 'longTermStats'
						}];
		 };
  return [stdevSwitch, stdArea];
};
function greyNaN (xvalues, yvalues){ // Function to make a trace for missing values, by adding a grey column instead of leaving empty.
  var out = [];
  var dt = Math.abs(Math.max.apply(null,yvalues)) + Math.abs(Math.min.apply(null,yvalues));
  for (var i = 0; i < yvalues.length; i++) {
     if(yvalues[i] == null){
		    out[i] = dt
     } else {
       out[i] = NaN
     }
  }
  return {x: xvalues
		  ,y: out
		  ,name: 'nan'
		  ,type: 'bar'
		  ,base: Math.min.apply(null,yvalues)
		  ,hoverinfo: 'none'
		  ,marker:{color: 'rgba(200,200,200,0.2)'}
		  ,showscale: false
		  ,showlegend: false
		  };
}

function anomalyTraces (vals, what){ // Function to make the percent anomaly stacked bars from cell values
		if(what === 'cont4fpTSgraph'){
			var anote = ['Above +2 (higher photosynt.)','Between +1 and +2','Near normal','Between -1 and -2','Below -2 (lower photosynt.)'];
			var bcol = ['rgb(0,130,0)','rgb(105,245,0)','rgb(239,237,245)','rgb(255,222,0)','rgb(255,0,0)']
		} else {
			var anote = ['Above +2 (drier)','Between +1 and +2','Near normal','Between -1 and -2','Below -2 (wetter)'];
			var bcol = ['rgb(255,0,0)','rgb(255,222,0)','rgb(239,237,245)','rgb(105,245,0)','rgb(0,130,0)']
		}
		var traces = [];
        for (var i = 0; i < bcol.length; ++i) {
			//if(i === 0 | i === 1){var leg = true} else { var leg = 'legendonly'}
            var b = {x: vals.months
					,y: vals[Object.keys(vals)[i+1]]
                    ,name: anote[i]
                    ,type: 'bar'
                    ,marker: {color: bcol[i]}
					//,visible: leg
					//,text: anote
					,hoverinfo: 'x+y'
                    };
            traces.push(b);
         }
		 traces.push({
			x: vals.months
			,y: vals.H2.map(function (num, idx) {  return (100 - num - vals.H1[idx] - vals.L2[idx] - vals.L1[idx] - vals.N[idx]) })
            ,name: 'No data'
            ,type: 'bar'
            ,marker: {color: 'rgb(190,190,190)'}
			,hoverinfo: 'x+y'
			//,visible: 'legendonly'
		 })
		 return(traces)
};

function plotSoilFapar (dataSet,dest) { // Function to generate the fapar/soil moisture bar plot
		 var i,k;
         var destElemId,elDest;
         var pltlyTraces = {};
         var pltlyLayout;
         switch (typeof(dest)) {
           case "string":
                destElemId = dest;
                elDest = document.getElementById(destElemId);
                break;
           default:
                break;
         }
         try { // resetting all plotly charts..
             elDest.innerHTML = "";
             Plotly.purge(destElemId);
             i = 0;
             for (k in dataSet) {
                 Plotly.deleteTraces(destElemId, i);
                 i++;
             }
         }   catch (e) {}
         pltlyLayout = {autosize: true
                       ,barmode: 'stack'
                       /*,hoverlabel: {bgcolor: 'black'
									,font: {color: 'white'}
									,namelength: -1
                                    }*/
                       ,showlegend: true
                       ,xaxis: {type: 'date'}
                       ,yaxis: {fixedrange: true
                               ,title: '% of the<br>whole region'
                               ,type: 'linear'
                               }
					   ,height: 200
                       ,margin: {t: 20
                                ,b: 30
                                }
                       };
         Plotly.newPlot(destElemId
                       ,anomalyTraces(dataSet, dest)
					   ,pltlyLayout
					   ,pltModebar()
                       );
}
