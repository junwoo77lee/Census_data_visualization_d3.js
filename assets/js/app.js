
svgWidth = 960;
svgHeight = 600;

const margin = {
    top: 20,
    bottom: 100,
    left: 100,
    right: 20
};

const svg = d3.select('#scatter').append('svg');

svg
   .attr('width', svgWidth)
   .attr('height', svgHeight);

const chartGroup = svg.append('g')
                      .attr('transform', `translate(${margin.left}, ${margin.top})`);

const chartWidth = svgWidth - margin.left - margin.right;
const chartHeight = svgHeight - margin.top - margin.bottom;

const chosenXfeatures = ['poverty', 'age', 'income'];
const chosenYfeatures = ['healthcare', 'smokes', 'obesity'];

let currentXfeature = 'poverty'
let currentYfeature = 'healthcare'

function xScaler(acsData, currentXfeature) {
    // Linear scale for xaxis with user-defined feature
    const xLinearScale = d3.scaleLinear()
                           .domain(d3.extent(acsData, d => d[currentXfeature]))
                           .range([0, chartWidth]);

    return xLinearScale;
}

function renderXAxis(newXScale, xAxis) {
    // reset yaxis based on the new scale and return the modified yaxis
    const bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
         .duration(1000)
         .call(bottomAxis);
    
    return xAxis;             
}

function renderCirclesInXaxis(circleGroup, newXScale, oldYScale, currentXfeature) {
    // modifiy the postion of circles when features changed
    circleGroup.transition()
               .duration(1000)               
               .attr('transform', function(d) {
                    return `translate(${newXScale(d[currentXfeature])},
                                      ${oldYScale(d[currentYfeature])})`
               });

    return circleGroup;
}

function yScaler(acsData, currentYfeature) {
    // Linear scale for yaxis with user-defined feature
    const yLinearScale = d3.scaleLinear()
                           .domain(d3.extent(acsData, d => d[currentYfeature]))
                           .range([chartHeight, 0]);
    return yLinearScale;
}

function renderYAxis(newYScale, yAxis) {
    // reset yaxis based on the new scale and return the modified yaxis
    const leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
         .duration(1000)
         .call(leftAxis);
    
    return yAxis;             
}

function renderCirclesInYaxis(circleGroup, oldXScale, newYScale, currentYfeature) {
    // modifiy the postion of circles when features changed
    circleGroup.transition()
               .duration(1000)               
               .attr('transform', function(d) {
                    return `translate(${oldXScale(d[currentXfeature])},
                                      ${newYScale(d[currentYfeature])})`
               });
    
    return circleGroup;
}

function updateTooptips(circleGroup, currentXfeature, currentYfeature) {
    // update tooltips
    let xLabel, yLabel;

    // const chosenXfeatures = ['poverty', 'age', 'income'];
    // const chosenYfeatures = ['healthcare', 'smokes', 'obesity'];
    
    chosenXfeatures.forEach(item => {
        if (item === currentXfeature) {
            xLabel = item;
            if (xLabel === 'income') { xUnit = ' [USD]' }
            else if (xLabel === 'age') { xUnit = ' [years]'}
            else { xUnit = '%' };
        }
    });

    chosenYfeatures.forEach(item => {
        if (item === currentYfeature) {
            yLabel = item.slice(0);//.toUpperCase() + item.slice(1,)
            yUnit = '%'
        }
    });

    const toolTip = d3.tip()
                      .attr('class','d3-tip')
                      .offset([180, -100])
                      .html(d => {
                          return (`<h3>${d.state}</h3><hr>
                                  <h5>${xLabel}: ${d[currentXfeature]}${xUnit}
                                  <h5>${yLabel}: ${d[currentYfeature]}%`);
                      });

    circleGroup.call(toolTip);

    circleGroup.on('mouseover', function(data) {
            toolTip.show(data, this);
     })
       .on('mouseout', function(data) {
            toolTip.hide(data, this);
     });


    return circleGroup;
}


