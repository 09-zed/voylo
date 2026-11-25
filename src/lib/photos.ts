// Photos generated from docs/prompts-photos.md, resized and compressed for the app.
// Covers without a photo yet (montagne) fall back to their flat colour.

export const photos = {
  welcome: require('../../assets/photos/accueil-groupe.jpg'),
  noTrips: require('../../assets/photos/vide-voyages.jpg'),
  covers: {
    ville: require('../../assets/photos/couverture-ville.jpg'),
    plage: require('../../assets/photos/couverture-plage.jpg'),
    roadtrip: require('../../assets/photos/couverture-roadtrip.jpg'),
  } as Record<string, number | undefined>,
};
