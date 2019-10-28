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
      line: null,
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

      // If you try to import a CSV file like you would another module, then you will get errors.
      // See "Problem loading data with D3.js in Vue.js":
      // https://forum.vuejs.org/t/problem-loading-data-with-d3-js-in-vue-js/39360
      const dataFile = "../../data/mauna_loa_co2_monthly_averages.csv";

      // Read in data
      // NOTE: The API for d3.csv has changed in D3 v5. It now uses Promises.
      // Read about it here: http://learnjsdata.com/read_data.html.
      const data = await d3.csv("./mauna_loa_co2_monthly_averages.csv");

      console.log("DATA:", data);

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
        .range([0, this.w]);

      this.yScale = d3.scaleLinear()
        .domain([0, d3.max(this.dataset, function(d) {
          return d.average;
        })])
        .range([this.h, 0]);


      // Define line generator
      this.line = d3.line()
        .x(function(d) {
          return vm.xScale(d.date);
        })
        .y(function(d) {
          return vm.yScale(d.average);
        });

      // Create reference to SVG element
      this.svg = d3.select("#svg");

      // Create line
      this.svg.append("path")
        .datum(this.dataset)
        .attr("class", "line")
        .attr("d", this.line)
        .attr("fill", "none")
        .attr("stroke", "gray");
    }
  }
};
</script>

<style lang="stylus" scoped>

</style>
