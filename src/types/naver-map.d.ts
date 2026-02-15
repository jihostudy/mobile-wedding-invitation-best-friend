declare namespace naver {
  namespace maps {
    interface MapOptions {
      center: LatLng;
      zoom?: number;
      zoomControl?: boolean;
      zoomControlOptions?: {
        position?: number;
      };
    }

    class LatLng {
      constructor(lat: number, lng: number);
    }

    class Map {
      constructor(mapDiv: HTMLElement, mapOptions?: MapOptions);
    }

    interface MarkerOptions {
      position: LatLng;
      map: Map;
      title?: string;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
    }

    interface InfoWindowOptions {
      content?: string;
      disableAnchor?: boolean;
      borderWidth?: number;
      backgroundColor?: string;
    }

    class InfoWindow {
      constructor(options?: InfoWindowOptions);
      open(map: Map, anchor?: Marker): void;
      close(): void;
    }

    const Position: {
      TOP_RIGHT: number;
    };
  }
}

interface Window {
  naver?: {
    maps: typeof naver.maps;
  };
}
