import React, { useRef, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function VerificationScreen({ navigation }: any) {
  const [code, setCode] = useState(['', '', '', '']);
  const inputRefs = useRef<TextInput[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto focus next input
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleContinue = () => {
    const fullCode = code.join('');
    if (fullCode.length === 4) {
      console.log('Verification code:', fullCode);
      // Handle verification logic here
      // Navigate to location screen
      navigation.navigate('Location');
    }
  };

  const handleResendCode = () => {
    console.log('Resend code');
    // Handle resend code logic here
  };

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
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
          <Text style={styles.title}>Enter your 4-digit code</Text>

          {/* Code Input */}
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Code</Text>
            <View style={styles.inputContainer}>
              {[0, 1, 2, 3].map((index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  style={styles.codeInput}
                  value={code[index]}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                  selectionColor="#53B175"
                />
              ))}
            </View>
          </View>
        </View>

        {/* Footer - This will automatically move up when keyboard appears */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleResendCode}>
            <Text style={styles.resendText}>Resend Code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.continueButton,
              isCodeComplete && styles.continueButtonActive
            ]}
            onPress={handleContinue}
            disabled={!isCodeComplete}
          >
            <Text style={styles.continueArrow}>→</Text>
          </TouchableOpacity>
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
  keyboardAvoidingView: {
    flex: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D1D1B',
    textAlign: 'center',
    marginBottom: 40,
  },
  codeContainer: {
    width: '100%',
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 16,
    color: '#7C7C7C',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  codeInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1B',
    backgroundColor: '#F8F8F8',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  resendText: {
    fontSize: 16,
    color: '#53B175',
    fontWeight: '500',
  },
  continueButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonActive: {
    backgroundColor: '#53B175',
  },
  continueArrow: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
});
