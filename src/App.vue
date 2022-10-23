<template>
  <div class="overlay" v-show="overlay" @click="resetModals"></div>
  <div class="main-container">
    <div class="header">
      <div @click="showAddForm" class="add-btn" :class="{ 'add-btn-clicked': this.addForm }">
        <img src="./assets/images/add.svg" />
      </div>
    </div>
    <h1>Bucket List</h1>
    <div class="add-form" v-show="this.addForm">
      <div class="inputs">
        <input v-model="description" type="text" placeholder="Goal..." />
        <input v-model="do_before" type="text" placeholder="Do before..." />
        <button class="add-form-btn">
          <a @click="addItem" :disabled="!description || !do_before">Add</a>
        </button>
      </div>
    </div>
    <div class="loader" v-if="!items.length">Loading...</div>
    <div class="list-container">
      <div class="list-head">
        <div>Done</div>
        <div class="done-before-head">Do before age</div>
      </div>
      <div class="items-list" v-for="(item, i) in items" :key="item.uuid">
        <div class="item-row">
          <label class="styled-checkbox" :class="{ 'styled-checkbox-checked': itemDone(item) }"
            @click="isDone(item, i)">
            <div class="checked-sign" v-if="itemDone(item)">
              <img src="./assets/images/check-mark.svg" />
            </div>
          </label>
          <div class="description-input" v-if="isSelected(item)">
            <input v-model="editedDescription" />
          </div>
          <div v-else>{{ item.description }}</div>
          <div class="done-before-input" v-if="isSelected(item)">
            <input v-model="editedDobefore" />
          </div>
          <div class="done-before" v-else>{{ item.do_before }}</div>
          <div v-if="isSelected(item)">
            <div class="update-btn" @click="updateItem(item, i)">Update</div>
            <div class="cancel-btn" @click="resetSelected">Cancel</div>
          </div>
          <button v-else :class="{ 'reveal-btn': !isSelected(item) }" @click="modalList[i] ? resetModals() : showModal(i)">
            <div class="modal-list" v-show="modalList[i]">
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
                <button class="delete-btn" @click="
                  isSelected(item) ? updateItem(item, i) : removeItem(item, i)
                ">
                  <img src="./assets/images/close-red.svg" /> Delete bucket item
                </button>
              </div>
              <div>
                <button class="edit-btn" @click="
                  Object.keys(selected).length > 0 ? unselect() : select(item)
                ">
                  <img src="./assets/images/edit.svg" /> Edit bucket item
                </button>
              </div>
            </div>
            <div><img src="./assets/images/three-dots.svg" /></div>
          </button>
        </div>
      </div>
    </div>
    <hr />
    <div class="footer">
      <button class="done-btn" @click="resetModals">Done</button>
    </div>
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
      selected: {},
      modalShow:false,
      overlay: false,
      modalList: [],
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
    this.modalList = Array.from(this.items.length);
  },
  methods: {
    async addItem() {
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
      this.items.push(response.data);
      this.description = "";
      this.do_before = "";
      this.showAddForm();
    },
    async removeItem(item, i) {
      this.resetModals();
      await axios.delete(this.apiUrl + "/api/item/" + item.uuid, {
        headers: {
          "API-key": this.apiKey,
        },
      });
      this.items.splice(i, 1);
      this.overlay = false;
    },
    async updateItem(item, i) {
      this.resetModals();
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
      this.unselect();
      this.overlay = false;
    },
    async isDone(item, i) {
      this.resetModals();
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
      this.unselect();
    },
    select(item) {
      this.selected = item;
      this.editedDescription = item.description;
      this.editedDobefore = item.do_before;
    },
    isSelected(item) {
      return item.uuid === this.selected.uuid;
    },
    unselect() {
      this.resetModals();
      this.selected = {};
      this.editedDescription = "";
      this.editedDobefore = "";
    },
    showModal(i) {
      this.resetModals();
      this.modalList[i] = true;
      this.overlay = true;
      this.modalShow;
    },
    resetModals() {
      this.modalList = Array.from(this.items.length);
      this.overlay = false;
      this.modalShow = false;
    },
    resetSelected(){this.selected={}},
    itemDone(item) {
      return item.done;
    },
    showAddForm() {
      this.addForm = !this.addForm;
      if (!this.addForm) {
        this.description = "";
        this.do_before = "";
      }
    },
  },
};
</script>
<style>
body {
  background-color: #f5f5f5;
}

#app {
  display: flex;
  justify-content: center;
}

.main-container {
  font-family: sans-serif;
  margin: auto;
  margin: 3rem;
  width: 70%;
  min-width: 400px;
  background-color: #fff;
  box-shadow: 1px 1px 0px rgba(0, 40, 68, 0.09),
    0px 13.59px 47.8684px -26.89px rgba(2, 57, 95, 0.2),
    0px 24.13px 50.97px -29.28px rgba(2, 57, 95, 0.23);
  border-radius: 16.8947px;
  padding: 30px 30px;
}

.list-container {
  padding-left: 20px;
  padding-right: 20px;
}

h1 {
  padding-left: 20px;
  font-size: 2rem;
}
h2{
  margin-top:0px;
  margin-bottom:10px;
}
hr {
  border: 1px solid #f5f5f5;
  margin-bottom: 20px;
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
  background: rgba(0, 0, 0, 0.2);
}

.inputs {
  border-radius: 8px;
  padding: 1rem 1.5rem;
  width: 60%;
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
  width: 100%;
  display: flex;
  flex-wrap: wrap;
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
  margin-left: auto;
  margin-right: 10px;
}

.done-before-input {
  width: 30px;
  margin-left: auto;
  margin-right: 10px;
}

.description input {
  border-radius: 4px;
  border: 1px solid #67889f;
}

.done-before-input input {
  width: 30px;
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
  z-index:100;
}

.styled-checkbox {
  height: 28px;
  width: 28px;
  border: 1px solid #67889f;
  border-radius: 4px;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
}

.styled-checkbox:hover {
  background-color: #67889f;
}

.styled-checkbox-checked {
  background-color: #002844;
}

.checked-sign {
  margin-left: 3px;
  margin-top: 2px;
  fill: #fff;
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
  background: #f5f5f5;
}

.add-form-btn:hover {
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

.update-btn, .cancel-btn{
  border: none;
  border:1px solid #67889f;
  border-radius: 4px;
  background: transparent;
  display: flex;
  align-items: center;
  padding: 0.2rem .6rem;
  cursor: pointer;
  margin:6px 0px;
}

.update-btn:hover,.cancel-btn:hover  {
  background: #d6e0e8;
}

.delete-btn {
  font-size: 1rem;
  background: transparent;
  border: none;
  color: #ff0000;
  margin-top: 15px;
  cursor:pointer;
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
  cursor:pointer;
}

.edit-btn:hover {
  color: #333;
}

.footer {
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

.icon {
  cursor: pointer;
}

@media only screen and (max-width: 600px) {
  .modal-list {
    width: 86%;
    right: 0px;
    left: 0px;
    position: fixed;
    bottom:0px;
    transform: translateY(0px);
    opacity :1;
    padding-left: 40px;
    padding-right: 40px;
    border-radius: 16px 16px 0px 0px;
    transition: all 0.6s ease-in-out;
  }
  .modal-show{
    transform: translateY(120px);
    opacity :1;
  }

  .modal-close {
    display: block;
    font-size: 2rem;
    color: #99a9b4;
    z-index:100;
    cursor:pointer;
  }

  .footer {
    justify-content: center;
  }
}
</style>
