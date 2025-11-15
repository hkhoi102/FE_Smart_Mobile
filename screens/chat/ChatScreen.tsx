import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ChatApi, { ChatMessage } from '../../services/api/ChatApi';
import { RootStackParamList } from '../../types/navigation';

const { width } = Dimensions.get('window');

export default function ChatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [messages, setMessages] = useState<Array<ChatMessage & { id: string; timestamp: Date; route?: string; isQuotaError?: boolean }>>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState(() => `user_${Date.now()}`);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Simple markdown to text converter (basic support)
  const markdownToText = (text: string): string => {
    // Convert **text** to bold (we'll use Text component styling)
    return text.replace(/\*\*(.*?)\*\*/g, '$1');
  };

  // Add message to chat
  const addMessage = (role: 'user' | 'assistant', content: string, route?: string, isQuotaError?: boolean) => {
    const newMessage = {
      id: `${Date.now()}_${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
      route,
      isQuotaError,
    };
    setMessages((prev) => [...prev, newMessage]);

    // Add to conversation history (only if not quota error to avoid spam)
    if (!isQuotaError || route !== 'quota_error') {
      setConversationHistory((prev) => [...prev, { role, content }]);
    }
  };

  // Send message to API
  const sendMessage = async () => {
    const question = inputText.trim();
    if (!question || isLoading) return;

    // Add user message
    addMessage('user', question);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await ChatApi.sendMessage({
        question,
        user_id: userId,
        top_k: 4,
        conversation_history: conversationHistory,
      });

      // Check if it's a quota error
      const isQuotaError = response.route === 'quota_error' || response.error === 'quota_exceeded';

      // Add assistant message
      addMessage('assistant', response.answer, response.route, isQuotaError);

      // If quota error and has retry_after, log it
      if (isQuotaError && response.retry_after) {
        const retrySeconds = parseFloat(response.retry_after);
        if (retrySeconds > 0) {
          console.log(`Quota exceeded. Retry after ${retrySeconds} seconds.`);
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      let errorMessage = 'Không thể kết nối đến server. ';
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network request failed')) {
        errorMessage += 'Vui lòng kiểm tra xem AI service đã chạy chưa (http://localhost:8000).';
      } else {
        errorMessage += error.message || 'Đã xảy ra lỗi không xác định.';
      }
      addMessage('assistant', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear chat
  const clearChat = () => {
    Alert.alert(
      'Xóa lịch sử',
      'Bạn có chắc muốn xóa toàn bộ lịch sử chat?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setMessages([]);
            setConversationHistory([]);
            // Clear on server
            ChatApi.clearConversation(userId).catch((err) =>
              console.error('Failed to clear server history:', err)
            );
          },
        },
      ]
    );
  };

  // Render message item
  const renderMessage = ({ item }: { item: typeof messages[0] }) => {
    const isUser = item.role === 'user';
    const timeStr = item.timestamp.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.assistantMessageContainer]}>
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
            item.isQuotaError && styles.quotaErrorBubble,
          ]}
        >
          <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.assistantMessageText]}>
            {markdownToText(item.content)}
          </Text>
          {item.route && (
            <View style={styles.routeBadgeContainer}>
              <View style={[styles.routeBadge, item.route === 'quota_error' && styles.quotaErrorBadge]}>
                <Text style={styles.routeBadgeText}>
                  {item.route === 'quota_error' ? 'QUOTA EXCEEDED' : item.route.toUpperCase()}
                </Text>
              </View>
            </View>
          )}
        </View>
        <Text style={styles.messageTime}>{timeStr}</Text>
      </View>
    );
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    if (!isLoading) return null;
    return (
      <View style={[styles.messageContainer, styles.assistantMessageContainer]}>
        <View style={[styles.messageBubble, styles.assistantBubble]}>
          <View style={styles.typingIndicator}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
          </View>
        </View>
      </View>
    );
  };

  // Render welcome message
  const renderWelcomeMessage = () => {
    if (messages.length > 0) return null;
    return (
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeEmoji}>👋</Text>
        <Text style={styles.welcomeTitle}>Chào mừng!</Text>
        <Text style={styles.welcomeText}>
          Tôi là trợ lý AI cho hệ thống siêu thị. Bạn có thể hỏi tôi về:
        </Text>
        <View style={styles.welcomeList}>
          <Text style={styles.welcomeListItem}>• Sản phẩm, giá cả, tồn kho</Text>
          <Text style={styles.welcomeListItem}>• Thống kê doanh số, đơn hàng</Text>
          <Text style={styles.welcomeListItem}>• Chính sách và hướng dẫn</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#222" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>🤖 Trợ Lý Hệ Thống Siêu Thị</Text>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Đang hoạt động</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
            <MaterialIcons name="delete-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          ListEmptyComponent={renderWelcomeMessage}
          ListFooterComponent={renderTypingIndicator}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Container */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Nhập câu hỏi của bạn..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isLoading}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialIcons name="send" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  clearButton: {
    padding: 4,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: width * 0.75,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginBottom: 4,
  },
  userBubble: {
    backgroundColor: '#6FCF97',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#F4F4F4',
    borderBottomLeftRadius: 4,
  },
  quotaErrorBubble: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FED7D7',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  assistantMessageText: {
    color: '#222',
  },
  routeBadgeContainer: {
    marginTop: 8,
    flexDirection: 'row',
  },
  routeBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quotaErrorBadge: {
    backgroundColor: '#FED7D7',
  },
  routeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1976D2',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
    marginRight: 4,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  welcomeEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  welcomeList: {
    alignItems: 'flex-start',
  },
  welcomeListItem: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
    lineHeight: 22,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F4F4F4',
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6FCF97',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
});

