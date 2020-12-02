var svgWidth = 760;
var svgHeight = 540;

var margin = {
    top: 20,
    right: 40,
    bottom: 150,
    left: 100
};

var width = svgWidth - margin.right - margin.left;
var height = svgHeight - margin.top - margin.bottom;

// ----------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
// append a div class to the scatter element per the html
var chart = d3
    .select('#scatter')
    .append('div')
    .classed('chart', true);

//append an svg element to the chart 
var svg = chart.append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

//append an svg group
var chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

// ----------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------

// Initial Params
var chosenXAxis = 'poverty';
var chosenYAxis = 'healthcare';

// ----------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
        d3.max(healthData, d => d[chosenXAxis]) * 1.07
        ])
        .range([0, width]);

    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(healthData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.7,
        d3.max(healthData, d => d[chosenYAxis]) * 1.01
        ])
        .range([height, 0]);

    return yLinearScale;
}
// ----------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(2000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(2000)
        .call(leftAxis);

    return yAxis;
}

// ----------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(2000)
        .attr('cx', data => newXScale(data[chosenXAxis]))
        .attr('cy', data => newYScale(data[chosenYAxis]))

    return circlesGroup;
}

// function used for updating state text
function renderText(stateText, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    stateText.transition()
        .duration(2000)
        .attr('x', d => newXScale(d[chosenXAxis]))
        .attr('y', d => newYScale(d[chosenYAxis]));

    return stateText
}

// ----------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------

// function to style x-axis values for tooltips
function styleXAxis(value, chosenXAxis) {

    if (chosenXAxis === 'poverty') {
        return `${value}%`;
    }

    else if (chosenXAxis === 'income') {
        return `${value}`;
    }
    else {
        return `${value}`;
    }
}

