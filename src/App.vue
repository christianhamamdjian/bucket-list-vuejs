<template>
  <div>
    <h1>Bucket List</h1>
    <hr />
    <div>
      <div>
        <input v-model="description" type="text" placeholder="Goal..." />
        <input v-model="do_before" type="text" placeholder="Do before..." />
      </div>
      <button>
        <a @click="addItem" :disabled="!description || !do_before">Add</a>
      </button>
    </div>
    <div v-for="(item, i) in items" :key="item.uuid">
      <div class="item-row">
        <label
          class="styled-checkbox"
          :class="{ 'styled-checkbox-checked': itemDone(item) }"
          @click="isDone(item, i)"
        ></label>
        <input v-if="isSelected(item)" v-model="editedDescription" />
        <div v-else>{{ item.description }}</div>
        <input v-if="isSelected(item)" v-model="editedDobefore" />
        <div v-else>{{ item.do_before }}</div>
        <button @click="modalList[i] ? resetModals() : showModal(i)">
          ...
        </button>
        <div v-show="modalList[i]">
          <button
            @click="
              Object.keys(selected).length > 0 ? unselect() : select(item)
            "
          >
            {{ isSelected(item) ? "Cancel" : "Edit" }}
          </button>
          <button
            @click="
              isSelected(item) ? updateItem(item, i) : removeItem(item, i)
            "
          >
            {{ isSelected(item) ? "Update" : "Delete" }}
          </button>
        </div>
      </div>
    </div>
    <hr />
    <button @click="resetModals">Done</button>
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
      modalList: [],
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
    },
    async removeItem(item, i) {
      this.resetModals();
      await axios.delete(this.apiUrl + "/api/item/" + item.uuid, {
        headers: {
          "API-key": this.apiKey,
        },
      });
      this.items.splice(i, 1);
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
    },
    resetModals() {
      this.modalList = Array.from(this.items.length);
    },
    itemDone(item) {
      return item.done;
    },
  },
};
</script>

<style>
#app {
  margin: auto;
  margin: 3rem;
  max-width: 700px;
}
.item-row {
  width: 100%;
  display: flex;
  gap: 20px;
  justify-items: space-between;
}
.styled-checkbox {
  height: 20px;
  width: 20px;
  border: 1px solid #000;
  border-radius: 4px;
}
.styled-checkbox-checked {
  background-color: #ccc;
}
.icon {
  cursor: pointer;
}
</style>
