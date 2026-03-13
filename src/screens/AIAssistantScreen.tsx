// filename: src/screens/AIAssistantScreen.tsx
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { id: '1', label: '🏘️ Tìm BĐS phù hợp', prompt: 'Tôi muốn tìm bất động sản phù hợp với nhu cầu của mình' },
  { id: '2', label: '💰 Tư vấn tài chính', prompt: 'Tư vấn về tài chính và vay vốn mua nhà' },
  { id: '3', label: '📋 So sánh dự án', prompt: 'Giúp tôi so sánh các dự án bất động sản' },
  { id: '4', label: '📈 Xu hướng thị trường', prompt: 'Cho tôi biết xu hướng thị trường bất động sản hiện tại' },
];

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'Xin chào! Tôi là trợ lý AI bất động sản của bạn 🏠\n\nTôi có thể giúp bạn:\n• Tìm kiếm và tư vấn bất động sản\n• Phân tích thị trường và giá cả\n• Tư vấn tài chính, vay vốn\n• Hỏi đáp về giao dịch, pháp lý\n\nBạn cần hỗ trợ gì hôm nay?',
  timestamp: new Date(),
};

const AIAssistantScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Simulate AI response - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(trimmed),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Xin lỗi, tôi gặp sự cố kết nối. Vui lòng thử lại sau.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isLoading]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🤖</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {item.content}
          </Text>
          <Text style={[styles.timeText, isUser && styles.timeTextUser]}>
            {item.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiIndicator}>
            <Text style={styles.aiIndicatorText}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Trợ lý AI</Text>
            <Text style={styles.headerSubtitle}>Tư vấn bất động sản thông minh</Text>
          </View>
        </View>
        <View style={styles.onlineDot} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Message List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>🤖</Text>
            </View>
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.loadingText}>Đang soạn câu trả lời...</Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <View style={styles.quickActions}>
            <Text style={styles.quickActionsTitle}>Gợi ý câu hỏi</Text>
            <View style={styles.quickActionsGrid}>
              {QUICK_ACTIONS.map(action => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.quickActionBtn}
                  onPress={() => sendMessage(action.prompt)}
                >
                  <Text style={styles.quickActionText}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Input bar */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Nhập câu hỏi về bất động sản..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage(inputText)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Mock response generator - replace with real AI API
function generateMockResponse(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('giá') || q.includes('tài chính') || q.includes('vay')) {
    return 'Về tài chính mua nhà, bạn cần lưu ý:\n\n💡 Vốn tự có tối thiểu 20-30% giá trị BĐS\n🏦 Lãi suất vay hiện tại khoảng 8-11%/năm\n📅 Thời hạn vay tối đa 25-30 năm\n\nBạn muốn tôi tính toán cụ thể khả năng vay theo thu nhập của bạn không?';
  }
  if (q.includes('tìm') || q.includes('phù hợp')) {
    return 'Để tìm BĐS phù hợp, tôi cần biết thêm:\n\n📍 Khu vực bạn mong muốn?\n💰 Ngân sách của bạn?\n🏠 Loại hình: căn hộ, nhà phố, hay đất?\n👨‍👩‍👧 Mục đích: ở, đầu tư, hay cho thuê?\n\nHãy chia sẻ để tôi tư vấn chính xác hơn nhé!';
  }
  if (q.includes('thị trường') || q.includes('xu hướng')) {
    return 'Thị trường BĐS 2024-2025:\n\n📈 Phân khúc căn hộ trung cấp đang tăng trưởng ổn định\n🏙️ TP.HCM & Hà Nội vẫn dẫn đầu thanh khoản\n🔥 Khu vực ven đô và các tỉnh vệ tinh đang nóng lên\n⚖️ Chính sách pháp lý đang được hoàn thiện\n\nBạn muốn phân tích sâu hơn khu vực nào?';
  }
  return 'Cảm ơn câu hỏi của bạn! Tôi đang phân tích thông tin để đưa ra tư vấn phù hợp nhất.\n\nBạn có thể cung cấp thêm thông tin về nhu cầu cụ thể để tôi hỗ trợ tốt hơn không? 😊';
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiIndicator: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  aiIndicatorText: { fontSize: 20 },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 4,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16 },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleAI: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  bubbleUser: {
    backgroundColor: '#2563EB',
    borderTopRightRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#111827',
  },
  bubbleTextUser: {
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'right',
  },
  timeTextUser: {
    color: 'rgba(255,255,255,0.7)',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loadingText: {
    fontSize: 13,
    color: '#6B7280',
  },
  quickActions: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  quickActionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quickActionText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#BFDBFE',
  },
  sendBtnText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
});

export default AIAssistantScreen;