// ----------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    // X
    //poverty
    if (chosenXAxis === 'poverty') {
        var xLabel = 'Poverty:';
    }
    //income
    else if (chosenXAxis === 'income') {
        var xLabel = 'Median Income:';
    }
    //age
    else {
        var xLabel = 'Age:';
    }

    // Y 
    // healthcare
    if (chosenYAxis === 'healthcare') {
        var yLabel = "Lacks Healthcare:"
    }
    // obesity
    else if (chosenYAxis === 'obesity') {
        var yLabel = 'Obesity:';
    }
    // smokes
    else {
        var yLabel = 'Smokes:';
    }

    // tooltip
    var toolTip = d3.tip()
        .attr('class', 'd3-tip') // used 'd3-tip' over 'tooltip'
        .offset([-12, 0]) // seperation of box from circle
        .html(function (d) {
            return (`${d.state}<br>${xLabel} ${styleXAxis(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
        });

    circlesGroup.call(toolTip);

    // .on mouseover event
    circlesGroup.on('mouseover', toolTip.show)
        .on('mouseout', toolTip.hide);

    return circlesGroup;
}

// ----------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------

// Retrieve data from the CSV file and execute everything below
d3.csv('./assets/data/data.csv').then(function (healthData) {

    // parse data
    healthData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(healthData, chosenXAxis);
    var yLinearScale = yScale(healthData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
// ----------------------------------------------------------------------------------------------------------

    // append x axis
    var xAxis = chartGroup.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append('g')
        .call(leftAxis);

// ----------------------------------------------------------------------------------------------------------

    // append initial circles
    var circlesGroup = chartGroup.selectAll('circle')
        .data(healthData)
        .enter()
        .append('circle')
        .classed('stateCircle', true) // d3Style.css
        .attr('cx', d => xLinearScale(d[chosenXAxis]))
        .attr('cy', d => yLinearScale(d[chosenYAxis]))
        .attr('r', 10);
    // .attr('opacity', '.5');

    //append Initial Text
    var stateText = chartGroup.selectAll('.stateText')
        .data(healthData)
        .enter()
        .append('text')
        .classed('stateText', true) // d3Style.css
        .attr('x', d => xLinearScale(d[chosenXAxis]))
        .attr('y', d => yLinearScale(d[chosenYAxis]))
        .attr('dy', 3) //position of text in the circle
        .attr('font-size', '10px')
        .text(function (d) {
            return d.abbr
        });
        
// ----------------------------------------------------------------------------------------------------------

    // Create group for the 3 x-axis labels
    var labelsGroupX = chartGroup.append('g')
        .attr('transform', `translate(${width / 2}, ${height + 10 + margin.top})`);

    var povertyLabel = labelsGroupX.append('text')
        .classed('aText', true) // d3Style.css
        .classed('active', true) // d3Style.css
        .attr('x', 0) // text positioning
        .attr('y', 20) // text positioning
        .attr('value', 'poverty')
        .text('In Poverty (%)');

    var ageLabel = labelsGroupX.append('text')
        .classed('aText', true) // d3Style.css
        .classed('inactive', true) // d3Style.css
        .attr('x', 0) // text positioning
        .attr('y', 40) // text positioning
        .attr('value', 'age')
        .text('Age (Median)');

    var incomeLabel = labelsGroupX.append('text')
        .classed('aText', true) // d3Style.css
        .classed('inactive', true) // d3Style.css
        .attr('x', 0) // text positioning
        .attr('y', 60) // text positioning
        .attr('value', 'income')
        .text('Household Income (Median)')

    // Create group for the 3 y-axis labels // -----------------------------------------------

    var labelsGroupY = chartGroup.append('g')
        .attr('transform', `translate(${0 - margin.left / 4}, ${height / 2})`);

    var healthcareLabel = labelsGroupY.append('text')
        .attr('transform', 'rotate(-90)') // text rotation
        .classed('aText', true) // d3Style.css
        .classed('active', true) // d3Style.css
        .attr('x', 0) // text positioning
        .attr('y', 0 - 25) // text positioning
        .attr('dy', '1em') // text positioning
        .attr('value', 'healthcare')
        .text('Lacks Healthcare (%)');

    var smokesLabel = labelsGroupY.append('text')
        .attr('transform', 'rotate(-90)') // text rotation
        .classed('aText', true) // d3Style.css
        .classed('inactive', true) // d3Style.css
        .attr('x', 0) // text positioning
        .attr('y', 0 - 45) // text positioning
        .attr('dy', '1em') // text positioning
        .attr('value', 'smokes')
        .text('Smokes (%)');

    var obesityLabel = labelsGroupY.append('text')
        .attr('transform', 'rotate(-90)') // text rotation
        .classed('aText', true) // d3Style.css
        .classed('inactive', true) // d3Style.css
        .attr('x', 0) // text positioning
        .attr('y', 0 - 65) // text positioning
        .attr('dy', '1em') // text positioning
        .attr('value', 'obesity')
        .text('Obese (%)');

// ----------------------------------------------------------------------------------------------------------

    // update ToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    labelsGroupX.selectAll('text')
        .on('click', function () {
            // get value of selection
            var value = d3.select(this).attr('value');
            if (value != chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(healthData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxis(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates text with new info 
                stateText = renderText(stateText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text // ------------------------------------------------------

                if (chosenXAxis === 'poverty') {
                    povertyLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    ageLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    incomeLabel
                        .classed('active', false)
                        .classed('inactive', true);
                }
                else if (chosenXAxis === 'age') {
                    povertyLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    ageLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    incomeLabel
                        .classed('active', false)
                        .classed('inactive', true);
                }
                else {
                    povertyLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    ageLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    incomeLabel
                        .classed('active', true)
                        .classed('inactive', false);
                }
            }
        });
        
    // y axis labels event listener // -----------------------------------------------------------------------
    labelsGroupY.selectAll('text')
        .on('click', function () {
            // get value of selection
            var value = d3.select(this).attr('value');
            if (value != chosenYAxis) {

                // replaces chosenYAxis with value  
                chosenYAxis = value;

                // console.log(chosenYAxis)

                // functions here found above csv import
                // updates y scale for new data
                yLinearScale = yScale(healthData, chosenYAxis);

                // updates y axis with transition 
                yAxis = renderYAxis(yLinearScale, yAxis);

                // updates circles with new y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates text with new info
                stateText = renderText(stateText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes y axis classes to change bold text // ----------------------------------------------------
                if (chosenYAxis === 'obesity') {
                    obesityLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    smokesLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    healthcareLabel
                        .classed('active', false)
                        .classed('inactive', true);
                }
                else if (chosenYAxis === 'smokes') {
                    obesityLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    smokesLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    healthcareLabel
                        .classed('active', false)
                        .classed('inactive', true);
                }
                else {
                    obesityLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    smokesLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    healthcareLabel
                        .classed('active', true)
                        .classed('inactive', false);
                }
            }
        });
});
// ----------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------
