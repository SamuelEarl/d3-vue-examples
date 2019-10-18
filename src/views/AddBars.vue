<template>
  <div>
    <div id="body"></div>
    <br />
    <button id="click-this" @click="update">
      Click To Add A New Bar
    </button>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "BarChart",
  data() {
    return {
      svg: null,
      dataset: [
        // 5, 10, 13, 19, 21, 25, 22, 18, 15, 13, 11, 12, 15, 20, 18, 17, 16, 18, 23, 25
      ],
      numValues: 25,
      maxValue: 100,
      w: 600,
      h: 250,
      xScale: null,
      yScale: null,
      bars: null,
      labels: null,
    };
  },
  watch: {
    // watchers
  },
  mounted() {
    this.renderCharts()
  },
  methods: {
    generateRandomData() {
      // Set this.dataset to an empty array.
      this.dataset = [];

      // Push random data to this.dataset.
      for (let i = 0; i < this.numValues; i++) {
        const newNumber = Math.floor(Math.random() * this.maxValue);
        this.dataset.push(newNumber);
      }
    },

    renderCharts() {
      const vm = this;

      // // Set this.numValues to equal the length of the original dataset.
      // this.numValues = this.dataset.length;

      this.generateRandomData();

      // Define scales
      this.xScale = d3.scaleBand()
        .domain(d3.range(this.dataset.length))
        .rangeRound([0, this.w])
        .paddingInner(0.05);

      this.yScale = d3.scaleLinear()
				.domain([0, d3.max(this.dataset)])
				.range([0, this.h]);

      // Create SVG element
      this.svg = d3.select("#body")
        .append("svg")
        .attr("width", this.w)
        .attr("height", this.h);

      // Create bars
      this.svg.selectAll("rect")
        .data(this.dataset)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
          return vm.xScale(i);
        })
        // SVG y-coordinates start at the top of the SVG element and move down. So we have to set the y-coordinates as the height of the SVG element minus the data value.
        .attr("y", function(d) {
          return vm.h - vm.yScale(d);
        })
        .attr("width", this.xScale.bandwidth())
        .attr("height", function(d) {
          return vm.yScale(d);
        })
        .attr("fill", function(d) {
          // To get some good color variation in the bars, divide maxValue by 40% of maxValue.
          const colorValue = Math.round(d * (vm.maxValue / (vm.maxValue * 0.4)));
          return `rgb(0, 0, ${colorValue})`;
        });

      // Create labels
      this.svg.selectAll("text")
        .data(this.dataset)
        .enter()
        .append("text")
        .text(function(d) {
          return d;
        })
        // Beginning of align value labels code
        .attr("text-anchor", "middle")
        .attr("x", function(d, i) {
          return vm.xScale(i) + vm.xScale.bandwidth() / 2;
        })
        .attr("y", function(d) {
          let yValue;
          if (d <= (vm.maxValue * 0.07)) {
            yValue = vm.h - vm.yScale(d) - 4;
          }
          else {
            yValue = vm.h - vm.yScale(d) + 14;
          }
          return yValue;
        })
        // End of align value labels code
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", function(d) {
          let fillColor;
          if (d <= (vm.maxValue * 0.07)) {
            fillColor = "black";
          }
          else {
            fillColor = "white";
          }
          return fillColor;
        });
    },

    update() {
      const vm = this;

      const newNumber = Math.floor(Math.random() * this.maxValue);
      this.dataset.push(newNumber);

      // Update scale domains
      // Recalibrate the X-scale domain, given the new length of dataset.
      this.xScale.domain(d3.range(this.dataset.length));
      // Recalibrate the Y-scale domain, given the new max value in this.dataset.
      this.yScale.domain([0, d3.max(this.dataset)]);

      this.bars = this.svg.selectAll("rect") // Select all bars
        .data(this.dataset); // Re-bind data to existing bars and return the "update" selection from the data() method. this.bars is now the update selection.

      // Update the shapes and colors of those shapes based on the new data values.
      this.bars.enter() // References the enter selection (a subset of the update selection)
        .append("rect") // Creates a new rect
        .attr("x", this.w) // Sets the initial x position of the rect beyond the far right edge of the SVG
        .attr("y", function(d) { // Sets the y value, based on the updated yScale
          return vm.h - vm.yScale(d);
        })
        .attr("width", this.xScale.bandwidth()) // Sets the width value, based on the updated xScale
        .attr("height", function(d) { // Sets the height value, based on the updated yScale
          return vm.yScale(d);
        })
        .attr("fill", function(d) { // Sets the fill value
          // To get some good color variation in the bars, divide maxValue by 40% of maxValue.
          const colorValue = Math.round(d * (vm.maxValue / (vm.maxValue * 0.4)));
          return `rgb(0, 0, ${colorValue})`;
        })
        .merge(this.bars) // Merges the enter selection (the new bar) with the update selection (the other existing bars)
        .transition() // Initiate a transition on all elements in the update selection (all rects)
        .duration(500)
        .attr("x", function(d, i) { // Set new x position, based on the updated xScale
          return vm.xScale(i);
        })
        .attr("y", function(d) { // Set new y position, based on the updated yScale
          return vm.h - vm.yScale(d);
        })
        .attr("width", this.xScale.bandwidth()) // Set new width value, based on the updated xScale
        .attr("height", function(d) { // Set new height value, based on the updated yScale
          return vm.yScale(d);
        });

      // Update the labels based on the new data values.
      this.labels = this.svg.selectAll("text")
        .data(this.dataset);

      this.labels.enter()
        .append("text")
        .attr("x", this.w)
        .attr("y", function(d) {
          let yValue;
          if (d <= (vm.maxValue * 0.07)) {
            yValue = vm.h - vm.yScale(d) - 4;
          }
          else {
            yValue = vm.h - vm.yScale(d) + 14;
          }
          return yValue;
        })
        .merge(this.labels)
        .transition()
        .duration(500)
        .text(function(d) {
          return d;
        })
        .attr("text-anchor", "middle")
        .attr("x", function(d, i) {
          return vm.xScale(i) + vm.xScale.bandwidth() / 2;
        })
        .attr("y", function(d) {
          let yValue;
          if (d <= (vm.maxValue * 0.07)) {
            yValue = vm.h - vm.yScale(d) - 4;
          }
          else {
            yValue = vm.h - vm.yScale(d) + 14;
          }
          return yValue;
        })
        .attr("font-family", "sans-serif")
			  .attr("font-size", "11px")
        .attr("fill", function(d) {
          let fillColor;
          if (d <= (vm.maxValue * 0.07)) {
            fillColor = "black";
          }
          else {
            fillColor = "white";
          }
          return fillColor;
        });
    }
  }
};
</script>

<style lang="stylus" scoped>
  #click-this {
    padding: 8px 10px;
    border: 2px solid navy;
    font-size: 16px;
    background-color: transparent;
    color: darken(navy, 20%);
    box-shadow: 2px 2px 2px gray;
    cursor: pointer;
    outline: none;
    &:hover {
      box-shadow: none;
    }
  }
</style>
