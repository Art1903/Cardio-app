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

  _setDescription() {
    this.type === "running"
      ? (this.description = `Пробіжка ${new Intl.DateTimeFormat(
          "ukr-UA"
        ).format(this.date)}`)
      : (this.description = `Велотренування ${new Intl.DateTimeFormat(
          "ukr-UA"
        ).format(this.date)}`);
  }
}

class Running extends Workout {
  type = "running";

  constructor(coords, distance, duration, temp) {
    super(coords, distance, duration);
    this.temp = temp;
    this.calculatePace();
    this._setDescription();
  }

  calculatePace() {
    // min/km
    this.pace = this.duration / this.distance / 60;
  }
}

class Cycling extends Workout {
  type = "cycling";

  constructor(coords, distance, duration, climb) {
    super(coords, distance, duration);
    this.climb = climb;
    this.calculateSpeed();
    this._setDescription();
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
  #workouts = [];

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

  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputTemp.value =
      inputClimb.value =
        "";
    form.classList.add("hidden");
  }

  _togglgeClimbField() {
    inputClimb.closest(".form__row").classList.toggle("form__row--hidden");
    inputTemp.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    const areNunbers = (...numbers) =>
      numbers.every((num) => Number.isFinite(num));
    const areNunbersPositive = (...numbers) => numbers.every((num) => num > 0);

    e.preventDefault();

    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // Отримати дані з форми
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    // Якщо тренуванням є біг, створити Running
    if (type === "running") {
      const temp = +inputTemp.value;

      // Перевірка валідності даних
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(temp)

        !areNunbers(distance, duration, temp) ||
        !areNunbersPositive(distance, duration, temp)
      )
        return alert("Введіть позитивне число!");

      workout = new Running([lat, lng], distance, duration, temp);
    }
    // Якщо тренуванням є велотренування, створити обʼєкт Cycling
    if (type === "cycling") {
      // Перевірка валідності даних
      const climb = +inputClimb.value;
      if (
        // Перевірка валідності даних
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(climb)

        !areNunbers(distance, duration, climb) ||
        !areNunbersPositive(distance, duration, climb)
      )
        return alert("Введіть позитивне число!");

      workout = new Cycling([lat, lng], distance, duration, climb);
    }
    // Добавити новий обʼєкт в масив тренувань
    this.#workouts.push(workout);

    // Відобразити тренування на карті
    this._displayWorkout(workout);

    // Відобразити тренування в списку
    this._displayWorkoutOnSidebar(workout);
    // Сховати форму і очистити поля вводу даних
    this._hideForm();
  }

  _displayWorkout(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${ workout.type === "running" ? "🏃" : "🚵‍♂️"} ${workout.description}`)
      .openPopup();
  }

  _displayWorkoutOnSidebar(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === "running" ? "🏃" : "🚵‍♂️"
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">км</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">мин</span>
      </div>

    `;
    if (workout.type === "running") {
      html += `
        <div class="workout__details">
              <span class="workout__icon">📏⏱</span>
              <span class="workout__value">${workout.pace.toFixed(2)}</span>
              <span class="workout__unit">м/мин</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">👟⏱</span>
              <span class="workout__value">${workout.temp}</span>
              <span class="workout__unit">шаг/мин</span>
            </div>
        </li>
      `;
    }

    if (workout.type === "cycling") {
      html += `
      <div class="workout__details">
      <span class="workout__icon">📏⏱</span>
      <span class="workout__value">${workout.speed.toFixed(2)}</span>
      <span class="workout__unit">км/ч</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🏔</span>
      <span class="workout__value">${workout.climb}</span>
      <span class="workout__unit">м</span>
    </div>
  </li>
      `;
    }

    form.insertAdjacentHTML("afterend", html);
  }
}

const app = new App();
app._getPosition();
