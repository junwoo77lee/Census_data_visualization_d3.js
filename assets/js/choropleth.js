function drawMap(svg, acsData, currentFeature, stateFeature, width, height) {

    // Refresh
    svg.html("");

    const projection = d3.geoAlbersUsa()
        .scale(1000)
        .translate([width / 2, height / 2]);
    path = d3.geoPath(projection);


    // const states = svg.append('g')

    // Discrete color scale and legend
    // const colorScale = d3.scaleQuantize()
    //     .domain(d3.extent(acsData, d => d[currentFeature]))
    //     .range(d3.schemeYlGn[9]);

    // legend({
    //     svg: svg,
    //     color: d3.scaleQuantize(colorScale.domain(), d3.schemeYlGn[9]),
    //     title: `${currentFeature} by State`,
    //     tickSize: 0,
    //     tickFormat: ".0f",
    //     positionX: width / 2.5,  // legend position
    //     positionY: height / 12
    // });


    // Continuous color scale and legend
    const colorScale = d3.scaleSequential()
                         .domain(d3.extent(acsData, d => d[currentFeature]))                        
                         .interpolator(d3.piecewise(d3.interpolateHcl, [d3.hcl(NaN, 0, 100), "red", "black"]));

    legend({
        svg: svg,
        color: d3.scaleSequential(colorScale.domain(),
                d3.piecewise(d3.interpolateHcl, [d3.hcl(NaN, 0, 100), "red", "black"])),
        title: `${currentFeature} by State`,
        tickSize: 0,
        positionX: width / 2.5,  // legend position
        positionY: height / 12
    });
 
    let featureByState = {};

    acsData.forEach(function (d) {
        featureByState[d.state] = {
            currentFeature: d[currentFeature]
        }
    });

    stateFeature.forEach(function (d) {
        d.details = featureByState[d.properties.NAME] ? featureByState[d.properties.NAME] : {};
    });

    // state-level drawing
    svg.selectAll("path")
        .data(stateFeature)
        .enter()
        .append("path")
        .attr("name", function (d) {
            return d.properties.NAME;
        })
        .attr("id", function (d) {  // contry code ex. 'AFG'
            return d.properties.STATE;
        })
        .attr("d", path)
        .attr('stroke', 'brown')
        .attr('stroke-width', '1')
        .style("fill", function (d) {
            return d.details && d.details.currentFeature ? colorScale(d.details.currentFeature) : undefined;
        });
};