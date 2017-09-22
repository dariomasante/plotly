function plotLdiBar (data,dest) {
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
         try { // resetting..
             elDest.innerHTML = "";
             Plotly.purge(destElemId);
             i = 0;
             for (k in data) {
                 Plotly.deleteTraces(destElemId, i);
                 i++;
             }
         }   catch (e) {}
         pltlyTraces['low'] = {x: data.refDate
                                               ,y: data.low
                                               ,name: 'Low'
                                               ,opacity: 1
                                               ,type: 'bar'
                                               ,  marker: {
													color: 'yellow'
													}
                                               };
		 pltlyTraces['medium'] = {x: data.refDate
                                               ,y: data.medium
                                               ,name: 'Medium'
                                               ,opacity: 1
                                               ,type: 'bar'
                                               ,  marker: {
													color: 'orange'
													}
                                               };
         pltlyTraces['high'] = {x: data.refDate
                                               ,y: data.high
                                               ,name: 'High'
                                               ,opacity: 1
                                               ,type: 'bar'       
                                               ,  marker: {
													color: 'red'
													}
                                               };
         pltlyLayout = {autosize: true,
                        barmode: 'stack',
					                       showlegend: true
                       ,xaxis: {type: 'date'}
                       ,yaxis: {autorange: true
                               ,title: '% of the whole region'
                               ,type: 'linear'
                               }
                       ,margin: {t: 10
                                }
                       };
         Plotly.newPlot(destElemId
                    ,{data: [pltlyTraces['low'],pltlyTraces['medium'],pltlyTraces['high']]
                     ,layout: pltlyLayout
                     }
                    );
}
function plotCumulBar (data,dest) {
         var i,k;
         var idDest,elDest;
         var pltlyTraces = {};
         var pltlyLayout;
		 var avg_cumul = []; data.avgs.reduce(function(a,b,i) { return avg_cumul[i] = a+b; },0); // Calculate cumulative long-term average
		 var avg_text = []; for(var i = 0; i < avg_cumul.length; ++i) avg_text[i] = avg_cumul[i] + ' mm'; // Builds label for tooltip
		 var c_std = cumulStd(data.stds); // cumulative st. deviations of long term averages
		 var vals_cumul = []; data.qnts.reduce(function(a,b,i) { return vals_cumul[i] = a+b; },0); // Calculate cumulative monthly precipitation for period of interest
		 var delta = [];  for (var n = 0; n < vals_cumul.length; ++n) delta.push(vals_cumul[n] - avg_cumul[n]); // Calculate cumulative differences from long-term average (cumulative deficit surplis)
		 var cs = grad_zero(delta); // Bars colors
		 var dtx = []; // The text box shown on hovering over the bars
		 var full = ['January', 'February', 'March', 'April', 'May', 'June','July', 'August', 'September', 'October', 'November', 'December'];
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

		for (var d = 0; d < data.months.length; d++) {
		  var add = []; for (var dd = 0; dd <= d; dd++) {
		  add.unshift('<i>' + full[parseFloat((data.months[dd]).split("-")[1]) - 1] + ': ' + data.qnts[dd] + ' mm<i\><br\>');
			  if(dd >= 6){ // Show only last 6 months on hover
				add.splice(6, 1);
				add[6] = '[...]';
			  }
		  }
		  var tx = (delta[d] < 0) ? "deficit ":"surplus ";
		  add.unshift('<B>' + vals_cumul[d] + ' mm</B> - Total precipitation<br\>from ' + data.months[0] + ' to ' + data.months[d] + '<br\><br\>' + '<B>Cumulated ' + tx + delta[d] + ' mm</B><br\><br\>');
		  dtx[d] = add.join('');
		};
		  var pltlyTraces = make_trace(data.months, data.qnts); // Make traces for stacked monthly boxes
		pltlyTraces.unshift( { // Full color bars representing total cumulative precipitation, overlapping the stacked ones
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
									colorscale: cs_scale(delta),
									cmax:Math.max(...delta),
									cmin:Math.min(...delta),
									colorbar  :{
										tickvals   : [Math.min(...delta),Math.max(...delta)],
										thickness: 12,
										len: 0.7,
										title: 'Cumulative<br\>deficit / surplus<br\>(mm)'
									}
								  },
								  showlegend: false,
								});
 		 
		 pltlyTraces.push( {  // Line of long term averages, plus error bar of cumulative st. dev.
									  x: data.months, 
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
									});
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
					   ,margin: {t: 10}
                       ,showlegend: true
                       ,xaxis: {autorange: true
                               ,tickmode: 'auto'
							   ,showline: false
							   ,type:'category'
                               }
                       ,yaxis: {autorange: true
                               ,title: 'Monthly cumulative (mm)'
                               ,type: 'linear'
                               }
                       };
         Plotly.plot(idDest
                    ,{data: pltlyTraces
                     ,layout: pltlyLayout
                     }
                    );
}
function plotSPI (data,dest) {
         var i,k;
         var idDest,elDest;
         var pltlyTraces = {};
         var pltlyLayout;
		 /*for(var i = 0; i < data.spis.length; i++){ // Round to 2 decimal
			data.spis[i] = data.spis[i].toFixed(2); 
		 }*/
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
                                       //,colorscale: [[0, 'rgb(124, 6, 7)'], [0.5, 'rgb(235, 226, 226)'], [1,'rgb(31, 40, 162)']]
								                       ,colorscale: [[0, 'rgb(255,0,0)'], [0.25, 'rgb(255,170,0)'], [0.375, 'rgb(255,255,0)'], [0.5, 'rgb(255,255,255)'], [0.625, 'rgb(233,204,249)'], [0.75, 'rgb(131,51,147)'], [1,'rgb(0,0,255)']]
                                       ,cmax:3
                                       ,cmin:-3
                                       ,colorbar: {//title      : "SPI"
                                                  ticktext   : ["Extremely dry","Very dry","Dry","Normal","Wet","Very wet","Extremely wet"]
                                                  ,tickvals   : [-3,-2,-1,0,1,2,3]
                                                  ,thickness: 12
                                                  ,len: 0.9
                                                  }
                                       }
                                       //,opacity: 1
                                       ,type: 'bar'
                                       ,hoverinfo:'y'
                              };
         pltlyLayout = {autosize: true
                       ,margin: {b: 50
                                ,t: 10
                                }
                       ,hovermode: 'closest'
                       ,hoverlabel: {bgcolor: 'white'
                                    ,font: {color: 'black'}
                                    }
                       ,showlegend: false
                       ,xaxis: {autorange: true
                               //,nticks: data.months.length
                               //,nticks: 40
                               //,tickformat: "%m-%Y"
                               //,tickmode: 'auto'
							                 ,ticks: 'outside'
                               ,type: 'category'
                               }
                       ,yaxis: {autorange: true
                               ,range: [-3.6, 3.6]
							                 ,dtick: 0.5
							                 //,dtick: 1
                               //,title: 'SPI'
                               ,title: 'SPI ' + idDest.slice(-2)
                               ,type: 'linear'
                               }
                       };
         Plotly.plot(idDest
                     ,{data: [pltlyTraces['spi']]
                     ,layout: pltlyLayout
                     }
                    );
}
function plotPrecipitation (data,dest) {
         var i,k;
         var destElemId,elDest;
         var pltlyTraces = {};
         var pltlyLayout;
		 for(var i = 0; i < data.avgs.length; i++){ // Round to 2 decimal
			data.avgs[i] = data.avgs[i].toFixed(2); 
			data.stds[i] = data.stds[i].toFixed(2)
		 }
		 var stdevSwitch = (data.months.length < 120) ? {symmetric: false
                                                ,array: data.stds
                                                ,arrayminus: err_bar(data.avgs,data.stds)
                                                ,color: 'rgb(0, 0, 0)'
												,width: 3
                                                ,thickness: 1}:{};
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
         pltlyTraces['LongTermAvg'] = {x: data.months
                                      ,y: data.avgs
                                      ,error_y: stdevSwitch
                                      ,line: {color: 'rgba(0, 0, 0, 0.5)'
                                             ,dash: 'solid'
                                             ,shape: 'linear'
                                             ,width: 3
                                             }
                                      ,name: 'Long-term average (1981-2010)'
                                      ,type: 'scatter'
                                      ,hoverinfo:'y'
                                      };
         pltlyTraces['MonthlyPrecipitation'] = {x: data.months
                                               ,y: data.qnts
                                               ,name: 'Monthly precipitation'
                                               ,opacity: 1
                                               ,type: 'bar'
											   ,hoverinfo:'y' 
                                               };
         pltlyLayout = {autosize: true
                       ,margin: {r: 130 //NOTE exporting to png leaves wide right margin
                                ,b: 0
                                ,t: 10
                                }
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
                               //,tickformat: "%m-%Y"
                               //,tickmode: 'auto'
							   //,ticks: 'inside'
							   ,type: 'category'
							   //,dtick: 'M1'
							   //,tick0: m0 //data.months[0].toISOString().slice(0, 10)
                               }
                       ,yaxis: {autorange: true
                               ,title: 'Precipitation (mm)'
                               ,type: 'linear'
                               }
                       };
         Plotly.newPlot(destElemId
                    ,{data: [pltlyTraces['MonthlyPrecipitation']
                            ,pltlyTraces['LongTermAvg']
                            ]
                     ,layout: pltlyLayout
                     }
                    );
}
function grad (vals) {
		 var intervals = []; for (var i = 0; i < 50; ++i) intervals.push((6 / 50) * i - 3);
         //var gradient = ['#7C0607','#801314','#841D1E','#882526','#8C2D2D','#903435','#943B3C','#984243','#9D494A','#A15151','#A55858','#A95F5F','#AE6667','#B26E6E','#B67676','#BB7E7E','#BF8686','#C48F8F','#C99898','#CDA2A2','#D2ACAC','#D8B7B7','#DDC3C3','#E3D0D0','#EBE2E2','#E3E3EA','#D3D4E2','#C7C7DB','#BCBCD6','#B2B3D1','#A9AACC','#A0A1C7','#9899C3','#9091BF','#888ABB','#8183B7','#7A7CB4','#7375B1','#6D6EAD','#6668AB','#6062A8','#595CA5','#5356A3','#4D50A1','#464A9F','#40449E','#393D9E','#32379E','#29309F','#1F28A2'];
		     var gradient = ['#FF0000','#FF1400','#FF2900','#FF3E00','#FF5300','#FF6800','#FF7C00','#FF9100','#FFA600','#FFB200','#FFBD00','#FFC700','#FFD100','#FFDC00','#FFE600','#FFF100','#FFFB00','#FFFF14','#FFFF34','#FFFF53','#FFFF72','#FFFF91','#FFFFB0','#FFFFD0','#FFFFEF','#FDFBFE','#FAF5FD','#F8EFFD','#F5E9FC','#F2E2FB','#F0DCFA','#EDD6FA','#EAD0F9','#E4C5F4','#D8B3E8','#CBA0DB','#BF8DCF','#B27AC2','#A668B6','#9955A9','#8D429D','#803195','#702BA2','#6025AF','#501FBC','#4018CA','#3012D7','#200CE4','#1006F1','#0000FF'];
         var i,val,diff,newdiff;
			   var colors = [];
         for (i = 0; i < vals.length; ++i) {
             diff = 1000; // Just to generate the variable
             for (val = 0; val < intervals.length; val++) {
                 newdiff = Math.abs (vals[i] - intervals[val]);
                 if (newdiff < diff) {
                    diff = newdiff;
                    var sel_col = gradient[val];
                 };
             };
             colors.push(sel_col);
         }
			   return colors;
}
function err_bar (avg,err) {
         var out = [];
         for (var i = 0; i < avg.length; ++i) {
             var d = avg[i] - err[i];
             if (d < 0) {
                err[i] = avg[i];
             }
             out.push(err[i]);
         }
         return (out)
}
/*function out_scale (val) {
         var out = [];
         for (var i = 0; i < val.length; ++i) {
             v = '';
             if (val[i] < -3.5 | val[i] > 3.5){
                v = val[i].toFixed(2);
             }
             out.push(v);
         }
         return(out)
}*/
function make_trace (x, vals){ // Function to make the cumulative stacked bars
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
function grad_zero (vs) { // Function to associate colorscale colors to deficit/surplus values
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
function cumulStd (st_devs) { // Function to calculate the cumulative st. dev. (i.e. sqrt of cumulative monthly variances)
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
function cs_scale (x) { // Function to calibrate the colorbar based on the deficit/surplus values
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
