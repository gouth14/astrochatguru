import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../App';
import { AdMobBanner, AdMobInterstitial, AdMobRewarded } from 'expo-ads-admob';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Replace with your actual Deepseek API key
const DEEPSEEK_API_KEY = 'sk-a999c10572b54fb5a067c8d0f5934efc';

// Helper to query our internal LLM API for real replies
async function askAI(question: string): Promise<string> {
  const response = await global.fetch('https://api.a0.dev/ai/llm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`, // Using the Deepseek key for our internal API
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: question }]
    }),
  });
  if (!response.ok) throw new Error(`LLM API error: ${response.status}`);
  const data = await response.json();
  if (!data.completion) throw new Error('Invalid response from LLM API');
  return data.completion;
}

type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [guruAvatar, setGuruAvatar] = useState('');
  
  useEffect(() => {
    generateGuruAvatar();
    addWelcomeMessage();
    if (Platform.OS === 'android' && Constants.appOwnership === 'standalone') {
      try {
        if (AdMobInterstitial && typeof AdMobInterstitial.setAdUnitID === 'function') {
          AdMobInterstitial.setAdUnitID('ca-app-pub-1451353682401749/8070288361');
        }
      } catch (err) {
        console.warn('AdMobInterstitial not available:', err);
      }
      try {
        if (AdMobRewarded && typeof AdMobRewarded.setAdUnitID === 'function') {
          AdMobRewarded.setAdUnitID('ca-app-pub-1451353682401749/6757206692');
        }
      } catch (err) {
        console.warn('AdMobRewarded not available:', err);
      }
    }
  }, []);

  const generateGuruAvatar = async () => {
    try {
      const avatarUrl = `https://api.a0.dev/assets/image?text=wise mystical astrology guru with cosmic robes, stars in eyes, ethereal appearance, magical aura, portrait style&aspect=1:1&seed=guru123`;
      setGuruAvatar(avatarUrl);
    } catch (error) {
      console.error('Avatar generation error:', error);
      // Will use the placeholder icon if avatar fails to load
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: "🌟 Greetings, seeker of cosmic wisdom! I am your AI Astrology Guru, here to illuminate your path with the ancient knowledge of the stars. What celestial guidance do you seek today? ✨",
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    if (Platform.OS === 'android' && AdMobInterstitial) {
      try {
        const countStr = await AsyncStorage.getItem('chat_msg_count');
        const count = countStr ? parseInt(countStr, 10) : 0;
        if (count >= 5) {
          if (typeof AdMobInterstitial.requestAdAsync === 'function') {
            await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });
          }
          if (typeof AdMobInterstitial.showAdAsync === 'function') {
            await AdMobInterstitial.showAdAsync();
          }
          await AsyncStorage.setItem('chat_msg_count', '0');
        } else {
          await AsyncStorage.setItem('chat_msg_count', (count + 1).toString());
        }
      } catch (error) {
        console.error('AdMobInterstitial error:', error);
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Call internal LLM API for real astrology response
      const aiAnswer = await askAI(inputText.trim());
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiAnswer,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error communicating with the stars:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "🌫️ The cosmic signals are clouded at this moment. Please try again, and the stars shall reveal their wisdom. ✨",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderMessage = (message: Message) => {
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          message.isUser ? styles.userMessage : styles.aiMessage
        ]}
      >
        {!message.isUser && (
          <View style={styles.avatarContainer}>
            {guruAvatar ? (
              <Image source={{ uri: guruAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="sparkles" size={20} color="#fbbf24" />
              </View>
            )}
          </View>
        )}
        
        <View
          style={[
            styles.messageBubble,
            message.isUser ? styles.userBubble : styles.aiBubble
          ]}
        >
          <Text
            style={[
              styles.messageText,
              message.isUser ? styles.userText : styles.aiText
            ]}
          >
            {message.text}
          </Text>
          <Text
            style={[
              styles.timestamp,
              message.isUser ? styles.userTimestamp : styles.aiTimestamp
            ]}
          >
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a0033" />
      
      <LinearGradient
        colors={['#1a0033', '#2d1b69', '#4c1d95']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fbbf24" />
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.headerText}>AI Astrology Guru</Text>
            <Text style={styles.headerSubtext}>🔮 Cosmic Wisdom Chat</Text>
          </View>
        </View>

        {/* Messages */}
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map(renderMessage)}
            
            {isLoading && (
              <View style={styles.loadingContainer}>
                <View style={styles.avatarContainer}>
                  {guruAvatar ? (
                    <Image source={{ uri: guruAvatar }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="sparkles" size={20} color="#fbbf24" />
                    </View>
                  )}
                </View>
                <View style={styles.loadingBubble}>
                  <ActivityIndicator size="small" color="#8b5cf6" />
                  <Text style={styles.loadingText}>The stars are aligning...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* AdMob Banner - Android only */}
          {Platform.OS === 'android' && Constants.appOwnership === 'standalone' && AdMobBanner && (
            <AdMobBanner
              bannerSize="smartBannerPortrait"
              adUnitID="ca-app-pub-1451353682401749/9383370038"
              servePersonalizedAds
              onDidFailToReceiveAdWithError={error => console.error('AdMob Error:', error)}
              style={styles.adBanner}
            />
          )}

          {/* Input Area */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask the stars your question..."
                placeholderTextColor="#9ca3af"
                multiline
                maxLength={200}
              />
              
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isLoading) && styles.sendButtonDisabled
                ]}
                onPress={sendMessage}
                disabled={!inputText.trim() || isLoading}
              >
                <LinearGradient
                  colors={
                    (!inputText.trim() || isLoading)
                      ? ['#6b7280', '#4b5563']
                      : ['#8b5cf6', '#6366f1']
                  }
                  style={styles.sendGradient}
                >
                  <Ionicons
                    name="send"
                    size={20}
                    color="white"
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.3)',
  },
  backButton: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtext: {
    fontSize: 12,
    color: '#fbbf24',
  },
  headerRight: {
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    marginBottom: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: '#8b5cf6',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: '#e5e7eb',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: 'rgba(251, 191, 36, 0.7)',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  loadingBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendGradient: {
    flex: 1,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adBanner: {
    alignSelf: 'center',
    marginVertical: 8,
  },
});