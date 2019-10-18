<template>
  <div id="body"></div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "Circles",
  data() {
    return {
      dataset: [ 5, 10, 15, 20, 25 ],
      w: 500,
      h: 50
    };
  },
  watch: {
    // watchers
  },
  mounted() {
    this.renderCharts()
  },
  methods: {
    renderCharts() {
      const svg = d3.select("#body")
        .append("svg")
        .attr("width", this.w)
        .attr("height", this.h);

      const circles = svg.selectAll("circle")
        .data(this.dataset)
        .enter()
        .append("circle");

      circles.attr("cx", function(d, i) {
        return (i * 50) + 25;
      })
      .attr("cy", this.h/2)
      .attr("r", function(d) {
        return d;
      })
      .attr("fill", "yellow")
      .attr("stroke", "orange")
      .attr("stroke-width", function(d) {
        return d/2;
      });

      // const svg = d3.select("#body")
      //   .append("svg")
      //   .attr("width", 500)
      //   .attr("height", 500);

      // const rectangles = svg.selectAll("rect")
      //   .data(this.dataset)
      //   .enter()
      //   .append("rect");

      // rectangles.attr("class", "bar")
      //   .style("height", function(d) {
      //     const barHeight = d * 5;
      //     return barHeight + "px";
      //   });
    }
  }
};
</script>

<style lang="stylus">
  // .bar {
  //   display: inline-block;
  //   width: 20px;
  //   margin-right: 2px;
  //   background-color: teal;
  // }
</style>
