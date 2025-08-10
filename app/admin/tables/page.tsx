import { TablesManager } from "@/components/admin/tables-manager"

export const dynamic = "force-dynamic"

export default function AdminTablesPage() {
  return (
    <main className="container mx-auto p-4">
      <TablesManager />
    </main>
  )
}
