// @TODO: YOUR CODE HERE!
// Read csv file:
const csvData = d3.csv('./assets/data/data.csv');

// Confirming and viewing data via console
console.log(csvData)

// Calling function to respond to page resizing
function makeResponsive() {

    // Creating the svg container
    let svgArea = d3.select("body").select("svg");
    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    if (!svgArea.empty()) {
      svgArea.remove();
    }

    // svg params - width and height
    let svgHeight = 820;
    let svgWidth =1100;

    // circle and text sizes change with window resizing
    let circlesResize = svgWidth*0.012; 
    let textsResize = +svgWidth*0.009;

    let margin = {
    top: 30,
    right: 20,
    bottom: 110,
    left: 85
    };

    let chartWidth = svgWidth - margin.left - margin.right;
    let chartHeight = svgHeight - margin.top - margin.bottom;

    // Importing csv data and converting each value from string to integer
    csvData.then(function(inputData, err){
        if (err) throw err;
        inputData.forEach(data =>{
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;

            data.smokes = +data.smokes;
            data.age = +data.age;

            data.income = +data.income;
            data.obesity = +data.obesity;

            data.abbr = data.abbr
    });

    // create svg group, append in container and shift everything over by the margins
    let svg = d3.select("#scatter")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

    // Append an SVG group and set axis margins
    let chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial Params
    let chosenXAxis = "poverty";

    let chosenYAxis ="healthcare";

    // Creating chart scales for x-axis
    function xScale(inputData, chosenXAxis) {
    
    let xLinearScale = d3.scaleLinear().domain([d3.min(inputData, data => data[chosenXAxis]) * 0.8,
        d3.max(inputData, data => data[chosenXAxis]) * 1.2]).range([0, chartWidth]);

    return xLinearScale;
    }

    // Creating chart scales for y-axis
    function yScale(inputData, chosenYAxis) {
    
    let yLinearScale = d3.scaleLinear().domain([d3.min(inputData, data => data[chosenYAxis]) * 0.8,
        d3.max(inputData, data => data[chosenYAxis]) * 1.2]).range([chartHeight, 0]);

    return yLinearScale;
    }

    // Binding labels - x-axis
    function renderXAxes(newXScale, xAxis) {
        let bottomAxis = d3.axisBottom(newXScale);

            xAxis.transition().duration(1000).call(bottomAxis);

    return xAxis;
    }

    // Binding labels - y-axis
    function renderYAxes(newYScale, yAxis) {
        let leftAxis = d3.axisLeft(newYScale);

            yAxis.transition().duration(1000).call(leftAxis);

    return yAxis;
    }

    // function used for updating circles group and text group with a transition to
    // new circles
    function renderCircles(circlesGroup, newXScale, newYScale,chosenXAxis,chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", data => newXScale(data[chosenXAxis]))
        .attr("cy", data => newYScale(data[chosenYAxis]));

    return circlesGroup;
    }
    //function used for updating texts
    function renderText(textGroup, newXScale, newYScale,chosenXAxis,chosenYAxis) {
        textGroup.transition().duration(1000)
            .attr("x", data => newXScale(data[chosenXAxis]))
            .attr("y", data => newYScale(data[chosenYAxis])); 
        return textGroup;
    }

    // function used for updating circles group with X and Y axis selections
    function updateToolTip(chosenXAxis, chosenYAxis,circlesGroup) {

    let toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(data) {
        if (chosenXAxis === "income"){
            return (`<b>State: ${data.state} (${data.abbr})</b><br><strong>${chosenXAxis} (median): $${data[chosenXAxis]}</strong><br><strong>${chosenYAxis}: ${data[chosenYAxis]}%</strong>`); 
        
        } else if (chosenXAxis === "age"){
            return (`<strong>State: ${data.state} (${data.abbr})</strong><br><strong>${chosenXAxis} (median): ${data[chosenXAxis]} yrs</strong><br><strong>${chosenYAxis}: ${data[chosenYAxis]}%</strong>`); 
        }    
        else {
            return (`<strong>State: ${data.state} (${data.abbr})</strong><br><strong>${chosenXAxis}: ${data[chosenXAxis]}%</strong><br><strong>${chosenYAxis}: ${data[chosenYAxis]}%</strong>`); 
        }
        })
        .style('display', 'block');
        
        
    circlesGroup.call(toolTip);
    // Event listeners to show text block and change circles color from green to red
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data,this);
                d3.select(this)
                .transition()
                .duration(100)
                .style('fill', 'red')                                            
        })
        // Event listeners to return circles to normal state
        .on("mouseout", function(data, index) {
        toolTip.hide(data);
                d3.select(this)
                .transition()
                .duration(100)
                .style('fill', 'green')
        });
    return circlesGroup;
    }
       
    // creating x-axis scale variable
    let xLinearScale = xScale(inputData, chosenXAxis);

    // creating y-axis scale variable
    let yLinearScale = yScale(inputData, chosenYAxis);

    // Assigning axis scale to variable
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // appending x axis group tags
    let xAxis = chartGroup.append("g")
                            .classed("x-axis", true)
                            .attr("transform", `translate(0, ${chartHeight})`)
                            .call(bottomAxis);

    // append y axis group tags
    let yAxis = chartGroup.append("g")
                            .classed("y-axis", true)
                            .call(leftAxis);

    // append circles and text to circleGroup 
    let circlesGroup = chartGroup.selectAll("circle")
                                    .data(inputData)
                                    .enter()
                                    .append("circle")
                                    .attr("cx", data => xLinearScale(data[chosenXAxis]))
                                    .attr("cy", data => yLinearScale(data[chosenYAxis]))
                                    .attr("r", circlesResize)
                                    .attr("fill", "green");

    let textGroup = chartGroup.selectAll("text")
                                .exit() 
                                .data(inputData)
                                .enter()
                                .append("text")
                                .text(data => data.abbr)
                                .attr("x", data => xLinearScale(data[chosenXAxis]))
                                .attr("y", data => yLinearScale(data[chosenYAxis]))
                                .attr("font-size", textsResize+"px")
                                .attr("text-anchor", "middle")
                                .attr("class","stateText");
    
    // Update circlesGroup variable                            
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);

    
    // Create group for x-axis labels
    let labelsGroup = chartGroup.append("g")
                                .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    let povertyLabel = labelsGroup.append("text")
                                    .attr("x", 0)
                                    .attr("y", 20)
                                    .attr("class","axisTextX")
                                    .attr("value", "poverty") 
                                    .classed("active", true)
                                    .text("In Poverty (%)");

    let ageLabel = labelsGroup.append("text")
                                .attr("x", 0)
                                .attr("y", 40)
                                .attr("class","axisTextX")
                                .attr("value", "age") 
                                .classed("inactive", true)
                                .text("Age (Median)");

    let incomeLabel = labelsGroup.append("text")
                                    .attr("x", 0)
                                    .attr("y", 60)
                                    .attr("class","axisTextX")
                                    .attr("value", "income") 
                                    .classed("inactive", true)
                                    .text("Income (Median)");

    // Create group for y-axis labels (Obesity, Smokes, Lack of Healthcare)
    let ylabelsGroup = chartGroup.append("g");

    let healthcareLabel = ylabelsGroup.append("text")
                                        .attr("transform", `translate(-40,${chartHeight / 2})rotate(-90)`)
                                        .attr("dy", "1em")
                                        .attr("class","axisTextY")
                                        .classed("axis-text", true)
                                        .attr("value", "healthcare") 
                                        .classed("active", true)
                                        .text("Lack of Healthcare (%)");

    let smokesLabel = ylabelsGroup.append("text")
                                    .attr("transform", `translate(-60,${chartHeight / 2})rotate(-90)`)
                                    .attr("dy", "1em")
                                    .attr("class","axisTextY")
                                    .attr("value", "smokes") 
                                    .classed("inactive", true)
                                    .text("Smokes (%)");

    let obesityLabel = ylabelsGroup.append("text")
                                    .attr("transform", `translate(-80,${chartHeight / 2})rotate(-90)`)
                                    .attr("dy", "1em")
                                    .attr("class","axisTextY")
                                    .attr("value", "obesity") 
                                    .classed("inactive", true)
                                    .text("Obesity (%)");

    // x axis labels event listener/handler - click
    labelsGroup.selectAll(".axisTextX")
        .on("click", function() {
        let value = d3.select(this).attr("value");  
        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            //xLinearScale function above csv import
            xLinearScale = xScale(inputData, chosenXAxis);
            // updates y scale for new data
            yLinearScale = yScale(inputData, chosenYAxis);


            // updates x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);

            textGroup = renderText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);

            // updates tooltips with new entries
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);

            /// Conditional if statements for X-axis labels with current charge highlighted
            if (chosenXAxis === "age") {
            ageLabel
                .classed("active", true)
                .classed("inactive", false);
            povertyLabel
                .classed("active", false)
                .classed("inactive", true);
            incomeLabel
                .classed("active", false)
                .classed("inactive", true);
                
            }
            else if (chosenXAxis === "poverty")
            {
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
            povertyLabel
                .classed("active", true)
                .classed("inactive", false);
            incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            
            }else {
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
            povertyLabel
                .classed("active", false)
                .classed("inactive", true);
            incomeLabel
                .classed("active", true)
                .classed("inactive", false);
            
            }

        }
        });

    // y axis labels event listener
    ylabelsGroup.selectAll(".axisTextY")
        .on("click", function() {
        let value = d3.select(this).attr("value");
        
        if (value !== chosenYAxis) {          
        // assign value to choseYAxis variable
        chosenYAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(inputData, chosenXAxis);
        // updates y scale for new data
        yLinearScale = yScale(inputData, chosenYAxis);
        // updates Y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x and y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);

        textGroup = renderText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);

        // updates tooltips with new entries
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);

        // Conditional if statements for Y-axis labels with current charge highlighted
        if (chosenYAxis === "healthcare") {
        healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        
        }
        else if (chosenYAxis === "smokes")
        {
        healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        smokesLabel
            .classed("active", true)
            .classed("inactive", false);
        obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        } else {
        healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        obesityLabel
            .classed("active", true)
            .classed("inactive", false);   
       }
    }
  });
})
// Error handling
.catch( error => {
    console.log(`Error ${error} occured while reading csv`);
})
}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);