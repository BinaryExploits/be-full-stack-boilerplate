import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Link, Stack } from "expo-router";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  content: {
    alignItems: "center",
    gap: 24,
  },
  errorCode: {
    fontSize: 72,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Page Not Found" }} />
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorCode}>404</Text>
          <Text style={styles.title}>Page Not Found</Text>
          <Text style={styles.description}>
            The page you're looking for doesn't exist or has been moved.
          </Text>
          <Link href="/" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Go to Home</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </>
  );
}
