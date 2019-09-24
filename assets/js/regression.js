function regressionLine(svg, xData, yData) {

    //clear existing regression line for redrawing
    svg.html("");

    // calculate xmean and ymean
    const xMean = (xData.reduce((a, b) => a + b, 0)) / xData.length
    const yMean = (yData.reduce((a, b) => a + b, 0)) / yData.length

    // calculate coefficients
    let xr = 0;
    let yr = 0;
    let term1 = 0;
    let term2 = 0;

    xData.forEach((el, index) => {
        xr = el - xMean;
        yr = yData[index] - yMean;
        term1 += xr * yr;
        term2 += xr * xr;
    });

    const b1 = term1 / term2;
    const b0 = yMean - (b1 * xMean);
    // perform regression 

    yHat = [];
    // fit line using coeffs
    xData.forEach(el => {
        yHat.push(b0 + (el * b1));
    });

    const result = [];
    yData.forEach((el, index) => {
        result.push({
            "yhat": yHat[index],
            "y": el,
            "x": xData[index]
        });
    });

    const line = d3.line()
        .x(d => d.x)
        .y(d => d.yhat)

    svg.append("path")
    .datum(result)
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", '2')
    .transition()
    .duration(100)
    .attr("d", line);
}