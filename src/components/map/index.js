import React, { useEffect, useRef, useCallback } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';

import './map.css';

const GenerateMap = () => {
  const mapContainerRef = useRef(null);
  // mapboxgl.accessToken =
  //   'pk.eyJ1Ijoic2FtYWRvciIsImEiOiJja3FzbWFmcnAxY2R6MnBxYXZkOXpmcnhxIn0.r8bu07XqO_VtwR-9m9NsZA';
  mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_API;

  const fetchData = useCallback(() => {
    const geocodingClient = mbxGeocoding({
      accessToken: mapboxgl.accessToken,
    });

    // geocoding with countries
    return geocodingClient
      .forwardGeocode({
        query: 'Ikeja, Lagos',
        countries: ['ng'],
        limit: 2,
      })
      .send()
      .then((response) => {
        const match = response.body;
        const coordinates = match.features[0].geometry.coordinates;
        const placeName = match.features[0].place_name;
        const center = match.features[0].center;

        return {
          type: 'Feature',
          center: center,
          geometry: {
            type: 'Point',
            coordinates: coordinates,
          },
          properties: {
            description: placeName,
          },
        };
      });
  }, []);

  useEffect(() => {
    const results = fetchData();
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      zoom: 9,
      center: [3.361881, 6.672557],
    });

    results.then((marker) => {
      // create a HTML element for each feature
      var el = document.createElement('div');
      el.className = 'circle';

      // make a marker for each feature and add it to the map
      new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }) // add popups
            .setHTML('<p>' + marker.properties.description + '</p>')
        )
        .addTo(map);

      map.on('load', async () => {
        map.flyTo({
          center: marker.center,
        });
      });
    });

    // clean up on unmount
    return () => map.remove();
  }, [fetchData]);

  return (
    <div>
      <div ref={mapContainerRef} className='map-container' />
    </div>
  );
};

export default GenerateMap;
