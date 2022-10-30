<template>
<div class="loading" v-if="loading"></div>

    <!-- Items list start -->
    <div class="list-head">
      <div>Done</div>
      <div class="do-before-head">Do before age</div>
    </div>
    <h3 v-if="!items.length">Your bucket is empty.</h3>
    <div class="items-list" :class="{ 'items-list-adding': addForm }">
      <!-- Item start -->
      <div class="item-row" v-for="(item, i) in items" :key="item.id">
        <label
          class="styled-checkbox"
          :class="{ 'styled-checkbox-checked': itemDone(item) }"
          @click="isDone(item)"
          ><div class="loading" v-if="isDoneLoading"></div>
          <div class="checked-sign" v-if="itemDone(item)"></div>
        </label>
        <div class="description-input" v-if="isEditing(item)">
          <input v-model="editedDescription" type="text" />
        </div>
        <div v-else>{{ item.description }}</div>
        <div class="do-before-field" v-if="isEditing(item)">
          <input v-model="editedDobefore" type="number" min="1" max="140" />
        </div>
        <div class="do-before-list" v-else>{{ item.do_before }}</div>
        <div class="update-cancel-btns" v-if="isEditing(item)">
          <div class="update-btn" @click="updateItem(item)">Update</div>
          <div class="cancel-btn" @click="noSelection">Cancel</div>
        </div>
        <button
          v-else
          :class="{ 'reveal-btn': !isEditing(item) }"
          @click="modals[i] ? resetModals() : showModal(i)"
        >
          <!-- Modal start -->

          <!-- Modal end -->

          <div><img src="./assets/images/three-dots.svg" /></div>
        </button>
      </div>
    </div>
    <!-- Item end -->
  </div>
  <!-- Items list end-->
</template>
<script></script>
<style></style>

