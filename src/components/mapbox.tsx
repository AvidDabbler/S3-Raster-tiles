import React, { ReactNode, createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import mapboxgl, {
  Map,
  MapboxOptions, RasterSource,
} from "mapbox-gl";
import { useEffectOnce } from "../hooks/useEffectOnce";


export const MapBoxContext = createContext<Map | null>(null);


export const useMapBox = () => {
  const map = useContext(MapBoxContext);
  if (!map) {
    throw new Error("useMap should be used in <Map> child components");
  }
  return map;
};

export const useMapBoxStore = ({ MAPBOX_API_KEY, options }: {
  options: Omit<MapboxOptions, "container">;
  MAPBOX_API_KEY: string;
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<Map | null>(null);

  useEffect(() => {
    if (map) {
      if (options.center && options.zoom) map.setCenter(options.center);
    }
  }, [map]);

  useEffect(() => {
    if (map) {
      if (options.bounds) {
        map.fitBounds(options.bounds, { padding: 20 });
      }
    }
  }, [options.bounds])

  const initialize = useCallback(() => {
    if (mapContainerRef.current !== null && mapContainerRef.current && !map) {
      mapboxgl.accessToken = MAPBOX_API_KEY;
      const mapImpl = new Map({
        fitBoundsOptions: {
          maxZoom: 18,
          padding: { top: 100, bottom: 100, left: 100, right: 100 },
        },
        style: "mapbox://styles/mapbox/navigation-night-v1", // style URL
        ...options, container: mapContainerRef.current
      })
      setMap(mapImpl);
    }
  }, [mapContainerRef, map, options]);

  useEffectOnce(initialize);

  return { mapContainerRef: mapContainerRef, map };
};

export const MapComponent = ({
  children,
  MAPBOX_API_KEY,
  options,
  className,
}: {
  children?: ReactNode;
  MAPBOX_API_KEY: string;
  options: Partial<MapboxOptions>;
  className: string;
}) => {
  const { map, mapContainerRef } = useMapBoxStore({
    MAPBOX_API_KEY,
    options,
  });

  return (
    <MapBoxContext.Provider value={map}>
      <div ref={mapContainerRef} className={className}></div>
      {!!map && children}
    </MapBoxContext.Provider>
  );
};

export function DroneLayer() {
  const map = useMapBox();
  useEffect(() => {
    try {
      // @ts-expect-error
      const env = import.meta.env;
      map.once('styledata', function () {
        map.addSource('drone-imagery', {
          type: 'raster',
          tiles: [
            `${env.VITE_APP_S3BUCKET_URL}/s3-tiles/{z}/{x}/{y}.png`,
          ],
          // tileSize: 256,
        });
        map.addLayer({
          id: 'radar-layer',
          type: 'raster',
          source: 'drone-imagery',
          paint: {
            'raster-fade-duration': 0,
          },
        });
        console.log('add imagery');
      })
    } catch (e) {
      console.error(e);
    }
    return () => {
      map.removeSource('drone-imagery');
    };
  }, [map]);
  return null;
}