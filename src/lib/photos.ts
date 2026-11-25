// Photos generated from docs/prompts-photos.md, resized and compressed for the app.
// A cover without a photo falls back to its flat colour.

export const photos = {
  welcome: require('../../assets/photos/accueil-groupe.jpg'),
  noTrips: require('../../assets/photos/vide-voyages.jpg'),
  covers: {
    ville: require('../../assets/photos/couverture-ville.jpg'),
    hiver: require('../../assets/photos/couverture-hiver.jpg'),
    plage: require('../../assets/photos/couverture-plage.jpg'),
    montagne: require('../../assets/photos/couverture-montagne.jpg'),
    roadtrip: require('../../assets/photos/couverture-roadtrip.jpg'),
  } as Record<string, number | undefined>,
};
