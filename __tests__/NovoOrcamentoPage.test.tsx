import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import NovoOrcamentoPage from "@/app/dashboard/orcamentos/novo/page"
import * as clientsService from "@/services/clients"
import * as budgetsService from "@/services/budgets"
import '@testing-library/jest-dom'

// Mock de clientes retornados da API
const mockClients = [
  { id: "1", name: "Cliente A", email: "a@exemplo.com" },
  { id: "2", name: "Cliente B", email: "b@exemplo.com" },
]

// Mock da função createBudget
jest.spyOn(clientsService, "getClients").mockResolvedValue(mockClients)
const createBudgetMock = jest.spyOn(budgetsService, "createBudget").mockResolvedValue({})

describe("NovoOrcamentoPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deve carregar e mostrar a lista de clientes", async () => {
    render(<NovoOrcamentoPage />)

    // O select deve conter os nomes dos clientes
    await waitFor(() => {
      expect(screen.getByText("Cliente A")).toBeInTheDocument()
      expect(screen.getByText("Cliente B")).toBeInTheDocument()
    })
  })

  it("deve permitir preencher o formulário, adicionar e remover itens, e enviar", async () => {
    render(<NovoOrcamentoPage />)

    // Espera os clientes carregarem
    await waitFor(() => screen.getByText("Cliente A"))

    // Seleciona cliente
    userEvent.click(screen.getByRole("combobox"))
    userEvent.click(screen.getByText("Cliente A"))

    // Preenche o primeiro item
    const descInput = screen.getByPlaceholderText("Descrição")
    const quantityInput = screen.getByRole("spinbutton", { name: "" }) // número
    const priceInput = screen.getAllByRole("spinbutton")[1] // o segundo input numérico é preço

    userEvent.type(descInput, "Cimento")
    userEvent.clear(quantityInput)
    userEvent.type(quantityInput, "2")
    userEvent.clear(priceInput)
    userEvent.type(priceInput, "50")

    // Adicionar novo item
    userEvent.click(screen.getByRole("button", { name: /Adicionar Item/i }))

    // Preenche o segundo item
    const allDescInputs = screen.getAllByPlaceholderText("Descrição")
    const allQuantityInputs = screen.getAllByRole("spinbutton")
    userEvent.type(allDescInputs[1], "Areia")
    userEvent.clear(allQuantityInputs[2])
    userEvent.type(allQuantityInputs[2], "3")
    userEvent.clear(allQuantityInputs[3])
    userEvent.type(allQuantityInputs[3], "30")

    // Remove o primeiro item
    const deleteButtons = screen.getAllByRole("button", { name: "" }) // botões com ícone trash
    userEvent.click(deleteButtons[0]) // remove primeiro item

    // Agora só deve restar 1 item, "Areia"
    expect(screen.getByDisplayValue("Areia")).toBeInTheDocument()
    expect(screen.queryByDisplayValue("Cimento")).not.toBeInTheDocument()

    // Tenta enviar o formulário
    userEvent.click(screen.getByRole("button", { name: /Salvar Orçamento/i }))

    await waitFor(() => {
      expect(createBudgetMock).toHaveBeenCalledTimes(1)

      // O createBudget deve ser chamado com clientId e array de items
      expect(createBudgetMock).toHaveBeenCalledWith("1", [
        { description: "Areia", quantity: 3, price: 30 },
      ])
    })
  })

  it("deve mostrar alerta se cliente não selecionado ao enviar", async () => {
    render(<NovoOrcamentoPage />)

    // Mock do alert para não poluir teste
    window.alert = jest.fn()

    // Tenta enviar sem selecionar cliente
    userEvent.click(screen.getByRole("button", { name: /Salvar Orçamento/i }))

    expect(window.alert).toHaveBeenCalledWith("Selecione um cliente")
    expect(createBudgetMock).not.toHaveBeenCalled()
  })
})
