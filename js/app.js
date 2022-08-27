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
  const inputName = form.elements[0];
  const inputPhone = form.elements[1];
  const inputEmail = form.elements[2];
  const inputFile = form.elements[3];
  // [56.631600, 47.886178]
  const map = L.map("map", {
    center: [40.93469, 72.98827],
    zoom: 14,
  });
  const small = smallMap();
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

  const layerCreate = (points) => {
    const layer = L.geoJSON(points, {
      onEachFeature: function onEachFeature(feature, layer) {
        if (feature.properties && feature.properties.title) {
          layer.bindTooltip(feature.properties.title, tooltipOptions); //Добавляем подписи маркеров
        }
        layer.on({
          //По клику обновляем данные в сайдбаре и открываем его
          click: function (e, feature) {
            var layer = e.target;
            update(layer.feature.properties);
            // $object.addClass("is-open");
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
  function smallMap() {
    const smallMap = L.map("small-map", {
      center: [40.93469, 72.98827],
      zoom: 13,
    });
    L.tileLayer(mapBoxURL, {
      maxZoom: 19,
      attribution:
        '<a href="https://apps.mapbox.com/feedback/">Mapbox</a> <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(smallMap);
    return smallMap;
  }

  const smallMapEl = document.querySelector(".small-map_wrapper");

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

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const newCoords = {
      id: `${Date.now()}`,
      type: "Feature",
      properties: {
        userName: inputName.value,
        phone: inputPhone.value,
        email: inputEmail.value,
        file: inputFile.files[0],
      },
      geometry: {
        type: "Point",
        coordinates: [a, b],
      },
    };
    addPointsOnServer(newCoords);
    getPointsFromServer()
  });
})();