d3.csv('assets/data/data.csv')
  .then((acsData) => {
    // data type conversion
    acsData.forEach(item => {
        item.poverty = parseFloat(item.poverty);
        item.age = parseFloat(item.age);
        item.income = parseInt(item.income);
        item.healthcare = parseFloat(item.healthcare);
        item.smokes = parseFloat(item.smokes);
        item.obesity = parseFloat(item.obesity);
    });


    // Initialization: draw a scatter plot
    let xScale = xScaler(acsData, currentXfeature);
    let yScale = yScaler(acsData, currentYfeature);

    let bottomAxis = d3.axisBottom(xScale);
    let xAxis = chartGroup.append('g')
                            .attr('transform', `translate(0, ${chartHeight})`)
                            .call(bottomAxis);

    let leftAxis = d3.axisLeft(yScale);
    let yAxis = chartGroup.append('g')
                            .call(leftAxis);
    
    let circleGroup = chartGroup.selectAll('g')
                                .data(acsData)
                                .enter()
                                .append('g')
                                .attr('transform', function(d) {
                                    return `translate(${xScale(d[currentXfeature])},
                                                        ${yScale(d[currentYfeature])})`
                                });

    circleGroup.append('circle')
               .classed('stateCircle', true)
               .attr('r', '20')
               .attr('opacity', '0.75');

    circleGroup.append('text')
               .classed('stateText', true)
               .attr('dy', d => 7)                                        
               .text(d => d.abbr);

    updateTooptips(circleGroup, currentXfeature, currentYfeature);

    const xLabelGroup = chartGroup.append('g')
                                  .attr('transform', `translate(${chartWidth / 2}
                                                                ${chartHeight + 20})`);
    // Three labels for Xaxis                                                          
    const xLabel1 = xLabelGroup.append('text')
                               .attr('x', 0)
                               .attr('y', 20)
                               .attr('value', chosenXfeatures[0])
                               .classed('aText', true)
                               .classed('active', true)
                               .text(`${chosenXfeatures[0]}`); 

    const xLabel2 = xLabelGroup.append('text')
                                .attr('x', 0)
                                .attr('y', 40)
                                .attr('value', chosenXfeatures[1])
                                .classed('aText', true)
                                .classed('inactive', true)
                                .text(`${chosenXfeatures[1]}`);
   
    const xLabel3 = xLabelGroup.append('text')
                                .attr('x', 0)
                                .attr('y', 60)
                                .attr('value', chosenXfeatures[2])
                                .classed('aText', true)
                                .classed('inactive', true)
                                .text(`${chosenXfeatures[2]}`);
                            
    const yLabelGroup = chartGroup.append('g')

    const yLabel1 =  yLabelGroup.append('text')                                
                                .attr('transform', 'rotate(-90)')                                                                                              
                                .attr('y', `${-50}`)
                                .attr('x', `${0 - (chartHeight / 2)}`)
                                .attr('dy', '1em')
                                .classed('aText', true)
                                .attr('value', chosenYfeatures[0])
                                .classed('active', true)
                                .text(`${chosenYfeatures[0]}`);

    const yLabel2 =  yLabelGroup.append('text')                             
                                .attr('transform', 'rotate(-90)')                                                                                            
                                .attr('y', `${-70}`)
                                .attr('x', `${0 - (chartHeight / 2)}`)
                                .attr('dy', '1em')
                                .classed('aText', true)
                                .attr('value', chosenYfeatures[1])
                                .classed('inactive', true)
                                .text(`${chosenYfeatures[1]}`); 

    const yLabel3 =  yLabelGroup.append('text')                             
                                .attr('transform', 'rotate(-90)')                                                                                            
                                .attr('y', `${-90}`)
                                .attr('x', `${0 - (chartHeight / 2)}`)
                                .attr('dy', '1em')
                                .classed('aText', true)
                                .attr('value', chosenYfeatures[2])
                                .classed('inactive', true)
                                .text(`${chosenYfeatures[2]}`);                                              


    xLabelGroup.selectAll('text')
               .on('click', function() {
                   const value = d3.select(this).attr('value');

                   if (value !== currentXfeature) {
                       currentXfeature = value;
                       
                       xScale = xScaler(acsData, currentXfeature);
                       xAxis = renderXAxis(xScale, xAxis);
                       circleGroup = renderCirclesInXaxis(circleGroup, xScale, yScale, currentXfeature);
                       updateTooptips(circleGroup, currentXfeature, currentYfeature);
                     
                       switch (currentXfeature) {
                           case chosenXfeatures[0]:
                               xLabel1.classed('active', true)
                                      .classed('inactive', false);
                               xLabel2.classed('active', false)
                                      .classed('inactive', true);
                               xLabel3.classed('active', false)
                                      .classed('inactive', true);
                               break;

                           case chosenXfeatures[1]:
                               xLabel2.classed('active', true)
                                      .classed('inactive', false);
                               xLabel1.classed('active', false)
                                      .classed('inactive', true);
                               xLabel3.classed('active', false)
                                      .classed('inactive', true); 
                               break;
                          
                           case chosenXfeatures[2]:
                                xLabel3.classed('active', true)
                                       .classed('inactive', false);
                                xLabel1.classed('active', false)
                                       .classed('inactive', true);
                                xLabel2.classed('active', false)
                                       .classed('inactive', true); 
                              break;
                       }

                   }
               });

    yLabelGroup.selectAll('text')
               .on('click', function() {
                   const value = d3.select(this).attr('value');

                   if (value !== currentYfeature) {
                       currentYfeature = value;
                       
                       yScale = yScaler(acsData, currentYfeature);
                       yAxis = renderYAxis(yScale, yAxis);
                       circleGroup = renderCirclesInYaxis(circleGroup, xScale, yScale, currentYfeature);
                       updateTooptips(circleGroup, currentXfeature, currentYfeature);

                       switch (currentYfeature) {
                           case chosenYfeatures[0]:
                               yLabel1.classed('active', true)
                                      .classed('inactive', false);
                               yLabel2.classed('active', false)
                                      .classed('inactive', true);
                               yLabel3.classed('active', false)
                                      .classed('inactive', true);
                               break;

                           case chosenYfeatures[1]:
                               yLabel2.classed('active', true)
                                      .classed('inactive', false);
                               yLabel1.classed('active', false)
                                      .classed('inactive', true);
                               yLabel3.classed('active', false)
                                      .classed('inactive', true); 
                               break;
                          
                           case chosenYfeatures[2]:
                                yLabel3.classed('active', true)
                                       .classed('inactive', false);
                                yLabel1.classed('active', false)
                                       .classed('inactive', true);
                                yLabel2.classed('active', false)
                                       .classed('inactive', true); 
                              break;
                       }

                   }
               });


}).catch(error => {
    if (error) throw error;
});
