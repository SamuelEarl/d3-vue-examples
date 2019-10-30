// D3.js real-time line chart with circle markers: https://stackoverflow.com/questions/54277572/d3-js-realtime-line-chart-with-circle

<template>
  <div id="line-chart">
    <div id="chart-container">
      <svg id="svg" :width="w" :height="h"></svg>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "LineChart",
  data() {
    return {
      svg: null,
      w: 800,
      h: 300,
      group: null,
      padding: 40,
      axisLabelPadding: 5, // Used to give the labels a bit of padding so they don't get cut off
      dataset: [],
      numDataPoints: 60,
      xScale: null,
      yScale: null,
      key: null,
      xAxis: null,
      yAxis: null,
      lineGenerator: null,
      path: null,
      formatTime: null,
      maxValue: 100,
      interval: null,
      newTimestamp: null,
      duration: 500,
    };
  },
  watch: {
    // watchers
  },
  mounted() {
    this.generateSeedData();
    this.renderChart();
    this.createInterval();
  },

  methods: {
    createInterval() {
      this.interval = setInterval(this.updateData, 1000);
    },

    generateSeedData() {
      // Set this.dataset to an empty array.
      this.dataset = [];

      // First timestamp in chart
      const beginTime = Date.now() - (1000 * this.numDataPoints);

      // Push random data to this.dataset.
      for (let i = 0; i < this.numDataPoints; i++) {
        const timestamp = beginTime + (1000 * i);
        const value = Math.floor(Math.random() * this.maxValue);
        // this.dataset.push({ key: i, value: newNumber });
        this.dataset.push({ key: i, timestamp: timestamp, value: value });
      }
    },

    renderChart() {
      const vm = this;

      this.formatTime = d3.timeFormat(`%I:%M:%S`);


      // Create scale functions
      this.xScale = d3.scaleTime()
        .domain([
          d3.min(this.dataset, function(d) {
            return d.timestamp;
          }),
          d3.max(this.dataset, function(d) {
            return d.timestamp;
          })
        ])
        .range([this.padding, this.w]);

      this.yScale = d3.scaleLinear()
        .domain([
          // If the y-scale domain values are set to the highest and lowest possible values from the
          // beginning, then all of the data points will fit inside the chart no matter how high or
          // low they are.
          0, this.maxValue

          // These would create dynamic y-scale domains, but I would have to update these y-scale
          // domains in the "updateChart" method each time a new data value is plotted in order to
          // keep the values inside the chart.
          // d3.min(this.dataset, function(d) {
          //   return d.value;
          // }),
          // d3.max(this.dataset, function(d) {
          //   return d.value;
          // })
        ])
        .range([this.h - this.padding, this.axisLabelPadding]);


      // Define key function, to be used when binding data.
      this.key = function(d) {
        return d.key;
      };


      // Define axes
      // ------------
      // Define x-axis
      this.xAxis = d3.axisBottom()
        .scale(this.xScale)
        .ticks()
        .tickFormat(this.formatTime);

      // Define y-axis
      this.yAxis = d3.axisLeft()
        .scale(this.yScale)
        .ticks();


      // Define line generators
      this.lineGenerator = d3.line()
        .x(function(d) {
          return vm.xScale(d.timestamp);
        })
        .y(function(d) {
          return vm.yScale(d.value);
        });


      // Create reference to SVG element
      this.svg = d3.select("#svg");


      // Define clipping path
      this.svg.append("clipPath")
        .attr("id", "chart-area")
        .append("rect")
        .attr("x", this.padding)
        .attr("y", 0)
        .attr("width", this.w - this.padding)
        .attr("height", this.h);


      // Append group element
      this.group = this.svg.append("g")
        .attr("id", "line-graph")
        .attr("clip-path", "url(#chart-area");


      // Append path / create line
      this.path = this.group.append("path")
        .datum(this.dataset, this.key)
        .attr("class", "line")
        .attr("d", this.lineGenerator);


      // Create axes
      // The axes should be created after the other elements so that, if there is any overlap
      // between the elements, the axes are drawn on top of the other elements.
      this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${this.h - this.padding})`)
        .call(this.xAxis)
        .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-0.5rem")
          .attr("dy", "0.25rem");

      this.svg.append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(${this.padding}, 0)`)
        .call(this.yAxis);
    },

    updateData() {
      const vm = this;

      // -----------------------------------
      // Beginning of create new data point
      // -----------------------------------
      const lastTimestamp = this.dataset[this.dataset.length - 1].timestamp;
      this.newTimestamp = lastTimestamp + 1000;

      const newValue = Math.floor(Math.random() * this.maxValue);
      // Make sure to give each new data object that is added to the array a key value that is one
      // higher than the key value of the last data object in the array.
      let dataObj;
      let key;
      // If there is a least one data object in the dataset array, then...
      if (this.dataset.length > 0) {
        // Select the last data object in the array
        dataObj = this.dataset[this.dataset.length - 1];
        // Assign "key" to be one number higher than the key value of the last data object in the array.
        key = dataObj.key + 1;
      }
      // If the dataset array is empty, then...
      else {
        // Assign "key" the value of 0.
        key = 0;
      }
      // Set the key value of the new data object to be key.
      this.dataset.push({ key: key, timestamp: this.newTimestamp, value: newValue });
      // -----------------------------
      // End of create new data point
      // -----------------------------

      // --------------------------------------------------------------------------------------------
      //  Remove data point - search for "Remove data point" in this file and read the comment there
      // --------------------------------------------------------------------------------------------
      // if (this.dataset.length >= this.numDataPoints) {
      //   this.dataset.shift();
      // }

      // Call this.updateChart()
      this.updateChart();
    },

    updateChart() {
      const vm = this;

      // Update x-scale domain to shift the chart to the left
      // Recalibrate the x-scale domain, given the possible new min and max values in this.dataset.
      this.xScale.domain([
        d3.min(this.dataset, function(d) {
          return d.timestamp;
        }),
        d3.max(this.dataset, function(d) {
          return d.timestamp;
      })]);

      // // Update y-scale domain
      // // Recalibrate the Y-scale domain, given the possible new min and max values in this.dataset.
      // this.yScale.domain([
      //   d3.min(this.dataset, function(d) {
      //     return d.value;
      //   }),
      //   d3.max(this.dataset, function(d) {
      //     return d.value;
      // })]);


      // Redraw path and shift it left
      // To get the data to transition smoothly, I referenced the code from this chart and modified it:
      // http://bl.ocks.org/denisemauldin/ceb7065687c125223339a26a47d58a28
      // Also, this one might be helpful: https://jsfiddle.net/peDzT/
      this.path
        .attr("d", this.lineGenerator)
        .attr("transform", null)
		    .transition()
		    .duration(this.duration)
		    .ease(d3.easeLinear)
		    .attr("transform", `translate(${this.xScale(this.newTimestamp - 1000 * 64)})`);

// I would like to test these methods to see if they update the chart with less memory usage:
      // this.path
      //   .attr("d", this.lineGenerator)
		  //   .transition()
		  //   .duration(this.duration)
      //   .ease(d3.easeLinear);


      // Update the axes. For each axis, do the following:
      // 1. Select the axis.
      // 2. Initiate a transition.
      // 3. Set the transition's duration.
      // 4. Call the appropriate axis generator. Make sure that "this.xAxis" equals the original axis definition. I accidentally set "this.xAxis" to the axis that was created and I got errors because of that.

      // Update X-axis
      this.svg.select(".x.axis")
        .transition()
        .duration(this.duration)
        .ease(d3.easeLinear)
        .call(this.xAxis)
        .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-0.5rem")
          .attr("dy", "0.25rem");


      // -------------------
      //  Remove data point
      // -------------------
      // If I use the smooth transitions, then keep this conditional statement here.
      // If I do not use smooth transitions, then keep the conditional statement at the end of the "updateData" method.
      if (this.dataset.length >= this.numDataPoints) {
        this.dataset.shift();
      }
    },
  }
};
</script>

<style lang="stylus" scoped>
  #svg >>> .line {
    fill: none;
    stroke: blue;
    stroke-width: 0.5;
  }

  #svg >>> .safe-level {
    stroke: red;
    stroke-dasharray: 2, 3;
  }

  #svg >>> .danger {
    stroke: red;
  }

  #svg >>> .danger-label {
    font-family: Helvetica, sans-serif;
    font-size: 12px;
    fill: red;
  }

  #svg >>> .x.axis .tick text {
    transform: rotate(-45deg);
  }
</style>
