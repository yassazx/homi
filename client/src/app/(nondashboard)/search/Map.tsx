"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import { Property } from "@/types/prismaTypes";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const Map = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const filters = useAppSelector((state) => state.global.filters);
  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  useEffect(() => {
    console.log("Map useEffect triggered");
    console.log("Loading:", isLoading, "Error:", isError);
    if (isLoading) {
      console.log("Still loading properties...");
      return;
    }
    if (isError) {
      console.error("Error loading properties.");
      return;
    }
    if (!properties || properties.length === 0) {
      console.warn("No properties found.");
      return;
    }

    if (!mapContainerRef.current) {
      console.error("Map container ref is null.");
      return;
    }

    // Center on filters.coordinates or first property coordinates
    const centerCoords =
      filters.coordinates && filters.coordinates.length === 2
        ? filters.coordinates
        : properties[0].location.coordinates;

    console.log("Map center coordinates:", centerCoords);

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: `https://api.mapbox.com/styles/v1/mapbox/streets-v11?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`,
      center: centerCoords,
      zoom: 10,
    });

    map.on("load", () => {
      console.log("Map loaded");
    
      properties.forEach((property) => {
        const coordsObj = property.location?.coordinates;
        console.log(`Property ID: ${property.id} coords:`, coordsObj);
    
        if (
          !coordsObj ||
          typeof coordsObj.longitude !== "number" ||
          typeof coordsObj.latitude !== "number" ||
          isNaN(coordsObj.longitude) ||
          isNaN(coordsObj.latitude)
        ) {
          console.warn(
            `Skipping property ${property.id} due to invalid coordinates:`,
            coordsObj
          );
          return;
        }
    
        const coordsArray: [number, number] = [
          coordsObj.longitude,
          coordsObj.latitude,
        ];
    
        const marker = new mapboxgl.Marker()
          .setLngLat(coordsArray)
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `
              <div class="marker-popup">
                <a href="/search/${property.id}" target="_blank" class="marker-popup-title">${property.name}</a>
                <p class="marker-popup-price">MAD${property.pricePerMonth.toLocaleString()} <span class="marker-popup-price-unit">/ month</span></p>
              </div>
              `
            )
          )
          .addTo(map);
    
        // Marker element styling
        const markerElement = marker.getElement();
        if (markerElement) {
          const path = markerElement.querySelector("path[fill='#3FB1CE']");
          if (path) path.setAttribute("fill", "#000000");
        }
      });
    });
    

    // Trigger a resize after some delay to ensure map layout is correct
    setTimeout(() => {
      console.log("Resizing map...");
      map.resize();
    }, 1000);

    return () => {
      console.log("Cleaning up map");
      map.remove();
    };
  }, [isLoading, isError, properties, filters.coordinates]);

  if (isLoading) return <>Loading map...</>;
  if (isError || !properties) return <div>Failed to load properties on map</div>;

  return (
    <div className="basis-5/12 grow relative rounded-xl">
      <div
        ref={mapContainerRef}
        className="map-container rounded-xl"
        style={{ height: "100%", width: "100%", border: "2px solid #ccc" }}
      />
    </div>
  );
};

export default Map;
