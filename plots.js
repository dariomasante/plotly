/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function plotSPI (data,dest) {
         console.log(dest,data);
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
		 
         pltlyTraces['spi'] = {x: data.months
                              ,y: data.spis
                              ,name: 'SPI'
                              ,marker: {
								color: grad(intervals) 
								,showscale: true
								,colorscale: [[0, 'rgb(124, 6, 7)'], [0.5, 'rgb(235, 226, 226)'], [1,'rgb(31, 40, 162)']]
								//,colorscale: [[0, 'rgb(142, 6, 59)'], [0.5, 'rgb(240, 240, 240)'], [1,'rgb(2, 63, 165)']]
								,cmax:3
								,cmin:-3
								,colorbar  :{
									title      : "SPI"
									,ticktext   : ["Extremely dry","Very dry","Drier than normal","Normal","Wetter than normal","Very wet","Extremely wet"]
									,tickvals   : [-3,-2,-1,0,1,2,3]
								}
							  }
                              //,opacity: 1
                              ,type: 'bar'
							  ,hoverinfo:'y'
							  ,text: out_scale(data.spis)
							  ,textfont: {
								color: "white",
								size: 12
							  }
                         };
         pltlyLayout = {autosize: true
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
                       ,yaxis: {autorange: false
                               ,range: [-3, 3]
							                 ,dtick: 0.5
							                 //,dtick: 1
                               ,title: 'SPI'
                               ,type: 'linear'
                               }
                       };
         Plotly.plot(destElemId
                     ,{data: [pltlyTraces['spi']]
                     ,layout: pltlyLayout
                     }
                    );
}
function plotPrecipitation (data,dest) {
         console.log(dest,data);
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
         pltlyTraces['LongTermAvg'] = {x: data.months
                                      ,y: data.avgs
                                      ,error_y: {symmetric: false
											    ,array: data.stds
												,arrayminus: err_bar(data.avgs,data.stds)
                                                ,color: 'black'
                                                }
                                      ,line: {color: 'rgba(0, 0, 0, 0.5)'
                                             ,dash: 'solid'
                                             ,shape: 'linear'
                                             ,width: 3
                                             }
                                      ,name: 'Long-term average'
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
                       ,hovermode: 'closest'
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
                               //,nticks: data.months.length
                               //,nticks: 40
                               //,tickformat: "%m-%Y"
                               //,showline: false
                               //,tickmode: 'auto'
							                 ,ticks: 'inside'
							                 ,type: 'category'
                               }
                       ,yaxis: {autorange: true
                               ,title: 'Precipitation (mm)'
                               ,type: 'linear'
                               }
                       };
         Plotly.plot(destElemId
                    ,{data: [pltlyTraces['MonthlyPrecipitation']
                            ,pltlyTraces['LongTermAvg']
                            ]
                     ,layout: pltlyLayout
                     }
                    );
}
function grad (vals) {
		 var gradient = ['#7C0607','#801314','#841D1E','#882526','#8C2D2D','#903435','#943B3C','#984243','#9D494A','#A15151','#A55858','#A95F5F','#AE6667','#B26E6E','#B67676','#BB7E7E','#BF8686','#C48F8F','#C99898','#CDA2A2','#D2ACAC','#D8B7B7','#DDC3C3','#E3D0D0','#EBE2E2','#E3E3EA','#D3D4E2','#C7C7DB','#BCBCD6','#B2B3D1','#A9AACC','#A0A1C7','#9899C3','#9091BF','#888ABB','#8183B7','#7A7CB4','#7375B1','#6D6EAD','#6668AB','#6062A8','#595CA5','#5356A3','#4D50A1','#464A9F','#40449E','#393D9E','#32379E','#29309F','#1F28A2'];
		 //var gradient = ['#8E063B','#952146','#9C3250','#A34059','#A94D63','#AF596D','#B56576','#BB7080','#C07B89','#C58592','#CA8F9A','#CE99A3','#D2A2AB','#D6ABB3','#DAB4BB','#DDBCC2','#E0C4C9','#E3CCD0','#E6D3D6','#E8D9DC','#EBDFE1','#EDE5E6','#EEE9EA','#EFEDEE','#F0F0F0','#F0F0F0','#EDEEEF','#EAEAEE','#E6E6EC','#E0E2E9','#DBDCE7','#D5D7E4','#CED1E1','#C7CADE','#C0C3DB','#B8BCD7','#B0B5D3','#A7ADCF','#9EA5CB','#959DC7','#8C94C3','#828CBE','#7883BA','#6D7AB6','#6270B1','#5667AD','#495DAA','#3B54A7','#2849A5','#023FA5'];
         var i,ii,val,diff;
         var intervals = [];
         for (i = 0; i < 50; ++i) intervals.push((6 / 50) * i - 3)
			   var colors = [];
         for (ii = 0; ii < vals.length; ++ii) {
             diff = 1000; // Just to generate the variable
             for (val = 0; val < intervals.length; val++) {
                 var newdiff = Math.abs (vals[ii] - intervals[val]);
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
    if(d < 0){
      err[i] = avg[i];
    }
	out.push(err[i]);
  }
  return(out)
}
var out_scale = function(val) {
  var out = [];
  for (var i = 0; i < val.length; ++i) {
    v = ''
    if(val[i] < -3 | val[i] > 3){
      v = val[i].toFixed(2);
    }
    out.push(v);
	;
  }
  return(out)
}
