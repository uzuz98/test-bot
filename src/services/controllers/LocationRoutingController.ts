/*
 * The purpose of this file is to provide a singleton that
 * optimizes access to the user's location for client side routing.
 */

const LOCALSTORAGE_LOCATION_CACHE_PATH = 'ramper_routingLocation'
const LOCATION_VALID_TIME = 1000 * 60 * 60 * 24 * 7 // 7 days valid time.

interface Location {
  latitude: number
  longitude: number
  accessedDate: number
}

export interface RoutableResource {
  latitude: number
  longitude: number
  resourceUri: string
}

export interface AWSRoutableResource extends RoutableResource {
  region: string
}

interface GeoLocationResponse {
  geoplugin_areaCode?: string
  geoplugin_city?: string
  geoplugin_continentCode?: string
  geoplugin_continentName?: string
  geoplugin_countryCode?: string
  geoplugin_countryName?: string
  geoplugin_credit?: string
  geoplugin_currencyCode?: string
  geoplugin_currencyConverter?: number
  geoplugin_currencySymbol?: string
  geoplugin_currencySymbol_UTF8?: string
  geoplugin_delay?: string
  geoplugin_dmaCode?: string
  geoplugin_euVATrate?: boolean
  geoplugin_inEU?: number
  geoplugin_latitude?: string
  geoplugin_locationAccuracyRadius?: string
  geoplugin_longitude?: string
  geoplugin_region?: string
  geoplugin_regionCode?: string
  geoplugin_regionName?: string
  geoplugin_request?: string
  geoplugin_status?: number
  geoplugin_timezone?: string
}

class LocationRoutingController {
  location: Location | null = null

  static isValidLocation(location: Location | null): boolean {
    return !!location && Date.now() - location.accessedDate < LOCATION_VALID_TIME
  }

  /**
   * Haversine's formula
   * @param toLocation
   * @returns The distance between the user's routing location and the toLocation.
   *     returns -1 if the user's routing location is unknown.
   */
  async getDistance(toLocation: Location) {
    const toRadians = (degrees: number): number => {
      return degrees * (Math.PI / 180)
    }
    const currentLocation = await this.getLocation()
    if (!currentLocation) {
      return -1
    }
    const earthRadius = 6371 // in kilometers

    const latDiff = toRadians(toLocation.latitude - currentLocation.latitude)
    const lonDiff = toRadians(toLocation.longitude - currentLocation.longitude)

    const a =
      Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
      Math.cos(toRadians(currentLocation.latitude)) *
        Math.cos(toRadians(toLocation.latitude)) *
        Math.sin(lonDiff / 2) *
        Math.sin(lonDiff / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    const distance = earthRadius * c

    return distance
  }

  /**
   * @param routableResources All the resources to select from.
   * @returns The resource that is closest to the user
   */
  async route(routableResources: RoutableResource[], defaultResource: RoutableResource) {
    const currentLocation = await this.getLocation()
    if (!currentLocation) {
      return defaultResource
    }

    let closestResource: RoutableResource | null = null
    let closestDistance = Number.MAX_VALUE

    for (const resource of routableResources) {
      const distance = await this.getDistance({
        latitude: resource.latitude,
        longitude: resource.longitude,
        accessedDate: Date.now()
      })

      if (distance >= 0 && distance < closestDistance) {
        closestResource = resource
        closestDistance = distance
      }
    }

    if (closestResource) {
      return closestResource
    } else {
      return defaultResource
    }
  }

  async getLocation() {
    if (!LocationRoutingController.isValidLocation(this.location)) {
      // const cachedLocation = JSON.parse(window.localStorage.getItem(LOCALSTORAGE_LOCATION_CACHE_PATH) || 'null')
      // const cachedLocation = JSON.parse('null')
      // if (LocationRoutingController.isValidLocation(cachedLocation)) {
      //   this.setLocation(cachedLocation)
      // } else {
        // Fetch location from server
      try {
        const geoLocationResponse = await fetch('https://ssl.geoplugin.net/json.gp?k=b0b77ddad776a79d')
        const geoLocation: GeoLocationResponse = await geoLocationResponse.json()
        if (geoLocation.geoplugin_latitude && geoLocation.geoplugin_longitude) {
          this.setLocation({
            latitude: Number.parseFloat(geoLocation.geoplugin_latitude),
            longitude: Number.parseFloat(geoLocation.geoplugin_longitude),
            accessedDate: Date.now()
          })
        }
      } catch (err) {}
      // }
    }
    return this.location
  }

  setLocation(newLocation: Location) {
    this.location = newLocation
    window.localStorage.setItem(LOCALSTORAGE_LOCATION_CACHE_PATH, JSON.stringify(this.location))
  }
}

const locationRoutingController = new LocationRoutingController()

export default locationRoutingController
