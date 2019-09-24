function legend({
    svg,
    color,
    title,
    tickSize = 6,
    positionX,
    positionY,
    width = 320, 
    height = 44 + tickSize,
    marginTop = 18,
    marginRight = 0,
    marginBottom = 16 + tickSize,
    marginLeft = 0,
    ticks = width / 64,
    tickFormat,
    tickValues
  } = {}) {
  
    const legendGroup = svg.append('g')
        .attr("id", "legend")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .style("overflow", "visible")
        .style("display", "block");
  
    let x;
  
    // Continuous
    if (color.interpolator) {
      x = Object.assign(color
          .copy()
          .interpolator(
            d3.interpolateRound(marginLeft, width - marginRight)
            ),
          {
            range() { return [marginLeft, width - marginRight]; }
        });
  
      legendGroup.append("image")
          .attr("id", "container")
          .attr('transform', `translate(${positionX}, ${positionY - 10})`)
          // .attr("x", marginLeft)
          // .attr("y", marginTop)
          .attr("width", width - marginLeft - marginRight)
          .attr("height", height - marginTop - marginBottom)
          .attr("preserveAspectRatio", "none")
          .attr("xlink:href", ramp(color.interpolator()).toDataURL())
  
      // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
      if (!x.ticks) {
        if (tickValues === undefined) {
          const n = Math.round(ticks + 1);
          tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
        }
        if (typeof tickFormat !== "function") {
          tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
        }
      }
    }
  
    // Discrete
    else if (color.invertExtent) {
      const thresholds
          = color.thresholds ? color.thresholds() // scaleQuantize
          : color.quantiles ? color.quantiles() // scaleQuantile
          : color.domain(); // scaleThreshold
  
      const thresholdFormat
          = tickFormat === undefined ? d => d
          : typeof tickFormat === "string" ? d3.format(tickFormat)
          : tickFormat;
  
      x = d3.scaleLinear()
          .domain([-1, color.range().length - 1])
          .rangeRound([marginLeft, width - marginRight]);
  
      legendGroup.append("g")
        .attr('transform', `translate(${positionX}, ${positionY - 28})`)
        .selectAll("rect")
        .data(color.range())
        .join("rect")
          .attr("x", (d, i) => x(i - 1))
          .attr("y", marginTop)
          .attr("width", (d, i) => x(i) - x(i - 1))
          .attr("height", height - marginTop - marginBottom)
          .attr("fill", d => d);
  
      tickValues = d3.range(thresholds.length);
      tickFormat = i => thresholdFormat(thresholds[i], i);
    }
  
    legendGroup.append("g")
        // .attr("transform", `translate(0, ${height - marginBottom})`)
        .attr("transform", `translate(${positionX}, ${positionY})`)        
        .call(d3.axisBottom(x)
          .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
          .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
          .tickSize(tickSize)
          .tickValues(tickValues))
        .attr("font-size", "14")
        .call(g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
          .attr("y", marginTop + marginBottom - height - 6)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .attr("font-size", '14')
          .text(title));
  
    return legendGroup.node();
  }


function ramp(color, height = 1, n = 256) {
  // const canvas = DOM.canvas(n, 1); used only at Observable 
  const canvas = document.createElement("canvas");
  d3.select(canvas)
    .attr('width', n)
    .attr('height', height)
  // const canvas = d3.select('body')
  //                  .append('canvas')
  //                  .attr('width', 800)
  //                  .attr('height', 1)
  //                  .node()
    // console.log(canvas);
  const context = canvas.getContext("2d");
  for (let i = 0; i < n; ++i) {
    context.fillStyle = color(i / (n - 1));
    context.fillRect(i, 0, 1, height);
  }
  return canvas;
}