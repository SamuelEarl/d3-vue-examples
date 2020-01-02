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
        left: 20
      },
      svgWidth: 800,
      svgHeight: 500,
      baseGroup: null,
      labels: null,
      // Scale function variables
      xScale: null,
      yScale: null,
      rScale: null, // The scale used to calculate the radius of the circles
    };
  },

  computed: {
    baseGroupWidth() {
      return this.svgWidth - this.margin.left - this.margin.right;
    },
    baseGroupHeight() {
      return this.svgHeight - this.margin.top - this.margin.bottom;
    }
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
        .range([0, this.baseGroupWidth]);

      this.yScale = d3.scaleLinear()
        .domain([0, d3.max(this.dataset, function(d) {
          return d[1];
        })])
        .range([this.baseGroupHeight, 0]);

      this.rScale = d3.scaleSqrt()
        .domain([0, d3.max(this.dataset, function(d) {
          return d[1];
        })])
        .range([0, 20]);

      // Append the SVG and base group elements using the margin convention
      // https://bl.ocks.org/mbostock/3019563
      this.baseGroup = d3.select("#chart-container")
        .append("svg")
          .attr("width", this.baseGroupWidth + this.margin.left + this.margin.right)
          .attr("height", this.baseGroupHeight + this.margin.top + this.margin.bottom)
        .append("g")
          .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

      // Create circles
      this.baseGroup.selectAll("circle")
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
      this.baseGroup.selectAll("text")
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
    },
  },
};
</script>

<style lang="stylus" scoped>

</style>
