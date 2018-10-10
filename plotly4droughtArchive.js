var mngData2plot = function (o4plot,elDest) {
    //console.log(o4plot); // single geometry, single date
    
    let el4eventsTimebar = document.createElement('div');
    el4eventsTimebar.id = "eventsTimebar";
    el4eventsTimebar.style.width = "100%";
    elDest.appendChild(el4eventsTimebar);
    plotEventsTimebar (o4plot,el4eventsTimebar);

    let el4eventsBubbles = document.createElement('div');
    el4eventsBubbles.id = "eventsBubbles";
    //el4eventsBubbles.style.width = "100%";
    el4eventsBubbles.style.display = "flex";
    el4eventsBubbles.style.justifyContent = "center";
    
    elDest.appendChild(el4eventsBubbles);
    plotEventsBubbles (o4plot,el4eventsBubbles);

    /*let el4eventsIndicators = document.createElement('div');
    el4eventsIndicators.id = "eventsIndicators";
    el4eventsIndicators.style.width = "100%";
    elDest.appendChild(el4eventsIndicators);
    plotEventsIndicator (o4plot,el4eventsIndicators);*/	
};
var pltModebar = function () { // Sets mode/action bar icons available on plotly plots
	 return {displaylogo: false, modeBarButtonsToRemove: ['sendDataToCloud','toggleSpikelines','resetViews','resetScale2d','lasso2d','select2d']}//'zoomIn2d','zoomOut2d',
};
var whichEvent = function(dt, m) { // Function to return selected/active event
	var out = dt.peak_month.indexOf(m);
	if (out == -1){out = dt.end_month.indexOf(m)}
	return out;
};
var monthDiff = function (dt1, dt2) {
    var n,out,months;  
    var d1,d2;  
    var delta = [];  
    for (n = 0; n < dt2.length; ++n) {
        d1 = Array.isArray(dt1) ? (new Date(dt1[n] + '-15')) : (new Date(dt1 + '-15'));
        d2 = new Date(dt2[n] + '-15');	
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth() + 1;
        months += d2.getMonth();	
        out = months <= 0 ? 0 : months; 	
        delta.push(out);
    };
    return delta;
};
var hoverLabels = function(eventDates){
	var txt = []; 
    for (n = 0; n < eventDates.start_month.length; ++n) {
		txt.push(
			'Event from '+ eventDates.start_month[n] + ' to ' +
			eventDates.end_month[n] + '<br>' +
			'Peak month: '+ eventDates.peak_month[n] + '<br>' +
			'Severity: '+ eventDates.severity[n] + ' | ' +
			'Intensity: '+ eventDates.intensity[n] + '<br>' +
			'Duration: '+ eventDates.duration[n] + ' | ' +
			'Score: '+ eventDates.score[n] + '<br>' +
			'Average area: '+ eventDates.average_area[n] +
			'% (max: '+ eventDates.widest_area_perc[n]+'%)'
		);
	};
	return txt;
};
/*var annotationLabels = function(eventData, pt){
	if(eventData.id[pt] === undefined){return ''} else {
	var txt = 'Event from '+ eventData.start_month[pt] + ' to ' +
	eventData.end_month[pt] + '<br>' +
	'Peak month: '+ eventData.peak_month[pt] + '<br>' +
	'Severity: '+ eventData.severity[pt] + ' | ' +
	'Intensity: '+ eventData.intensity[pt] + '<br>' +
	'Duration: '+ eventData.duration[pt] + ' | ' +
	'Score: '+ eventData.score[pt] + '<br>' +
	'Average area: '+ eventData.average_area[pt] +
	'% (max: '+ eventData.widest_area_perc[pt]+'%)';
	return txt;}
};*/
function gradBars (vals) { // Function to assign color to columns in barplots
  var i;
  var intervals = zam.scales.score.color.domain();
  var scaleColors = zam.scales.score.color.range();
  var gradient = new Array();
  for (i=1; i < scaleColors.length; i++) {
      gradient.push('rgb('+scaleColors[i].join(',')+')');
  }
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
};

