
var intervals = [];
for (var i = 0; i < 50; ++i) intervals.push((6 / 50) * i - 3);

/*
var CumulBar = function () {
         function plot()
}();
*/
function plotCumulBar (data,dest) {
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
                       ,showlegend: true
                       ,xaxis: {autorange: true
                               ,tickmode: 'auto'
							                 ,showline: false
                               }
                       ,yaxis: {autorange: true
                               ,title: 'Monthly cumulative (mm)'
                               ,type: 'linear'
                               }
                       };
         Plotly.plot(idDest
                    ,{data: [pltlyTraces['spi']]
                     ,layout: pltlyLayout
                     }
                    );
}
function plotSPI (data,dest) {
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
                                       /*,text: out_scale(data.spis)
									                     ,textposition: 'auto'
                                       ,textfont: {color: "white"
									                                ,size: 12
                                                  }*/
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
                       ,yaxis: {autorange: true//false
                               ,range: [-3.6, 3.6]
							                 ,dtick: 0.5
							                 //,dtick: 1
                               //,title: 'SPI'
                               ,title: 'SPI ' + idDest.slice(-2)
                               ,type: 'linear'
                               }
/*					,annotations:[
    {
      x: data.months[10],
      y: 3.4,
      align: "center", 
	  showarrow: false,
      xref: 'x',
      yref: 'y',
      text: data.spis[10],
      font: {color: 'white'},
      align: 'center',
    }
  ]*/
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
                                                ,color: 'rgb(0, 0, 0)'
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
						,margin: {l: 50
								 ,r: 0
								 ,b: 0
								 ,t: 0
								}
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
         Plotly.newPlot(destElemId
                    ,{data: [pltlyTraces['MonthlyPrecipitation']
                            ,pltlyTraces['LongTermAvg']
                            ]
                     ,layout: pltlyLayout
                     }
                    );
}
function grad (vals) {
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
function out_scale (val) {
         var out = [];
         for (var i = 0; i < val.length; ++i) {
             v = '';
             if (val[i] < -3.5 | val[i] > 3.5){
                v = val[i].toFixed(2);
             }
             out.push(v);
         }
         return(out)
}

