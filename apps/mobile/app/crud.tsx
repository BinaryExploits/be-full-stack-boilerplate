import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { trpc } from "@repo/trpc/client";

type DbType = "mongoose" | "prisma";

interface CrudItem {
  id: string;
  content: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 32,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
  },
  backButtonText: {
    color: "#94a3b8",
    fontSize: 16,
  },
  mainHeader: {
    alignItems: "center",
    marginBottom: 48,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#60a5fa",
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 4,
  },
  techStack: {
    fontSize: 12,
    color: "#64748b",
  },
  dbTabsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  dbTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#334155",
    backgroundColor: "#1e293b",
    alignItems: "center",
  },
  dbTabActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#1e3a8a",
  },
  dbTabActiveMongoose: {
    borderColor: "#10b981",
    backgroundColor: "#064e3b",
  },
  dbTabText: {
    color: "#94a3b8",
    fontSize: 16,
    fontWeight: "600",
  },
  dbTabTextActive: {
    color: "#60a5fa",
  },
  dbTabTextActiveMongoose: {
    color: "#34d399",
  },
  panelContainer: {
    marginBottom: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  headerIconMongoose: {
    backgroundColor: "#10b981",
  },
  headerIconPrisma: {
    backgroundColor: "#3b82f6",
  },
  headerIconText: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  titleMongoose: {
    color: "#10b981",
  },
  titlePrisma: {
    color: "#3b82f6",
  },
  inputSection: {
    marginBottom: 24,
    gap: 12,
  },
  input: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#ffffff",
    fontSize: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 48,
  },
  buttonMongoose: {
    backgroundColor: "#10b981",
  },
  buttonPrisma: {
    backgroundColor: "#3b82f6",
  },
  buttonDisabled: {
    backgroundColor: "#475569",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  refreshButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 16,
    alignSelf: "center",
  },
  refreshButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  listContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    overflow: "hidden",
    flex: 1,
  },
  listHeader: {
    backgroundColor: "#334155",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  listHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#cbd5e1",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  listItemText: {
    flex: 1,
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "500",
  },
  editInput: {
    flex: 1,
    backgroundColor: "#334155",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: "#ffffff",
    fontSize: 16,
  },
  editInputMongoose: {
    borderColor: "#10b981",
  },
  editInputPrisma: {
    borderColor: "#3b82f6",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
  deleteButtonText: {
    color: "#ef4444",
    fontSize: 24,
  },
  emptyText: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyTextContent: {
    color: "#94a3b8",
    fontSize: 16,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
});

