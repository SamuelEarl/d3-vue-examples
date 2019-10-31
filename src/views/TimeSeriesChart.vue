// D3.js real-time line chart with circle markers: https://stackoverflow.com/questions/54277572/d3-js-realtime-line-chart-with-circle

<template>
  <div id="time-series-chart">
    <div id="btn-bar">
      <button class="btn" @click="showSidebar = !showSidebar">Toggle Sidebar</button>
      <br /><br />
      <p>Toggle the sidebar to see the chart's responsive design. The chart will redraw itself to fill the space.</p>
    </div>
    <div id="flex-container">
      <div id="sidebar" v-if="showSidebar">
        Sidebar
      </div>
      <div id="time-series-chart-container">
        <!-- <svg id="svg" :width="w" :height="h"></svg> -->
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import Ring from "ringjs";
import debounce from "lodash.debounce";

export default {
  name: "LineChart",
  data() {
    return {
      showSidebar: true,
      svg: null,
      w: 800,
      h: 300,
      group: null,
      paddingTop: 20, // Create padding around the axes by using these values in the range() methods.
      paddingBottom: 60,
      paddingLeft: 40,
      datasetBuffer: null, // This will be a circle buffer
      datasetArray: null, // This will be a plain array generated from the circle buffer
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
    showSidebar() {
      this.recreateChart();
    }
  },

  mounted() {
    const vm = this;

    this.initializeChart();

    // I could make the SVG responsive, as is explained here:
    // https://stackoverflow.com/questions/16265123/resize-svg-when-window-is-resized-in-d3-js.
    // But I also need to be able to destroy and recreate the charts when users change certain
    // settings. So it might be best to use the "window.onresize" event listener.
    window.onresize = debounce((event) => {
      vm.recreateChart();
    }, 100);
  },

  beforeDestroy() {
    this.destroyChart();
  },

  methods: {
    async recreateChart() {
      this.destroyChart();
      // To ensure that the previous chart is completely destroyed before the new chart is created,
      // call this.$nextTick() to wait until the next DOM update cycle before creating the new chart.
      await this.$nextTick();
      this.initializeChart();
    },

    initializeChart() {
      this.setDimensions();
      this.generateSeedData();
      this.createChart();
      this.createInterval();
    },

    setDimensions() {
      const container = document.getElementById("time-series-chart-container").getBoundingClientRect();
      // For some reason using an SVG element prevents you from reading the width accurately. I cannot get the width minus the scrollbar width.
      // Container width - scrollbar width = visible width. I need to either find a dynamic way to retrieve an accurate width or I need to hardcode the width of the scrollbar here, if I know it. Right now I have given the "time-series-chart-container" a "margin-right: 30px;". The width of the scrollbar (without customizing the scrollbar) is 15px, so 30px right margin gives some padding on the right side and I have given the "time-series-chart" <div> a background color, so everything looks nice. I think I will keep it like this.
      // UPDATE: Using Flexbox to create flex containers seems to have fixed all of the issues with the SVG spilling out of its container. So I have removed the "margin-right: 30px" from the "time-series-chart-container".
      this.w = container.width;
      this.h = container.height;

      // console.log("container:", container);

      // const clientWidth = document.body.clientWidth;
      // const scrollWidth = document.body.scrollWidth;
      // console.log("clientWidth:", clientWidth, "scrollWidth:", scrollWidth);

      // const width1 = window.innerWidth;
      // const width2 = document.documentElement.clientWidth;
      // const width3 = document.body.clientWidth;
      // console.log("width1:", width1, "width2:", width2, "width3:", width3);
    },

    createInterval() {
      this.interval = setInterval(this.updateData, 1000);
    },

    generateSeedData() {
      // Set this.datasetBuffer to a circular buffer.
      this.datasetBuffer = new Ring(this.numDataPoints);

      // First timestamp in chart
      const beginTime = Date.now() - (1000 * this.numDataPoints);

      // Push random data to this.datasetBuffer.
      for (let i = 0; i < this.numDataPoints; i++) {
        const timestamp = beginTime + (1000 * i);
        const value = Math.floor(Math.random() * this.maxValue);
        this.datasetBuffer.push({ key: i, timestamp: timestamp, value: value });
      }

      // D3.js has to work with plain arrays, so convert the initial seed data from the dataset buffer to an array.
      this.datasetArray = this.datasetBuffer.toArray();
    },

    createChart() {
      const vm = this;

      this.formatTime = d3.timeFormat(`%I:%M:%S`);

      // Create scale functions
      this.xScale = d3.scaleTime()
        .domain([
          d3.min(this.datasetArray, function(d) {
            return d.timestamp;
          }),
          d3.max(this.datasetArray, function(d) {
            return d.timestamp;
          })
        ])
        .range([this.paddingLeft, this.w]);

      this.yScale = d3.scaleLinear()
        .domain([
          // If the y-scale domain values are set to the highest and lowest possible values from the
          // beginning, then all of the data points will fit inside the chart no matter how high or
          // low they are.
          0, this.maxValue

          // These would create dynamic y-scale domains, but I would have to update these y-scale
          // domains in the "updateChart" method each time a new data value is plotted in order to
          // keep the values inside the chart.
          // d3.min(this.datasetArray, function(d) {
          //   return d.value;
          // }),
          // d3.max(this.datasetArray, function(d) {
          //   return d.value;
          // })
        ])
        .range([this.h - this.paddingBottom, this.paddingTop]);


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
      // this.svg = d3.select("#svg");
      this.svg = d3.select("#time-series-chart-container")
        .append("svg")
        .attr("width", this.w)
        .attr("height", this.h);


      // Define clipping path
      this.svg.append("clipPath")
        .attr("id", "chart-area")
        .append("rect")
        .attr("x", this.paddingLeft)
        .attr("y", 0)
        .attr("width", this.w - this.paddingLeft)
        .attr("height", this.h);


      // Append group element
      this.group = this.svg.append("g")
        .attr("id", "line-graph")
        .attr("clip-path", "url(#chart-area");


      // Append path / create line
      this.path = this.group.append("path")
        .datum(this.datasetArray, this.key)
        .attr("class", "line")
        .attr("d", this.lineGenerator);


      // Create axes
      // The axes should be created after the other elements so that, if there is any overlap
      // between the elements, the axes are drawn on top of the other elements.
      this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${this.h - this.paddingBottom})`)
        .call(this.xAxis)
        .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-0.5rem")
          .attr("dy", "0.25rem");

      this.svg.append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(${this.paddingLeft}, 0)`)
        .call(this.yAxis);
    },

    updateData() {
      const vm = this;

      // -----------------------------------
      // Beginning of create new data point
      // -----------------------------------
      // Convert this.datasetBuffer to an array so you can access the elements in the circle buffer.
      const lastTimestamp = this.datasetArray[this.datasetArray.length - 1].timestamp;
      this.newTimestamp = lastTimestamp + 1000;

      const newValue = Math.floor(Math.random() * this.maxValue);
      // Make sure to give each new data object that is added to the array a key value that is one
      // higher than the key value of the last data object in the array.
      let dataObj;
      let key;
      // If there is a least one data object in the dataset array, then...
      if (this.datasetArray.length > 0) {
        // Select the last data object in the array
        dataObj = this.datasetArray[this.datasetArray.length - 1];
        // Assign "key" to be one number higher than the key value of the last data object in the array.
        key = dataObj.key + 1;
      }
      // If the dataset array is empty, then...
      else {
        // Assign "key" the value of 0.
        key = 0;
      }

      // Push the new data point object to this.datasetBuffer
      this.datasetBuffer.push({ key: key, timestamp: this.newTimestamp, value: newValue });

      // Set this.datasetArray to equal the updated circle buffer
      this.datasetArray = this.datasetBuffer.toArray();
      // -----------------------------
      // End of create new data point
      // -----------------------------

      // Call this.updateChart()
      this.updateChart();
    },

    updateChart() {
      const vm = this;

      // Update x-scale domain to shift the chart to the left
      // Recalibrate the x-scale domain, given the possible new min and max values in this.datasetArray.
      this.xScale.domain([
        d3.min(this.datasetArray, function(d) {
          return d.timestamp;
        }),
        d3.max(this.datasetArray, function(d) {
          return d.timestamp;
      })]);

      // Update y-scale domain
      // Recalibrate the Y-scale domain, given the possible new min and max values in this.datasetArray.
      this.yScale.domain([
        d3.min(this.datasetArray, function(d) {
          return d.value;
        }),
        d3.max(this.datasetArray, function(d) {
          return d.value;
      })]);


      // Redraw path and shift it left
      // To get the data to transition smoothly, I referenced the code from this chart and modified it:
      // http://bl.ocks.org/denisemauldin/ceb7065687c125223339a26a47d58a28
      // Also, this one might be helpful: https://jsfiddle.net/peDzT/
      this.path
        .datum(this.datasetArray, this.key)
        .attr("d", this.lineGenerator);
        // .attr("transform", null)
		    // .transition()
		    // .duration(this.duration)
		    // .ease(d3.easeLinear)
		    // .attr("transform", `translate(${this.xScale(this.newTimestamp - 1000 * 64)})`);

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
        // .transition()
        // .duration(this.duration)
        // .ease(d3.easeLinear)
        .call(this.xAxis)
        .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-0.5rem")
          .attr("dy", "0.25rem");


      // // -------------------
      // //  Remove data point
      // // -------------------
      // // If I use the smooth transitions, then keep this conditional statement here.
      // // If I do not use smooth transitions, then keep the conditional statement at the end of the "updateData" method.
      // if (this.datasetArray.length >= this.numDataPoints) {
      //   this.dataset.shift();
      // }
    },

    destroyChart() {
      // Destroy SVG elements (i.e., remove the SVG element).
      const containerElement = document.getElementById("time-series-chart-container");
      containerElement.removeChild(containerElement.childNodes[0]);

      // Destroy interval.
      clearInterval(this.interval);
      this.interval = null;

      // Destroy datasetBuffer and datasetArray.
      this.datasetBuffer = null;
      this.datasetArray = null;
    }
  }
};
</script>

