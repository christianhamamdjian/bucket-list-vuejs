<template>
  <!-- Modal start -->
  <Transition name="fade">
    <div class="options-modal" v-show="modals[i]">
      <div class="modal-head">
        <h2>{{ item.description }}</h2>
        <div class="modal-close">
          <img src="./assets/images/close-grey.svg" />
        </div>
      </div>
      <div>
        <img src="./assets/images/icon.svg" />
        <span> Bucket item action {{ i }}</span>
      </div>
      <div>
        <button class="delete-btn" @click="confirmDelete(item, i)">
          <img src="./assets/images/close-red.svg" /> Delete bucket item
        </button>
      </div>
      <div>
        <button class="edit-btn" @click="edit(item)">
          <img src="./assets/images/edit.svg" /> Edit bucket item
        </button>
      </div>
    </div>
  </Transition>
  <!-- Modal end -->
</template>
<script></script>
<style></style>
