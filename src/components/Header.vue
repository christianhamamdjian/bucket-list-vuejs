<template>
<div class="overlay" v-show="overlay" @click="resetModals"></div>
  <div class="main-container">
    <div class="header">
      <div
        @click="toggleAddForm"
        class="add-btn"
        :class="{ 'add-btn-clicked': addForm }"
      >
        <img src="./assets/images/add.svg" />
      </div>
    </div>
<!-- Add form start -->
 
  <!-- Add form end -->

    <h1>Bucket List</h1></template>
<script></script>
<style></style>