var colScale = function(colorObj){
	let scaleLimits = colorObj.domain();
	let scaleColors = colorObj.range();
	let step = 1/scaleLimits.length;
	let colorScale4plotly = new Array();
	for (n=0; n < scaleColors.length-1; n++) {
		colorScale4plotly.push(new Array(step*n
									,'rgb('+scaleColors[n+1].join(',')+')'));
		colorScale4plotly.push(new Array(step*(n+1)
									,'rgb('+scaleColors[n+1].join(',')+')'));
	}
	return colorScale4plotly;
};
var plotEventsTimebar = function (o4plot, dest) {
    var i,k,n;
    var dataSet = o4plot.data;
	var pm = whichEvent(dataSet,o4plot.info.month);
    var destElemId,elDest;
    var pltlyLayout;
	var indicatorName = o4plot.info.indicator;
/*	var pm = o4plot.data.peak_month.indexOf(o4plot.info.month);
	if(pm === -1){var pm = dataSet.end_month.indexOf(o4plot.info.month)};
	if(pm === -1){var pm = {}};*/
	var xSteps = Array.apply(null, {length: o4plot.hst['month'].length}).map(Function.call, Number);
    switch (typeof(dest)) {
      case "string":
           destElemId = dest;
           elDest = document.getElementById(destElemId);
           break;
      default:
           elDest = dest;
           destElemId = elDest.id;
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
    }   catch (e) {console.log(e);}
    // Make traces
 /*   var avg_area = [];
    for (n = 0; n < dataSet.average_area.length; ++n) {
        avg_area.push((dataSet.average_area[n] + 1)/30);
    };*/
	var lin = Array.apply(null, Array(dataSet.score.length)).map(function(){return 0.5});
	lin[pm] = 3;
    var eventBars = {x: dataSet.duration
                    ,y: dataSet.severity
                    ,name: 'Drought events'
                    ,type: 'bar'
                    ,orientation: 'h'
			        ,marker:{showscale: true
							,line:{width: lin, color:'purple'}
							,colorscale: colScale(zam.scales.score.color)
							,color: gradBars(dataSet.score)
						    ,cmin:1
							,cmax:23
                            ,colorbar:{title: 'Score'
                                      ,titleside: 'top'
                                      ,thickness:15
                                      //,xanchor:'left'
                                      //,x:1.08
                                      }
						  }
                    ,width: Math.max.apply(null,dataSet.severity) * 0.1//0.5 //avg_area
                    ,base: monthDiff(o4plot.hst.month[0], dataSet.start_month)
                    ,hoverinfo: "text"
                    ,text: hoverLabels(dataSet)	
                    ,hoverlabel: {
                       bgcolor: 'white',
                       font: {color: 'black'}
                      }
                    };
    var xMonthSteps = [];  
    for (n = 0; n < xMonthSteps.length; ++n) {
        d2 = new Date(dt2[n] + '-15');						
	}
	var indicatorLine = {x: xSteps
				,y: o4plot.hst[indicatorName.replace('-','').toUpperCase()]  
				,name: indicatorName
				,type:'line'
				,hoverinfo: 'y'
				//,visible: 'legendonly'
				,hoverlabel: {
                    bgcolor: 'white',
                    font: {color: 'black'}
                }
				,yaxis: 'y2'
				,line:{color: 'grey', width:0.5}
	};	
    pltlyLayout = {autosize: true
				  //,legend: {orientation: 'h',x:0.4,y:-0.2} 
				  ,showlegend:false
                  ,barmode: 'stack'
                  ,xaxis: {
					     tickvals: monthDiff(o4plot.hst.month[0], dataSet.peak_month)
					     ,ticktext: dataSet.peak_month
						 }
                  ,yaxis: {fixedrange: true
                    ,rangemode:"nonnegative"
				    ,title:'Severity'
					,domain: [0.0,0.55]
                  }
				  ,yaxis2: {fixedrange: true
					,title: indicatorName
					//,overlaying: 'y' ,side: 'right'
					,domain: [0.65,1.0]
				}
                ,hovermode: 'x'								
				  /*,updatemenus: [{ // select y axis variable
				  		 borderwidth: 0,
						 y: 1,
						 x: -0.1,
						buttons: [{
							method: 'restyle',
							args: ['y', [dataSet.severity]],
							label: 'Severity'
						}, {
							method: 'restyle',
							args: ['y', [dataSet.intensity]],
							label: 'Intensity'
						},  {
							method: 'restyle',
							args: ['y', [dataSet.average_area]],
							label: 'Mean area (%)'
						}, {
							method: 'restyle',
							args: ['y', [dataSet.score]],
							label: 'Score'
						}]
					}]*/
				,annotations: [{ // GDO bottom signature
					x: 1.05, y: -0.25, showarrow: false, 
					text: 'Global Drought Observatory (JRC)  ' + new Date().getFullYear(), 
					font: {size: 8}, xref: 'paper', yref: 'paper'
				},{
					font: {size: 13, color: 'grey'},
					showarrow: false, align: 'left',
					x: 0.5, y: 1.25,
					text: 'The bars are the drought events following the timeline from 1950 to 2016 (left to right).<br>The bar length is proportional to the duration of the event; the thicker purple border highlights the selected event.', 
					xref: 'paper', yref: 'paper'		
				}/*,{
					x: monthDiff(o4plot.hst.month[0], dataSet.end_month)[pm],
					y: dataSet.severity[pm],
					arrowhead: 1,
					ax: 50,
					ay: -80,
					bgcolor: 'rgba(235, 235, 235, 0.8)',
					//arrowcolor: point.fullData.marker.color,
					font: {size:12},
					borderwidth: 3,
					borderpad: 4,
					text: annotationLabels(dataSet, pm)
				}*/]
	};
    Plotly.newPlot(destElemId
                  ,[indicatorLine,eventBars]
				  ,pltlyLayout
				  ,pltModebar()
                  );
	/*elDest.on('plotly_doubleclick', function(){ // Remove all annotations but the fixed ones
		var newIndex = (document.getElementById(destElemId).layout.annotations || []).length;
		for (n = 2; n < newIndex; ++n) {
			Plotly.relayout(destElemId, 'annotations[2]', 'remove')
		}
	});*/
	/*elDest.on('plotly_click', // Add annotations on click
		function(data){
		    var point = data.points[0],
			newAnnotation = {
				x: point.xaxis.d2l(point.x),
				y: point.yaxis.d2l(point.y),
				arrowhead: 1,
				ax: 50,
				ay: -80,
				bgcolor: 'rgba(235, 235, 235, 0.8)',
				font: {size:12},
				borderwidth: 3,
				borderpad: 4,
				text: annotationLabels(dataSet, point.pointNumber)
			},
			divid = document.getElementById(destElemId),
			newIndex = (divid.layout.annotations || []).length;
		 // delete instead if clicked twice
		  if(newIndex) {
		   var foundCopy = false;
		   divid.layout.annotations.forEach(function(ann, sameIndex) {
			 if(ann.text === newAnnotation.text ) {
			   Plotly.relayout(destElemId, 'annotations[' + sameIndex + ']', 'remove');
			   foundCopy = true;
			 }
		   });
		   if(foundCopy) return;
		 }
		Plotly.relayout(destElemId, 'annotations[' + newIndex + ']', newAnnotation);
	  })*/
};
var plotEventsBubbles = function (o4plot, dest) {
    var i,k;
    var dataSet = o4plot.data;
	var pm = whichEvent(dataSet,o4plot.info.month);
    var destElemId,elDest;
    var pltlyLayout;
	var bubbleSize = []; 
	for(var n = 0; n < dataSet.average_area.length; ++n) bubbleSize.push(dataSet.average_area[n] * 0.7);
    switch (typeof(dest)) {
      case "string":
           destElemId = dest;
           elDest = document.getElementById(destElemId);
           break;
      default:
           elDest = dest;
           destElemId = elDest.id;
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
    } catch (e) {console.log(e);};
    // Make bubbles	
	var sym = Array.apply(null, Array(dataSet.score.length)).map(function(){return 'circle-open'});
	var lin = Array.apply(null, Array(dataSet.score.length)).map(function(){return 4});
	sym[pm] = 'circle';
	lin[pm] = 0;
	//var sym = Array.apply(null, Array(dataSet.score.length)).map(function(){return 0});
	//sym[whichEvent(dataSet,o4plot.info.month)] = 8;
    var bubbles = {x: dataSet.duration
              ,y: dataSet.severity
              ,mode: 'markers'
              ,marker: {symbol:sym
						,line:{width:lin}
                       ,size: bubbleSize
                       ,colorscale: colScale(zam.scales.score.color)
					   ,showscale: true
                       ,color: dataSet.score
					   ,cmin:1
					   ,cmax:23
                       ,colorbar:{title: 'Score'
                                 ,titleside: 'top'
								 ,thickness:15
								 ,x:1.05
                       }
               }
              ,type: 'scatter'
			  ,text: hoverLabels(dataSet)
             };	
//	var pm = whichEvent(dataSet,o4plot.info.month)
/*	var selectPoint = {x: [dataSet.duration[dataSet.peak_month.indexOf(o4plot.info.month)]]
              ,y: [dataSet.severity[dataSet.peak_month.indexOf(o4plot.info.month)]]
              ,mode: 'markers'
              ,marker: {symbol:'circle-open'
                       ,size: bubbleSize[dataSet.peak_month.indexOf(o4plot.info.month)] 
					   ,showscale: false
					   ,color: 'purple'
					   /*,colorscale: colScale(zam.scales.score.color)
					   ,cmin:1
					   ,cmax:23
                       ,colorbar:{title: 'Score'
                                 ,titleside: 'top'
								 ,thickness:15
								 ,x:1.05
                       }
               }
              ,type: 'scatter'
			  ,hoverinfo: 'none'
    };*/
    pltlyLayout = {autosize: false
                  //,title: 'Events in selected region'
                  ,showlegend: false
				  ,hovermode: 'closest'	
				  ,hoverlabel: {
					 bgcolor: 'white',
					 font: {color: 'black'}
				  },
		updatemenus:[{
		  y: -0.1,
		  x: 0.6,
		  direction: 'up',
		  borderwidth: 0,
			buttons: [{
            method: 'restyle',
            args: ['x', [dataSet.duration]],
            label: 'Duration (months)'
			}, {
            method: 'restyle',
            args: ['x', [dataSet.intensity]],
            label: 'Intensity'
			}, {
            method: 'restyle',
            args: ['x', [dataSet.severity]],
            label: 'Severity'
			}, {
            method: 'restyle',
            args: ['x', [dataSet.average_area]],
            label: 'Mean area (%)'
        }, {
            method: 'restyle',
            args: ['x', [dataSet.score]],
            label: 'Score'
        }]
    },{
		 borderwidth: 0,
		 y: 0.7,
		 x: -0.1,
		 direction:'down',
		 textangle: 90,
        buttons: [{
            method: 'restyle',
            args: ['y', [dataSet.severity]],
            label: 'Severity'
        }, {
            method: 'restyle',
            args: ['y', [dataSet.intensity]],
            label: 'Intensity'
        }, {
            method: 'restyle',
            args: ['y', [dataSet.duration]],
            label: 'Duration'
        }, {
            method: 'restyle',
            args: ['y', [dataSet.average_area]],
            label: 'Mean area'
        }, {
            method: 'restyle',
            args: ['y', [dataSet.score]],
            label: 'Score'
        }]
    }],
	annotations: [{ // GDO bottom signature
		  x: 1.15, y: -0.2, 
		  showarrow: false, 
		  text: 'Global Drought Observatory (JRC)  ' + new Date().getFullYear(), 
		  font: {size: 8}, xref: 'paper', yref: 'paper'
		},
		{
			text: "Circle size indicates the percentage of total area hit by the event.<br>The filled circle is the selected event. Zoom or pan or select the variables<br>to show by clicking on the axes label.",//<br>Click on a circle to view the event metrics. Double click to reset.",
			font: {size: 13, color: 'grey'},
			showarrow: false, align: 'left',
			x: 0.5, y: 1.25,
			xref: 'paper', yref: 'paper',
		}]
	};
    Plotly.newPlot(destElemId
                  ,[bubbles]
                   ,pltlyLayout
                   ,pltModebar()
                  );
	/*var trace_update = {
		opacity: 1,
		marker: {color: 'black'}
	};
	Plotly.restyle(destElemId, trace_update, [0,1])
	elDest.on('plotly_click',
		function(data){
			var point = data.points[0],
			newAnnotation = {
				x: point.xaxis.d2l(point.x),
				y: point.yaxis.d2l(point.y),
				arrowhead: 1,
				ax: 50,
				ay: -80,
				bgcolor: 'rgba(235, 235, 235, 0.8)',
				font: {size:12},
				borderwidth: 3,
				borderpad: 4,
				text: annotationLabels(dataSet, point.pointNumber)
			},
			divid = document.getElementById(destElemId),
			newIndex = (divid.layout.annotations || []).length;
		 // delete instead if clicked twice
		   if(newIndex) {
		   var foundCopy = false;
		   divid.layout.annotations.forEach(function(ann, sameIndex) {
			 if(ann.text === newAnnotation.text ) {
			   Plotly.relayout(destElemId, 'annotations[' + sameIndex + ']', 'remove');
			   foundCopy = true;
			 }
		   });
		   if(foundCopy) return;
		 }
		 Plotly.relayout(destElemId, 'annotations[' + newIndex + ']', 'remove');
		 Plotly.relayout(destElemId, 'annotations[' + newIndex + ']', newAnnotation);
	  });
	elDest.on('plotly_doubleclick', function(){ // Remove all annotations but the first two
		var newIndex = (document.getElementById(destElemId).layout.annotations || []).length;
		for (n = 2; n < newIndex; ++n) {
			Plotly.relayout(destElemId, 'annotations[2]', 'remove')
		}
	})*/
};
// All indicator timeline
/*function plotEventsIndicator(o4plot, dest) {
    var i,k;
    var dataSet = o4plot.data;
    var destElemId,elDest;
    var pltlyLayout;
    switch (typeof(dest)) {
      case "string":
           destElemId = dest;
           elDest = document.getElementById(destElemId);
           break;
      default:
           elDest = dest;
           destElemId = elDest.id;
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
    }   catch (e) {console.log(e);}

	var indicator = {spi3:[],spi6:[],spi12:[]};  
	for (var n = 0; n < dataSet.start_month.length; ++n) indicator.spi3.push('SPI-3');
	for (var n = 0; n < dataSet.start_month.length; ++n) indicator.spi6.push('SPI-6');
	for (var n = 0; n < dataSet.start_month.length; ++n) indicator.spi12.push('SPI-12');
	var trace1 = {
	  type: 'scatter',
	  x: dataSet.start_month,
	  y: indicator,
	  mode: 'markers',
	  marker: {
		color: 'black',
		symbol: 108,
		size: 10
	  } 
	};

	var trace2 = {
	  x: dataSet.end_month,
	  y: indicator,
	  mode: 'markers',
	  marker: {
		color: 'black',
		symbol: 107,
		size: 10
	  }
	};
	 var spi6 = {x: monthDiff(dataSet.start_month, dataSet.end_month)
					  ,y: indicator.spi6
                 ,type: 'bar'
					  ,orientation: 'h'
                 ,color: 'orange'
					 // ,width: 0.1
					  ,base: monthDiff(dataSet.start_month[0], dataSet.start_month)
         };
	 var spi3 = {x: monthDiff(dataSet.start_month, dataSet.end_month)
					  ,y: indicator.spi3
                 ,type: 'bar'
					  ,orientation: 'h'
                 ,color: 'orange'
					 // ,width: 0.1
					  ,base: monthDiff(dataSet.start_month[0], dataSet.start_month)
         };
	 var spi12 = {x: monthDiff(dataSet.start_month, dataSet.end_month)
					  ,y: indicator.spi12
                 ,type: 'bar'
					  ,orientation: 'h'
                 ,color: 'orange'
					 // ,width: 0.1
					  ,base: monthDiff(dataSet.start_month[0], dataSet.start_month)
         };

	var dataSet = [spi3, spi6, spi12];

	var layout = {
	  title: 'PLACEHOLDER Timeline of drought events by indicator',
	  xaxis: {
		    range: [500, 700],
			rangeslider: {}    
	  },
	  yaxis:{fixedrange: true},
	  showlegend: false,
	  //width: 600,
	  height: 400,
	  hovermode: 'closest'
	};
		Plotly.newPlot(dest, dataSet, layout);
};*/
