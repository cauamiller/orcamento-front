'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import DeleteConfirmationModal from "@/components/delete-confirmation-modal"
import { listBudgets, deleteBudget, Budget } from "@/services/budgets"

export default function OrcamentosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    budgetId: "",
    clientName: "",
  })

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const data = await listBudgets() as Budget[]
        setBudgets(data)
      } catch (error) {
        console.error("Erro ao buscar orçamentos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBudgets()
  }, [])

  const filteredBudgets = budgets.filter(
    (budget) =>
      budget.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.items.some((item) =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
  )

  const handleDeleteClick = (budget: Budget) => {
    setDeleteModal({
      isOpen: true,
      budgetId: budget.id,
      clientName: budget.client.name,
    })
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteBudget(deleteModal.budgetId)
      setBudgets((prev) => prev.filter((b) => b.id !== deleteModal.budgetId))
    } catch (err: any) {
      console.error("Erro ao excluir orçamento:", err.message)
      alert("Erro ao excluir orçamento")
    } finally {
      setDeleteModal({ isOpen: false, budgetId: "", clientName: "" })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, budgetId: "", clientName: "" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
          <p className="text-muted-foreground">Gerencie todos os orçamentos dos seus clientes</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/orcamentos/novo">
            <Plus className="h-4 w-4 mr-2" />
            Novo Orçamento
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Orçamentos</CardTitle>
          <CardDescription>Todos os orçamentos cadastrados no sistema</CardDescription>
          <div className="flex items-center space-x-2 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente ou item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando orçamentos...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBudgets.map((budget) => (
                  <TableRow key={budget.id}>
                    <TableCell>{budget.client.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {budget.items.map((item) => item.description).join(", ")}
                    </TableCell>
                    <TableCell>
                      R$ {budget.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {new Date(budget.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/orcamentos/${budget.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteClick(budget)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Excluir Orçamento"
        description="Tem certeza que deseja excluir o orçamento?"
        itemName={deleteModal.clientName}
      />
    </div>
  )
}