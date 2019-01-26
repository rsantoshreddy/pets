"use strict";
(function(window) {
  // window.foo = data => {
  //   console.log(data);
  // };
  // const r = fetch(
  //   "http://api.petfinder.com/shelter.getPets?key=4c44162d3dd8bdb52553149813248c4f&format=json&id=CA2477&callback=foo",
  //   { credentials: "include", mode: "cors" }
  // ).then(function(response) {
  //   return response.json();
  // });
  // console.log(r);

  const update = (store, intent) => {
    let state = {};
    const { type, payload } = intent;
    switch (type) {
      case "ADD":
        const { pets = [] } = store;
        pets.push(intent.data);
        state = Object.assign({}, store, { pets });
        break;
    }
    return state;
  };

  const s = fetch("/shelter.json").then(response => {
    return response.json();
  });

  const createStore = reducer => {
    let internalStore = {};
    const handlers = [];
    return {
      getStore: () => internalStore,
      dispatch: intent => {
        internalStore = reducer(internalStore, intent);
        handlers.forEach(h => h());
      },
      subscribe: handler => handlers.push(handler)
    };
  };

  s.then(data => {
    render(data.petfinder.pets.pet);
    container.subscribe(render);
  });
  const container = createStore(update);

  function render(pets, availableStore) {
    const petsEls = pets
      .map(pet => {
        let newPet = {};
        if (!availableStore) {
          newPet = new Pet(pet);
          container.dispatch({ type: "ADD", data: newPet });
        } else {
          newPet = pet;
        }
        return `<li class="flex-item">
        <img
          src=${newPet.imageUrl}
          alt=""
        />
        <div class="name" data-details="${newPet.description}">
          <p>${newPet.name}</p>
        </div>
      </li>`;
      })
      .join("");
    document.getElementById("pets").innerHTML = petsEls;

    var classnames = document.getElementsByClassName("name");

    var showDetails = function() {
      var details = this.getAttribute("data-details");
      document.getElementById("details").innerHTML = details;
    };

    for (var i = 0; i < classnames.length; i++) {
      classnames[i].addEventListener("click", showDetails, false);
    }
  }

  document.getElementById("age").onchange = e => {
    updateWithNewData("age", e.target.value);
  };

  document.getElementById("gender").onchange = e => {
    updateWithNewData("sex", e.target.value);
  };

  document.getElementById("clear").addEventListener("click", () => {
    const { pets } = container.getStore();
    render(pets, true);
  });

  function updateWithNewData(key, value) {
    const { pets } = container.getStore();
    const newPets = pets.filter(pet => pet[key] === value);
    render(newPets, true);
  }

  ///Entitiy
  function Pet(data) {
    const { name, media, age, breeds, description, sex } = data;
    const { photo } = media.photos;
    const imageUrl = photo.filter(
      p => p["@size"] === "x" || p["@size"] === "x"
    )[0];

    this.name = name["$t"];
    this.imageUrl = imageUrl["$t"];
    this.sex = sex["$t"];
    this.age = age["$t"];
    this.breed = getBreed(breeds);
    this.description = description["$t"];
  }

  function getBreed(data) {
    const { breed } = data;
    if (breed instanceof Array) {
      return breed.map(breed => breed.$t).join(",");
    }
    if (breed instanceof Object) {
      return data.breed["$t"];
    }
  }
})(window);
