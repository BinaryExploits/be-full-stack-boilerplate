import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    padding: 32,
  },
  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 64,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#06b6d4",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#0f172a",
    fontSize: 24,
    fontWeight: "bold",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#60a5fa",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 8,
  },
  cardsContainer: {
    gap: 24,
    marginBottom: 64,
  },
  card: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    padding: 32,
  },
  cardPressed: {
    borderColor: "#3b82f6",
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cardIconBlue: {
    backgroundColor: "#3b82f6",
  },
  cardIconGreen: {
    backgroundColor: "#10b981",
  },
  cardIconText: {
    color: "#ffffff",
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  cardDescription: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 24,
    lineHeight: 20,
  },
  cardLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardLinkTextBlue: {
    color: "#60a5fa",
    fontSize: 16,
    fontWeight: "600",
  },
  cardLinkTextGreen: {
    color: "#34d399",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#475569",
    textAlign: "center",
  },
});

export default function Home() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>BE</Text>
            </View>
            <Text style={styles.title}>Full Stack{"\n"}Boilerplate</Text>
          </View>
          <Text style={styles.subtitle}>
            NextJs (Tailwind CSS), NestJs, Expo, tRPC, Better Auth
          </Text>
        </View>

        {/* Demo Cards */}
        <View style={styles.cardsContainer}>
          {/* CRUD Demo Card */}
          <Link href="/crud-demo" asChild>
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, styles.cardIconBlue]}>
                  <Text style={styles.cardIconText}>☰</Text>
                </View>
                <Text style={styles.cardTitle}>CRUD Demo</Text>
              </View>
              <Text style={styles.cardDescription}>
                Test Create, Read, Update, Delete operations with tRPC and
                Prisma integration. Full-stack type safety demonstration.
              </Text>
              <View style={styles.cardLink}>
                <Text style={styles.cardLinkTextBlue}>Try it out</Text>
                <Text style={styles.cardLinkTextBlue}>→</Text>
              </View>
            </TouchableOpacity>
          </Link>

          {/* Auth Demo Card */}
          <Link href="/auth-demo" asChild>
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, styles.cardIconGreen]}>
                  <Text style={styles.cardIconText}>🔒</Text>
                </View>
                <Text style={styles.cardTitle}>Auth Demo</Text>
              </View>
              <Text style={styles.cardDescription}>
                Test authentication with Better Auth. OAuth integration with
                Google, session management, and protected routes.
              </Text>
              <View style={styles.cardLink}>
                <Text style={styles.cardLinkTextGreen}>Try it out</Text>
                <Text style={styles.cardLinkTextGreen}>→</Text>
              </View>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Built with modern tools for rapid development
          </Text>
        </View>
      </View>
    </View>
  );
}
