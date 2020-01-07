<template>
  <div>
    <div id="chart-container"></div>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "Scatterplot",

  data() {
    return {
      dataset: [
        [5, 20],
        [480, 90],
        [250, 50],
        [100, 33],
        [330, 95],
        [410, 12],
        [475, 44],
        [25, 67],
        [85, 21],
        [220, 88],
        [600, 150]
      ],
      margin: {
        top: 20,
        right: 40,
        bottom: 20,
        left: 30
      },
      svgWidth: 800,
      svgHeight: 500,
      baseSvg: null,
      labels: null,
      // Scale and axis variables
      xScale: null,
      yScale: null,
      rScale: null, // The scale used to calculate the radius of the circles
      xAxis: null,
      yAxis: null,
    };
  },

  mounted() {
    this.createChart();
  },

  methods: {
    createChart() {
      const vm = this;

      // Create scale functions
      this.xScale = d3.scaleLinear()
        // d3.max() loops through each item in the "dataset" array. If I provide an "accessor
        // function," I can get d3.max() to loop through only the first elements of each item in the
        // "dataset" array and return the number with the greatest value.
        .domain([0, d3.max(this.dataset, function(d) {
          return d[0];
        })])
        .range([this.margin.left, this.svgWidth - this.margin.right]);

      this.yScale = d3.scaleLinear()
        .domain([0, d3.max(this.dataset, function(d) {
          return d[1];
        })])
        .range([this.svgHeight - this.margin.bottom, this.margin.top]);

      this.rScale = d3.scaleSqrt()
        .domain([0, d3.max(this.dataset, function(d) {
          return d[1];
        })])
        .range([0, 20]);

      // Define the x-axis
      this.xAxis = d3.axisBottom()
        .scale(this.xScale)
        .ticks(5);

      // Define the y-axis
      this.yAxis = d3.axisLeft()
        .scale(this.yScale)
        .ticks(5);

      // Create the baseSvg element
      this.baseSvg = d3.select("#chart-container")
        .append("svg")
          .attr("width", this.svgWidth)
          .attr("height", this.svgHeight);

      // Create circles
      this.baseSvg.selectAll("circle")
        .data(this.dataset)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
          return vm.xScale(d[0]);
        })
        .attr("cy", function(d) {
          return vm.yScale(d[1]);
        })
        .attr("r", function(d) {
          return vm.rScale(d[1]);
        });

      // Create labels
      this.baseSvg.selectAll("text")
        .data(this.dataset)
        .enter()
        .append("text")
        .text(function(d) {
          return `${d[0]}, ${d[1]}`;
        })
        .attr("x", function(d) {
          return vm.xScale(d[0]);
        })
        .attr("y", function(d) {
          return vm.yScale(d[1]);
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "red");

      // Create x-axis
      this.baseSvg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${this.svgHeight - this.margin.bottom})`)
        .call(this.xAxis);

      // Creae y-axis
      this.baseSvg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${this.margin.left}, 0)`)
        .call(this.yAxis);
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>
