'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Mail, Phone, Plus, Search, Edit, Trash2 } from "lucide-react"
import { deleteClient, getClients } from "@/services/clients"
import { useAuthRedirect } from "@/hooks/use-auth-redirect"
import DeleteConfirmationModal from "@/components/delete-confirmation-modal"

interface Cliente {
  id: string
  name: string
  email: string
  phone?: string
}

export default function ClientesPage() {
  useAuthRedirect() // garante que só usuários autenticados vejam

  const [searchTerm, setSearchTerm] = useState("")
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getClients() as Cliente[]
        setClientes(data)
      } catch (err: any) {
        console.error("Erro ao carregar clientes:", err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    clienteId: "",
    clienteNome: "",
  })

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteClick = (cliente: Cliente) => {
    setDeleteModal({
      isOpen: true,
      clienteId: cliente.id,
      clienteNome: cliente.name,
    })
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteClient(deleteModal.clienteId)

      // Atualiza a lista local removendo o cliente
      setClientes(prev => prev.filter(c => c.id !== deleteModal.clienteId))
    } catch (err: any) {
      console.error("Erro ao excluir cliente:", err.message)
      alert("Erro ao excluir cliente")
    } finally {
      setDeleteModal({ isOpen: false, clienteId: "", clienteNome: "" })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, clienteId: "", clienteNome: "" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes e informações de contato</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clientes/novo">
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Todos os seus clientes cadastrados</CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando clientes...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.name}</TableCell>
                    <TableCell>{cliente.email}</TableCell>
                    <TableCell>
                      <div className="text-sm flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {cliente.phone || "Não informado"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/clientes/${cliente.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteClick(cliente)}>
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
        title="Excluir Cliente"
        description="Tem certeza que deseja excluir o cliente"
        itemName={deleteModal.clienteNome}
      />
    </div>
  )
}
