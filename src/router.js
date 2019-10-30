import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "home",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "home" */ "./views/Home.vue")
    },
    {
      path: "/html-bar-chart",
      name: "html-bar-chart",
      component: () => import(/* webpackChunkName: "htmlBarChart" */ "./views/HTMLBarChart.vue")
    },
    {
      path: "/circles",
      name: "circles",
      component: () => import(/* webpackChunkName: "circles" */ "./views/Circles.vue")
    },
    {
      path: "/bar-chart",
      name: "bar-chart",
      component: () => import(/* webpackChunkName: "barChart" */ "./views/BarChart.vue")
    },
    {
      path: "/add-remove-bars",
      name: "add-remove-bars",
      component: () => import(/* webpackChunkName: "addRemoveBars" */ "./views/AddRemoveBars.vue")
    },
    {
      path: "/scatterplot",
      name: "scatterplot",
      component: () => import(/* webpackChunkName: "scatterplot" */ "./views/Scatterplot.vue")
    },
    {
      path: "/line-chart",
      name: "line-chart",
      component: () => import(/* webpackChunkName: "lineChart" */ "./views/LineChart.vue")
    },
    {
      path: "/time-series-chart",
      name: "time-series-chart",
      component: () => import(/* webpackChunkName: "timeSeriesChart" */ "./views/TimeSeriesChart.vue")
    },
    {
      path: "/area-chart",
      name: "area-chart",
      component: () => import(/* webpackChunkName: "areaChart" */ "./views/AreaChart.vue")
    },
  ]
})
