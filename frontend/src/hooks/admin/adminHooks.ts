import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllUsers, getUserStats, toggleBlockUser } from "@/api/admin";
import type { AdminUser } from "@/types/ApiTypes";

type UsersResponse = {
  items: AdminUser[];
  meta: {
    totalItems: number;
    totalPages: number;
  };
};

export function useAdminUsers(page: number, search: string, limit = 10) {
  const queryClient = useQueryClient();

  const usersQuery = useQuery<UsersResponse>({
    queryKey: ["admin-users", page, search],
    queryFn: () => getAllUsers({ page, limit, search }),
  });

  const toggleBlockMutation = useMutation({
    mutationFn: (id: string) => toggleBlockUser(id),

    // optimistic update (better UX than manual toggling state)
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({
        queryKey: ["admin-users", page, search],
      });

      const previous = queryClient.getQueryData<UsersResponse>([
        "admin-users",
        page,
        search,
      ]);

      queryClient.setQueryData<UsersResponse>(
        ["admin-users", page, search],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            items: old.items.map((u) =>
              u.id === id ? { ...u, isBlocked: !u.isBlocked } : u,
            ),
          };
        },
      );

      return { previous };
    },

    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["admin-users", page, search],
          context.previous,
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-users"],
      });
    },
  });

  return {
    ...usersQuery,
    toggleBlock: toggleBlockMutation.mutate,
    isToggling: toggleBlockMutation.isPending,
  };
}

export function useUserStats() {
  return useQuery({
    queryKey: ["admin-user-stats"],
    queryFn: getUserStats,
  });
}
