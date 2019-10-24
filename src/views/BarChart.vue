<template>
  <div id="bar-chart">
    <div id="body">
      <svg id="svg" :width="w" :height="h"></svg>
    </div>
    <br />
    <button id="click-this" @click="randomize">
      Generate Random Data
    </button>

    &nbsp;

    <button id="click-this" @click="sortBars">
      Toggle Sort Order
    </button>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "BarChart",
  data() {
    return {
      dataset: [
        // 5, 10, 13, 19, 21, 25, 22, 18, 15, 13, 11, 12, 15, 20, 18, 17, 16, 18, 23, 25
      ],
      svg: null,
      g: null,
      numValues: 25,
      maxValue: 100,
      w: 600,
      h: 250,
      xScale: null,
      yScale: null,
      sortOrder: false,
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

      // Set the selected SVG element to this.svg so you can reference the SVG element later.
      this.svg = d3.select("#svg");
        // .append("svg")
        // .attr("width", this.w)
        // .attr("height", this.h);


      // Create <g> elements and append them into the <svg> element
      this.g = this.svg.selectAll("g")
        .data(this.dataset)
        .enter()
        .append("g");
        // .on("mouseover", function() {
        //   // "this" references the <g> element. You can reference child elements by chaining
        //   // additional "select()" functions together and referencing the necessary child elements.
        //   d3.select(this).select("rect")
        //     .attr("fill", "orange");
			  // })
			  // .on("mouseout", function(d) {
        //   d3.select(this).select("rect")
        //     .transition("restoreBarColor")
        //     .duration(250)
        //     .attr("fill", function(d) {
        //       const colorValue = Math.round(d * (vm.maxValue / (vm.maxValue * 0.4)));
        //       return `rgb(0, 0, ${colorValue})`;
        //     })
        // });


      // Append <rect> elements into each <g> element
      this.g.append("rect")
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


      // Append <text> elements into each <g> element
      this.g.append("text")
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


      // this.g.selectAll("rect")
      //   .data(this.dataset)
      //   .enter()
      //   .append("rect")
      //   .attr("x", function(d, i) {
      //     return vm.xScale(i);
      //   })
      //   // SVG y-coordinates start at the top of the SVG element and move down. So we have to set the y-coordinates as the height of the SVG element minus the data value.
      //   .attr("y", function(d) {
      //     return vm.h - vm.yScale(d);
      //   })
      //   .attr("width", this.xScale.bandwidth())
      //   .attr("height", function(d) {
      //     return vm.yScale(d);
      //   })
      //   .attr("fill", function(d) {
      //     // To get some good color variation in the bars, divide maxValue by 40% of maxValue.
      //     const colorValue = Math.round(d * (vm.maxValue / (vm.maxValue * 0.4)));
      //     return `rgb(0, 0, ${colorValue})`;
      //   })
      //   .on("mouseover", function() {
      //     d3.select(this)
      //       .attr("fill", "orange");
			//   })
			//   .on("mouseout", function(d) {
			// 	  d3.select(this)
      //       .transition()
      //       .duration(250)
      //       .attr("fill", function(d) {
      //         const colorValue = Math.round(d * (vm.maxValue / (vm.maxValue * 0.4)));
      //         return `rgb(0, 0, ${colorValue})`;
      //       })
      //   });

      // // Create labels
      // this.g.selectAll("text")
      //   .data(this.dataset)
      //   .enter()
      //   .append("text")
      //   .text(function(d) {
      //     return d;
      //   })
      //   // Beginning of align value labels code
      //   .attr("text-anchor", "middle")
      //   .attr("x", function(d, i) {
      //     return vm.xScale(i) + vm.xScale.bandwidth() / 2;
      //   })
      //   .attr("y", function(d) {
      //     let yValue;
      //     if (d <= (vm.maxValue * 0.07)) {
      //       yValue = vm.h - vm.yScale(d) - 4;
      //     }
      //     else {
      //       yValue = vm.h - vm.yScale(d) + 14;
      //     }
      //     return yValue;
      //   })
      //   // End of align value labels code
      //   .attr("font-family", "sans-serif")
      //   .attr("font-size", "11px")
      //   .attr("fill", function(d) {
      //     let fillColor;
      //     if (d <= (vm.maxValue * 0.07)) {
      //       fillColor = "black";
      //     }
      //     else {
      //       fillColor = "white";
      //     }
      //     return fillColor;
      //   });
    },

    randomize() {
      const vm = this;

      // // Set the iterator value to equal the length of the original dataset.
      // this.numValues = this.dataset.length;

      this.generateRandomData();

      // // Push random data to this.dataset.
      // for (let i = 0; i < this.numValues; i++) {
      //   const newNumber = Math.floor(Math.random() * this.maxValue);
      //   this.dataset.push(newNumber);
      // }

      // Update scale domain
      // Recalibrate the Y-scale domain, given the new max value in this.dataset.
      this.yScale.domain([0, d3.max(this.dataset)]);


// If I change to following selections to "this.g.selectAll('rect')" then the bar charts break when
// the data is randomized. I don't understand why that is, but I am going to find out.

      // Update the shapes and colors of those shapes based on the new data values.
      this.svg.selectAll("rect")
        .data(this.dataset)
        .transition()
        .delay(function(d, i) {
          return i / vm.dataset.length * 1000;
        })
        .duration(500)
        .ease(d3.easeLinear)
        .attr("y", function(d) {
          return vm.h - vm.yScale(d);
        })
        .attr("height", function(d) {
          return vm.yScale(d);
        })
        .attr("fill", function(d) {
          // To get some good color variation in the bars, divide maxValue by 40% of maxValue.
          const colorValue = Math.round(d * (vm.maxValue / (vm.maxValue * 0.4)));
          return `rgb(0, 0, ${colorValue})`;
        });

      // Update the labels based on the new data values.
      this.svg.selectAll("text")
        .data(this.dataset)
        .transition()
        .delay(function(d, i) {
          return i / vm.dataset.length * 1000;
        })
        .duration(500)
        .ease(d3.easeLinear)
        .text(function(d) {
          return d;
        })
        // .attr("x", function(d, i) {
        //   return vm.xScale(i) + vm.xScale.bandwidth() / 2;
        // })
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

    sortBars() {
      const vm = this;

      this.sortOrder = !this.sortOrder;

      // Sort the bars
      this.svg.selectAll("rect")
        .sort(function(a, b) {
          if (vm.sortOrder) {
            return d3.ascending(a, b);
          }
          else {
            return d3.descending(a, b);
          }
        })
        .transition("sortBars")
        .delay(function(d, i) {
          return i * 50;
        })
        .duration(1000)
        .attr("x", function(d, i) {
          return vm.xScale(i);
        });

      // Sort the labels
      this.svg.selectAll("text")
        .sort(function(a, b) {
          if (vm.sortOrder) {
            return d3.ascending(a, b);
          }
          else {
            return d3.descending(a, b);
          }
        })
        .transition("sortLabels")
        .delay(function(d, i) {
          return i * 50;
        })
        .duration(1000)
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
        });
    }
  }
};
</script>

<style lang="stylus" scoped>
  // In order to add scoped styles to elements that have been dynamically added to the DOM after the Vue component has been created, you have to use deep selectors (https://vue-loader.vuejs.org/guide/scoped-css.html#deep-selectors).
  #body >>> rect {
    // You have to specify the property that you want to be affected during the transition,
    // otherwise all properties will be affected and the transition will cause the sorting and
    // random data generation to look glitchy.
    transition: fill 0.25s ease 0s;
    &:hover {
      fill: orange;
    }
  }

  #body >>> text {
    // Prevent the bars' mouseout event from firing when a user hovers over the text labels in the bars.
    pointer-events: none;
  }

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