<style lang="stylus" scoped>
  #time-series-chart {
    // height = 100vh - nav_header - btn_bar
    height: calc(100vh - 78px - 58px);

    #btn-bar {
      margin-bottom: 20px;

      .btn {
        padding: 10px;
        background-color: lighten(#282c34, 10%);
        color: #bbb;
        border: none;
        outline: none;
      }
    }

    #flex-container {
      display: flex;
      width: 100%;
      height: 100%;
      background-color: black;

      #sidebar {
        width: 20%;
        padding: 20px;
        color: lightgray;
      }

      #time-series-chart-container {
        // "flex-grow: 1" will take up remaining space
        flex-grow: 1;
        height: 100%;
        // margin-right: 0;
        background-color: #282c34;
      }
    }
  }

  // #time-series-chart-container >>> svg {
  //   background-color: #282c34;
  // }

  // Styles for plotted line
  #time-series-chart-container >>> #line-graph .line {
    fill: none;
    stroke: #4d78cc;
    stroke-width: 2;
  }

  // Styles for axes lines (.axis path) and tick marks (.axis .tick line),
  #time-series-chart-container >>> .axis path, #time-series-chart-container >>> .axis .tick line {
    stroke: #818a9d;
    shape-rendering: crispEdges;
  }

  // Styles for axis tick labels
  #time-series-chart-container >>> .axis .tick text {
    font-size: 0.75rem;
    fill: #818a9d;
  }

  // Styles for x-axis tick labels
  #time-series-chart-container >>> .x.axis .tick text {
    transform: rotate(-45deg);
  }
</style>
