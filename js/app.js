const addPointsOnServer = async (coords) => {
  const resp = await fetch(
    "https://6309e658f8a20183f7786ebd.mockapi.io/coords",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(coords),
    }
  );
  const data = await resp.json();
  console.log(data);
};

(async function () {
  const getPointsFromServer = async () => {
    const resp = await fetch(
      "https://6309e658f8a20183f7786ebd.mockapi.io/coords"
    );
    const data = await resp.json();
    return data;
  };
  const points = await getPointsFromServer();
  const mapBoxURL =
    "https://api.mapbox.com/styles/v1/aizat2002/cl7a981u7000q15nsctauz5z2/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWl6YXQyMDAyIiwiYSI6ImNsN2E5MGY1aTBxem4zeG8zZTg5YTJzejcifQ.TpNAQt8_gUNgDsWJMxK0yg&zoomwheel=true&fresh=true#13.67/40.93339/73.01505";
  const form = document.forms["form"];
  const inputName = document.getElementById("userName");
  const inputPhone = document.getElementById("userPhone");
  const inputEmail = document.getElementById("userEmail");
  const inputFile = document.getElementById("file");
  const textArea = document.querySelector("#desc");
  const aside = document.querySelector(".object");
  const closeAside = document.querySelector(".object__close");

  // [56.631600, 47.886178]
  const map = L.map("map", {
    center: [40.93469, 72.98827],
    zoom: 14,
  });
  let small = smallMap();
  L.control.locate().addTo(small);

  L.tileLayer(mapBoxURL, {
    maxZoom: 19,
    attribution:
      '<a href="https://apps.mapbox.com/feedback/">Mapbox</a> <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  L.marker([40.93469, 72.98827]).addTo(map);

  function update(props) {
    document.querySelector(".js-object-title").textContent = props.title; //Добавляем заголовок объекта
    document.querySelector(".js-object-descr").textContent = props.desc; //Добавляем заголовок объекта
    document.querySelector(".js-object-img").setAttribute("src", props.image); //Добавляем изображение объекта
    document.querySelector(".js-object-img").setAttribute("alt", props.title); //Добавляем атрибут alt изображения объекта
    document.querySelector(".js-object-user-name").textContent = props.userName; //Указываем имя пользователья
    document.querySelector(".js-object-user-email").textContent = props.email; //Указываем почту пользователья
    document.querySelector(".js-object-user-phone").textContent = props.phone; //Указываем телефон пользователья
  }

  const divIcon = (cluster = "", isChecked = false) =>
    L.divIcon({
      html: `<div class="${isChecked ? "green" : "icon"}">${cluster}</div>`,
    });

  const layerCreate = (points) => {
    const layer = L.geoJSON(points, {
      onEachFeature: function onEachFeature(feature, layer) {
        layer.addEventListener("click", (e) => {
          const layer = e.target;
          update(layer.feature.properties);
          aside.classList.add("is-open");
        });
      },
      pointToLayer: function (feature, latlng) {
        return L.marker(feature.geometry.coordinates, {
          icon: divIcon("", feature.isChecked),
        }); //Задаем положение маркера
      },
    });
    return layer;
  };

  const layer = layerCreate(points);

  const markers = L.markerClusterGroup({
    showCoverageOnHover: true, //Отключаем показ границы маркеров при наведении на кластер
    iconCreateFunction: function (cluster) {
      for (let i = 0; i < points.length; i++) {
        //Создаем значок кластера
        return divIcon(cluster.getChildCount(), points[i].isChecked);
      }
    },
  });

  markers.addLayer(layer); //Добавляем слой маркеров
  markers.addTo(map);

  function smallMap(position = [40.93469, 72.98827]) {
    const smallMap = L.map("small-map").setView(position, 13);
    L.tileLayer(mapBoxURL, {
      maxZoom: 19,
      attribution:
        '<a href="https://apps.mapbox.com/feedback/">Mapbox</a> <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(smallMap);
    return smallMap;
  }

  const smallMapEl = document.querySelector(".small-map_wrapper");
  const myPositionBtn = document.getElementById("myPos");
  const openMapBtn = document.querySelector(".pointBtn");
  const myPosControl = document.querySelector(".leaflet-control-locate");

  openMapBtn.addEventListener("click", function (e) {
    this.disabled = true;
    smallMapEl.classList.add("activeSmallMap");
    document.getElementById("close").addEventListener("click", () => {
      smallMapEl.classList.remove("activeSmallMap");
      this.disabled = false;
    });
  });

  let a;
  let b;
  small.addEventListener("click", (e) => {
    smallMapEl.classList.remove("activeSmallMap");
    openMapBtn.disabled = false;
    a = e.latlng.lat;
    b = e.latlng.lng;
  });

  function success({ coords }) {
    const { latitude, longitude } = coords;
    const currentPosition = [latitude, longitude];
    console.log(currentPosition);
    // вызываем функцию, передавая ей текущую позицию и сообщение
    smallMap(currentPosition);
    const marker = new L.marker(currentPosition);
    marker.addTo(small);
  }

  function error({ message }) {
    console.log(message);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newCoords = {
      _id: Date.now(),
      type: "Feature",
      isChecked: false,
      properties: {
        userName: inputName.value,
        phone: inputPhone.value,
        email: inputEmail.value,
        desc: textArea.value,
        image: "",
      },
      geometry: {
        type: "Point",
        coordinates: [a, b],
      },
    };

    addPointsOnServer(newCoords);
    const layer = layerCreate(newCoords);
    markers.addLayer(layer);
    markers.addTo(map);
  });

  async function sync(data) {
    console.log(data);
    const formData = new FormData();
    formData.append("points", data);

    const res = await fetch("http://localhost:9000/points", {
      method: "POST",
      body: formData,
    });

    const log = await res.json();
    console.log(log);
  }

  document.querySelector(".tilek").addEventListener("click", () => {
    const file = inputFile.files[0];
    sync(file);
  });

  closeAside.addEventListener("click", (e) => {
    if (aside.classList.contains("is-open")) {
      aside.classList.remove("is-open");
    }
  });

  map.addEventListener("click", (e) => {
    if (aside.classList.contains("is-open")) {
      aside.classList.remove("is-open");
    }
  });
})();

