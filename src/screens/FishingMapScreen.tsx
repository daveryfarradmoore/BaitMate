import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Mapbox from '@rnmapbox/maps';
import type { StackNavigationProp } from '../../App';
import {
  MICHIGAN_FISH_SPECIES,
  MICHIGAN_FISHING_SPOTS,
  type MichiganFishSpeciesId,
  type MichiganFishingSpot,
} from '../data/michiganFishingSpots';
import { buildAppleMapsDirectionsUrl } from '../lib/appleMaps';
import { colors, shadows } from '../theme';

type Props = {
  navigation: StackNavigationProp;
};

type SelectedDestination = Pick<
  MichiganFishingSpot,
  'id' | 'name' | 'waterBody' | 'region' | 'latitude' | 'longitude' | 'accessNote'
> & {
  species: MichiganFishSpeciesId[];
};

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() ?? '';
const HAS_MAPBOX_TOKEN = MAPBOX_TOKEN.startsWith('pk.');
const MICHIGAN_CENTER: [number, number] = [-85.45, 44.55];
const MAP_STYLE = 'mapbox://styles/mapbox/outdoors-v11';

if (HAS_MAPBOX_TOKEN) {
  Mapbox.setAccessToken(MAPBOX_TOKEN);
}

const FishingMapScreen = ({ navigation }: Props) => {
  const [selectedSpecies, setSelectedSpecies] = useState<MichiganFishSpeciesId[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<SelectedDestination>(
    MICHIGAN_FISHING_SPOTS[0]!,
  );
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [latitudeText, setLatitudeText] = useState('');
  const [longitudeText, setLongitudeText] = useState('');

  const filteredSpots = useMemo(() => {
    if (selectedSpecies.length === 0) return MICHIGAN_FISHING_SPOTS;
    return MICHIGAN_FISHING_SPOTS.filter((spot) =>
      spot.species.some((species) => selectedSpecies.includes(species)),
    );
  }, [selectedSpecies]);

  const toggleSpecies = (species: MichiganFishSpeciesId) => {
    setSelectedSpecies((previous) =>
      previous.includes(species)
        ? previous.filter((value) => value !== species)
        : [...previous, species],
    );
  };

  const selectMapCoordinate = (longitude: number, latitude: number) => {
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      Alert.alert('Check the coordinates', 'Enter a valid latitude and longitude.');
      return;
    }

    setSelectedDestination({
      id: 'custom-pin',
      name: 'Pinned fishing destination',
      waterBody: 'Custom map pin',
      region: 'Selected coordinates',
      latitude,
      longitude,
      species: [],
      accessNote: 'Confirm public access, parking, and local fishing regulations before traveling.',
    });
  };

  const handleCoordinateSubmit = () => {
    const latitude = Number(latitudeText.trim());
    const longitude = Number(longitudeText.trim());
    if (
      latitudeText.trim() === '' ||
      longitudeText.trim() === '' ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      Alert.alert('Check the coordinates', 'Use decimal coordinates such as 42.5715 and -82.8014.');
      return;
    }
    selectMapCoordinate(longitude, latitude);
    setShowCoordinates(false);
  };

  const openAppleMaps = async () => {
    const url = buildAppleMapsDirectionsUrl(selectedDestination);
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Could not open Apple Maps', 'Please try again from this device.');
    }
  };

  const destinationSpecies = selectedDestination.species
    .map((id) => MICHIGAN_FISH_SPECIES.find((species) => species.id === id)?.shortName)
    .filter((name): name is string => Boolean(name));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapShell}>
        {HAS_MAPBOX_TOKEN ? (
          <Mapbox.MapView
            style={styles.map}
            styleURL={MAP_STYLE}
            compassEnabled
            logoEnabled
            attributionEnabled
            scaleBarEnabled={false}
            onPress={(feature) => {
              const [longitude, latitude] = feature.geometry.coordinates;
              selectMapCoordinate(longitude, latitude);
            }}
          >
            <>
              <Mapbox.Camera
                centerCoordinate={MICHIGAN_CENTER}
                zoomLevel={5.35}
                minZoomLevel={4.5}
                maxZoomLevel={16}
              />

              {filteredSpots.map((spot) => {
                const selected = selectedDestination.id === spot.id;
                const markerColor =
                  MICHIGAN_FISH_SPECIES.find((species) => species.id === spot.species[0])?.color ??
                  colors.brand;
                return (
                  <Mapbox.MarkerView
                    key={spot.id}
                    coordinate={[spot.longitude, spot.latitude]}
                    anchor={{ x: 0.5, y: 1 }}
                    allowOverlap={selected}
                    isSelected={selected}
                  >
                    <TouchableOpacity
                      style={[styles.marker, selected && styles.markerSelected]}
                      onPress={() => setSelectedDestination(spot)}
                      accessibilityLabel={`${spot.name}, ${spot.waterBody}`}
                    >
                      <View style={[styles.markerCore, { backgroundColor: markerColor }]}>
                        <Ionicons name="fish" size={17} color="#fff" />
                      </View>
                    </TouchableOpacity>
                  </Mapbox.MarkerView>
                );
              })}

              {selectedDestination.id === 'custom-pin' ? (
                <Mapbox.MarkerView
                  coordinate={[
                    selectedDestination.longitude,
                    selectedDestination.latitude,
                  ]}
                  anchor={{ x: 0.5, y: 1 }}
                  allowOverlap
                  isSelected
                >
                  <View style={[styles.marker, styles.markerSelected]}>
                    <View style={[styles.markerCore, styles.customMarker]}>
                      <Ionicons name="navigate" size={17} color="#fff" />
                    </View>
                  </View>
                </Mapbox.MarkerView>
              ) : null}
            </>
          </Mapbox.MapView>
        ) : (
          <View style={styles.mapFallback}>
            <View style={styles.fallbackWaterOne} />
            <View style={styles.fallbackWaterTwo} />
            <Ionicons name="map-outline" size={46} color={colors.brand} />
            <Text style={styles.fallbackTitle}>Mapbox token needed</Text>
            <Text style={styles.fallbackText}>
              Add EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env file to load the live map.
              Suggested Michigan spots and Apple Maps directions still work below.
            </Text>
          </View>
        )}

        <View style={styles.topOverlay} pointerEvents="box-none">
          <View style={styles.discoverCard}>
            <View style={styles.discoverHeading}>
              <View>
                <Text style={styles.eyebrow}>DISCOVER MICHIGAN</Text>
                <Text style={styles.heading}>Fishing waters</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                <Ionicons name="close" size={21} color={colors.ink} />
              </TouchableOpacity>
            </View>
            <View style={styles.mapHint}>
              <Ionicons name="locate-outline" size={16} color={colors.brand} />
              <Text style={styles.mapHintText}>
                Tap a marker or anywhere on the map to choose coordinates
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            <TouchableOpacity
              style={[styles.filterChip, selectedSpecies.length === 0 && styles.filterChipActive]}
              onPress={() => setSelectedSpecies([])}
            >
              <Ionicons
                name="fish-outline"
                size={15}
                color={selectedSpecies.length === 0 ? '#fff' : colors.ink}
              />
              <Text
                style={[
                  styles.filterText,
                  selectedSpecies.length === 0 && styles.filterTextActive,
                ]}
              >
                All species
              </Text>
            </TouchableOpacity>
            {MICHIGAN_FISH_SPECIES.map((species) => {
              const active = selectedSpecies.includes(species.id);
              return (
                <TouchableOpacity
                  key={species.id}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => toggleSpecies(species.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: active }}
                >
                  <View
                    style={[
                      styles.speciesDot,
                      { backgroundColor: active ? '#fff' : species.color },
                    ]}
                  />
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>
                    {species.shortName}
                  </Text>
                  {active ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.resultsPill}>
            <Ionicons name="pin" size={14} color={colors.brand} />
            <Text style={styles.resultsText}>{filteredSpots.length} suggested areas</Text>
          </View>
        </View>

        <View style={styles.bottomOverlay}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.spotStrip}
          >
            {filteredSpots.map((spot) => {
              const active = selectedDestination.id === spot.id;
              return (
                <TouchableOpacity
                  key={spot.id}
                  style={[styles.miniSpotCard, active && styles.miniSpotCardActive]}
                  onPress={() => setSelectedDestination(spot)}
                >
                  <Text style={styles.miniWater}>{spot.waterBody}</Text>
                  <Text style={styles.miniSpotName} numberOfLines={1}>{spot.name}</Text>
                  <Text style={styles.miniRegion}>{spot.region}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.destinationCard}>
            <View style={styles.destinationHeader}>
              <View style={styles.pinIcon}>
                <Ionicons name="location" size={21} color="#fff" />
              </View>
              <View style={styles.destinationCopy}>
                <Text style={styles.destinationName}>{selectedDestination.name}</Text>
                <Text style={styles.destinationWater}>
                  {selectedDestination.waterBody} · {selectedDestination.region}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.coordinateButton}
                onPress={() => setShowCoordinates(true)}
              >
                <Ionicons name="keypad-outline" size={18} color={colors.brand} />
                <Text style={styles.coordinateButtonText}>Coordinates</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.coordinateRow}>
              <Text style={styles.coordinateLabel}>PINNED LOCATION</Text>
              <Text style={styles.coordinateValue}>
                {selectedDestination.latitude.toFixed(6)}, {selectedDestination.longitude.toFixed(6)}
              </Text>
            </View>

            {destinationSpecies.length > 0 ? (
              <Text style={styles.speciesSummary} numberOfLines={1}>
                Potential species: {destinationSpecies.join(' · ')}
              </Text>
            ) : null}

            <Text style={styles.accessNote}>{selectedDestination.accessNote}</Text>

            <TouchableOpacity style={styles.directionsButton} onPress={openAppleMaps}>
              <Ionicons name="navigate" size={19} color="#fff" />
              <Text style={styles.directionsText}>Directions in Apple Maps</Text>
              <Ionicons name="open-outline" size={17} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        visible={showCoordinates}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCoordinates(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeading}>
              <View>
                <Text style={styles.eyebrow}>CUSTOM DESTINATION</Text>
                <Text style={styles.modalTitle}>Enter coordinates</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCoordinates(false)}>
                <Ionicons name="close" size={23} color={colors.ink} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalHelp}>
              Use decimal coordinates. West longitudes in Michigan are negative.
            </Text>
            <Text style={styles.inputLabel}>LATITUDE</Text>
            <TextInput
              value={latitudeText}
              onChangeText={setLatitudeText}
              placeholder="42.5715"
              placeholderTextColor="#8CA09D"
              keyboardType="numbers-and-punctuation"
              style={styles.coordinateInput}
            />
            <Text style={styles.inputLabel}>LONGITUDE</Text>
            <TextInput
              value={longitudeText}
              onChangeText={setLongitudeText}
              placeholder="-82.8014"
              placeholderTextColor="#8CA09D"
              keyboardType="numbers-and-punctuation"
              style={styles.coordinateInput}
            />
            <TouchableOpacity style={styles.pinButton} onPress={handleCoordinateSubmit}>
              <Ionicons name="pin" size={18} color="#fff" />
              <Text style={styles.pinButtonText}>Pin these coordinates</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#DDE8E4' },
  mapShell: { flex: 1, position: 'relative', overflow: 'hidden' },
  map: { flex: 1, width: '100%', height: '100%' },
  mapFallback: {
    flex: 1,
    backgroundColor: '#DCECE6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 42,
    paddingBottom: 180,
    overflow: 'hidden',
  },
  fallbackWaterOne: {
    position: 'absolute',
    width: 360,
    height: 230,
    borderRadius: 180,
    backgroundColor: '#B7D9D9',
    top: 160,
    right: -120,
    transform: [{ rotate: '-18deg' }],
  },
  fallbackWaterTwo: {
    position: 'absolute',
    width: 280,
    height: 180,
    borderRadius: 140,
    backgroundColor: '#C5E0DE',
    bottom: 210,
    left: -100,
    transform: [{ rotate: '22deg' }],
  },
  fallbackTitle: { fontSize: 20, fontWeight: '800', color: colors.ink, marginTop: 12 },
  fallbackText: {
    maxWidth: 430,
    textAlign: 'center',
    color: colors.inkMuted,
    lineHeight: 20,
    marginTop: 7,
  },
  topOverlay: { position: 'absolute', left: 0, right: 0, top: 0, paddingTop: 12 },
  discoverCard: {
    width: '92%',
    maxWidth: 480,
    marginHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(220,233,230,0.95)',
    padding: 15,
    ...shadows.card,
  },
  discoverHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontSize: 10, letterSpacing: 1.35, fontWeight: '800', color: colors.brand },
  heading: { fontSize: 23, fontWeight: '800', color: colors.ink, marginTop: 2 },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapHint: { flexDirection: 'row', alignItems: 'center', marginTop: 9 },
  mapHintText: { flex: 1, fontSize: 12, color: colors.inkMuted, marginLeft: 7 },
  filterRow: { paddingHorizontal: 14, paddingVertical: 10 },
  filterChip: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 19,
    paddingHorizontal: 13,
    marginRight: 7,
    ...shadows.card,
  },
  filterChipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  filterText: { fontSize: 12, fontWeight: '700', color: colors.ink, marginHorizontal: 6 },
  filterTextActive: { color: '#fff' },
  speciesDot: { width: 8, height: 8, borderRadius: 4 },
  resultsPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 14,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  resultsText: { fontSize: 11, fontWeight: '700', color: colors.ink, marginLeft: 5 },
  marker: {
    width: 42,
    height: 50,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    borderWidth: 2,
    borderColor: '#fff',
    ...shadows.card,
  },
  markerSelected: { width: 48, height: 56, borderColor: colors.accent },
  markerCore: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customMarker: { backgroundColor: colors.brand },
  bottomOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  spotStrip: { paddingHorizontal: 14, paddingBottom: 9 },
  miniSpotCard: {
    width: 152,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 11,
    marginRight: 8,
  },
  miniSpotCardActive: { borderWidth: 2, borderColor: colors.brand },
  miniWater: { fontSize: 9, letterSpacing: 0.8, fontWeight: '800', color: colors.brand },
  miniSpotName: { fontSize: 13, fontWeight: '800', color: colors.ink, marginTop: 4 },
  miniRegion: { fontSize: 11, color: colors.inkMuted, marginTop: 2 },
  destinationCard: {
    width: '92%',
    maxWidth: 720,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 15,
    marginBottom: 14,
    ...shadows.card,
  },
  destinationHeader: { flexDirection: 'row', alignItems: 'center' },
  pinIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationCopy: { flex: 1, marginHorizontal: 11 },
  destinationName: { fontSize: 17, fontWeight: '800', color: colors.ink },
  destinationWater: { fontSize: 12, color: colors.inkMuted, marginTop: 2 },
  coordinateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandSoft,
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  coordinateButtonText: { fontSize: 11, fontWeight: '800', color: colors.brand, marginLeft: 5 },
  coordinateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 13,
  },
  coordinateLabel: { fontSize: 9, letterSpacing: 1.1, fontWeight: '800', color: colors.inkMuted },
  coordinateValue: { fontSize: 13, fontWeight: '700', color: colors.ink },
  speciesSummary: { fontSize: 12, color: colors.brandDark, fontWeight: '600', marginTop: 8 },
  accessNote: { fontSize: 11, lineHeight: 16, color: colors.inkMuted, marginTop: 6 },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 12,
  },
  directionsText: { color: '#fff', fontSize: 15, fontWeight: '800', marginHorizontal: 9 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(8, 31, 30, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
    ...shadows.card,
  },
  modalHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 23, fontWeight: '800', color: colors.ink, marginTop: 3 },
  modalHelp: { fontSize: 13, lineHeight: 19, color: colors.inkMuted, marginTop: 10, marginBottom: 16 },
  inputLabel: { fontSize: 9, letterSpacing: 1.1, fontWeight: '800', color: colors.inkMuted, marginBottom: 6 },
  coordinateInput: {
    height: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.canvas,
    paddingHorizontal: 13,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 14,
  },
  pinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    borderRadius: 13,
    paddingVertical: 14,
  },
  pinButtonText: { color: '#fff', fontSize: 15, fontWeight: '800', marginLeft: 8 },
});

export default FishingMapScreen;
