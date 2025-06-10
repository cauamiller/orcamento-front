"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

import { getClients, Cliente } from "@/services/clients"
import { getBudgetById, updateBudget } from "@/services/budgets" // Crie essas funções na sua API

interface BudgetItem {
  id: number
  description: string
  quantity: number
  price: number
  total: number
}

interface Budget {
  id: string
  clientId: string
  items: { description: string; quantity: number; price: number }[]
}

export default function EditarOrcamentoPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clientId, setClientId] = useState("")
  const [items, setItems] = useState<BudgetItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [clientsData, budgetData] = await Promise.all([
          getClients(),
          getBudgetById(params.id),
        ])

        if (!clientsData || !budgetData) throw new Error("Erro ao carregar dados")

        setClientes(clientsData)
        setClientId(budgetData.clientId)
        // Mapear items da API para o estado com id sequencial para controle local
        setItems(
          budgetData.items.map((item, index) => ({
            id: index + 1,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price,
          })),
        )
      } catch (err) {
        alert("Erro ao carregar orçamento")
        router.push("/dashboard/orcamentos")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, router])

  const handleItemChange = (
    id: number,
    field: keyof Omit<BudgetItem, "id" | "total">,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = {
            ...item,
            [field]: field === "description" ? value : Number(value),
          }
          updated.total = updated.quantity * updated.price
          return updated
        }
        return item
      }),
    )
  }

  const addItem = () => {
    const newId = items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1
    setItems((prev) => [...prev, { id: newId, description: "", quantity: 1, price: 0, total: 0 }])
  }

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientId) {
      alert("Selecione um cliente")
      return
    }

    try {
      await updateBudget(params.id, {
        clientId,
        items: items.map(({ description, quantity, price }) => ({
          description,
          quantity,
          price,
        })),
      })
      router.push("/dashboard/orcamentos")
    } catch (err) {
      console.error(err)
      alert("Erro ao atualizar orçamento")
    }
  }

  if (loading) return <p className="p-6">Carregando orçamento...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/orcamentos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Orçamento</h1>
          <p className="text-muted-foreground">Atualize as informações do orçamento</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
            <CardDescription>Selecione o cliente para este orçamento</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="cliente">Cliente *</Label>
            <Select value={clientId} onValueChange={setClientId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map(({ id, name }) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Itens do Orçamento</CardTitle>
            <Button type="button" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Valor Unitário</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(({ id, description, quantity, price, total }) => (
                  <TableRow key={id}>
                    <TableCell>
                      <Input
                        placeholder="Descrição"
                        value={description}
                        onChange={(e) => handleItemChange(id, "description", e.target.value)}
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => handleItemChange(id, "quantity", Number(e.target.value))}
                        required
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={price}
                        onChange={(e) => handleItemChange(id, "price", Number(e.target.value))}
                        required
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>R$ {total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(id)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end pt-4 border-t">
              <span className="text-lg font-semibold">
                Total: R$ {items.reduce((acc, i) => acc + i.total, 0).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/orcamentos">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
