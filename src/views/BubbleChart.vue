<template>
  <div id="bubble-chart">
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
        top: 40,
        right: 20,
        bottom: 20,
        left: 20
      },
      svgWidth: 800,
      svgHeight: 500,
      baseSvg: null,
      labels: null,
      // Scale and axis variables
      xScale: null,
      yScale: null,
      rScale: null,
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
        // Loop through all of the d[3] values in the dataset and find which percentile the current value falls in relation to all the other values in the dataset.
        .domain([0, d3.max(this.dataset, function(d) {
          return d[1];
        })])
        // Then take that percentile and pass it to the range() method and calculate the value that corresponds with that percentile and return that value.
        .range([this.margin.left, this.svgWidth - this.margin.right]);

      this.yScale = d3.scaleLinear()
        .domain([0, d3.max(this.dataset, function(d) {
          return d[2];
        })])
        .range([this.svgHeight - this.margin.bottom, this.margin.top]);

      this.rScale = d3.scaleSqrt()
        .domain([0, d3.max(this.dataset, function(d) {
          return d[3];
        })])
        .range([0, 30]);

      // Define the x-axis.
      this.xAxis = d3.axisBottom().scale(this.xScale);

      // Define the y-axis
      this.yAxis = d3.axisLeft().scale(this.yScale);

      // Create the baseSvg element
      this.baseSvg = d3.select("#chart-container")
        .append("svg")
          .attr("width", this.svgWidth)
          .attr("height", this.svgHeight)
          .attr("id", "svg");

      this.baseSvg.selectAll("circle")
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
        .attr("id", function(d, i) {
          return `company-${i}`;
        })
        .on("mouseover", function(d) {
          const highlightedCircle = d3.select(`#${this.id}`);
          highlightedCircle.classed("highlighted", true);

          const tooltip = d3.select("#tooltip");
          tooltip.classed("hidden", false);

          d3.select("#name").text(d[0]);
          d3.select("#sales").text(d[1]);
          d3.select("#income").text(d[2]);
          d3.select("#market-cap").text(d[3]);

          // Show the tooltip.
          // On hover, create the tooltip.
          // We first need to get the x-position of the left edge of the svgEl element and then we can
          // calculate the x-position of the circles from the left edge of the svgEl element.
          const svgEl = document.getElementById("svg");
          const svgElLeftEdge = svgEl.getBoundingClientRect().left;
          const svgElTopEdge = svgEl.getBoundingClientRect().top;
          // Get "this" circle's cx/cy values, then use those to set the tooltip position.
          const xPosition = parseFloat(d3.select(this).attr("cx")) + svgElLeftEdge;
          const yPosition = parseFloat(d3.select(this).attr("cy")) + svgElTopEdge;

          tooltip.style("left", xPosition + 30 + "px");
          tooltip.style("top", yPosition - 30 + "px")
        })
        .on("mouseout", function(d) {
          const highlightedCircle = d3.select(`#${this.id}`);
          highlightedCircle.classed("highlighted", false);

          d3.select("#tooltip").classed("hidden", true);
        });

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
#bubble-chart {
  background-color: rgb(38, 41, 49);
}

table#tooltip {
  position: absolute;
  border-collapse: collapse;
  background-color: lighten(rgb(38, 41, 49), 10%);
  color: #ccc;
  border: 2px solid #777;
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
        border-bottom: 1px solid #777;
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
  fill: rgba(255, 65, 70, 0.85);
}
#chart-container >>> .technology {
  fill: rgba(255, 147, 0, 0.85);
}
#chart-container >>> .financial {
  fill: rgba(255, 255, 0, 0.85);
}
#chart-container >>> .healthcare {
  fill: rgba(52, 170, 0, 0.85);
}
#chart-container >>> .services {
  fill: rgba(0, 209, 109, 0.85);
}
#chart-container >>> .basic-materials {
  fill: rgba(24, 163, 224, 0.85);
}
#chart-container >>> .industrial-goods {
  fill: rgba(89, 99, 209, 0.85);
}

#chart-container >>> .highlighted {
  cursor: pointer;
  stroke: white;
}

// Axis styles
#chart-container >>> g.axis path, #chart-container >>> g.axis line {
  stroke: #ccc;
  shape-rendering: crispEdges;
}
#chart-container >>> g.axis text {
  fill: #ccc;
}
</style>
