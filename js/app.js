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
  // [40.93469, 72.98827]
  const customIcon = L.icon({
    iconUrl: "img/icon-placemark-single.svg", //Ссылка на изображение маркера
    iconSize: [41, 56], //Рзамер маркера
    tooltipAnchor: [15, 25], //Положение подписи маркера
  });

  //Задаем опции маркера
  const markerOptions = {
    icon: customIcon, //Пресет настроек, созданный выше
  };

  const tooltipOptions = {
    permanent: true, //Постоянный показ подписи маркера
    className: "map__tooltip", //Класс
    opacity: 1, //Прозрачность
    direction: "right", //Положение
  };

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

  const layerCreate = (points) => {
    const layer = L.geoJSON(points, {
      onEachFeature: function onEachFeature(feature, layer) {
        // if (feature.properties && feature.properties.title) {
        //   layer.bindTooltip(feature.properties.title, tooltipOptions); //Добавляем подписи маркеров
        // }
        layer.on({
          //По клику обновляем данные в сайдбаре и открываем его
          click: function (e, feature) {
            const layer = e.target;
            update(layer.feature.properties);
            aside.classList.add("is-open");
          },
        });
      },
      pointToLayer: function (feature, latlng) {
        return L.marker(feature.geometry.coordinates, markerOptions); //Задаем положение маркера
      },
    });

    return layer;
  };
  const layer = layerCreate(points);

  const markers = L.markerClusterGroup({
    showCoverageOnHover: false, //Отключаем показ границы маркеров при наведении на кластер
    iconCreateFunction: function (cluster) {
      //Создаем значок кластера
      return L.divIcon({
        html:
          '<svg width="41" height="56" viewBox="0 0 41 56" fill="none" xmlns="http://www.w3.org/2000/svg" class="map__cluster_icon"><path d="M40.5106 20.2222C40.5106 37.7222 20.2553 56 20.2553 56C20.2553 56 0 37.3333 0 20.2222C0 9.0538 9.06862 0 20.2553 0C31.442 0 40.5106 9.0538 40.5106 20.2222Z" fill="#FF9D42"/><circle cx="20.5" cy="20.5" r="13.5" fill="white"/></svg><span class="map__cluster_number">' +
          cluster.getChildCount() +
          "</span>",
        className: "map__cluster", //Задаем класс кластера
        iconSize: L.point(30, 41), //Размер иконки кластера
      });
    },
  });

  markers.addLayer(layer); //Добавляем слой маркеров
  markers.addTo(map);
  function smallMap(position = [40.93469, 72.98827], message) {
    const smallMap = L.map("small-map").setView(position, 13);
    L.tileLayer(mapBoxURL, {
      maxZoom: 19,
      attribution:
        '<a href="https://apps.mapbox.com/feedback/">Mapbox</a> <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(smallMap);
    // L.marker(position).addTo(smallMap).bindTooltip(message);
    return smallMap;
  }

  const smallMapEl = document.querySelector(".small-map_wrapper");
  const myPositionBtn = document.getElementById("myPos");
  const openMapBtn = document.querySelector(".pointBtn");

  openMapBtn.addEventListener("click", function (e) {
    this.disabled = true;
    smallMapEl.classList.add("active");
    document.getElementById("close").addEventListener("click", () => {
      smallMapEl.classList.remove("active");
      this.disabled = false;
    });
  });

  let a;
  let b;
  small.addEventListener("click", (e) => {
    smallMapEl.classList.remove("active");
    openMapBtn.disabled = false;
    a = e.latlng.lat;
    b = e.latlng.lng;
  });

  myPositionBtn.addEventListener("click", (e) => {
    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
    });
  });

  function success({ coords }) {
    const { latitude, longitude } = coords;
    const currentPosition = [latitude, longitude];
    console.log(currentPosition);
    // вызываем функцию, передавая ей текущую позицию и сообщение
    const marker = new L.marker(currentPosition);
    marker.addTo(small);
    // L.marker(small).addTo(currentPosition).bindTooltip("sad");
    // smallMap(currentPosition, "xnjn");
  }

  function error({ message }) {
    console.log(message);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const newCoords = {
      id: `${Date.now()}`,
      type: "Feature",
      properties: {
        userName: inputName.value,
        phone: inputPhone.value,
        email: inputEmail.value,
        desc: textArea.value,
        file: inputFile.files[0],
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

