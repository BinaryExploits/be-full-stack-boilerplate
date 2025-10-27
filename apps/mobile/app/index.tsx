// app/index.tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { trpc } from "@repo/trpc/client";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#06b6d4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerIconText: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "bold",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#60a5fa",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
  },
  inputSection: {
    marginBottom: 32,
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
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 48,
  },
  buttonDisabled: {
    backgroundColor: "#475569",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  listContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    overflow: "hidden",
    flex: 1,
    minHeight: 200,
    maxHeight: 400,
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
    borderColor: "#3b82f6",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: "#ffffff",
    fontSize: 16,
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
  },
  footer: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 16,
  },
  refreshButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  refreshButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
});

interface CrudItem {
  id: number;
  content: string;
}

export default function CrudPage() {
  const utils = trpc.useUtils();
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  // Queries
  const crudList = trpc.crud.findAll.useQuery(
    {},
    {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  );

  // Mutations
  const createCrud = trpc.crud.createCrud.useMutation({
    onSuccess: () => {
      utils.crud.findAll.invalidate();
      setContent("");
    },
  });

  const deleteCrud = trpc.crud.deleteCrud.useMutation({
    onSuccess: () => utils.crud.findAll.invalidate(),
  });

  const updateCrud = trpc.crud.updateCrud?.useMutation({
    onSuccess: () => {
      utils.crud.findAll.invalidate();
      setEditingId(null);
      setEditingContent("");
    },
  });

  const handleCreate = () => {
    if (!content.trim()) return;
    createCrud.mutate({ content });
  };

  const handleUpdate = (id: number) => {
    if (!editingContent.trim()) return;
    updateCrud?.mutate({ id, data: { content: editingContent } });
  };

  const handleRefresh = () => {
    utils.crud.findAll.invalidate();
  };

  const renderItem = ({ item }: { item: CrudItem }) => (
    <View style={styles.listItem}>
      {editingId === item.id ? (
        <>
          <TextInput
            style={styles.editInput}
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
            onPress={() => deleteCrud.mutate({ id: item.id })}
            disabled={deleteCrud.isPending}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>🗑</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>✓</Text>
            </View>
            <Text style={styles.title}>BE Tech Stack CRUD</Text>
            <Text style={styles.subtitle}>NextJs, NestJs, Expo, Trpc</Text>
          </View>

          {/* Input Section */}
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
                (!content.trim() || createCrud.isPending) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleCreate}
              disabled={!content.trim() || createCrud.isPending}
            >
              <Text style={styles.buttonText}>
                {createCrud.isPending ? "Adding..." : "Add"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Refresh Button */}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={crudList.isRefetching}
          >
            <Text style={styles.refreshButtonText}>
              {crudList.isRefetching ? "Refreshing..." : "Refresh"}
            </Text>
          </TouchableOpacity>

          {/* List Section */}
          <View style={styles.listContainer}>
            {crudList.isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#60a5fa" />
              </View>
            ) : crudList.data && crudList.data.cruds.length > 0 ? (
              <>
                <View style={styles.listHeader}>
                  <Text style={styles.listHeaderText}>
                    {crudList.data.cruds.length}{" "}
                    {crudList.data.cruds.length === 1 ? "Item" : "Items"}
                  </Text>
                </View>
                <FlatList
                  data={crudList.data.cruds}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled
                />
              </>
            ) : (
              <View style={styles.emptyText}>
                <Text style={styles.emptyTextContent}>
                  No items yet. Add one to get started!
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
