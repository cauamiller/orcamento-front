"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { Cliente, getClientById, updateClient } from "@/services/clients"

export default function EditarClientePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const client = await getClientById(params.id) as Cliente
        setFormData({
          nome: client.name,
          email: client.email,
          telefone: client.phone || "",
        })
      } catch (err: any) {
        console.error("Erro ao carregar cliente:", err.message)
        alert("Erro ao carregar cliente")
        router.push("/dashboard/clientes")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, router])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateClient(params.id, {
        name: formData.nome,
        email: formData.email,
        phone: formData.telefone,
      })

      router.push("/dashboard/clientes")
    } catch (err: any) {
      console.error("Erro ao atualizar cliente:", err.message)
      alert("Erro ao atualizar cliente")
    }
  }

  if (loading) return <p className="p-6">Carregando cliente...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/clientes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Cliente</h1>
          <p className="text-muted-foreground">Atualize as informações do cliente</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
          <CardDescription>Edite os dados do cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleChange("telefone", e.target.value)}
                required
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/clientes">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}