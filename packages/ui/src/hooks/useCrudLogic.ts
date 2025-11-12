import { useState } from "react";

export interface CrudItem {
  id: number;
  content: string;
}

export function useCrudLogic<
  TUtils extends { crud: { findAll: { invalidate: () => any } } },
  TList extends {
    data?: { cruds: CrudItem[] };
    isLoading: boolean;
    isRefetching: boolean;
  },
  TCreate extends {
    mutate: (data: { content: string }) => any;
    isPending: boolean;
  },
  TUpdate extends {
    mutate: (data: { id: number; data: { content: string } }) => any;
    isPending: boolean;
  },
  TDelete extends { mutate: (data: { id: number }) => any; isPending: boolean },
>({
  trpcUtils,
  crudList,
  createMutation,
  updateMutation,
  deleteMutation,
}: {
  trpcUtils: TUtils;
  crudList: TList;
  createMutation: TCreate;
  updateMutation: TUpdate;
  deleteMutation: TDelete;
}) {
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const handleCreate = () => {
    if (!content.trim()) return;
    createMutation.mutate({ content });
  };

  const handleUpdate = (id: number) => {
    if (!editingContent.trim()) return;
    updateMutation.mutate({ id, data: { content: editingContent } });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const handleRefresh = () => {
    trpcUtils.crud.findAll.invalidate();
  };

  const startEditing = (id: number, itemContent: string) => {
    setEditingId(id);
    setEditingContent(itemContent);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingContent("");
  };

  return {
    // State
    content,
    setContent,
    editingId,
    editingContent,
    setEditingContent,

    // Data
    items: crudList.data?.cruds || [],
    isLoading: crudList.isLoading,
    isRefetching: crudList.isRefetching,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Actions
    handleCreate,
    handleUpdate,
    handleDelete,
    handleRefresh,
    startEditing,
    cancelEditing,
  };
}
