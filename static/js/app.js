// Async function, with "await" 
(async function(){

    //JSON data reader 
    const samplesData = await d3.json("samples.json").catch(function(error) {
      console.log(error);
    });
  
    // Array of sample objects from JSON data .names
    var names = samplesData.names;
  
    // Array of .samples objects
    var sample = samplesData.samples;
  
    // Array of sample .metadata objects
    var metadata = samplesData.metadata;
  
    // Dropdown select menu with D3.select
    var selectDrop = d3.select("#selDataset");
  
    // Adding IDs for options into the dropdown menu
    selectDrop.selectAll('option')
      .data(names)
      .enter()
      .append('option')
      .text(function(d) {
          return d;
      })
  
    // Created an event handler
    selectDrop.on("change",runEnter);
    // The event handler function runenter()
    function runEnter() {
      // Stopped the page from refreshing with .prevent
      d3.event.preventDefault();
      // Select the inputElement
      var inputElement = d3.select("select");
      // Acquire the value property of the inputEelement.
      var userSample = inputElement.property("value");
  
      // Used the input to .filter the data by ID
      var sampleResult = sample.filter(s => userSample === s.id)[0];
      var sampleMeta = metadata.filter(m => +userSample === m.id);
  
      // CATEGORIZE THE DATA //
  
      // Combined the arrays from "sample" key
      var sampleObject = [];
      for (var i = 0; i < sampleResult.sample_values.length; i++) {
        sampleObject.push(
          {sample_values: sampleResult.sample_values[i], 
          otuIds: `OTU ${sampleResult.otu_ids[i]}`,
          otuLabels: sampleResult.otu_labels[i]});
      }
      // Sorted the (new array)
      var sortedSample = sampleObject.sort((a, b) => b.sample_values - a.sample_values);
      // Created new arrays to hold the sorted data
      var sampleValues = []
      var otuIds = []
      var otuLabels = []
      // Unpack objects from "sortedSample" into empty arrays
      for (var j = 0; j < sortedSample.length; j++) {
        sampleValues.push(sortedSample[j].sample_values);
        otuIds.push(sortedSample[j].otuIds);
        otuLabels.push(sortedSample[j].otuLabels);
      }
  
      // BAR CHART //
  
      // traceBar chart
      var traceBar = [{
        x: sampleValues.slice(0,10).reverse(),
        y: otuIds.slice(0,10).reverse(),
        labels: otuIds.slice(0,10).reverse(),
        text: otuLabels.slice(0,10).reverse(),
        type:"bar",
        orientation: "h"
      }];
      // Bar layout
      var barLayout = {
        height: 600,
        width: 500,
      };
      //Plotly to plot bar chart layout 
      Plotly.newPlot("bar", traceBar, barLayout);
  
      // BUBBLE CHART //
  
      // traceBubble chart
      var traceBubble = [{
        x: sampleResult.otu_ids,
        y: sampleValues,
        text: otuLabels,
        mode: 'markers',
        marker: {
          size: sampleValues,
          color: sampleResult.otu_ids
        }
      }];
      // BUbble chart layout 
      var bubbleLayout = {
        height: 600,
        width: 1200,
        xaxis: {title: "OTU ID"}
      };      
      // Plotly to plot bubble chart layout
      Plotly.newPlot('bubble', traceBubble, bubbleLayout);
  
      // CREATE GAUGE CHART //
  
      // traceGauge chart 
      var traceGauge = [
        {
        domain: {x: [0, 1], y: [0, 1]},
        value: sampleMeta[0].wfreq,
        title: {text: "Belly Button Wash Frequency (Scrubs Per Week)"},
        type: "indicator",
        mode: "gauge+number",
            gauge: {
              axis: {range: [null, 9]},
              bar: {color: "blue"},
              steps: [
                {range: [0, 1], color: "darkred"},
                {range: [1, 2], color: "red"},
                {range: [2, 3], color: "orange"},
                {range: [3, 4], color: "gold"},
                {range: [4, 5], color: "yellow"},
                {range: [5, 6], color: "lightyellow"},
                {range: [6, 7], color: "lightgreen"},
                {range: [7, 8], color: "green"},
                {range: [8, 9], color: "darkgreen"}
              ],
            }
        }
        ];
        // tracegauge layout chart
        var traceLayout = { width: 600, height: 500, margin: { t: 0, b: 0,}};
      // Plotly to plot gauge layout chart
        Plotly.newPlot('gauge', traceGauge, traceLayout);
  
      // POPULATE INFORMATION BOX //
  
      // Setted selection variable in order to update metadata information
      var selection = d3.select("#sample-metadata").selectAll("div")
        .data(sampleMeta);
      // Populated the Demographic Information into the box with sample metadata information
      selection.enter()
        .append("div")
        .merge(selection)
        .html(function(d){
          return `<p>ID: ${d.id}</p>
                <p>Ethnicity: ${d.ethnicity}</p>
                <p>Gender: ${d.gender}</p>
                <p>Age: ${d.age}</p>
                <p>Location: ${d.location}</p>
                <p>bbtype: ${d.bbtype}</p>
                <p>wfreq: ${d.wfreq}</p>`
        });
      // Removed old data //
      selection.exit().remove();
  }
  })()