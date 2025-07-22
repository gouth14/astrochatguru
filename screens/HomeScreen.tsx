import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  ImageBackground,
  Image,
  StatusBar,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdMobInterstitial } from 'expo-ads-admob';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [showInterstitial, setShowInterstitial] = useState(true);
  const [mysticalImage, setMysticalImage] = useState('');

  useEffect(() => {
    // Generate mystical background image
    generateMysticalImage();
    // Configure and show AdMob for Android standalone apps
    if (Platform.OS === 'android' && AdMobInterstitial) {
      try {
        if (typeof AdMobInterstitial.setAdUnitID === 'function') {
          AdMobInterstitial.setAdUnitID('ca-app-pub-1451353682401749/8070288361');
        }
        if (showInterstitial) {
          setTimeout(() => {
            showInterstitialAd();
          }, 1000);
        }
      } catch (err) {
        console.warn('AdMobInterstitial not available:', err);
      }
    } else if (showInterstitial) {
      // Show fallback welcome dialog if no AdMob
      setTimeout(() => {
        showInterstitialAd();
      }, 1000);
    }
  }, [showInterstitial]);

  const generateMysticalImage = async () => {
    try {
      const imageUrl = `https://api.a0.dev/assets/image?text=mystical cosmic night sky with stars, nebula, and celestial patterns, dark purple and gold colors, ethereal atmosphere&aspect=16:9&seed=mystical123`;
      const loaded = await Image.prefetch(imageUrl);
      if (loaded) {
        setMysticalImage(imageUrl);
      } else {
        console.warn('Mystical image failed to load, using gradient fallback');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      // Use a fallback gradient instead of image
      // The LinearGradient component will still be visible
    }
  };

  const showInterstitialAd = () => {
    Alert.alert(
      "🌟 Welcome to AI Astrology Guru 🌟",
      "Discover the wisdom of the stars! Your cosmic journey begins now...",
      [
        {
          text: "Enter the Mystical Realm",
          onPress: () => setShowInterstitial(false),
          style: "default"
        }
      ],
      { cancelable: false }
    );
  };

  const handleAskStars = async () => {
    if (Platform.OS === 'android' && AdMobInterstitial) {
      try {
        if (typeof AdMobInterstitial.requestAdAsync === 'function') {
          await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
        }
        if (typeof AdMobInterstitial.showAdAsync === 'function') {
          await AdMobInterstitial.showAdAsync();
        }
      } catch (error) {
        console.error('AdMobInterstitial error:', error);
      }
    }
    navigation.navigate('Chat');
  };

  const handleExit = () => {
    Alert.alert(
      "🔮 Leaving the Cosmic Realm?",
      "The stars will miss you! Come back soon for more divine guidance.",
      [
        {
          text: "Stay in the Stars",
          style: "cancel"
        },
        {
          text: "Leave Cosmic Realm",
          onPress: () => {
            // Exit app (in real app, this would minimize)
            Alert.alert("✨ Until the stars align again... ✨");
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#1a0033', '#2d1b69', '#8b5cf6', '#fbbf24']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {mysticalImage && (
          <ImageBackground
            source={{ uri: mysticalImage }}
            style={styles.backgroundImage}
            imageStyle={styles.backgroundImageStyle}
          />
        )}
        
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.exitButton} 
              onPress={handleExit}
            >
              <Ionicons name="close" size={24} color="#fbbf24" />
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            {/* App Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>AI Astrology Guru</Text>
              <Text style={styles.subtitle}>✨ Your Cosmic Guide to Wisdom ✨</Text>
            </View>

            {/* Mystical Elements */}
            <View style={styles.mysticalElements}>
              <View style={styles.starContainer}>
                <Ionicons name="star" size={20} color="#fbbf24" style={styles.star1} />
                <Ionicons name="star-outline" size={16} color="#8b5cf6" style={styles.star2} />
                <Ionicons name="star" size={24} color="#fbbf24" style={styles.star3} />
                <Ionicons name="star-outline" size={12} color="#d1d5db" style={styles.star4} />
              </View>
            </View>

            {/* Main Action Button */}
            <TouchableOpacity 
              style={styles.askButton}
              onPress={handleAskStars}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#8b5cf6', '#6366f1', '#3b82f6']}
                style={styles.buttonGradient}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="sparkles" size={28} color="white" />
                  <Text style={styles.buttonText}>Ask My Stars</Text>
                  <Ionicons name="arrow-forward" size={24} color="white" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Mystical Quote */}
            <View style={styles.quoteContainer}>
              <Text style={styles.quote}>
                "The stars speak to those who listen with their hearts"
              </Text>
              <Text style={styles.quoteAuthor}>- Ancient Wisdom</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>🌙 Powered by GV Developers 🌙</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImageStyle: {
    opacity: 0.3,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  exitButton: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fbbf24',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  mysticalElements: {
    width: width * 0.8,
    height: 100,
    marginBottom: 40,
    position: 'relative',
  },
  starContainer: {
    flex: 1,
    position: 'relative',
  },
  star1: {
    position: 'absolute',
    top: 10,
    left: 20,
  },
  star2: {
    position: 'absolute',
    top: 30,
    right: 30,
  },
  star3: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    marginLeft: -12,
  },
  star4: {
    position: 'absolute',
    top: 5,
    right: 50,
  },
  askButton: {
    width: width * 0.8,
    height: 70,
    marginBottom: 40,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  quoteContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  quote: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 24,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  footer: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#fbbf24',
    textAlign: 'center',
  },
});