import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Logger } from "@repo/utils-core";
import { useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { getJoinedFrontendUrl } from "@/lib/utils/url";

type AuthStep = "choose" | "email" | "otp";

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
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#991b1b",
    fontSize: 14,
    flex: 1,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#d1d5db",
  },
  dividerText: {
    paddingHorizontal: 8,
    color: "#6b7280",
    fontSize: 14,
  },
  otpButton: {
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
  otpButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "500",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#ffffff",
  },
  otpInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 24,
    marginBottom: 16,
    backgroundColor: "#ffffff",
    textAlign: "center",
    letterSpacing: 8,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  primaryButton: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  secondaryButton: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "500",
  },
  infoBox: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  infoText: {
    color: "#1e40af",
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default function Auth() {
  const { data: session, isPending } = authClient.useSession();
  const [authStep, setAuthStep] = useState<AuthStep>("choose");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    const signInResponse = await authClient.signIn.social({
      provider: "google",
      callbackURL: getJoinedFrontendUrl("auth"),
    });

    if (signInResponse.error) {
      Alert.alert("Error while Signing in", signInResponse.error.message);
      Logger.instance.critical(
        "Error while Signing in",
        signInResponse.error.message,
      );
      setError("Failed to sign in with Google");
    }
  };

  const handleSendOTP = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    setError(null);

    const { data: success, error } =
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

    setLoading(false);

    if (error) {
      Logger.instance.critical(error);
      setError("Failed to send OTP. Please try again.");
      return;
    }

    if (success) {
      setAuthStep("otp");
    } else {
      setError("Unable to send OTP");
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await authClient.signIn.emailOtp({
      email,
      otp,
    });

    setLoading(false);

    if (error) {
      Logger.instance.critical(error);
      setError("Invalid OTP. Please try again.");
      return;
    }

    if (!data) {
      setError("Unable to verify OTP");
      return;
    }

    // Session will be updated automatically and user will see the session page
  };

  const resetAuthFlow = () => {
    setAuthStep("choose");
    setEmail("");
    setOtp("");
    setError(null);
  };

  const signOut = async () => {
    const signOutResponse = await authClient.signOut();
    if (signOutResponse.error) {
      Alert.alert("Error while signing out", signOutResponse.error.message);
      Logger.instance.critical(
        "Error while signing out",
        signOutResponse.error.message,
      );
    } else {
      // Reset auth flow to initial state
      resetAuthFlow();
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/")}
        >
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
                    <Text style={styles.value}>
                      {session.user.name || "N/A"}
                    </Text>
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
              <>
                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                  </View>
                )}

                {authStep === "choose" && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.signInButton,
                        loading && styles.buttonDisabled,
                      ]}
                      onPress={() => {
                        signInWithGoogle().catch((err: Error) => {
                          Logger.instance.critical(err);
                        });
                      }}
                      disabled={loading}
                    >
                      <Text style={styles.signInButtonText}>
                        Sign in with Google
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>Or</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                      style={[styles.otpButton, loading && styles.buttonDisabled]}
                      onPress={() => setAuthStep("email")}
                      disabled={loading}
                    >
                      <Text style={styles.otpButtonText}>
                        Sign in with Email OTP
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {authStep === "email" && (
                  <>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />

                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        loading && styles.buttonDisabled,
                      ]}
                      onPress={handleSendOTP}
                      disabled={loading}
                    >
                      <Text style={styles.primaryButtonText}>
                        {loading ? "Sending..." : "Send OTP"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.secondaryButton,
                        loading && styles.buttonDisabled,
                      ]}
                      onPress={resetAuthFlow}
                      disabled={loading}
                    >
                      <Text style={styles.secondaryButtonText}>Back</Text>
                    </TouchableOpacity>
                  </>
                )}

                {authStep === "otp" && (
                  <>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoText}>
                        We sent a verification code to{" "}
                        <Text style={{ fontWeight: "600" }}>{email}</Text>
                      </Text>
                    </View>

                    <Text style={styles.inputLabel}>Verification Code</Text>
                    <TextInput
                      style={styles.otpInput}
                      value={otp}
                      onChangeText={setOtp}
                      placeholder="000000"
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={!loading}
                    />

                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        loading && styles.buttonDisabled,
                      ]}
                      onPress={handleVerifyOTP}
                      disabled={loading}
                    >
                      <Text style={styles.primaryButtonText}>
                        {loading ? "Verifying..." : "Verify OTP"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.secondaryButton,
                        loading && styles.buttonDisabled,
                      ]}
                      onPress={() => {
                        setAuthStep("email");
                        setOtp("");
                        setError(null);
                      }}
                      disabled={loading}
                    >
                      <Text style={styles.secondaryButtonText}>
                        Change Email
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
