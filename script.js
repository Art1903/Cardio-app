"use strict";

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputTemp = document.querySelector(".form__input--temp");
const inputClimb = document.querySelector(".form__input--climb");

class Workout {
  date = new Date();
  id = (Date.now() + "").slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; // km
    this.duration = duration; // min
  }
}

class Running extends Workout {
    constructor(coords, distance, duration, temp) {
        super(coords,distance,duration);
        this.temp = temp;
        this.calculatePace();
    }

    calculatePace() {
        // min/km
        this.pace = this.duration / this.distance / 60;
    }
}

class Cycling extends Workout {
    constructor(coords, distance, duration, climb) {
        super(coords,distance,duration);
        this.climb = climb;
        this.calculateSpeed();
    }
    calculateSpeed() {
        // km/h
        this.speed = this.distance / this.duration;
    }
}

// const running = new Running([50,39], 7, 40, 170);
// const cycling = new Cycling([50,39], 37, 80, 370);


class App {
  #map;
  #mapEvent;

  constructor() {
    this._getPosition();

    form.addEventListener("submit", this._newWorkout.bind(this));

    inputType.addEventListener("change", this._togglgeClimbField);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          console.log("Неможливо отримати Вашу геолокацію");
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude},14z`);

    const coords = [latitude, longitude];

    this.#map = L.map("map").setView(coords, 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Опрацювання кліків на карті
    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(e) {
    this.#mapEvent = e;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _togglgeClimbField() {
    inputClimb.closest(".form__row").classList.toggle("form__row--hidden");
    inputTemp.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    e.preventDefault();

    // Очищення поля вводу даних
    inputDistance.value =
      inputDistance.value =
      inputTemp.value =
      inputClimb.value =
        "";

    // Відображення маркера
    const { lat, lng } = this.#mapEvent.latlng;

    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: "running-popup",
        })
      )
      .setPopupContent("Тренування")
      .openPopup();
  }
}

const app = new App();
app._getPosition();
