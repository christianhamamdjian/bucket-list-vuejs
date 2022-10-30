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

    <h1>Bucket List</h1>

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

    <div class="loading" v-if="loading"></div>

    <!-- Items list start -->
    <div class="list-head">
      <div>Done</div>
      <div class="do-before-head">Do before age</div>
    </div>
    <h3 v-if="!items.length">Your bucket is empty.</h3>
    <div class="items-list">
      <!-- Item start -->
      <div class="item-row" v-for="(item, i) in items" :key="item.id">
        <label
          class="styled-checkbox"
          :class="{ 'styled-checkbox-checked': itemDone(item) }"
          @click="isDone(item, i)"
        >
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
          <div class="update-btn" @click="updateItem(item, i)">Update</div>
          <div class="cancel-btn" @click="noSelection">Cancel</div>
        </div>
        <button
          v-else
          :class="{ 'reveal-btn': !isEditing(item) }"
          @click="modals[i] ? resetModals() : showModal(i)"
        >
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

          <div><img src="./assets/images/three-dots.svg" /></div>
        </button>
      </div>
    </div>
    <!-- Item end -->
  </div>
  <!-- Items list end-->

  <!-- Footer start-->
  <div class="cover">
    <div class="footer">
      <hr />
      <div class="done-btn-container">
        <button class="done-btn" @click="doneButton">Done</button>
      </div>
    </div>
  </div>
  <!-- Footer end-->
</template>
<script>
import axios from "axios";
export default {
  name: "App",
  data() {
    return {
      items: [],
      description: "",
      do_before: "",
      editedDescription: "",
      editedDobefore: "",
      selectedItem: {},
      loading: false,
      overlay: false,
      modals: [],
      addForm: false,
    };
  },
  mounted() {
    this.getItems();
  },
  watch: {
    description: function (newValue) {
      this.description = this.capitalizeFirstLetter(newValue);
    },
    editedDescription: function (newValue) {
      this.editedDescription = this.capitalizeFirstLetter(newValue);
    },
  },
  methods: {
    async getItems() {
      this.loading = true;
      const { data } = await axios.get("/api/getItems");
      this.noSelection;
      this.loading = false;
      this.items = [...data];
    },
    async addItem() {
      try {
        const { data } = await axios.post("/api/createItem", {
          description: this.description,
          do_before: this.do_before,
          done: "false",
        });
        this.description = "";
        this.do_before = "";
        this.hideAddForm();
        const id = data[0].id;
        const { description, do_before, done } = data[0].fields;
        this.items = [...this.items, { id, description, do_before, done }];
        alert("The item has been added.");
      } catch (e) {
        alert("An error has occured, please try again.");
      }
    },
    async removeItem(item, i) {
      try {
        const { data } = await axios.delete(`/api/deleteItem?id=${item.id}`);
        if (data == null) {
          console.log(null);
        }
        this.items.splice(i, 1);
        this.items = [...this.items];
        alert("The item has been deleted.");
      } catch (e) {
        console.log(e);
      }
    },
    confirmDelete(item, i) {
      this.overlay = false;
      let confirmed = confirm(
        "Are you sure you want to delete " + item.description + "?"
      );
      if (confirmed) {
        this.removeItem(item, i);
      } else {
        this.selectedItem = {};
      }
    },
    async updateItem(item, i) {
      try {
        const { data } = await axios.put(`/api/updateItem?id=${item.id}`, {
          id: item.id,
          fields: {
            description: this.editedDescription,
            do_before: this.editedDobefore,
            done: item.done,
          },
        });
        const id = data[0].id;
        const { description, do_before, done } = data[0].fields;
        this.items[i] = { id, description, do_before, done };
        this.resetEditFields();
        this.noSelection();
        alert("The item has been updated.");
      } catch (e) {
        alert("An error has occured, please try again.");
      }
    },
    async isDone(item, i) {
      try {
        const { data } = await axios.put(`/api/updateItem?id=${item.id}`, {
          id: item.id,
          fields: {
            description: item.description,
            do_before: item.do_before,
            done: item.done === "true" ? "false" : "true",
          },
        });
        const id = data[0].id;
        this.items[i] = { id, ...data[0].fields };
      } catch (e) {
        alert("An error has occured, please try again.");
      }
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    edit(item) {
      this.selectedItem = item;
      this.editedDescription = item.description;
      this.editedDobefore = item.do_before;
    },
    isEditing(item) {
      return item.id === this.selectedItem.id;
    },
    noSelection() {
      this.selectedItem = {};
    },
    resetEditFields() {
      this.editedDescription = "";
      this.editedDobefore = "";
    },
    showModal(i) {
      this.modals[i] = true;
      this.showOverlay();
    },
    resetModals() {
      this.modals = Array.from(this.items.length);
      this.hideOverlay();
    },
    showOverlay() {
      this.overlay = true;
    },
    hideOverlay() {
      this.overlay = false;
    },
    itemDone(item) {
      return item.done === "true" ? true : false;
    },
    toggleAddForm() {
      this.addForm = !this.addForm;
      if (!this.addForm) {
        this.description = "";
        this.do_before = "";
      }
    },
    doneButton() {
      this.hideAddForm();
      this.noSelection();
    },
    hideAddForm() {
      this.addForm = false;
      this.description = "";
      this.do_before = "";
    },
  },
};
</script>
<style>
@import url("https://fonts.googleapis.com/css?family=Open+Sans:600,700");
@import url("https://fonts.googleapis.com/css?family=Roboto+Mono:500");
* {
  box-sizing: border-box;
  margin: 0px;
  padding: 0px;
}
body {
  background-color: #f5f5f5;
  padding-top: 40px;
  height: 100vh;
  overflow: hidden;
}
#app {
  position: fixed;
  width: 100%;
  padding-bottom: 120px;
}

