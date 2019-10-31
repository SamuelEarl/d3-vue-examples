<template>
  <div>
    <div id="body"></div>
    <br />
    <button class="click-this" @click="addData">
      Add Data
    </button>

    &nbsp;

    <button class="click-this" @click="removeData">
      Remove Data
    </button>

    &nbsp;

    <button class="click-this" @click="addRemove">
      Add &amp; Remove Data
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
      key: null,
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
        this.dataset.push({ key: i, value: newNumber });
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
				.domain([0, d3.max(this.dataset, function(d) {
          return d.value;
        })])
        .range([0, this.h]);


      // Define key function, to be used when binding data.
      this.key = function(d) {
        return d.key;
      };


      // Create SVG element
      this.svg = d3.select("#body")
        .append("svg")
        .attr("width", this.w)
        .attr("height", this.h);

      // Create bars
      this.svg.selectAll("rect")
        .data(this.dataset, this.key)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
          return vm.xScale(i);
        })
        // SVG y-coordinates start at the top of the SVG element and move down. So we have to set the y-coordinates as the height of the SVG element minus the data value.
        .attr("y", function(d) {
          return vm.h - vm.yScale(d.value);
        })
        .attr("width", this.xScale.bandwidth())
        .attr("height", function(d) {
          return vm.yScale(d.value);
        })
        .attr("fill", function(d) {
          // To get some good color variation in the bars, divide maxValue by 40% of maxValue.
          const colorValue = Math.round(d.value * (vm.maxValue / (vm.maxValue * 0.4)));
          return `rgb(0, 0, ${colorValue})`;
        });

      // Create labels
      this.svg.selectAll("text")
        .data(this.dataset, this.key)
        .enter()
        .append("text")
        .text(function(d) {
          return d.value;
        })
        // Beginning of align value labels code
        .attr("text-anchor", "middle")
        .attr("x", function(d, i) {
          return vm.xScale(i) + vm.xScale.bandwidth() / 2;
        })
        .attr("y", function(d) {
          let yValue;
          // If the bars are too short to place the label inside of them, then this function will
          // place the label above the bar.
          if (d.value <= (vm.maxValue * 0.07)) {
            yValue = vm.h - vm.yScale(d.value) - 4;
          }
          else {
            yValue = vm.h - vm.yScale(d.value) + 14;
          }
          return yValue;
        })
        // End of align value labels code
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", function(d) {
          let fillColor;
          // If the bars are too short to place the label inside of them, then the label will be
          // placed above the bar. This function will change the text color to black.
          if (d.value <= (vm.maxValue * 0.07)) {
            fillColor = "black";
          }
          else {
            fillColor = "white";
          }
          return fillColor;
        });
    },

    addData() {
      const vm = this;

      const newNumber = Math.floor(Math.random() * this.maxValue);
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
      // Set the key value of the new data object to be i.
      this.dataset.push({ key: key, value: newNumber });

      // Update scale domains
      // Recalibrate the X-scale domain, given the new length of dataset.
      this.xScale.domain(d3.range(this.dataset.length));
      // Recalibrate the Y-scale domain, given the new max value in this.dataset.
      this.yScale.domain([0, d3.max(this.dataset, function(d) {
        return d.value;
      })]);

      this.bars = this.svg.selectAll("rect") // Select all bars
        .data(this.dataset, this.key); // Re-bind data to existing bars and return the "update" selection from the data() method. this.bars is now the update selection.

      // Update the shapes and colors of those shapes based on the new data values.
      this.bars.enter() // References the enter selection (a subset of the update selection)
        .append("rect") // Creates a new rect
        .attr("x", this.w) // Sets the initial x position of the rect beyond the far right edge of the SVG
        .attr("y", function(d) { // Sets the y value, based on the updated yScale
          return vm.h - vm.yScale(d.value);
        })
        .attr("width", this.xScale.bandwidth()) // Sets the width value, based on the updated xScale
        .attr("height", function(d) { // Sets the height value, based on the updated yScale
          return vm.yScale(d.value);
        })
        .attr("fill", function(d) { // Sets the fill value
          // To get some good color variation in the bars, divide maxValue by 40% of maxValue.
          const colorValue = Math.round(d.value * (vm.maxValue / (vm.maxValue * 0.4)));
          return `rgb(0, 0, ${colorValue})`;
        })
        .merge(this.bars) // Merges the enter selection (the new bar) with the update selection (the already existing bars)
        .transition() // Initiate a transition on all elements in the update selection (all rects)
        .duration(500)
        .attr("x", function(d, i) { // Set new x position, based on the updated xScale
          return vm.xScale(i);
        })
        .attr("y", function(d) { // Set new y position, based on the updated yScale
          return vm.h - vm.yScale(d.value);
        })
        .attr("width", this.xScale.bandwidth()) // Set new width value, based on the updated xScale
        .attr("height", function(d) { // Set new height value, based on the updated yScale
          return vm.yScale(d.value);
        });

      // Update the labels based on the new data values.
      this.labels = this.svg.selectAll("text")
        .data(this.dataset, this.key);

      this.labels.enter()
        .append("text")
        .attr("x", this.w)
        .attr("y", function(d) {
          let yValue;
          if (d.value <= (vm.maxValue * 0.07)) {
            yValue = vm.h - vm.yScale(d.value) - 4;
          }
          else {
            yValue = vm.h - vm.yScale(d.value) + 14;
          }
          return yValue;
        })
        .merge(this.labels)
        .transition()
        .duration(500)
        .text(function(d) {
          return d.value;
        })
        .attr("text-anchor", "middle")
        .attr("x", function(d, i) {
          return vm.xScale(i) + vm.xScale.bandwidth() / 2;
        })
        .attr("y", function(d) {
          let yValue;
          if (d.value <= (vm.maxValue * 0.07)) {
            yValue = vm.h - vm.yScale(d.value) - 4;
          }
          else {
            yValue = vm.h - vm.yScale(d.value) + 14;
          }
          return yValue;
        })
        .attr("font-family", "sans-serif")
			  .attr("font-size", "11px")
        .attr("fill", function(d) {
          let fillColor;
          if (d.value <= (vm.maxValue * 0.07)) {
            fillColor = "black";
          }
          else {
            fillColor = "white";
          }
          return fillColor;
        });
    },

    removeData() {
      const vm = this;

      this.dataset.shift();

      // Update scale domains
      this.xScale.domain(d3.range(this.dataset.length));
      this.yScale.domain([0, d3.max(this.dataset, function(d) {
        return d.value;
      })]);

      // Select...
      this.bars = this.svg.selectAll("rect")
        .data(this.dataset, this.key); // Bind data with custom key function.


// This is a duplicate. I need to refactor this code and put this into a separate method:
      // Update the shapes and colors of those shapes based on the new data values.
      this.bars.enter() // References the enter selection (a subset of the update selection)
        .append("rect") // Creates a new rect
        .attr("x", this.w) // Sets the initial x position of the rect beyond the far right edge of the SVG
        .attr("y", function(d) { // Sets the y value, based on the updated yScale
          return vm.h - vm.yScale(d.value);
        })
        .attr("width", this.xScale.bandwidth()) // Sets the width value, based on the updated xScale
        .attr("height", function(d) { // Sets the height value, based on the updated yScale
          return vm.yScale(d.value);
        })
        .attr("fill", function(d) { // Sets the fill value
          // To get some good color variation in the bars, divide maxValue by 40% of maxValue.
          const colorValue = Math.round(d.value * (vm.maxValue / (vm.maxValue * 0.4)));
          return `rgb(0, 0, ${colorValue})`;
        })
        .merge(this.bars) // Merges the enter selection (the new bar) with the update selection (the other existing bars)
        .transition() // Initiate a transition on all elements in the update selection (all rects)
        .duration(500)
        .attr("x", function(d, i) { // Set new x position, based on the updated xScale
          return vm.xScale(i);
        })
        .attr("y", function(d) { // Set new y position, based on the updated yScale
          return vm.h - vm.yScale(d.value);
        })
        .attr("width", this.xScale.bandwidth()) // Set new width value, based on the updated xScale
        .attr("height", function(d) { // Set new height value, based on the updated yScale
          return vm.yScale(d.value);
        });

      // Remove the left bar
      this.bars.exit()
        .transition()
        .duration(500)
        .attr("x", -this.xScale.bandwidth())
        .remove();


      // Update the labels based on the new data values.
      this.labels = this.svg.selectAll("text")
        .data(this.dataset, this.key);


// This is a duplicate. I need to refactor this code and put this into a separate method:
      // Update the labels
      this.labels.enter()
        .append("text")
        .attr("x", this.w)
        .attr("y", function(d) {
          let yValue;
          if (d.value <= (vm.maxValue * 0.07)) {
            yValue = vm.h - vm.yScale(d.value) - 4;
          }
          else {
            yValue = vm.h - vm.yScale(d.value) + 14;
          }
          return yValue;
        })
        .merge(this.labels)
        .transition()
        .duration(500)
        .text(function(d) {
          return d.value;
        })
        .attr("text-anchor", "middle")
        .attr("x", function(d, i) {
          return vm.xScale(i) + vm.xScale.bandwidth() / 2;
        })
        .attr("y", function(d) {
          let yValue;
          if (d.value <= (vm.maxValue * 0.07)) {
            yValue = vm.h - vm.yScale(d.value) - 4;
          }
          else {
            yValue = vm.h - vm.yScale(d.value) + 14;
          }
          return yValue;
        })
        .attr("font-family", "sans-serif")
			  .attr("font-size", "11px")
        .attr("fill", function(d) {
          let fillColor;
          if (d.value <= (vm.maxValue * 0.07)) {
            fillColor = "black";
          }
          else {
            fillColor = "white";
          }
          return fillColor;
        });

      // Remove the left label
      this.labels.exit()
        .transition()
        .duration(500)
        .attr("x", -this.xScale.bandwidth())
        .remove();
    },

    addRemove() {
      this.addData();
      this.removeData();
    }
  }
};
</script>

<style lang="stylus" scoped>
  .click-this {
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
