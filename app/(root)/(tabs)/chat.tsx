import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Animated,
  Keyboard,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '@/constants';
import { generateResponse } from '@/utils/geminiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your AI assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
      status: 'sent'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const typingDots = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingDots, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(typingDots, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingDots.setValue(0);
    }
  }, [isTyping]);

  const sendMessage = async () => {
    if (message.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'user',
        timestamp: new Date(),
        status: 'sent'
      };

      const currentMessage = message.trim();
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      setIsTyping(true);

      try {
        const aiResponse = await generateResponse(currentMessage);
        
        // Check if the response indicates an error
        if (aiResponse.startsWith('Error:')) {
          throw new Error(aiResponse);
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date(),
          status: 'sent'
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error: any) {
        console.error('Chat error:', error.message);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: error.message || 'Sorry, I encountered an error. Please try again.',
          sender: 'ai',
          timestamp: new Date(),
          status: 'error'
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      {item.sender === 'ai' && (
        <Image 
          source={icons.chat} 
          style={styles.aiAvatar}
        />
      )}
      <View style={styles.messageContent}>
        <Text style={[
          styles.messageText,
          item.sender === 'user' ? styles.userMessageText : styles.aiMessageText
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.timestamp,
          item.sender === 'user' ? styles.userTimestamp : styles.aiTimestamp
        ]}>
          {item.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </View>
  );

  const renderTypingIndicator = () => (
    <Animated.View style={styles.typingContainer}>
      <Image source={icons.chat} style={styles.aiAvatar} />
      <View style={styles.typingBubble}>
        <Text style={styles.typingText}>AI is typing</Text>
        <Animated.View style={[styles.typingDots, {
          opacity: typingDots
        }]}>
          <Text style={styles.dotText}>...</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Assistant...</Text>
          <Text style={styles.headerSubtitle}>Powered by Aspirant</Text>
        </View>
        
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isTyping ? renderTypingIndicator : null}
          style={styles.chatContainer}
        />

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Ask me anything..."
              multiline
              maxLength={1000}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              placeholderTextColor="#666"
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                !message.trim() && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!message.trim() || isTyping}
            >
              {isTyping ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Image 
                  source={icons.chat} 
                  style={[
                    styles.sendIcon,
                    !message.trim() && styles.sendIconDisabled
                  ]} 
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 2,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    maxWidth: '80%',
  },
  messageContent: {
    borderRadius: 16,
    padding: 12,
    flex: 1,
  },
  userMessage: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 12,
  },
  aiMessageText: {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#666',
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 8,
  },
  inputWrapper: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: Platform.OS === 'android' ? 4 : 0,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'flex-end',
    marginBottom: 66,
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    minHeight: 40,
    color: '#000',
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
  sendIconDisabled: {
    tintColor: '#999',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  typingBubble: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    color: '#666',
    fontSize: 14,
  },
  typingDots: {
    marginLeft: 4,
  },
  dotText: {
    color: '#666',
    fontSize: 14,
  },
});