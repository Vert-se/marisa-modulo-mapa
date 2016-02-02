(function() {
    var map,
        service,
        myLatLng;

    function createMap(cep) {
        var place = null, lat = null, lng = null, formatted_address = null;
        $.ajax({
            url: "http://maps.googleapis.com/maps/api/geocode/json?address=" + cep + "-Brazil",
            data: "GET",
            success: function (response) {
                place = response;
                $('#maps').slideDown(200, function () {
                    if (place && place.status === "OK") {
                        formatted_address = place.results[0].formatted_address;
                        formatted_address = formatted_address.replace(/\ /, "+");
                        lat = place.results[0].geometry.location.lat;
                        lng = place.results[0].geometry.location.lng;
                        initialize(place, formatted_address, lat, lng);
                    }
                });
            },
            dataType: "json"
        });
        //Rafa API KEY = AIzaSyCLGLwDFy1QMhIS2JK-Wr0Nu1gOGcV2zbw
        //Miguel API KEY = AIzaSyAI9Ajz3LzJZuipezvr0UKMj4LOReUmzIc
    }

    function initialize(place, formatted_address, lat, lng) {

        if (isNaN(lat)) {
            console.log("Lat is not number");
            lat = lat || -23.5713158;
            lng = lng || -46.6509986;

            var successCallback = function(pos) {
                console.log(pos.coords);
                lat = pos.coords.latitude;
                lng = pos.coords.longitude;
                startMap(lat, lng);
            };

            var errorCallback = function() {
                console.log("Error get geoposition");
                startMap(lat, lng);
            };

            if (navigator && navigator.geolocation && navigator.geolocation.getCurrentPosition) {
                console.log('get geoposition');
                navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
            } else {
                startMap(lat, lng);
            }
        } else {
            console.log("Lat is number");
            startMap(lat, lng);
        }
        
    }

    function startMap(lat, lng) {
        myLatLng = {lat: lat, lng: lng};
        // Create a map object and specify the DOM element for display.
        map = new google.maps.Map(document.getElementById('map'), {
            center: myLatLng,
            scrollwheel: true,
            zoom: 14
        });

        // Create a marker and set its position.
        var marker = new google.maps.Marker({
            map: map,
            position: myLatLng,
            title: 'Seu CEP'
        });

        service = new google.maps.places.PlacesService(map);
        infoWindow = new google.maps.InfoWindow();
        performSearch();
        map.addListener('idle', performSearch);
    }

    function performSearch() {
        if (map.getBounds()) {
            var request = {
                bounds: map.getBounds(),
                keyword: 'lojas marisa'
            };
            service.radarSearch(request, callback);
        }
    }

    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0, result; result = results[i]; i++) {
                addMarker(result);
            }
        }
    }

    function addMarker(place) {
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            icon: {
                url: 'img/thumb_p.png',
                anchor: new google.maps.Point(10, 10),
                scaledSize: new google.maps.Size(26, 26)
            }
        });
        google.maps.event.addListener(marker, 'click', function () {
            service.getDetails(place, function (result, status) {
                if (status !== google.maps.places.PlacesServiceStatus.OK) {
                    console.error(status);
                    return;
                }
                infoWindow.setContent(result.adr_address);
                infoWindow.open(map, marker);
            });
        });
    }    

    function mtel(v) {
        return v.replace(/\D/, "") //Remove tudo o que não é dígito
                .replace(/(\d)(\d{3})$/, "$1-$2"); //Coloca hífen 
    }

    $(document).ready(function () {

        // Asynchronously Load the map API 
        var script = document.createElement('script');
        script.src = "http://maps.googleapis.com/maps/api/js?sensor=false&libraries=places,visualization";
        document.body.appendChild(script);


        $('.formCEP').on('submit', function (event) {
            event.preventDefault();
            var cep = $("#cep").val();
            if (cep.length < 9) {
                alert("CEP inválido");
                return;
            }
            createMap(cep);
        });

        $('#cep').on('keyup', function () {
            $(this).val(mtel($(this).val()));
        });



        initialize();

    });
})();