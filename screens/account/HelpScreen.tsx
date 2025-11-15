import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../types/navigation';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'Làm thế nào để đặt hàng?',
    answer: 'Bạn có thể tìm kiếm sản phẩm, thêm vào giỏ hàng và thanh toán. Sau khi đặt hàng thành công, bạn sẽ nhận được thông báo xác nhận.',
  },
  {
    id: '2',
    question: 'Có những phương thức thanh toán nào?',
    answer: 'Chúng tôi hỗ trợ thanh toán khi nhận hàng (COD), chuyển khoản ngân hàng, và ví điện tử.',
  },
  {
    id: '3',
    question: 'Thời gian giao hàng là bao lâu?',
    answer: 'Thời gian giao hàng thường từ 2-5 ngày làm việc tùy thuộc vào địa chỉ giao hàng của bạn.',
  },
  {
    id: '4',
    question: 'Làm sao để theo dõi đơn hàng?',
    answer: 'Bạn có thể vào mục "Đơn Hàng" trong tài khoản để xem trạng thái đơn hàng của mình.',
  },
  {
    id: '5',
    question: 'Có thể đổi/trả hàng không?',
    answer: 'Có, bạn có thể đổi/trả hàng trong vòng 7 ngày kể từ ngày nhận hàng nếu sản phẩm còn nguyên vẹn, chưa sử dụng.',
  },
  {
    id: '6',
    question: 'Làm thế nào để liên hệ hỗ trợ?',
    answer: 'Bạn có thể liên hệ qua email support@sieuthithongminh.com, hotline 1900 1234, hoặc sử dụng Trợ Lý AI trong ứng dụng.',
  },
];

export default function HelpScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trợ Giúp</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hành Động Nhanh</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Chat')}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#6FCF97" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Trò chuyện với Trợ Lý AI</Text>
              <Text style={styles.actionSubtitle}>Nhận hỗ trợ tức thì 24/7</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="call-outline" size={24} color="#6FCF97" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Gọi Hotline</Text>
              <Text style={styles.actionSubtitle}>1900 1234</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="mail-outline" size={24} color="#6FCF97" />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Gửi Email</Text>
              <Text style={styles.actionSubtitle}>support@sieuthithongminh.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Câu Hỏi Thường Gặp</Text>
          {faqData.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            return (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleItem(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestionText}>{item.question}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông Tin Liên Hệ</Text>
          <View style={styles.contactItem}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Giờ Làm Việc</Text>
              <Text style={styles.contactValue}>Thứ 2 - Chủ Nhật: 8:00 - 22:00</Text>
            </View>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Hotline</Text>
              <Text style={styles.contactValue}>1900 1234</Text>
            </View>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>support@sieuthithongminh.com</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  faqItem: {
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    paddingTop: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  contactContent: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    color: '#666',
  },
});

