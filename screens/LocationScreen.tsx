import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import PrimaryButton from '../components/PrimaryButton';

const { width, height } = Dimensions.get('window');

export default function LocationScreen({ navigation }: any) {
  const [zone, setZone] = useState('Banasree');
  const [area, setArea] = useState('');
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);

  // Sample data for zones and areas
  const zones = [
    'Banasree',
    'Dhanmondi',
    'Gulshan',
    'Mirpur',
    'Uttara',
    'Mohammadpur',
    'Lalbagh',
    'Old Dhaka'
  ];

  const areas: { [key: string]: string[] } = {
    'Banasree': ['Banasree Block A', 'Banasree Block B', 'Banasree Block C', 'Banasree Block D'],
    'Dhanmondi': ['Dhanmondi 1', 'Dhanmondi 2', 'Dhanmondi 3', 'Dhanmondi 4', 'Dhanmondi 5'],
    'Gulshan': ['Gulshan 1', 'Gulshan 2', 'Gulshan 3'],
    'Mirpur': ['Mirpur 1', 'Mirpur 2', 'Mirpur 3', 'Mirpur 4', 'Mirpur 5', 'Mirpur 6'],
    'Uttara': ['Uttara 1', 'Uttara 2', 'Uttara 3', 'Uttara 4', 'Uttara 5', 'Uttara 6'],
    'Mohammadpur': ['Mohammadpur 1', 'Mohammadpur 2', 'Mohammadpur 3'],
    'Lalbagh': ['Lalbagh 1', 'Lalbagh 2', 'Lalbagh 3'],
    'Old Dhaka': ['Old Dhaka 1', 'Old Dhaka 2', 'Old Dhaka 3']
  };

  const handleZoneSelect = (selectedZone: string) => {
    setZone(selectedZone);
    setArea(''); // Reset area when zone changes
    setShowZoneModal(false);
  };

  const handleAreaSelect = (selectedArea: string) => {
    setArea(selectedArea);
    setShowAreaModal(false);
  };

  const handleSubmit = () => {
    console.log('Zone:', zone);
    console.log('Area:', area);
    // Handle location submission logic here
    // Navigate to login screen after location is set
    navigation.navigate('Login');
  };

  const renderZoneItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.dropdownItem, zone === item && styles.selectedItem]}
      onPress={() => handleZoneSelect(item)}
    >
      <Text style={[styles.dropdownText, zone === item && styles.selectedText]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderAreaItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.dropdownItem, area === item && styles.selectedItem]}
      onPress={() => handleAreaSelect(item)}
    >
      <Text style={[styles.dropdownText, area === item && styles.selectedText]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('../assets/images/illustration.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Title and Description */}
        <Text style={styles.title}>Select Your Location</Text>
        <Text style={styles.description}>
          Swithch on your location to stay in tune with what's happening in your area
        </Text>

        {/* Input Fields */}
        <View style={styles.inputSection}>
          {/* Zone Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Zone</Text>
            <TouchableOpacity
              style={styles.inputField}
              onPress={() => setShowZoneModal(true)}
            >
              <Text style={styles.inputText}>{zone}</Text>
              <Text style={styles.chevron}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Area Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Area</Text>
            <TouchableOpacity
              style={styles.inputField}
              onPress={() => setShowAreaModal(true)}
            >
              <Text style={[styles.inputText, !area && styles.placeholderText]}>
                {area || 'Types of your area'}
              </Text>
              <Text style={styles.chevron}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Submit Button */}
      <View style={styles.footer}>
        <PrimaryButton
          title="Submit"
          onPress={handleSubmit}
        />
      </View>

      {/* Zone Modal */}
      <Modal
        visible={showZoneModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowZoneModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowZoneModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Zone</Text>
                  <TouchableOpacity onPress={() => setShowZoneModal(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={zones}
                  renderItem={renderZoneItem}
                  keyExtractor={(item) => item}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Area Modal */}
      <Modal
        visible={showAreaModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAreaModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAreaModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Area</Text>
                  <TouchableOpacity onPress={() => setShowAreaModal(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={areas[zone] || []}
                  renderItem={renderAreaItem}
                  keyExtractor={(item) => item}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  illustrationContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  illustration: {
    width: 200,
    height: 150,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D1D1B',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#7C7C7C',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  inputSection: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    color: '#7C7C7C',
    marginBottom: 10,
  },
  inputField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 15,
  },
  inputText: {
    fontSize: 16,
    color: '#1D1D1B',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#7C7C7C',
    fontWeight: 'normal',
  },
  chevron: {
    fontSize: 12,
    color: '#7C7C7C',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1B',
  },
  closeButton: {
    fontSize: 20,
    color: '#7C7C7C',
    fontWeight: 'bold',
  },
  dropdownItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedItem: {
    backgroundColor: '#F0F8FF',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1D1D1B',
  },
  selectedText: {
    color: '#53B175',
    fontWeight: 'bold',
  },
});
