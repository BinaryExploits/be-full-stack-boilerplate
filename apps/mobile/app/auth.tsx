import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Logger } from "@repo/utils-core";
import { authClient } from "@/lib/auth-client";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 32,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
  },
  backButtonText: {
    color: "#6b7280",
    fontSize: 16,
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#6b7280",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  statusBadge: {
    backgroundColor: "#d1fae5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  statusText: {
    color: "#065f46",
    fontSize: 16,
    fontWeight: "500",
  },
  profileContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  signInButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "500",
  },
  signOutButton: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#dc2626",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  signOutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default function Auth() {
  const { data: session, isPending } = authClient.useSession();

  const signInWithGoogle = async () => {
    // TODO: Get some base method to get us this always
    const expoBaseUrl =
      Platform.OS === "web" ? `${process.env.EXPO_PUBLIC_URL}` : "mobile://";

    const callbackURL = expoBaseUrl + "auth";
    Logger.instance.info("Callback: ", callbackURL);

    const signInResponse = await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });

    if (signInResponse.error) {
      Alert.alert("Error while Signing in", signInResponse.error.message);
      Logger.instance.critical(
        "Error while Signing in",
        signInResponse.error.message,
      );
    }
  };

  const signOut = async () => {
    const signOutResponse = await authClient.signOut();
    if (signOutResponse.error) {
      Alert.alert("Error while signing out", signOutResponse.error.message);
      Logger.instance.critical(
        "Error while signing out",
        signOutResponse.error.message,
      );
    }
  };

  if (isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#111827" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>←</Text>
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>

      <View style={styles.centeredContent}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Better Auth Demo</Text>
            <Text style={styles.subtitle}>
              {session ? "Welcome back!" : "Sign in to continue"}
            </Text>
          </View>

          {session ? (
            <>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>✓ You are signed in</Text>
              </View>

              <View style={styles.profileContainer}>
                <Text style={styles.profileTitle}>User Information</Text>

                {session.user.image && (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: session.user.image }}
                      style={styles.profileImage}
                      resizeMode="cover"
                    />
                  </View>
                )}

                <View style={styles.field}>
                  <Text style={styles.label}>Name</Text>
                  <Text style={styles.value}>{session.user.name || "N/A"}</Text>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Email</Text>
                  <Text style={styles.value}>{session.user.email}</Text>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>User ID</Text>
                  <Text style={styles.value}>{session.user.id}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.signOutButton}
                onPress={() => {
                  signOut().catch((err: Error) => {
                    Logger.instance.critical(err);
                  });
                }}
              >
                <Text style={styles.signOutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => {
                signInWithGoogle().catch((err: Error) => {
                  Logger.instance.critical(err);
                });
              }}
            >
              <Text style={styles.signInButtonText}>Sign in with Google</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
