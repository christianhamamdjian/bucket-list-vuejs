<template>
  <!-- Add form start -->
  <Transition name="fly">
    <div class="add-form" v-show="addForm">
      <form>
        <div class="add-form-fields">
          <input
            class="form-goal"
            v-model="description"
            type="text"
            placeholder="Goal..."
          />
          <input
            class="form-do-before"
            v-model="do_before"
            type="number"
            placeholder="Do before..."
            min="1"
            max="140"
          />
          <button
            type="submit"
            class="add-form-btn-disabled"
            :class="{ 'add-form-btn': this.description && this.do_before }"
            @click.prevent="addItem"
            :disabled="!this.description || !this.do_before"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  </Transition>
  <!-- Add form end -->
</template>
<script></script>
<style></style>
