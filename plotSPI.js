var intervals = [];
for (var i = 0; i < 50; ++i) intervals.push((6 / 50) * i - 3);

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
                              };
							           pltlyTraces['spi2'] = {x: data.months,
                                                  xaxis: 'x2',
  yaxis: 'y2'
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
                       ,hovermode: 'closest'
                       ,hoverlabel: {bgcolor: 'white'
                                    ,font: {color: 'black'}
                                    }
                       ,showlegend: false
                       ,xaxis: {anchor: 'y',autorange: true
                               //,nticks: data.months.length
                               //,nticks: 40
                               //,tickformat: "%m-%Y"
                               //,tickmode: 'auto'
							                 ,ticks: 'outside'
                               ,type: 'category'
                               }
                       ,yaxis: {autorange: true
                                ,domain: [0, 0.45]
                               ,range: [-3.6, 3.6]
							                 ,dtick: 0.5
							                 //,dtick: 1
                               //,title: 'SPI'
                               ,title: 'SPI ' + idDest.slice(-2)
                               ,type: 'linear'
                               }
                        ,xaxis2: {  title: "",
  zeroline: false,
  showline: false,
  showticklabels: false,
  showgrid: false}
  ,yaxis2: {domain: [0.55, 1],
          autorange: true
                               ,range: [-3.6, 3.6]
							                 ,dtick: 0.5
							                 //,dtick: 1
                               //,title: 'SPI'
                               ,title: 'SPI ' + idDest.slice(-2)
                               ,type: 'linear'}
                       };
 
         Plotly.plot("myDiv"
                     ,{data: [pltlyTraces['spi'],pltlyTraces['spi2']]
                     ,layout: pltlyLayout
                     }
                    );

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
data = {
  months: ['07-2016','08-2016','09-2016','10-2016','11-2016','12-2016','01-2017','02-2017','03-2017','04-2017','05-2017','06-2017'], 
  avgs: [96,78,55,32,24,20,14,14,20,46,46,95],
  stds: [40,30,32,24,18,16,16,12,18,29,40,40],
  spis: [0,1,-1,3,-3,2,-2,3.5,-3.6,-5,5,0.01],
  qnts: [96,60,35,9,4,16,9,0,6,20,27,92]
}

plotSPI(data, 'myDiv')
//console.log(grad([0,1,-1,3,-3,2,-2,3.5,-3.6,-5,5,0.01]))
