<template>
  <div id="bar-chart">
    <div id="bar-chart-container"></div>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "BarChart",
  data() {
    return {
      dataset: [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13, 11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ],
      chartWidth: 800,
      chartHeight: 500,
      baseSvg: null,
      bars: null,
      barPadding: 1,
      scaleFactor: 10,
      text: null,
    };
  },

  mounted() {
    this.createChart();
  },

  methods: {
    createChart() {
      const vm = this;

      this.baseSvg = d3.select("#bar-chart-container")
        .append("svg")
        .attr("width", this.chartWidth)
        .attr("height", this.chartHeight);

      this.bars = this.baseSvg.selectAll("rect")
        .data(this.dataset)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
          return i * (vm.chartWidth / vm.dataset.length);
        })
        .attr("y", function(d) {
          return vm.chartHeight - (d * vm.scaleFactor);
        })
        .attr("width", (this.chartWidth / this.dataset.length) - this.barPadding)
        .attr("height", function(d) {
          return d * vm.scaleFactor;
        })
        .attr("fill", function(d) {
          return `rgb(0, 0, ${Math.round(d * 10)})`;
        });

      this.text = this.baseSvg.selectAll("text")
        .data(this.dataset)
        .enter()
        .append("text")
        .text(function(d) {
          return d;
        })
        .attr("text-anchor", "middle")
        .attr("x", function(d, i) {
          return i * (vm.chartWidth / vm.dataset.length) + ((vm.chartWidth / vm.dataset.length - vm.barPadding) / 2);
        })
        .attr("y", function(d) {
          return vm.chartHeight - (d * vm.scaleFactor) + 15;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "white");
    }
  }
};
</script>

<style lang="stylus" scoped>

</style>
