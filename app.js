angular.module('myApp', []).


directive('grapheForces', function() {
    return {
        restrict: 'A',
        link: function (scope, element ,$filter) {
		

			var width = 2000;
            var height = 900;
            var color = d3.scale.category20();
						
            scope.$watch('grapheDatas', function (grapheDatas) {
				d3.select("body").selectAll("svg").remove();
				
				links = grapheDatas;
				var nodes = {};
				//populate nodes based on links 
				links.forEach(function(link) {
				link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
				link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
				});
				
				var force = d3.layout.force()
				.distance(100)
				.gravity(0.05)
				.charge(-100)
				.size([width, height])
                .nodes(d3.values(nodes))
                .links(links)
                .start();
				
                var min_zoom = 0.8;
				var max_zoom = 3.0;
				
 
                var svg = d3.select("body").append("svg")
                .attr("width", width)
                .attr("height", height)
				.call(d3.behavior.zoom().on("zoom", redraw).scaleExtent([min_zoom,max_zoom]))
				.append('svg:g')
				;
				
				function keydown() {
					console.log("function keydown")
					if (d3.event.key === 76 ) return;
						 console.log(d3.event.keyCode)
						 pathtext.style("fill-opacity",1)
						}
					
				
				d3.select('body')  
					.on('keydown', keydown)
				
                //path
				var path = svg.selectAll(".link")
						   .data(force.links())
							.enter()
							.append("g")
							.attr("class","pathG")

							
							.append("svg:path")
							
								.attr("class", "link")
								.style("stroke-width", function(d) { return Math.sqrt(d.capacity); }) //add capacity later
								.attr("id",function(d,i) { return "linkId_" + i; });
				var pathtext =	svg.selectAll(".pathG")
							.append("text")
							.append("textPath")
							.attr( "fill-opacity", 0 )
							.attr("text-anchor","middle")
							.style("text-anchor","midlle")
							.style("font-size", "12px")
							.style("font-weight","bold")
							.attr("dy",0)
							//.style("fill","none")
							.attr("startOffset","50%")
							.attr("xlink:href",function(d,i) { return "#linkId_" + i;})
							.text(function(d) { return "metric=" + d.metric });
							//" " + "bw=" + d.bw + " " +"provider=" + d.provider + " " + "interface=" + d.l_ip;});
							//+ " " +d.l_ip + "<-->" +d.r_ip;});

				//end path 
				
				//node add
				var node = svg.selectAll(".nodes")
				.data(force.nodes())
                .enter()
				.append("svg:g")
				.call(force.drag);
				
				node.append("circle")
					 .attr("class", "node")
					 .attr("r", 20)
					 .style("fill", function(d) { return color(d.name.slice(-3)); }) //color based on last 3 char using category20

					 .on("mouseover", fade(.1))
					 .on("mouseout", fade(1))
					 
	
				node.append("text")
					.attr("x", 12)
					.attr("dy", ".35em")
					.attr("class","nodelabel")
					.style("font-size", "12px")
					.text(function(d) { return d.name; });


					
				function dragstart(d) {
					
					d3.event.sourceEvent.stopPropagation();
					d3.select(this).classed("fixed", d.fixed = true);
					
					}
				function redraw() { //used in zoom 
					svg.attr("transform","translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
					}
					
				var drag = force.drag()
					.on("dragstart", dragstart)
					.on("dragend", function() { force.stop() } );

				
			    var linkedByIndex = {};
					grapheDatas.forEach(function(d) {
					linkedByIndex[d.source.index + "," + d.target.index] = 1;
					});

				function isConnected(a, b) {
					return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
					}
	
				function fade(opacity) {
					return function(d) {
					node.style("stroke-opacity", function(o) {
						thisOpacity = isConnected(d, o) ? 1 : opacity;
						this.setAttribute('fill-opacity', thisOpacity);
						return thisOpacity;
								}
							);

					path.style("stroke-opacity", function(o) {
					return o.source === d || o.target === d ? 1 : opacity;
								}
							);
					

					pathtext.style("fill-opacity", function(o) {
					{
					 
					if (o.source === d || o.target === d)  
					return 1;
					
						}
					});
			};
			}
				//end test neigh

                force.on("tick", function() {
				  path.attr("d", function(d,i) 
				  {
					var
						dx = d.target.x - d.source.x,
						dy = d.target.y - d.source.y,
						dr = Math.sqrt(dx * dx + dy * dy),
						
								r = 22
								numLinks = 5
								gap = 2*r / (numLinks + 1) 
								gap = ((d.linknum -1) * gap) + gap
								gap = Math.max(0, gap)
								gap = Math.round(gap)

								//radius - line stroke width
							var startY = d.source.y - (r-2) + gap
							var endY = d.target.y - (r-2) + gap 
							endY = Math.round(endY)
							
						    var endX = (d.target.x + d.source.x) / 2;
						    var endY = (endY + startY) / 2;
							

							var len = dr - ((dr/2) * Math.sqrt(3));
								endX = endX + (  len/dr) ;
								endY = endY + (  len/dr) ;

							if ( endX - d.source.x > 0) {
						return "M" + d.source.x  + "," + startY  + "L" + endX + "," + endY;
							}
							else {
						return "M" + endX  + "," + endY  + "L" + d.source.x + "," + startY;
							}



					}
				);
					node.attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")";
					});
					
					//text.attr("transform", function(d) {
					//return "translate(" + d.x + "," + d.y + ")";
					//});
                });
            });
        }
    }
}).

controller('AppCtrl', function ($scope , $filter , $http ) {
	$scope.clickme = function(source,target) {
	//define regexp as re with value of msg
		//create regexp based on input
		var re_source = new RegExp (source);
		var re_target = new RegExp (target);
		//define the values for the data
	  	var grapheDatas1 = 
		
[

{'r_ip': '1.1.1.160', 'l_int': '333', 'target': 'd', 'metric': '10', 'source': 'c', 'r_int': '74', 'l_ip': '1.1.1.161'},
{'r_ip': 0, 'l_int': 0, 'target': 'd', 'metric': '10', 'source': 'c','r_int': '74', 'l_ip': '1.1.1.161'},
{'r_ip': 0, 'l_int': 0, 'target': 'c', 'metric': '10', 'source': 'd','r_int': '74', 'l_ip': '1.1.1.161'},
]



	//sort array 
	grapheDatas1.sort(function(a,b) {
		if (a.source > b.source) {return 1;}
		else if (a.source < b.source) {return -1;}
		else {
			if (a.target > b.target) {return 1;}
			if (a.target < b.target) {return -1;}
			else {return 0;}
		}
	});
		//get nr of links between source and target and add a new object as linknum into array
	for (var i=0; i<grapheDatas1.length; i++) {
		if (i != 0 &&
			grapheDatas1[i].source == grapheDatas1[i-1].source && grapheDatas1[i].target == grapheDatas1[i-1].target) 
			{
				grapheDatas1[i].linknum = grapheDatas1[i-1].linknum + 1;
			}
		else {
				grapheDatas1[i].linknum = 1;
			};
		};
		
	$scope.grapheDatas = grapheDatas1.filter(function(d) { return re_source.test(d.source) && re_target.test(d.target) });

	}
	
	
});
