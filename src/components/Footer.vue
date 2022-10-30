<template>
  <div class="cover">
    <div class="footer" :class="{ 'footer-done': addForm }">
      <hr v-if="addForm" />
      <div v-if="addForm" class="done-btn-container">
        <button class="done-btn" @click="doneButton">Done</button>
      </div>
    </div>
  </div>
</template>
<script></script>
<style></style>
