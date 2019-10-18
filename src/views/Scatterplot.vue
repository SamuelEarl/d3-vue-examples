<template>
  <div>
    <div id="body"></div>
    <br />
    <button id="click-this" @click="update">
      Click To Generate Random Data
    </button>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "Scatterplot",
  data() {
    return {
      svg: null,
      dataset: [
        // [5, 20],
        // [480, 90],
        // [250, 50],
        // [100, 33],
        // [330, 95],
        // [410, 12],
        // [475, 44],
        // [25, 67],
        // [85, 21],
        // [220, 88],
        // [600, 150]
      ],
      numDataPoints: 50,
      maxValueInDataset: 100,
      w: 500,
      h: 300,
      xScale: null,
      yScale: null,
      aScale: null,
      xAxis: null,
      padding: 30,
      generateColorValue: null,
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
      this.dataset = [];

      for (let i = 0; i < this.numDataPoints; i++) {
        const randomNum1 = Math.floor(Math.random() * this.maxValueInDataset);
        const randomNum2 = Math.floor(Math.random() * this.maxValueInDataset);
        const randomNum3 = Math.floor(Math.random() * this.maxValueInDataset);
        this.dataset.push([ randomNum1, randomNum2, randomNum3 ]);
      }
    },

    renderCharts() {
      const vm = this;

      this.generateRandomData();

      // Define scale functions
      this.xScale = d3.scaleLinear()
        .domain([0, d3.max(this.dataset, function(d) {
          return d[0];
        })])
        .range([this.padding, this.w - this.padding * 2.5]);

      this.yScale = d3.scaleLinear()
        .domain([0, d3.max(this.dataset, function(d) {
          return d[1];
        })])
        .range([this.h - this.padding, this.padding]);

      this.aScale = d3.scaleSqrt()
        .domain([0, d3.max(this.dataset, function(d) {
          return d[2];
        })])
        // The range produces the output values.
        // The circle areas should be between 0 and 5% of the height of the chart so that all the
        // circles can fit into the chart.
        .range([0, this.h * .05]);

      // Define X-axis
      this.xAxis = d3.axisBottom()
        .scale(this.xScale)
        .ticks(5);

      // Define Y-axis
      this.yAxis = d3.axisLeft()
        .scale(this.yScale)
        .ticks(5);

      // Define generateColorValue function
      this.generateColorValue = function(areaInputVal) {
        const areaOutputVal = this.aScale(areaInputVal);
        const maxAreaOutputVal = this.aScale(vm.maxValueInDataset);

        let colorVal;
        // If the circle area is 0% to 24.9% of the max possible circle area,
        // then colorVal will be the darkest circles.
        if (areaOutputVal >= 0) {
          colorVal = 64;
        }
        // If the circle area is 25% to 49.9% of the max possible circle area,
        // then colorVal will be medium dark circles.
        if (areaOutputVal >= maxAreaOutputVal * .25) {
          colorVal = 128;
        }
        // If the circle area is 50% to 74.9% of the max possible circle area,
        // then colorVal will be medium light circles.
        if (areaOutputVal >= maxAreaOutputVal * .50) {
          colorVal = 192;
        }
        // If the circle area is 75% to 100% of the max possible circle area,
        // then colorVal will be the lightest circles.
        if (areaOutputVal >= maxAreaOutputVal * .75) {
          colorVal = 255;
        }
        return `rgb(${colorVal}, 0, ${colorVal})`;
      };


      // Create SVG element
      this.svg = d3.select("#body")
        .append("svg")
        .attr("width", this.w)
        .attr("height", this.h);


      // Define clipping path
      this.svg.append("clipPath")
        .attr("id", "chart-area")
        .append("rect")
        .attr("x", this.padding)
        .attr("y", this.padding)
        .attr("width", this.w - this.padding * 3)
        .attr("height", this.h - this.padding * 2);


      // Create circles (and call scale functions)
      this.svg.append("g") // Append a "g" element to the SVG
        .attr("id", "circles") // Give the "g" element an ID of "circles"
        .attr("clip-path", "url(#chart-area)") // Give the "g" element a reference to the clipPath
        .selectAll("circle") // Select the elements that you want to create in the SVG
        .data(this.dataset)
        .enter()
        .append("circle")
        // When you call "xScale()" and pass it a value, the xScale function will look for that value in its set of domain values (i.e., in its set of input values) and return the corresponding range value (i.e., the output value). The range value that is returned is used to set the X or Y-value of the shape that is being appended. In this case, the range value that is returned is used to set the "cx" value of the circle that is being appended in the current iteration of the ".data(this.dataset)" function.
        .attr("cx", function(d) {
          return vm.xScale(d[0]);
        })
        .attr("cy", function(d) {
          return vm.yScale(d[1]);
        })
        // Scatterplots are able to chart 3 values in one plot: (1) the x-value, (2) the y-value, and (3) an area value for each circle that represents amount or something similar.
        // As a general rule, when creating visualizations that use circles to plot values, make sure that those circles are created with an area calculation (A = PI * r^2) instead of the circle's radius value.
        .attr("r", function(d) {
          return vm.aScale(d[2]);
        })
        .attr("fill", function(d) {
          return vm.generateColorValue(d[2]);
        });

      // // Create labels and call scale functions
      // this.svg.selectAll("text")
      //   .data(this.dataset)
      //   .enter()
      //   .append("text")
      //   .text(function(d) {
      //     return d[0] + ", " + d[1];
      //   })
      //   .attr("x", function(d, i) {
      //     return vm.xScale(d[0]);
      //   })
      //   .attr("y", function(d) {
      //     return vm.yScale(d[1]);
      //   })
      //   .attr("font-family", "sans-serif")
      //   .attr("font-size", "11px")
      //   .attr("fill", "red");

      // Create X-axis
      this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${this.h - this.padding})`)
        .call(this.xAxis);

      // Create Y-axis
      this.svg.append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(${this.padding}, 0)`)
        .call(this.yAxis);
    },

    update() {
      const vm = this;

      this.generateRandomData();

      // Update scale domains
      this.xScale.domain([0, d3.max(this.dataset, function(d) {
        return d[0];
      })]);
      this.yScale.domain([0, d3.max(this.dataset, function(d) {
        return d[1];
      })]);

      // Update all circles
      this.svg.selectAll("circle")
        .data(this.dataset)
        .transition()
        .duration(1000)
        .on("start", function() {
          d3.select(this)
            .attr("fill", "black")
        })
        .attr("cx", function(d) {
          return vm.xScale(d[0]);
        })
        .attr("cy", function(d) {
          return vm.yScale(d[1]);
        })
        .transition()
        .duration(500)
        .attr("r", function(d) {
          return vm.aScale(d[2]);
        })
        .attr("fill", function(d) {
          return vm.generateColorValue(d[2]);
        });

      // Update the axes. For each axis, do the following:
      // 1. Select the axis.
      // 2. Initiate a transition.
      // 3. Set the transition's duration.
      // 4. Call the appropriate axis generator.

      // Update X-axis
      this.svg.select(".x.axis")
        .transition()
        .duration(1000)
        .call(this.xAxis);

      // Update Y-axis
      this.svg.select(".y.axis")
        .transition()
        .duration(1000)
        .call(this.yAxis);
    }
  }
};
</script>

<style lang="stylus" scoped>

// The "scoped" attribute prevents the SVG styles from being applied, as these components are
// currently constructed. I need to look at https://medium.com/tyrone-tudehope/composing-d3-visualizations-with-vue-js-c65084ccb686
// and refactor these components in a more Vue-esque way that will apply the SVG styles.

  .axis {
    path, line {
      stroke: yellow; // Change this or comment it out when I get the scoped styles working.
      shape-rendering: crispEdges;
    }

    text {
      font-family: Optima, Futura, sans-serif;
      // font-weight: bold;
      // font-size: 14px;
      // fill: teal;
    }
  }

  #click-this {
    padding: 8px 10px;
    border: 2px solid palevioletred;
    font-size: 16px;
    background-color: transparent;
    color: darken(palevioletred, 20%);
    box-shadow: 2px 2px 2px palevioletred;
    cursor: pointer;
    outline: none;
    &:hover {
      box-shadow: none;
    }
  }
</style>
