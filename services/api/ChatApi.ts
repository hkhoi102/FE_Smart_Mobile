import { Platform } from 'react-native';

// Chat types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  question: string;
  user_id: string;
  top_k?: number;
  conversation_history?: ChatMessage[];
}

export interface ChatResponse {
  answer: string;
  route?: string;
  error?: string;
  retry_after?: string;
}

// Chat API Configuration
const CHAT_API_CONFIG = {
  // For development
  DEVELOPMENT: {
    ANDROID_EMULATOR: 'http://10.0.2.2:8000',
    ANDROID_DEVICE: 'http://103.229.52.246:8000',
    IOS_SIMULATOR: 'http://103.229.52.246:8000',
    IOS_DEVICE: 'http://103.229.52.246:8000',
  },
  // For production
  PRODUCTION: {
    BASE_URL: 'http://103.229.52.246:8000',
  },
};

// Get chat API base URL
const getChatBaseURL = (): string => {
  const isDevelopment = __DEV__;

  if (!isDevelopment) {
    return CHAT_API_CONFIG.PRODUCTION.BASE_URL;
  }

  // For development, use localhost (works for both simulator and device if on same network)
  // For Android emulator, use 10.0.2.2
  if (Platform.OS === 'android') {
    // You can detect emulator vs device here if needed
    return CHAT_API_CONFIG.DEVELOPMENT.ANDROID_DEVICE;
  } else if (Platform.OS === 'ios') {
    return CHAT_API_CONFIG.DEVELOPMENT.IOS_DEVICE;
  }

  return CHAT_API_CONFIG.DEVELOPMENT.ANDROID_DEVICE; // fallback
};

class ChatApi {
  private baseURL: string;

  constructor() {
    // Chat API runs on port 8000 (different from main API)
    this.baseURL = getChatBaseURL();
  }

  /**
   * Send a chat message to the AI assistant
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('ChatApi.sendMessage error:', error);
      throw error;
    }
  }

  /**
   * Clear conversation history for a user
   */
  async clearConversation(userId: string): Promise<void> {
    try {
      await fetch(`${this.baseURL}/conversation/${userId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('ChatApi.clearConversation error:', error);
      // Don't throw - clearing history is not critical
    }
  }
}

export default new ChatApi();

