import { Pressable, StyleSheet, Text } from 'react-native';

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
}

export function ExternalLink({ href, children }: ExternalLinkProps) {
  const handlePress = () => {
    // Handle external link navigation
    if (href.startsWith('http')) {
      // Open external URL
      console.log('Opening external URL:', href);
    } else {
      // For internal navigation, just log for now
      console.log('Internal navigation to:', href);
    }
  };

  return (
    <Pressable style={styles.link} onPress={handlePress}>
      <Text style={styles.linkText}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  linkText: {
    color: '#53B175',
    fontSize: 16,
    fontWeight: '500',
  },
});
