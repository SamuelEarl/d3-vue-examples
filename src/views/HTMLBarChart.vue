<template>
  <div>
    <div id="body1"></div>
    <div id="body2"></div>
    <!-- <svg></svg> -->
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "Data",
  data() {
    return {
      dataset: []
    };
  },
  watch: {
    // watchers
  },
  mounted() {
    // this.renderValues();
    this.renderBars()
  },
  methods: {
    renderValues() {
      d3.select("#body1").selectAll("p")
        .data(this.dataset)
        .enter()
        .append("p")
        .text(function(d) {
          return d;
        });
    },

    renderBars() {
      for (let i = 0; i < 25; i++) {
        const newNumber = Math.random() * 30;
        this.dataset.push(newNumber);
      }

      d3.select("#body2").selectAll("div")
        .data(this.dataset)
        .enter()
        .append("div")
        .attr("class", "bar")
        .style("height", function(d) {
          const barHeight = d * 5;
          return barHeight + "px";
        });
    }
  }
};
</script>

<style lang="stylus">
  div.bar {
    display: inline-block;
    width: 20px;
    margin-right: 2px;
    background-color: teal;
  }
</style>
