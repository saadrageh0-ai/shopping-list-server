const API = "https://shopping-list-server-rrkw.onrender.com/api/shopping-list";

let items = JSON.parse(localStorage.getItem("items")) || [];

function saveCopy() {
  localStorage.setItem("items", JSON.stringify(items));
}

let sections = ["Produce", "Dairy & Egg", "Meat", "Snacks", "Frozen", "Candy", "Home needs", "clothes", "Other"]

function saveItems() {
  saveCopy();
  fetch(API, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items)
  });
}

let head = document.createElement("h1");
head.className = "head";
head.textContent = "Items List";
document.body.append(head);

let listSection = document.createElement("div");
listSection.className = "list-section";
document.body.append(listSection);

let list = document.createElement("ul");
list.className = "list";
listSection.append(list);

let counter = document.createElement("p");
counter.className = "counter";
listSection.append(counter);

let itemsInput = document.createElement("input");
itemsInput.className = "items-input";
itemsInput.type = "text";
itemsInput.placeholder = "Add an item";
listSection.append(itemsInput);

itemsInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addItem();
  }
});

let addBtn = document.createElement("input");
addBtn.className = "add-btn";
addBtn.type = "button";
addBtn.value = "Add";
listSection.append(addBtn);

let shareBtn = document.createElement("input");
shareBtn.className = "share-btn";
shareBtn.type = "button";
shareBtn.value = "Share";
listSection.append(shareBtn);

let sectionSelect = document.createElement("select");
sectionSelect.className = "section-select";
listSection.append(sectionSelect);

for (let section of sections) {
  let option = document.createElement("option");
  option.textContent = section
  sectionSelect.append(option);
}

function renderItems() {
  list.innerHTML = "";
  for (let item of items) {
    item.qty = item.qty || 1;
    item.section = item.section || "Other";
  }

  items.sort(function (a, b) {
    return a.done - b.done;
  })

  for (let section of sections) {
    let sectionItems = items.filter(function (item) {
      return item.section === section
    });

    if (sectionItems.length === 0) continue;

    let title = document.createElement("li");
    title.className = "section-title";
    title.textContent = section;
    list.append(title);

    for (let item of sectionItems) {
      let li = document.createElement("li");
      li.className = "li";

      let nameSpan = document.createElement("span");
      nameSpan.className = "item-name";

      nameSpan.addEventListener("click", function () {
        let editInput = document.createElement("input");
        editInput.type = "text";
        editInput.value = item.task;

        nameSpan.replaceWith(editInput);
        editInput.focus();

        function saveEdit() {
          let newName = editInput.value.trim();
          if (newName === "") {
            renderItems();
            return;
          }

          item.task = newName;
          saveItems();
          renderItems();
        }

        editInput.addEventListener("keydown", function (event) {
          if (event.key === "Enter") {
            saveEdit();
          }
        });

        editInput.addEventListener("blur", saveEdit);
      })

      if (item.qty > 1) {
        nameSpan.textContent = `${item.qty} ${item.task}`;
      } else {
        nameSpan.textContent = item.task;
      }

      if (item.done) {
        li.classList.add("done")
      }

      let checkBtn = document.createElement("input");
      checkBtn.className = "check-btn";
      checkBtn.type = "checkbox";
      checkBtn.checked = item.done;

      let plusBtn = document.createElement("input");
      plusBtn.className = "plus-btn";
      plusBtn.type = "button";
      plusBtn.value = "+";

      plusBtn.addEventListener("click", function () {
        item.qty = item.qty + 1;
        saveItems();
        renderItems();
      });

      let minusBtn = document.createElement("input");
      minusBtn.className = "minus-btn";
      minusBtn.type = "button";
      minusBtn.value = "-";

      minusBtn.addEventListener("click", function () {
        if (item.qty <= 1) return;
        item.qty = item.qty - 1;
        saveItems();
        renderItems();
      });

      checkBtn.addEventListener("click", function () {
        item.done = !item.done;
        saveItems();
        renderItems();
      });

      let deleteBtn = document.createElement("input");
      deleteBtn.className = "delete-btn";
      deleteBtn.type = "button";
      deleteBtn.value = "Delete";

      deleteBtn.addEventListener("click", function () {
        let index = items.indexOf(item);

        items.splice(index, 1);

        saveItems();
        renderItems();
      });

      list.append(li);
      li.append(nameSpan);
      li.append(checkBtn);
      li.append(plusBtn);
      li.append(minusBtn);
      li.append(deleteBtn);
    }
  }

  let total = items.length;

  let inCart = items.filter(function (item) {
    return item.done
  }).length;

  counter.textContent = `${inCart} of ${total} in cart`;
  counter.hidden = inCart === 0;

  if (total === 0) {
    counter.textContent = ""
  }
}

renderItems();

fetch(API)
  .then(res => res.json())
  .then(function (data) {
    items = data;
    saveCopy();
    renderItems();
  })

function addItem() {
  let text = itemsInput.value.trim();
  if (text === "") return;
  let newItem = { task: text, done: false, qty: 1, section: sectionSelect.value };

  fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newItem)
  })
    .then(function (res) {
      if (!res.ok) {
        alert("error: Item already exist");
        return;
      }
      items.push(newItem);
      saveCopy();
      renderItems();
    });

  itemsInput.value = "";
}

addBtn.addEventListener("click", addItem);


let resetBtn = document.createElement("input");
resetBtn.type = "button";
resetBtn.className = "reset-btn"
resetBtn.value = "Reset";
listSection.append(resetBtn);

resetBtn.addEventListener("click", function () {
  items = [];
  saveItems();
  renderItems();
});

let clearBtn = document.createElement("input");
clearBtn.className = "clear-btn";
clearBtn.type = "button";
clearBtn.value = "Clear checked";
listSection.append(clearBtn);

clearBtn.addEventListener("click", function () {
  items = items.filter(function (item) {
    return !item.done;
  });
  saveItems();
  renderItems();
});

shareBtn.addEventListener("click", function () {
  let itemString = JSON.stringify(items);
  let encoded = encodeURIComponent(itemString);
  let shareUrl = window.location.origin + window.location.pathname + "?data=" + encoded;
  navigator.clipboard.writeText(shareUrl).then(function () {
    alert("Link copied! You can now paste it anywhere.");
  });
});

let params = new URLSearchParams(window.location.search);
let dataParam = params.get("data");

if (dataParam) {
  let decoded = decodeURIComponent(dataParam);
  let restoredItems = JSON.parse(decoded);

  for (let shared of restoredItems) {
    let alreadyHave = items.some(function (item) {
      return item.task === shared.task;
    });

    if (!alreadyHave) {
      items.push(shared);
    }
  }

  saveItems();
  renderItems();
  history.replaceState(null, "", window.location.pathname);
}
