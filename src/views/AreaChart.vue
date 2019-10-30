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
      padding: 40,
      dataset: [],
      xScale: null,
      yScale: null,
      xAxis: null,
      yAxis: null,
      area: null,
      dangerArea: null,
      formatTime: null,
    };
  },
  watch: {
    // watchers
  },
  mounted() {
    this.renderCharts()
  },

  methods: {
    async renderCharts() {
      const vm = this;

      this.formatTime = d3.timeFormat("%Y");

      // If you try to import a CSV file like you would another module, then you will get errors.
      // See "Problem loading data with D3.js in Vue.js":
      // https://forum.vuejs.org/t/problem-loading-data-with-d3-js-in-vue-js/39360
      const dataFile = "/data/mauna_loa_co2_monthly_averages.csv";

      // Read in data
      // NOTE: The API for d3.csv has changed in D3 v5. It now uses Promises.
      // Read about it here: http://learnjsdata.com/read_data.html.

// I HAD THIS WORKING ON FRIDAY. CAME BACK MONDAY AND IT WOULD NOT WORK. IT LOOKS LIKE THERE IS SOME ERROR IN THE d3.csv and d3.json FUNCTIONS. FOR SOME REASON THEY ARE NOT READING DATA. THEY ONLY RETURN AN ERROR (SPECIFICALLY, THEY RETURN index.html).
// I AM GOING TO STOP MESSING AROUND WITH THIS AND MOVE ON WITH MY LIFE. THIS IS VERY INFURIATING!!!
      const data = await d3.csv(dataFile);

      data.forEach(function(d) {
        vm.dataset.push(
          {
            date: new Date(+d.year, (+d.month - 1)), // Make a new Date object for each year + month
            average: parseFloat(d.average) // Convert from string to float
          }
        );
      });

      // Print data to console as table, for verification
      // console.table(this.dataset, ["date", "average"]);

      // Create scale functions
      this.xScale = d3.scaleTime()
        .domain([
          d3.min(this.dataset, function(d) {
            return d.date;
          }),
          d3.max(this.dataset, function(d) {
            return d.date;
          })
        ])
        .range([this.padding, this.w]);

      this.yScale = d3.scaleLinear()
        .domain([
          // This scale does NOT use zero as the baseline.
          // This is how to set the domain's minimum value to be equal to the minimum value in the
          // dataset (minus 10 to give the graph a little padding at the bottom):
          d3.min(this.dataset, function(d) {
            // Include only valid data values in the line graph
            if (d.average >= 0) {
              return d.average;
            }
          }) - 10,
          d3.max(this.dataset, function(d) {
            return d.average;
        })])
        .range([this.h - this.padding, 0]);


      // Define axes
      // ------------
      // Define x-axis
      this.xAxis = d3.axisBottom()
        .scale(this.xScale)
        .ticks(10)
        .tickFormat(this.formatTime);

      // Define y-axis
      this.yAxis = d3.axisLeft()
        .scale(this.yScale)
        .ticks(10);


      // Define area generators
      this.area = d3.area()
        // If d.average is a valid value (e.g., if d.average is greater than or equal to zero in
        // this case), then return true so that the value will be included in the graph of the line.
        .defined(function(d) {
          return d.average >= 0;
        })
        .x(function(d) {
          return vm.xScale(d.date);
        })
        .y0(function() {
          return vm.yScale.range()[0];
        })
        .y1(function(d) {
          return vm.yScale(d.average);
        });

      this.dangerArea = d3.area()
        .defined(function(d) {
          return d.average >= 350;
        })
        .x(function(d) {
          return vm.xScale(d.date);
        })
        .y0(function() {
          return vm.yScale(350);
        })
        .y1(function(d) {
          return vm.yScale(d.average);
        });


      // Create reference to SVG element
      this.svg = d3.select("#svg");


      // Create areas
      this.svg.append("path")
        .datum(this.dataset)
        .attr("class", "area")
        .attr("d", this.area);

      this.svg.append("path")
        .datum(this.dataset)
        .attr("class", "area danger")
        .attr("d", this.dangerArea);


      // Create axes
      // The axes should be created after the other elements so that, if there is any overlap
      // between the elements, the axes are drawn on top of the other elements.
      this.svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${this.h - this.padding})`)
        .call(this.xAxis);

      this.svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${this.padding}, 0)`)
        .call(this.yAxis);


      // Draw 350 ppm line
      this.svg.append("line")
        .attr("class", "line safe-level")
        .attr("x1", this.padding)
        .attr("x2", this.w)
        .attr("y1", this.yScale(350))
        .attr("y2", this.yScale(350));

      // Label 350 ppm line
      this.svg.append("text")
        .attr("class", "danger-label")
        .attr("x", this.padding + 20)
        .attr("y", this.yScale(350) - 7)
        .text('350 ppm "safe" level');
    }
  }
};
</script>

<style lang="stylus" scoped>
  #svg >>> .area {
    fill: teal;
    stroke: none;
  }

  #svg >>> .line {
    fill: none;
    stroke: teal;
    stroke-width: 0.5;
  }

  #svg >>> .safe-level {
    stroke: red;
    stroke-dasharray: 2, 3;
  }

  #svg >>> .danger {
    fill: red;
  }

  #svg >>> .danger-label {
    font-family: Helvetica, sans-serif;
    font-size: 12px;
    fill: red;
  }
</style>
