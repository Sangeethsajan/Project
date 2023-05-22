// The svg
const svg = d3.select("#my_dataviz"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

// Map and projection
const path = d3.geoPath();
const projection = d3.geoMercator()
  .scale(100)
  .center([0,20])
  .translate([width/2.5, height / 2.5]);

// Data and color scale
const data = new Map();
const colorScale = d3.scaleThreshold()
  .domain([4,4.5, 5,5.5, 6,6.5 ,7,7.5])
  .range(d3.schemeGreens[8]);

// Load external data and boot
Promise.all([
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
d3.csv("2019.csv", function(d) {
    data.set(d.Country, +d.Score)
})]).then(function(loadData){
    let topo = loadData[0]
    
    var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    let mouseOver = function(event,d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .9)
    d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "black")
    div.transition()
      .style("opacity", 1)
    div.html(d.properties.name + "<br/>" + d.total)
      .style("left", (event.pageX) + "px")
      .style("top", (event.pageY - 28) + "px");
  }

  let mouseLeave = function(d) {
    d3.selectAll(".Country")
      .transition()
      .style("opacity", .8)
    d3.select(this)
      .transition()
      .duration(200)
      .style("stroke", "black")
    div.transition()
      .duration(500)
      .style("opacity", 0);
  }

  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("fill", function (d) {
        d.total = data.get(d.properties.name) || 0;
        return colorScale(d.total);
      })
      .style("stroke", "black")
      .attr("class", function(d){ return "Country" } )
      .style("opacity", 1)
      .on("mouseover", mouseOver )
      .on("mouseleave", mouseLeave )


})

const margin = {top: 50, right: 0, bottom:80, left: 30},
    width2 = 1200 - margin.left - margin.right,
    height2 = 700 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg2 = d3.select("#my_dataviz2")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",`translate(${margin.left},${margin.top})`);

// Parse the Data
d3.csv("2019.csv").then( function(data) {

  // List of subgroups = header of the csv files = soil condition here
  const subgroups = ['GDPPerCapita','HealthyLifeExpectancy','Score']
  const top10 = data.slice(0,10)
  const bottom10 = data.slice(146,156)
  const newdata = top10.concat(bottom10)

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  const groups = newdata.map(d => d.Country)

  console.log(newdata)
  console.log(subgroups)

  

  let mouseOver = function(event,d) {
    d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "black")
  }

  let mouseLeave = function(d) {
    d3.select(this)
      .transition()
      .duration(200)
      .style("stroke", "none")
    div.transition()
      .duration(500)
      .style("opacity", 0);
  }

  // Add X axis
  const x = d3.scaleBand()
      .domain(groups)
      .range([0, width2])
      .padding([0.2])
  svg2.append("g")
    .attr("transform", `translate(0, ${height2})`)
    .call(d3.axisBottom(x).tickSize(0))
    .selectAll("text")  
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .style("font-size","15px")
    .attr("transform", "rotate(-65)");

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, 8])
    .range([ height2, 0 ]);
  svg2.append("g")
    .call(d3.axisLeft(y));

  // Another scale for subgroup position?
  const xSubgroup = d3.scaleBand()
    .domain(subgroups)
    .range([0, x.bandwidth()])
    .padding([0.05])

  // color palette = one color per subgroup
  const color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['#e41a1c','#377eb8','#4daf4a'])

  // Show the bars
  svg2.append("g")
    .selectAll("g")
    // Enter in data = loop group per group
    .data(newdata)
    .join("g")
      .attr("transform", d => `translate(${x(d.Country)}, 0)`)
    .selectAll("rect")
    .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
    .join("rect")
      .attr("x", d => xSubgroup(d.key))
      .attr("y", d => y(d.value))
      .attr("width", xSubgroup.bandwidth())
      .attr("height", d => height2 - y(d.value))
      .attr("fill", d => color(d.key))
      .on("mouseover", mouseOver )
      .on("mouseleave", mouseLeave );
      svg2.append("circle").attr("cx",1000).attr("cy",130).attr("r", 6).style("fill", "#e41a1c")
      svg2.append("circle").attr("cx",1000).attr("cy",160).attr("r", 6).style("fill", "#377eb8")
      svg2.append("circle").attr("cx",1000).attr("cy",190).attr("r", 6).style("fill", "#4daf4a")
      svg2.append("text").attr("x", 1020).attr("y", 130).text("GDP Per Capita Score").style("font-size", "15px").attr("alignment-baseline","middle")
      svg2.append("text").attr("x", 1020).attr("y", 160).text("Life Expectancy Score").style("font-size", "15px").attr("alignment-baseline","middle")
      svg2.append("text").attr("x", 1020).attr("y", 190).text("Happiness Score").style("font-size", "15px").attr("alignment-baseline","middle")
      svg2.append("text").attr("x", 220).attr("y", 0).text("Comaprison of GDP Per Capita Score, Life Expectancy Score and Happiness Score of Top 5 and Bottom 5 Countries").style("font-size", "15px").attr("alignment-baseline","middle")



})

