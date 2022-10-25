<template>
  <div class="overlay" v-show="overlay" @click="resetModals"></div>
  <div class="main-container">
    <div class="header">
      <div
        @click="toggleAddForm"
        class="add-btn"
        :class="{ 'add-btn-clicked': this.addForm }"
      >
        <img src="./assets/images/add.svg" />
      </div>
    </div>
    <h1>Bucket List</h1>

    <!-- Add form start -->
    <Transition name="fly">
      <div class="add-form" v-show="this.addForm">
        <form>
          <div class="inputs">
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
              class="add-form-btn"
              @click.prevent="addItem"
              :disabled="!description || !do_before"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </Transition>
    <!-- Add form end -->

    <div class="loading" v-if="!items.length"></div>

    <!-- Items list start -->
    <div class="list-container">
      <div class="list-head">
        <div>Done</div>
        <div class="done-before-head">Do before age</div>
      </div>
      <div class="items-list" v-for="(item, i) in items" :key="item.uuid">
        <!-- Item start -->
        <div class="item-row">
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
          <div class="done-before-input" v-if="isEditing(item)">
            <input v-model="editedDobefore" type="number" min="1" max="140" />
          </div>
          <div class="done-before" v-else>{{ item.do_before }}</div>
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
              <div class="modal-list" v-show="modals[i]">
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
                    <img src="./assets/images/close-red.svg" /> Delete bucket
                    item
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

    <hr />
    <!-- Footer start-->
    <div class="footer">
      <button class="done-btn" @click="resetModals">Done</button>
    </div>
    <!-- Footer end-->
  </div>
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
      overlay: false,
      modals: [],
      addForm: false,
      apiUrl: process.env.VUE_APP_API_URL,
      apiKey: process.env.VUE_APP_API_KEY,
    };
  },
  async mounted() {
    const response = await axios.get(
      this.apiUrl + "/api/item?offset=0&limit=20",
      {
        headers: {
          "API-key": this.apiKey,
        },
      }
    );
    this.items = response.data.data;
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
    async addItem() {
      try {
        const response = await axios.post(
          this.apiUrl + "/api/item",
          {
            description: this.description,
            do_before: this.do_before,
          },
          {
            headers: {
              "API-key": this.apiKey,
            },
            "content-type": "text/json",
          }
        );
        this.items = [...this.items, response.data];
        this.description = "";
        this.do_before = "";
        this.hideAddForm();
      } catch (e) {
        alert("An error has occured, please try again.");
      }
    },
    async removeItem(item, i) {
      try {
        await axios.delete(this.apiUrl + "/api/item/" + item.uuid, {
          headers: {
            "API-key": this.apiKey,
          },
        });
        this.items.splice(i, 1);
      } catch (e) {
        alert("An error has occured, please try again.");
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
        const response = await axios.put(
          this.apiUrl + "/api/item/" + item.uuid,
          {
            description: this.editedDescription,
            do_before: this.editedDobefore,
          },
          {
            headers: {
              "API-key": this.apiKey,
            },
            "content-type": "text/json",
          }
        );
        this.items[i] = response.data;
        this.noSelection();
        this.resetEditFields();
        this.overlay = false;
      } catch (e) {
        alert("An error has occured, please try again.");
      }
    },
    async isDone(item, i) {
      try {
        const response = await axios.put(
          this.apiUrl + "/api/item/" + item.uuid,
          {
            done: !item.done,
          },
          {
            headers: {
              "API-key": this.apiKey,
            },
            "content-type": "text/json",
          }
        );
        this.items[i] = response.data;
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
      return item.uuid === this.selectedItem.uuid;
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
      return item.done;
    },
    toggleAddForm() {
      this.addForm = !this.addForm;
      if (!this.addForm) {
        this.description = "";
        this.do_before = "";
      }
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
body {
  background-color: #f5f5f5;
  padding-bottom: 140px;
}
#app {
  display: flex;
  justify-content: center;
}
@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fly-enter-active,
.fly-leave-active {
  transition: all 0.3s ease;
}
.fly-enter-from,
.fly-leave-to {
  transform: translateY(-100px);
  opacity: 0;
}
.loading {
  width: 6rem;
  height: 6rem;
  margin: 0 auto;
  margin-top: 10rem;
  margin-bottom: 10rem;
  border-radius: 50%;
  border: 3px solid #ccc;
  border-top-color: var(--clr-primary-5);
  animation: spinner 0.6s linear infinite;
}
.main-container {
  font-family: "Open Sans", sans-serif;
  font-style: normal;
  margin: auto;
  margin: 3rem;
  width: 70%;
  min-width: 400px;
  background-color: #fff;
  box-shadow: 1px 1px 0px rgba(0, 40, 68, 0.09),
    0px 13.59px 47.8684px -26.89px rgba(2, 57, 95, 0.2),
    0px 24.13px 50.97px -29.28px rgba(2, 57, 95, 0.23);
  border-radius: 16.8947px;
  padding: 30px 30px 40px 30px;
}
.list-container {
  padding-left: 20px;
  padding-right: 20px;
}
h1 {
  padding-left: 20px;
  font-size: 2rem;
  font-weight: 700;
}
h2 {
  margin-top: 0px;
  margin-bottom: 10px;
  font-weight: 700;
}
hr {
  border: 0;
  border-top: 1px solid #b5c5d0;
  width: 95%;
  margin: 40px auto;
}
.loader {
  font-size: 3rem;
  display: flex;
  justify-content: center;
  padding: 3rem;
}
.overlay {
  position: absolute;
  width: 100%;
  height: 100%;
}
input {
  padding-left: 0.5rem;
  font-size: 1rem;
}
.inputs {
  font-size: 1rem;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  width: 80%;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  gap: 20px;
  justify-content: space-between;
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
.list-head {
  display: flex;
  margin-top: 40px;
  margin-bottom: 20px;
}
.items-list {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
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
.done-before-head {
  margin-left: auto;
  margin-right: 60px;
}
.done-before {
  font-family: "Roboto Mono", sans-serif;
  font-size: 1rem;
  font-weight: 500;
  margin-left: auto;
  margin-right: 10px;
}
.description input {
  border-radius: 4px;
  border: 1px solid #67889f;
}
.done-before-input {
  width: 50px;
  margin-left: auto;
  margin-right: 10px;
}
.done-before-input input {
  font-family: "Roboto Mono", sans-serif;
  font-size: 1rem;
  font-weight: 500;
  width: 50px;
  border-radius: 4px;
  border: 1px solid #67889f;
}
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
.modal-list {
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
.header {
  display: flex;
  justify-content: flex-end;
}
.add-form {
  padding-left: 20px;
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
.add-btn {
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
.reveal-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  padding-bottom: 4px;
}
.reveal-btn:hover {
  background: #d6e0e8;
}
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
.footer {
  width: 100%;
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
  margin-right: 10px;
}
.done-btn:hover {
  background-color: #67889f;
}
.icon {
  cursor: pointer;
}
@media only screen and (max-width: 700px) {
  .modal-list {
    width: 86%;
    right: 0px;
    left: 0px;
    position: fixed;
    bottom: 0px;
    transform: translateY(0px);
    opacity: 1;
    padding-left: 40px;
    padding-right: 40px;
    border-radius: 16px 16px 0px 0px;
  }
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
    justify-content: center;
  }
}
</style>
