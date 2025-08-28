import { createFileRoute } from "@tanstack/react-router";
import logo from "../logo.svg";
import { DataTable } from "@/components/ui/data-table";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, CircleAlert, CloudDownload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  component: App,
});

function useKiosks() {
  return useQuery({
    queryKey: ["kiosks"],
    queryFn: async () => {
      return JSON.parse(JSON.stringify(data));
    },
  });
}

function useUpdateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update"],
    mutationFn: async (args: { id: number }) => {
      const duration = Math.random() * 3000;
      await new Promise((resolve) => setTimeout(resolve, duration));

      if (Math.random() > 0.75) {
        throw new Error("Something went wrong");
      }

      const kiosk = data.find((kiosk) => kiosk.id === args.id)!;
      const [, , prev] = kiosk.version.split(".");
      kiosk.version = `1.0.${Number(prev) + 1}`;
      return kiosk;
    },
    onSettled: async () => {
      console.log(data);
      await queryClient.invalidateQueries({ queryKey: ["kiosks"] });
    },
  });
}

function App() {
  const updateMutation = useUpdateMutation();
  const kiosks = useKiosks();
  console.log("data", kiosks.data);
  const table = useReactTable({
    data: kiosks.data ?? [],
    getRowId: (row) => row.id.toString(),
    getCoreRowModel: getCoreRowModel(),
    columns,
  });
  console.log("table", table.getRowModel().rows);

  const selectedIds = Object.keys(table.getState().rowSelection);

  return (
    <div className="p-4">
      <div
        className={cn(
          "py-2",
          selectedIds.length === 0 && "opacity-0 pointer-events-none",
        )}
      >
        <Button
          onClick={() => {
            selectedIds.forEach((id) =>
              updateMutation.mutate({ id: Number(id) }),
            );
            table.resetRowSelection();
          }}
        >
          Update selected
        </Button>
      </div>
      <DataTable table={table} onRowClick={(row) => row.toggleSelected()} />
    </div>
  );
}

interface Data {
  id: number;
  name: string;
  version: string;
}

const columnHelper = createColumnHelper<Data>();

const columns = [
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    maxSize: 50,
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={row.getToggleSelectedHandler()}
      />
    ),
  }),
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("version", {
    header: "version",
    cell: ({ getValue }) => <Badge>{getValue()}</Badge>,
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const updateMutation = useUpdateMutation();
      const mutations = useMutationState({
        filters: {
          mutationKey: ["update"],
          predicate: (mutation) =>
            (mutation.state.variables as { id: number })?.id ===
            row.original.id,
        },
      });
      const latest = mutations[mutations.length - 1];
      const pending = latest?.status === "pending";
      const error = latest?.error;
      const result = latest?.data;

      return (
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (pending) {
              return;
            }
            updateMutation.mutate({ id: Number(row.original.id) });
          }}
        >
          {pending ? (
            <Loader2 className="animate-spin" />
          ) : error ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <CircleAlert className="text-red-500" />
              </TooltipTrigger>
              <TooltipContent>{error.message}</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                {result ? <Check /> : <CloudDownload />}
              </TooltipTrigger>
              <TooltipContent>Update</TooltipContent>
            </Tooltip>
          )}
        </div>
      );
    },
  }),
];

const data: Data[] = [
  { id: 1, name: "Kiosk 1", version: "1.0.0" },
  { id: 2, name: "Kiosk 2", version: "1.0.0" },
  { id: 3, name: "Kiosk 3", version: "1.0.0" },
  { id: 4, name: "Kiosk 4", version: "1.0.0" },
  { id: 5, name: "Kiosk 5", version: "1.0.0" },
  { id: 6, name: "Kiosk 6", version: "1.0.0" },
  { id: 7, name: "Kiosk 7", version: "1.0.0" },
  { id: 8, name: "Kiosk 8", version: "1.0.0" },
  { id: 9, name: "Kiosk 9", version: "1.0.0" },
  { id: 10, name: "Kiosk 10", version: "1.0.0" },
  { id: 11, name: "Kiosk 11", version: "1.0.0" },
  { id: 12, name: "Kiosk 12", version: "1.0.0" },
  { id: 13, name: "Kiosk 13", version: "1.0.0" },
  { id: 14, name: "Kiosk 14", version: "1.0.0" },
];