/* App loader */

@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}
.loading {
  width: 6rem;
  height: 6rem;
  margin: 0 auto;
  margin-top: 5rem;
  margin-bottom: 5rem;
  border-radius: 50%;
  border: 3px solid #ccc;
  border-top-color: #063251;
  animation: spinner 0.6s linear infinite;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
}
h2 {
  margin-top: 0px;
  margin-bottom: 10px;
  font-weight: 700;
}

.header {
  display: flex;
  justify-content: flex-end;
}
.main-container {
  font-family: "Open Sans", sans-serif;
  font-style: normal;
  height: 60vh;
  width: 80%;
  max-width: 700px;
  margin: 0px auto;
  background-color: #fff;
  box-shadow: 1px 1px 0px rgba(0, 40, 68, 0.09),
    0px 13.59px 47.8684px -26.89px rgba(2, 57, 95, 0.2),
    0px 24.13px 50.97px -29.28px rgba(2, 57, 95, 0.23);
  border-radius: 18px 18px 0px 0px;
  padding: 30px 60px 40px 60px;
}

/* Overlay */

.overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: transparent;
}

/* Add item form toggler */

.add-btn {
  margin-right: -30px;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
}
.add-btn:hover {
  transform: rotate(45deg);
}
.add-btn-clicked {
  transform: rotate(45deg);
}

/* Add item form animation */

.fly-enter-active,
.fly-leave-active {
  transition: all 0.1s;
}
.fly-enter-from,
.fly-leave-to {
  transform: translateY(-100px);
  opacity: 0;
}

/* Add item form */

input {
  padding-left: 0.5rem;
  font-size: 1rem;
}
.add-form-fields {
  font-size: 1rem;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  width: 80%;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  gap: 20px;
  justify-content: space-between;
  margin-top: 20px;
  margin-bottom: 20px;
  box-shadow: 1px 1px 0px rgba(0, 40, 68, 0.09),
    0px 13.59px 47.8684px -26.89px rgba(2, 57, 95, 0.2),
    0px 24.13px 50.97px -29.28px rgba(2, 57, 95, 0.23);
}
.form-do-before {
  width: 100px;
}
.form-goal {
  width: 200px;
}

/* Add item form submit */

.add-form {
  padding-left: 20px;
}
.add-form-btn-disabled {
  border: none;
  border: 1px solid #67889f;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  background: #ffffff;
}
.add-form-btn {
  border: none;
  border: 1px solid #67889f;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  background: #ffffff;
}
.add-form-btn:hover {
  background: #f5f5f5;
}
.add-form-btn:active {
  background: #67889f;
}

/* Items list */

.list-head {
  display: flex;
  margin-top: 40px;
  margin-bottom: 20px;
}
.items-list {
  height: 80%;
  overflow: scroll;
}
.item-row {
  font-size: 1rem;
  font-weight: 600;
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  gap: 20px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.do-before-head {
  margin-left: auto;
  margin-right: 60px;
}
.do-before-list {
  font-family: "Roboto Mono", sans-serif;
  font-size: 1rem;
  font-weight: 500;
  margin-left: auto;
  margin-right: 10px;
}

/* Options modal reveal button */

.reveal-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 4px;
}
.reveal-btn:hover {
  background: #d6e0e8;
}

/* Modal animation */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Options modal */

