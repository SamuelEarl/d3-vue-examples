<template>
  <div>
    <table id="tooltip" class="hidden">
      <thead>
        <tr>
          <th id="name" colspan="2"></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>Sales: </th>
          <td id="sales"></td>
        </tr>
        <tr>
          <th>Income: </th>
          <td id="income"></td>
        </tr>
        <tr>
          <th>Market<br>Capitalization: </th>
          <td id="market-cap"></td>
        </tr>
        <tr>
          <td id="caption" colspan="2">Figures in billions of dollars</td>
        </tr>
      </tbody>
    </table>
    <div id="chart-container"></div>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "BubbleChart",
  data() {
    return {
      // Dataset using the Dow Jones Industrial Average:
      // https://finviz.com/bubbles.ashx?x=sales&y=income&size=marketCap&color=sector&idx=dji
      // ["Company Name", Sales, Income, Market Cap]
      dataset: [
        ["The Travelers Companies", 31.32, 2.35, 35.17, "financial"],
        ["DOW Inc", 47.36, 1.40, 40.73, "basic-materials"],
        ["Nike Inc", 40.78, 4.57, 158.03, "consumer-goods"],
        ["3M Company", 31.97, 4.91, 102.89, "industrial-goods"],
        ["McDonald's Corporation", 20.89, 5.89, 147.70, "services"],
        ["American Express Company", 44.25, 6.45, 102.70, "financial"],
        ["The P&G Company", 68.79, 4.03, 312.75, "consumer-goods"],
        ["The Boeing Company", 92.60, 3.79, 193.16, "industrial-goods"],
        ["United Technologies Corp", 75.54, 5.77, 128.66, "industrial-goods"],
        ["Caterpillar Inc", 55.00, 5.92, 80.65, "industrial-goods"],
        ["The Coca-Cola Company", 35.26, 7.61, 235.01, "consumer-goods"],
        ["The Goldman Sachs Group, Inc", 53.98, 8.01, 81.48, "financial"],
        ["Merck & Co., Inc", 45.97, 9.67, 234.67, "healthcare"],
        ["Visa Inc", 22.98, 11.65, 400.46, "financial"],
        ["Cisco Systems, Inc", 51.99, 11.87, 205.90, "technology"],
        ["The Walt Disney Company", 69.57, 10.41, 260.86, "services"],
        ["IBM", 77.13, 9.82, 120.10, "technology"],
        ["Pfizer Inc", 53.04, 15.42, 218.03, "healthcare"],
        ["Johnson & Johnson", 81.71, 14.15, 385.90, "healthcare"],
        ["Intel Corp", 70.41, 19.33, 253.32, "technology"],
        ["Walgreens Boots Alliance, Inc", 136.87, 3.98, 51.44, "services"],
        ["The Home Depot", 110.93, 11.13, 238.07, "services"],
        ["Verizon Communications Inc", 131.37, 16.11, 254.07, "technology"],
        ["Chevron Corp", 145.43, 13.67, 224.58, "basic-materials"],
        ["JPMorgan Chase & Co", 85.15, 33.19, 430.67, "financial"],
        ["Microsoft Corporation", 129.81, 38.65, 1187.88, "technology"],
        ["UnitedHealth Group Inc", 239.67, 13.34, 281.51, "healthcare"],
        ["Exxon Mobil Corp", 260.81, 14.63, 300.21, "basic-materials"],
        ["Apple Inc", 260.17, 55.26, 1264.51, "consumer-goods"],
        ["Walmart Inc", 521.09, 14.94, 337.12, "services"]
      ],
      margin: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      },
      baseSvgWidth: 800,
      baseSvgHeight: 500,
      baseSvg: null,
      baseGroup: null,
      labels: null,
      // Scale function variables
      xScale: null,
      yScale: null,
      rScale: null,
    };
  },

  computed: {
    baseGroupWidth() {
      return this.baseSvgWidth - this.margin.left - this.margin.right;
    },
    baseGroupHeight() {
      return this.baseSvgHeight - this.margin.top - this.margin.bottom;
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
        // Loop through all of the d[3] values in the dataset and find which percentile the current value falls in relation to all the other values in the dataset.
        .domain([0, d3.max(this.dataset, function(d) {
          return d[1];
        })])
        // Then take that percentile and pass it to the range() method and calculate the value that corresponds with that percentile and return that value.
        .range([0, this.baseGroupWidth]);

      this.yScale = d3.scaleLinear()
        .domain([0, d3.max(this.dataset, function(d) {
          return d[2];
        })])
        .range([this.baseGroupHeight, 0]);

      this.rScale = d3.scaleSqrt()
        .domain([0, d3.max(this.dataset, function(d) {
          return d[3];
        })])
        .range([0, 30]);

      // Append the SVG and base group elements using the margin convention
      // https://bl.ocks.org/mbostock/3019563
      this.baseSvg = d3.select("#chart-container")
        .append("svg")
          .attr("width", this.baseGroupWidth + this.margin.left + this.margin.right)
          .attr("height", this.baseGroupHeight + this.margin.top + this.margin.bottom);

      this.baseGroup = this.baseSvg.append("g")
          .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
          .attr("id", "base-group");

      this.baseGroup.selectAll("circle")
        .data(this.dataset)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
          return vm.xScale(d[1]);
        })
        .attr("cy", function(d) {
          return vm.yScale(d[2]);
        })
        .attr("r", function(d) {
          const r = vm.rScale(d[3]);
          return r;
        })
        .attr("class", function(d) {
          return d[4];
        })
        .on("mouseover", function(d) {
          const tooltip = d3.select("#tooltip");
          tooltip.classed("hidden", false);

          d3.select("#name").text(d[0]);
          d3.select("#sales").text(d[1]);
          d3.select("#income").text(d[2]);
          d3.select("#market-cap").text(d[3]);

          // Show the tooltip.
          // On hover, create the tooltip.
          // We first need to get the x-position of the left edge of the baseGroup element and then we can
          // calculate the x-position of the circles from the left edge of the baseGroup element.
          const baseGroup = document.getElementById("base-group");
          const baseGroupLeftEdge = baseGroup.getBoundingClientRect().left;
          const baseGroupTopEdge = baseGroup.getBoundingClientRect().top;
          // Get "this" circle's cx/cy values, then use those to set the tooltip position.
          const xPosition = parseFloat(d3.select(this).attr("cx")) + baseGroupLeftEdge;
          const yPosition = parseFloat(d3.select(this).attr("cy")) + baseGroupTopEdge;

          tooltip.style("left", xPosition + "px");
          tooltip.style("top", yPosition + "px")
        })
        .on("mouseout", function(d) {
          d3.select("#tooltip").classed("hidden", true);
        });

      // this.labels = this.baseGroup.selectAll("text")
      //   .data(this.dataset)
      //   .enter()
      //   .append("text")
      //   .text(function(d) {
      //     return d[0];
      //   })
      //   .attr("x", function(d) {
      //     return vm.xScale(d[1]);
      //   })
      //   .attr("y", function(d) {
      //     return vm.yScale(d[2]);
      //   })
      //   .attr("font-family", "sans-serif")
      //   .attr("font-size", "11px")
      //   .attr("fill", "red");
    },
  },
};
</script>

<style lang="stylus" scoped>
table#tooltip {
  position: absolute;
  border-collapse: collapse;
  background-color: white;
  border: 2px solid gray;
  text-align: left;
  z-index: 1;

  &.hidden {
    display: none;
  }

  thead {
    tr {
      th {
        padding: 5px;
        text-align: center;
        font-size: 1.2rem;
        font-weight: bold;
      }
    }
  }

  tbody {
    tr {
      th, td {
        padding: 10px;
        border-bottom: 1px solid gray;
        border-collapse: collapse;
      }
      th {
        font-weight: bold;
      }
      td {
        text-align: right;
        font-family: mono;
      }
      #caption {
        font-family: sans-serif;
        font-size: 0.7;
        font-style: italic;
      }
    }
  }
}

#chart-container >>> .consumer-goods {
  fill: red;
}
#chart-container >>> .technology {
  fill: orange;
}
#chart-container >>> .financial {
  fill: yellow;
}
#chart-container >>> .healthcare {
  fill: green;
}
#chart-container >>> .services {
  fill: pink;
}
#chart-container >>> .basic-materials {
  fill: violet;
}
#chart-container >>> .industrial-goods {
  fill: blue;
}
</style>
