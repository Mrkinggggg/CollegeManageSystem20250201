<template>
  <div id="app">
    <HeadNavbar v-if="$route.path !== '/login'" />

    <div class="app-container">
      <div class="sidebar" v-if="currentSidebar">
        <component :is="currentSidebar" />
      </div>

      <div class="main-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { RouterLink, RouterView } from 'vue-router'
import HeadNavbar from "@/components/headNavbar.vue";
import sSidebar from "@/components/sSidebar.vue";
import tSidebar from "@/components/tSidebar.vue";
import aSidebar from "@/components/aSidebar.vue";

export default {
  name: "App",
  components: {
    HeadNavbar,
    RouterView,
    RouterLink,
    sSidebar,
    tSidebar,
    aSidebar,
  },
  computed: {
    currentSidebar() {
      const path = this.$route.path;
      if (path.startsWith("/student")) {
        return "sSidebar";
      } else if (path.startsWith("/teacher")) {
        return "tSidebar";  
      } else if (path.startsWith("/admin/")) {
        return "aSidebar";
      } else {
        return null; 
      }
    },
  },
};
</script>

<style>

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-container {
  display: flex;
  flex: 1;
  height: 100%;
}


.main-content {
  flex: 1;
  padding: 20px;
  background: #fff;
  
}
</style>