.modal-head {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.modal-close {
  display: none;
}
.modal-close:hover {
  color: #000;
}
.options-modal {
  position: absolute;
  text-align: left;
  right: 60px;
  background: #ffffff;
  box-shadow: 1px 1px 0px rgba(0, 40, 68, 0.09),
    -32.3816px -1.40789px 47.8684px -16.8947px rgba(2, 57, 95, 0.28),
    -64.7632px 59.1316px 30.9737px -49.2763px rgba(2, 57, 95, 0.23);
  border-radius: 16px;
  padding: 20px;
  z-index: 100;
}

/* Modal buttons */

.delete-btn {
  font-size: 1rem;
  background: transparent;
  border: none;
  color: #ff0000;
  margin-top: 15px;
  cursor: pointer;
}
.delete-btn:hover {
  color: #333;
}
.edit-btn {
  font-size: 1rem;
  background: transparent;
  border: none;
  color: #67889f;
  margin-top: 15px;
  cursor: pointer;
}
.edit-btn:hover {
  color: #333;
}

/* Editing buttons */

.update-cancel-btns {
  display: flex;
  flex-direction: row;
  gap: 10px;
}
.update-btn,
.cancel-btn {
  border: none;
  border: 1px solid #67889f;
  border-radius: 4px;
  background: transparent;
  display: flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  cursor: pointer;
  margin: 2px 0px;
}
.update-btn:hover,
.cancel-btn:hover {
  background: #f5f5f5;
}
.update-btn:active,
.cancel-btn:active {
  background: #d6e0e8;
}

/* Item editing fields */

.description input {
  border-radius: 4px;
  border: 1px solid #67889f;
}
.do-before-field {
  width: 50px;
  margin-left: auto;
  margin-right: 10px;
}
.do-before-field input {
  font-family: "Roboto Mono", sans-serif;
  font-size: 1rem;
  font-weight: 500;
  width: 50px;
  border-radius: 4px;
  border: 1px solid #67889f;
}

/* Done checkbox */

.styled-checkbox {
  height: 28px;
  width: 28px;
  min-width: 28px;
  border: 1px solid #67889f;
  border-radius: 4px;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url(./assets/images/check-mark.svg) no-repeat top 8px left 6px;
}
.styled-checkbox:hover {
  background: url(./assets/images/check-mark-dark.svg) no-repeat top 8px left
    6px;

  background-color: #f5f5f5;
}
.styled-checkbox:active {
  background-color: #67889f;
}
.styled-checkbox-checked {
  background-color: #002844;
}
.checked-sign {
  margin-left: 3px;
  margin-top: 2px;
  width: 18px;
}

/* Footer */

.footer {
  width: 80%;
  max-width: 700px;
  height: 100px;
  margin: 0px auto;
  background-color: #ffffff;
  box-shadow: 1px 1px 0px rgba(0, 40, 68, 0.09),
    0px 13.59px 47.8684px -26.89px rgba(2, 57, 95, 0.2),
    0px 24.13px 50.97px -29.28px rgba(2, 57, 95, 0.23);
  border-radius: 0px 0px 18px 18px;
  padding: 0px 60px 40px 60px;
  position: relative;
}
.cover {
  height: 600px;
  background-color: #f5f5f5;
  position: relative;
}
hr {
  border: 0;
  border-top: 1px solid #b5c5d0;
  width: 100%;
}
.done-btn-container {
  padding-top: 20px;
  padding-bottom: 40px;
  display: flex;
  justify-content: flex-end;
}
.done-btn {
  width: 128px;
  height: 47px;
  color: #fff;
  padding: 0.5rem 1.5rem;
  background: #002844;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: regular;
}
.done-btn:hover {
  background-color: #67889f;
}

@media only screen and (max-width: 700px) {
  .add-btn {
    margin-right: 0px;
  }
  .main-container {
    padding: 30px 20px 40px 30px;
  }

  .options-modal {
    width: 100%;
    right: 0px;
    left: 0px;
    position: fixed;
    bottom: 0px;
    transform: translateY(0px);
    opacity: 1;
    padding-left: 80px;
    padding-right: 40px;
    border-radius: 16px 16px 0px 0px;
  }
  .do-before-head {
    margin-left: auto;
    margin-right: 72px;
  }
  /* Modal animation */

  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    transform: translateY(100px);
    opacity: 0;
  }

  .done-btn {
    margin-right: 0px;
  }
  .update-cancel-btns {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .item-row {
    width: 95%;
    gap: 15px;
  }
  .modal-close {
    display: block;
    font-size: 2rem;
    color: #99a9b4;
    z-index: 100;
    cursor: pointer;
  }
  .footer {
    padding: 0px 30px 40px 30px;
    position: relative;
  }
  .done-btn-container {
    justify-content: center;
  }
}
</style>