function CrudPanel({ dbType }: Readonly<{ dbType: DbType }>) {
  const utils = trpc.useUtils();
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const isMongoose = dbType === "mongoose";
  const label = isMongoose ? "Mongoose (MongoDB)" : "Prisma (PostgreSQL)";

  // Queries - dynamically choose endpoint
  const crudList = trpc.crud[
    isMongoose ? "findAllMongo" : "findAllPrisma"
  ].useQuery(
    {},
    {
      refetchOnWindowFocus: false,
    },
  );

  // Mutations
  const createCrud = trpc.crud[
    isMongoose ? "createCrudMongo" : "createCrudPrisma"
  ].useMutation({
    onSuccess: () => {
      void utils.crud[
        isMongoose ? "findAllMongo" : "findAllPrisma"
      ].invalidate();
      setContent("");
    },
  });

  const deleteCrud = trpc.crud[
    isMongoose ? "deleteCrudMongo" : "deleteCrudPrisma"
  ].useMutation({
    onSuccess: () =>
      utils.crud[isMongoose ? "findAllMongo" : "findAllPrisma"].invalidate(),
  });

  const updateCrud = trpc.crud[
    isMongoose ? "updateCrudMongo" : "updateCrudPrisma"
  ].useMutation({
    onSuccess: () => {
      void utils.crud[
        isMongoose ? "findAllMongo" : "findAllPrisma"
      ].invalidate();
      setEditingId(null);
      setEditingContent("");
    },
  });

  const handleCreate = () => {
    if (!content.trim()) return;
    createCrud.mutate({ content });
  };

  const handleUpdate = (id: string) => {
    if (!editingContent.trim()) return;
    updateCrud.mutate({ id, data: { content: editingContent } });
  };

  const handleDelete = (id: string) => {
    deleteCrud.mutate({ id });
  };

  const handleRefresh = () => {
    void utils.crud[isMongoose ? "findAllMongo" : "findAllPrisma"].invalidate();
  };

  const renderItem = ({ item }: { item: CrudItem }) => (
    <View style={styles.listItem}>
      {editingId === item.id ? (
        <>
          <TextInput
            style={[
              styles.editInput,
              isMongoose ? styles.editInputMongoose : styles.editInputPrisma,
            ]}
            value={editingContent}
            onChangeText={setEditingContent}
            autoFocus
            placeholder="Edit item..."
            placeholderTextColor="#64748b"
          />
          <TouchableOpacity
            onPress={() => handleUpdate(item.id)}
            disabled={!editingContent.trim()}
            style={styles.deleteButton}
          >
            <Text style={{ color: "#10b981", fontSize: 20 }}>✓</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setEditingId(null)}
            style={styles.deleteButton}
          >
            <Text style={{ color: "#ef4444", fontSize: 20 }}>✕</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            onPress={() => {
              setEditingId(item.id);
              setEditingContent(item.content);
            }}
            style={{ flex: 1 }}
          >
            <Text style={styles.listItemText}>{item.content}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            disabled={deleteCrud.isPending}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>🗑</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View
          style={[
            styles.headerIcon,
            isMongoose ? styles.headerIconMongoose : styles.headerIconPrisma,
          ]}
        >
          <Text style={styles.headerIconText}>{isMongoose ? "M" : "P"}</Text>
        </View>
        <Text
          style={[
            styles.title,
            isMongoose ? styles.titleMongoose : styles.titlePrisma,
          ]}
        >
          {label}
        </Text>
      </View>

      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          placeholder="Add text here"
          placeholderTextColor="#64748b"
          value={content}
          onChangeText={setContent}
          editable={!createCrud.isPending}
        />
        <TouchableOpacity
          style={[
            styles.button,
            isMongoose ? styles.buttonMongoose : styles.buttonPrisma,
            (!content.trim() || createCrud.isPending) && styles.buttonDisabled,
          ]}
          onPress={handleCreate}
          disabled={!content.trim() || createCrud.isPending}
        >
          <Text style={styles.buttonText}>
            {createCrud.isPending ? "Adding..." : "Add"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.refreshButton,
          isMongoose ? styles.buttonMongoose : styles.buttonPrisma,
          crudList.isRefetching && styles.buttonDisabled,
        ]}
        onPress={handleRefresh}
        disabled={crudList.isRefetching}
      >
        <Text style={styles.refreshButtonText}>
          {crudList.isRefetching ? "Refreshing..." : "Refresh"}
        </Text>
      </TouchableOpacity>

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>
          {crudList.data?.cruds.length || 0}{" "}
          {crudList.data?.cruds.length === 1 ? "Item" : "Items"}
        </Text>
      </View>
    </View>
  );

  if (crudList.isLoading) {
    return (
      <View style={styles.panelContainer}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={isMongoose ? "#10b981" : "#3b82f6"}
          />
        </View>
      </View>
    );
  }

  if (!crudList.data || crudList.data.cruds.length === 0) {
    return (
      <View style={styles.panelContainer}>
        {renderHeader()}
        <View style={styles.emptyText}>
          <Text style={styles.emptyTextContent}>
            No items yet. Add one to get started!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.panelContainer}>
      <FlatList
        data={crudList.data.cruds}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

export default function CrudPage() {
  const [selectedDb, setSelectedDb] = useState<DbType>("prisma");

  return (
    <View style={styles.container}>
      <View style={styles.safeArea}>
        <View style={styles.scrollContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/")}
          >
            <Text style={styles.backButtonText}>←</Text>
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>

          <View style={styles.mainHeader}>
            <Text style={styles.mainTitle}>Dual Database CRUD Demo</Text>
            <Text style={styles.mainSubtitle}>
              Comparison of Mongoose (MongoDB) and Prisma (PostgreSQL)
            </Text>
            <Text style={styles.techStack}>
              Expo (React Native) • NestJs • tRPC • Transactions
            </Text>
          </View>

          <View style={styles.dbTabsContainer}>
            <TouchableOpacity
              style={[
                styles.dbTab,
                selectedDb === "mongoose" && styles.dbTabActiveMongoose,
              ]}
              onPress={() => setSelectedDb("mongoose")}
            >
              <Text
                style={[
                  styles.dbTabText,
                  selectedDb === "mongoose" && styles.dbTabTextActiveMongoose,
                ]}
              >
                Mongoose
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.dbTab,
                selectedDb === "prisma" && styles.dbTabActive,
              ]}
              onPress={() => setSelectedDb("prisma")}
            >
              <Text
                style={[
                  styles.dbTabText,
                  selectedDb === "prisma" && styles.dbTabTextActive,
                ]}
              >
                Prisma
              </Text>
            </TouchableOpacity>
          </View>

          <CrudPanel dbType={selectedDb} />
        </View>
      </View>
    </View>
  );
}
