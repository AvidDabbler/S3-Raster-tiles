import React from 'react'
import './App.css'
import "mapbox-gl/dist/mapbox-gl.css";
import { DroneLayer, MapComponent } from './components/mapbox';

// @ts-expect-error
const env = import.meta.env;

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <MapComponent className='map'
          MAPBOX_API_KEY={env.VITE_APP_MAPBOX_API_KEY}
          options={{ center: [-81.7528142, 41.3040475], zoom: 16 }}>
          <DroneLayer />
        </MapComponent>
      </header>
    </div>
  )
}

export default App
