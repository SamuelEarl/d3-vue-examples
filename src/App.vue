<template>
  <div id="app">
    <nav id="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/html-bar-chart">HTML Bar Chart</router-link>
      <router-link to="/circles">Circles</router-link>
      <router-link to="/bar-chart">Bar Chart</router-link>
      <router-link to="/scatterplot">Scatterplot</router-link>
    </nav>
    <router-view/>
  </div>
</template>
<style lang="stylus" scoped>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
  a {
    padding: 1px 8px;
    border-left: 2px solid #333;
    font-weight: bold;
    text-decoration: none;
    color: #333;
    &:first-child {
      border-left: none;
    }
    &.router-link-exact-active {
      color: palevioletred;
    }
  }
}
</style>
