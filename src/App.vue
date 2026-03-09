<template>
    <router-view />
</template>

<script setup lang="ts"></script>

<style>
/* 保证占满全屏 */
html,
body,
#app {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100vh;
}
</style>
